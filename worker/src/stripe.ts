/**
 * Stripe Integration Helper
 * Handles checkout, webhooks, and subscription management
 */

import { withRetry, ExternalServiceError, withTimeout } from './errors';

export interface StripeEnv {
	STRIPE_SECRET_KEY: string;
	STRIPE_PUBLISHABLE_KEY: string;
	STRIPE_WEBHOOK_SECRET: string;
}

/**
 * Create a checkout session for upgrading to Pro plan
 */
export async function createCheckoutSession(
	stripeSecretKey: string,
	customerId: string,
	email: string,
	priceId: string,
	baseUrl: string
): Promise<{ sessionId: string; url: string } | null> {
	try {
		const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${stripeSecretKey}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				'payment_method_types[]': 'card',
				'line_items[0][price]': priceId,
				'line_items[0][quantity]': '1',
				'mode': 'subscription',
				'customer_email': email,
				'client_reference_id': customerId,
				'success_url': `${baseUrl}?session_id={CHECKOUT_SESSION_ID}`,
				'cancel_url': `${baseUrl}`,
				'billing_address_collection': 'auto',
			}).toString(),
		});

		if (!response.ok) {
			const errorText = await response.text();
			const sanitizedError = errorText.replace(/[\r\n]/g, ' ').substring(0, 200);
			console.error('Stripe API error:', sanitizedError);
			return null;
		}

		const session = (await response.json()) as any;
		return {
			sessionId: session.id,
			url: session.url,
		};
	} catch (error) {
		console.error('Error creating checkout session:', error);
		return null;
	}
}

/**
 * Verify Stripe webhook signature
 * Uses HMAC-SHA256 to verify the request came from Stripe
 */
export async function verifyWebhookSignature(
	body: string,
	signature: string,
	webhookSecret: string
): Promise<boolean> {
	try {
		// Stripe webhook signature format: t=timestamp,v1=hash
		const parts = signature.split(',');
		const timestamp = parts[0].split('=')[1];
		const hash = parts[1].split('=')[1];

		// Reconstruct signed content
		const signedContent = `${timestamp}.${body}`;

		// Create HMAC-SHA256 hash
		const encoder = new TextEncoder();
		const key = await crypto.subtle.importKey(
			'raw',
			encoder.encode(webhookSecret),
			{ name: 'HMAC', hash: 'SHA-256' },
			false,
			['sign']
		);

		const signature_bytes = await crypto.subtle.sign(
			'HMAC',
			key,
			encoder.encode(signedContent)
		);

		// Convert to hex string
		const hashArray = Array.from(new Uint8Array(signature_bytes));
		const computed = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

		// Constant-time comparison to prevent timing attacks
		if (computed.length !== hash.length) {
			return false;
		}
		let result = 0;
		for (let i = 0; i < computed.length; i++) {
			result |= computed.charCodeAt(i) ^ hash.charCodeAt(i);
		}
		return result === 0;
	} catch (error) {
		console.error('Error verifying webhook signature:', error);
		return false;
	}
}

/**
 * Process Stripe webhook events
 */
export async function processWebhookEvent(
	event: any,
	db: D1Database
): Promise<boolean> {
	try {
		const type = event.type;
		const data = event.data.object;

		switch (type) {
			case 'customer.subscription.created':
			case 'customer.subscription.updated':
				return await handleSubscriptionUpdate(db, data);

			case 'customer.subscription.deleted':
				return await handleSubscriptionCancelled(db, data);

			case 'payment_intent.succeeded':
				const sanitizedCustomer1 = String(data.customer).replace(/[\r\n]/g, ' ').substring(0, 50);
				console.log(`Payment succeeded for customer ${sanitizedCustomer1}`);
				return true;

			case 'payment_intent.payment_failed':
				const sanitizedCustomer2 = String(data.customer).replace(/[\r\n]/g, ' ').substring(0, 50);
				console.error(`Payment failed for customer ${sanitizedCustomer2}`);
				return true;

			default:
				const sanitizedType = String(type).replace(/[\r\n]/g, ' ').substring(0, 100);
				console.log(`Unhandled event type: ${sanitizedType}`);
				return true;
		}
	} catch (error) {
		console.error('Error processing webhook event:', error);
		return false;
	}
}

/**
 * Handle subscription creation/update
 */
async function handleSubscriptionUpdate(db: D1Database, subscription: any): Promise<boolean> {
	try {
		const customerId = subscription.metadata?.customer_id || subscription.client_reference_id;
		const stripeCustomerId = subscription.customer;
		const status = subscription.status; // active, past_due, unpaid, etc.

		if (!customerId) {
			console.error('No customer_id in subscription metadata');
			return false;
		}

		const isPro = status === 'active';

		// Update customer subscription status and rate limits together
		const result = await db
			.prepare(
				`UPDATE customers
				 SET stripe_customer_id = ?,
					 subscription_id = ?,
					 subscription_status = ?,
					 plan_type = ?,
					 rate_limit_per_hour = ?,
					 rate_limit_per_day = ?,
					 updated_at = ?
				 WHERE customer_id = ?`
			)
			.bind(
				stripeCustomerId,
				subscription.id,
				status,
				isPro ? 'pro' : 'free',
				isPro ? 50 : 5,    // pro: 50/hour, free: 5/hour
				isPro ? 500 : 20,  // pro: 500/day, free: 20/day
				Math.floor(Date.now() / 1000),
				customerId
			)
			.run();

		const sanitizedCustomerId = customerId.replace(/[\r\n]/g, ' ').substring(0, 50);
		console.log(`Updated subscription for customer ${sanitizedCustomerId}`);
		return true;
	} catch (error) {
		console.error('Error updating subscription:', error);
		return false;
	}
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(db: D1Database, subscription: any): Promise<boolean> {
	try {
		const customerId = subscription.metadata?.customer_id || subscription.client_reference_id;

		if (!customerId) {
			console.error('No customer_id in subscription metadata');
			return false;
		}

		// Revert to free plan and reset rate limits
		const result = await db
			.prepare(
				`UPDATE customers
				 SET subscription_id = NULL,
					 subscription_status = 'cancelled',
					 plan_type = 'free',
					 rate_limit_per_hour = 5,
					 rate_limit_per_day = 20,
					 updated_at = ?
				 WHERE customer_id = ?`
			)
			.bind(Math.floor(Date.now() / 1000), customerId)
			.run();

  // amazonq-ignore-next-line
		console.log(`Cancelled subscription for customer ${customerId}:`, result);
		return true;
	} catch (error) {
		// Sanitize error message to prevent log injection
		const errorMsg = error instanceof Error ? error.message.replace(/[\r\n]/g, ' ').substring(0, 200) : 'Unknown error';
		console.error('Error cancelling subscription:', errorMsg);
		return false;
	}
}

/**
 * Get subscription status for a customer
 */
export async function getSubscriptionStatus(
	db: D1Database,
	customerId: string
): Promise<{ status: string; plan: string } | null> {
	try {
		const result = await db
			.prepare(`SELECT subscription_status, plan_type FROM customers WHERE customer_id = ?`)
			.bind(customerId)
			.first<{ subscription_status: string; plan_type: string }>();

		if (!result) {
			return null;
		}

		return {
			status: result.subscription_status || 'none',
			plan: result.plan_type || 'free',
		};
	} catch (error) {
		console.error('Error getting subscription status:', error);
		return null;
	}
}
