<?php
/**
 * REST API endpoints for Insertabot
 *
 * @package Insertabot
 */

if ( ! defined( 'ABSPATH' ) ) {
    wp_die( 'Direct access not allowed.' );
}

add_action( 'rest_api_init', 'insertabot_register_rest_routes' );

/**
 * Register REST API routes
 */
function insertabot_register_rest_routes() {
    register_rest_route(
        'insertabot/v1',
        '/widget-token',
        array(
            'methods'             => 'GET',
            'callback'            => 'insertabot_widget_token_endpoint',
            'permission_callback' => '__return_true',
        )
    );
}

/**
 * Issue a short-lived signed ephemeral token for the client-side widget bridge.
 *
 * The raw API key is NEVER returned to the browser. Instead, the server uses
 * the API key as an HMAC secret to sign a time-limited payload. The Cloudflare
 * Worker validates this signature server-to-server and issues its own short-lived
 * session token. This means:
 *
 *  - The raw ib_sk_* key is never present in HTML, JS attributes, or JSON
 *    responses visible to visitors.
 *  - A stolen ephemeral token is useless after TOKEN_TTL seconds.
 *  - The Worker can independently verify authenticity without a round-trip to
 *    WordPress on every request.
 *
 * Token format (base64url):  customer_id:timestamp:nonce:hmac_hex
 *
 * @param WP_REST_Request $request The REST request object.
 * @return WP_REST_Response|WP_Error Response object or WP_Error on failure.
 */
function insertabot_widget_token_endpoint( WP_REST_Request $request ) {
    // ------------------------------------------------------------------ //
    // 1. Rate-limit: max 20 token requests per IP per minute.            //
    // ------------------------------------------------------------------ //
    $client_ip = insertabot_get_request_ip();
    $rate_key  = 'insertabot_token_rl_' . hash( 'sha256', $client_ip );
    $hits      = (int) get_transient( $rate_key );

    if ( $hits >= 20 ) {
        return new WP_Error(
            'rate_limited',
            'Too many token requests. Please try again later.',
            array( 'status' => 429 )
        );
    }

    // Increment counter only; set expiration only on first hit
    if ( $hits === 0 ) {
        set_transient( $rate_key, 1, 60 );
    } else {
        set_transient( $rate_key, $hits + 1, get_option( '_transient_timeout_' . $rate_key ) - time() );
    }

    // ------------------------------------------------------------------ //
    // 2. Retrieve the stored (encrypted) API key.                        //
    // ------------------------------------------------------------------ //
    if ( ! class_exists( 'Insertabot_Security' ) ) {
        return new WP_Error( 'no_security', 'Security helper missing', array( 'status' => 500 ) );
    }

    $api_key = Insertabot_Security::get_api_key();
    if ( empty( $api_key ) ) {
        return new WP_Error( 'no_api_key', 'API key not configured', array( 'status' => 400 ) );
    }

    // ------------------------------------------------------------------ //
    // 3. Build the signed ephemeral token.                              //
    //                                                                   //
    // v2 (preferred): customer_id:timestamp:nonce:hmac_hex             //
    //   Requires insertabot_customer_id to be cached in WP options.    //
    //   Enables O(1) single-row lookup in the Worker exchange endpoint. //
    //                                                                   //
    // v1 (legacy): timestamp:nonce:hmac_hex                            //
    //   Used when the customer_id option is not yet cached.            //
    //   Worker falls back to an O(N) full-table scan.                  //
    // ------------------------------------------------------------------ //
    /** @var int TOKEN_TTL Seconds until the ephemeral token expires. */
    $ttl         = (int) apply_filters( 'insertabot_widget_token_ttl', 300 ); // 5 minutes
    $timestamp   = time();
    $nonce       = bin2hex( random_bytes( 8 ) ); // 16 hex chars, prevents replay
    $customer_id = (string) get_option( 'insertabot_customer_id', '' );

    if ( ! empty( $customer_id ) && preg_match( '/^cust_[a-zA-Z0-9]{16}$/', $customer_id ) ) {
        // v2: include customer_id in payload — enables O(1) Worker lookup.
        $payload   = $customer_id . ':' . $timestamp . ':' . $nonce;
        $signature = hash_hmac( 'sha256', $payload, $api_key );
        $raw_token = $customer_id . ':' . $timestamp . ':' . $nonce . ':' . $signature;
    } else {
        // v1 legacy: omit customer_id — Worker falls back to O(N) scan.
        $payload   = $timestamp . ':' . $nonce;
        $signature = hash_hmac( 'sha256', $payload, $api_key );
        $raw_token = $timestamp . ':' . $nonce . ':' . $signature;
    }

    $token = insertabot_base64url_encode( $raw_token );

    // Log the token issuance (key is never logged).
    Insertabot_Security::log_event( 'widget_token_issued', array(
        'ip'        => $client_ip,
        'nonce'     => $nonce,
        'timestamp' => $timestamp,
    ) );

    return rest_ensure_response(
        array(
            'token'      => $token,
            'expires_at' => $timestamp + $ttl,
        )
    );
}

/**
 * Base64url encode (RFC 4648 §5 — URL-safe, no padding).
 *
 * @param string $data Raw string to encode.
 * @return string Base64url-encoded string.
 */
function insertabot_base64url_encode( $data ) {
    return rtrim( strtr( base64_encode( $data ), '+/', '-_' ), '=' );
}

/**
 * Get the real client IP, preferring CF-Connecting-IP when present.
 *
 * @return string
 */
function insertabot_get_request_ip() {
    // Cloudflare sets this header; trust it only when the server is behind CF.
    if ( ! empty( $_SERVER['HTTP_CF_CONNECTING_IP'] ) ) {
        $ip = sanitize_text_field( wp_unslash( $_SERVER['HTTP_CF_CONNECTING_IP'] ) );
        if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) {
            return $ip;
        }
    }

    if ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
        $forwarded = sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_FORWARDED_FOR'] ) );
        $ip        = trim( explode( ',', $forwarded )[0] );
        if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) {
            return $ip;
        }
    }

    $ip = ! empty( $_SERVER['REMOTE_ADDR'] )
        ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) )
        : '0.0.0.0';

    return filter_var( $ip, FILTER_VALIDATE_IP ) ? $ip : '0.0.0.0';
}
