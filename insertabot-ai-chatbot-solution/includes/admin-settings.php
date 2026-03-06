<?php
/**
 * Insertabot Admin Settings (Settings API)
 *
 * Drop-in file. Include from main plugin bootstrap.
 *
 * @package Insertabot
 */

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

/**
 * Insertabot Admin Settings Class
 */
final class Insertabot_Admin_Settings {
	public const PAGE_SLUG        = 'insertabot-settings';
	public const OPTION_KEY       = 'insertabot_api_key';
	public const OPTION_EN        = 'insertabot_enabled';
	public const OPTION_BASE      = 'insertabot_api_base';
	public const OPTION_CUST_ID   = 'insertabot_customer_id';

	/**
	 * Register admin hooks
	 */
	public static function register() {
		add_action( 'admin_menu', array( __CLASS__, 'add_menu' ) );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
	}

	/**
	 * Add admin menu
	 */
	public static function add_menu() {
		add_options_page(
			esc_html__( 'Insertabot Settings', 'insertabot-ai-chatbot-solution' ),
			esc_html__( 'Insertabot', 'insertabot-ai-chatbot-solution' ),
			'manage_options',
			self::PAGE_SLUG,
			array( __CLASS__, 'render_page' )
		);
	}

	/**
	 * Register settings
	 */
	public static function register_settings() {
		register_setting(
			'insertabot_settings_group',
			self::OPTION_KEY,
			array(
				'type'              => 'string',
				'sanitize_callback' => array( __CLASS__, 'sanitize_api_key' ),
				'default'           => '',
			)
		);

		register_setting(
			'insertabot_settings_group',
			self::OPTION_BASE,
			array(
				'type'              => 'string',
				'sanitize_callback' => array( __CLASS__, 'sanitize_api_base' ),
				'default'           => defined( 'INSERTABOT_API_URL' ) ? INSERTABOT_API_URL : '',
			)
		);

		register_setting(
			'insertabot_settings_group',
			self::OPTION_EN,
			array(
				'type'              => 'boolean',
				'sanitize_callback' => array( __CLASS__, 'sanitize_enabled' ),
				'default'           => false,
			)
		);

		add_settings_section(
			'insertabot_main_section',
			'',
			'__return_null',
			self::PAGE_SLUG
		);

		add_settings_field(
			self::OPTION_KEY,
			esc_html__( 'API Key', 'insertabot-ai-chatbot-solution' ),
			array( __CLASS__, 'field_api_key' ),
			self::PAGE_SLUG,
			'insertabot_main_section'
		);

		add_settings_field(
			self::OPTION_EN,
			esc_html__( 'Enable Chatbot', 'insertabot-ai-chatbot-solution' ),
			array( __CLASS__, 'field_enabled' ),
			self::PAGE_SLUG,
			'insertabot_main_section'
		);

		add_settings_field(
			self::OPTION_BASE,
			esc_html__( 'API Base URL', 'insertabot-ai-chatbot-solution' ),
			array( __CLASS__, 'field_api_base' ),
			self::PAGE_SLUG,
			'insertabot_main_section'
		);
	}

	public static function sanitize_api_key($value): string {
		$value = is_string($value) ? sanitize_text_field($value) : '';

		// Empty submission — the field is always blank by design (key is never pre-filled).
		// Only clear the stored key if there isn't one already; otherwise treat as no-change.
		if ($value === '') {
			if (class_exists('Insertabot_Security') && Insertabot_Security::get_api_key() !== '') {
				// Key already stored — blank field means "leave it alone".
				return '';
			}
			// No key stored yet — nothing to clear.
			return '';
		}

		// Validate format
		$validated = null;
		if (class_exists('Insertabot_Security')) {
			$validated = Insertabot_Security::validate_api_key($value);
  // amazonq-ignore-next-line
		} else {
			add_settings_error(
				'insertabot_settings_messages',
				'insertabot_security_missing',
				esc_html__('Security component missing. Cannot process API key.', 'insertabot-ai-chatbot-solution'),
				'error'
			);
			return '';
		}

		if (is_wp_error($validated)) {
			add_settings_error(
				'insertabot_settings_messages',
				'insertabot_invalid_key',
				esc_html__('Invalid API key format.', 'insertabot-ai-chatbot-solution'),
				'error'
			);
			return '';
		}

		// Store encrypted key and avoid persisting plaintext option
		if (class_exists('Insertabot_Security')) {
			$stored = Insertabot_Security::store_api_key($value);
			if ($stored === false) {
				add_settings_error(
					'insertabot_settings_messages',
					'insertabot_store_failed',
					esc_html__('Failed to securely store API key.', 'insertabot-ai-chatbot-solution'),
					'error'
				);
				return '';
			}
		}

		// Resolve and cache the customer_id from the Worker so future
		// ephemeral tokens can use the O(1) v2 format.  A failure here is
		// non-fatal — the plugin will fall back to the v1 O(N) format.
		$api_base = self::get_api_base();
		if (!empty($api_base)) {
			$customer_id = self::resolve_customer_id($value, $api_base);
			if ($customer_id) {
				update_option(self::OPTION_CUST_ID, $customer_id);
				add_settings_error(
					'insertabot_settings_messages',
					'insertabot_customer_id_cached',
					esc_html__('API key validated and customer ID cached successfully.', 'insertabot-ai-chatbot-solution'),
					'success'
				);
			} else {
				// Clear any stale customer_id
				delete_option(self::OPTION_CUST_ID);
				add_settings_error(
					'insertabot_settings_messages',
					'insertabot_customer_id_warning',
					esc_html__('API key saved but could not resolve customer ID. Widget will use legacy token format (slower). Check API Base URL.', 'insertabot-ai-chatbot-solution'),
					'warning'
				);
			}
		}

		// Return empty to avoid saving plaintext in options
		return '';
	}

	public static function sanitize_enabled($value): bool {
		$enabled = !empty($value);

		// Prevent enabling without API key.
		if ($enabled && !self::has_api_key()) {
			add_settings_error(
				'insertabot_settings_messages',
				'insertabot_enabled_no_key',
				esc_html__('API key required before enabling chatbot.', 'insertabot-ai-chatbot-solution'),
				'error'
			);
			return false;
		}

		return $enabled;
	}

	/**
	 * Call the Worker's /api/auth/key-info endpoint to resolve the customer_id
	 * for the given api_key.  Returns the validated customer_id string or null
	 * on any error (network failure, invalid key, unexpected format).
	 *
	 * This is called once at key-save time so that subsequent ephemeral tokens
	 * can use the O(1) v2 format (customer_id:timestamp:nonce:hmac_hex).
	 *
	 * @param string $api_key  The raw API key entered by the admin.
	 * @param string $api_base The Worker base URL stored in settings.
	 * @return string|null     Validated customer_id or null.
	 */
	private static function resolve_customer_id(string $api_key, string $api_base): ?string {
		$url = trailingslashit(esc_url_raw($api_base)) . 'api/auth/key-info';

		$response = wp_remote_post($url, array(
			'body'    => wp_json_encode(array('api_key' => $api_key)),
			'headers' => array('Content-Type' => 'application/json'),
			'timeout' => 5,
		));

		if (is_wp_error($response)) {
			return null;
		}

		if ((int) wp_remote_retrieve_response_code($response) !== 200) {
			return null;
		}

		$body        = json_decode(wp_remote_retrieve_body($response), true);
		$customer_id = isset($body['customer_id']) && is_string($body['customer_id'])
			? $body['customer_id']
			: '';

		// Validate the format matches the known customer_id pattern.
		if (!preg_match('/^cust_[a-zA-Z0-9]{16}$/', $customer_id)) {
			return null;
		}

		return $customer_id;
	}

	private static function get_api_key(): string {
		if (class_exists('Insertabot_Security')) {
			return (string) Insertabot_Security::get_api_key();
		}
		return (string) get_option(self::OPTION_KEY, '');
	}

	private static function get_enabled(): bool {
		return (bool) get_option(self::OPTION_EN, false);
	}

	private static function get_api_base(): string {
		$default = defined('INSERTABOT_API_URL') ? INSERTABOT_API_URL : '';
		return (string) get_option(self::OPTION_BASE, $default);
	}

	private static function has_api_key(): bool {
		return self::get_api_key() !== '';
	}

	public static function field_api_key(): void {
		$api_key = self::get_api_key();
		$has_key = self::has_api_key();

		$site_url = defined('INSERTABOT_WEBSITE_URL') ? INSERTABOT_WEBSITE_URL : '';
		$signup   = $site_url ? $site_url . '/signup' : '';
		$dash     = $site_url ? $site_url . '/dashboard' : '';

		// For security, do NOT pre-fill the field with the raw key. Let users paste a new key.
		$masked = '';
		if ($has_key && is_string($api_key) && strlen($api_key) > 12) {
			$masked = substr($api_key, 0, 8) . '...' . substr($api_key, -4);
		} elseif ($has_key && is_string($api_key) && $api_key !== '') {
			$masked = '***';
		}

		?>
		<input
			type="text"
			id="insertabot_api_key"
			name="<?php echo esc_attr(self::OPTION_KEY); ?>"
			value=""
			class="regular-text code"
			placeholder="ib_sk_your_api_key_here"
			autocomplete="off"
			spellcheck="false"
			inputmode="text"
		/>
		<?php if (!$has_key) : ?>
			<p class="description">
				<?php if ($signup) : ?>
					<a href="<?php echo esc_url($signup); ?>" target="_blank" rel="noopener noreferrer">
						<strong><?php esc_html_e('Get a free API key →', 'insertabot-ai-chatbot-solution'); ?></strong>
					</a>
				<?php else : ?>
					<strong><?php esc_html_e('Insertabot website URL not configured.', 'insertabot-ai-chatbot-solution'); ?></strong>
				<?php endif; ?>
			</p>
		<?php else : ?>
			<p class="description">
				<?php esc_html_e('API key connected.', 'insertabot-ai-chatbot-solution'); ?> <code><?php echo esc_html($masked); ?></code>
				<?php if ($dash) : ?>
					<a href="<?php echo esc_url($dash); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e('View dashboard →', 'insertabot-ai-chatbot-solution'); ?></a>
				<?php endif; ?>
			</p>
		<?php endif; ?>
	<?php
	}

	public static function field_enabled(): void {
		$enabled = self::get_enabled();
		$has_key = self::has_api_key();
		?>
		<label class="insertabot-toggle">
			<input
				type="checkbox"
				id="insertabot_enabled"
				name="<?php echo esc_attr(self::OPTION_EN); ?>"
				value="1"
				<?php checked($enabled, true); ?>
				<?php disabled(!$has_key); ?>
			/>
			<span class="insertabot-toggle-slider" aria-hidden="true"></span>
		</label>
		<p class="description">
			<?php
			if ( $has_key ) {
				esc_html_e( 'Toggle to show/hide the chatbot on the website.', 'insertabot-ai-chatbot-solution' );
			} else {
				esc_html_e( 'Enter API key above to enable the chatbot.', 'insertabot-ai-chatbot-solution' );
			}
			?>
		</p>
		<?php
	}

	public static function field_api_base(): void {
		$api_base = self::get_api_base();
		?>
		<input
			type="url"
			id="insertabot_api_base"
			name="<?php echo esc_attr(self::OPTION_BASE); ?>"
			value="<?php echo esc_attr($api_base); ?>"
			class="regular-text code"
			placeholder="https://api.example.com"
		/>
		<p class="description"><?php esc_html_e('Advanced: Change only when using a custom API endpoint.', 'insertabot-ai-chatbot-solution'); ?></p>
		<?php
	}

	public static function render_page(): void {
		if (!current_user_can('manage_options')) {
			wp_die(esc_html__('Insufficient permissions.', 'insertabot-ai-chatbot-solution'));
		}

		$api_key = self::get_api_key();
		$has_key = ($api_key !== '');

		$plugin_url = defined('INSERTABOT_PLUGIN_URL') ? INSERTABOT_PLUGIN_URL : '';
		$welcome_svg = $plugin_url ? $plugin_url . 'assets/welcome-illustration.svg' : '';

		$site_url = defined('INSERTABOT_WEBSITE_URL') ? INSERTABOT_WEBSITE_URL : '';
		$signup   = $site_url ? $site_url . '/signup' : '';
		$pricing  = $site_url ? $site_url . '/dashboard' : '';
		$docs     = $site_url ? $site_url . '/docs' : '';
		$dash     = $site_url ? $site_url . '/dashboard' : '';

		?>
		<div class="wrap insertabot-admin-wrap">
			<h1>
				<span class="dashicons dashicons-format-chat" style="font-size: 32px; margin-inline-end: 8px; vertical-align: middle;"></span>
				<?php echo esc_html__('Insertabot Settings', 'insertabot-ai-chatbot-solution'); ?>
			</h1>

			<?php settings_errors('insertabot_settings_messages'); ?>

			<?php if (!$has_key) : ?>
				<div class="insertabot-welcome-card">
					<div class="insertabot-welcome-content">
						<h2><span class="dashicons dashicons-rocket" style="font-size: 1.2em; vertical-align: middle;"></span> Welcome to Insertabot!</h2>
						<p class="insertabot-subtitle">Add AI chat to a WordPress site in 3 simple steps:</p>

						<div class="insertabot-steps">
							<div class="insertabot-step">
								<div class="insertabot-step-number">1</div>
								<div class="insertabot-step-content">
									<h3>Get Free API Key</h3>
									<p>Sign up and get <strong>20 free messages per day</strong></p>
									<?php if ($signup) : ?>
										<a href="<?php echo esc_url($signup); ?>" class="button button-primary button-hero" target="_blank" rel="noopener noreferrer">
											Get Free API Key →
										</a>
									<?php endif; ?>
								</div>
							</div>

							<div class="insertabot-step">
								<div class="insertabot-step-number">2</div>
								<div class="insertabot-step-content">
									<h3>Paste API Key Below</h3>
									<p>Copy API key from dashboard and paste here</p>
								</div>
							</div>

							<div class="insertabot-step">
								<div class="insertabot-step-number">3</div>
								<div class="insertabot-step-content">
									<h3>Enable Chatbot</h3>
									<p>Toggle "Enable Chatbot" and save.</p>
								</div>
							</div>
						</div>

						<div class="insertabot-features">
							<h3><span class="dashicons dashicons-star-filled" style="font-size: 1.2em; vertical-align: middle;"></span> What Free Tier Includes:</h3>
							<ul>
								<li><span class="dashicons dashicons-admin-users"></span> <strong>20 AI conversations per day</strong></li>
								<li><span class="dashicons dashicons-search"></span> <strong>Real-time web search</strong></li>
								<li><span class="dashicons dashicons-art"></span> Customizable colors and branding</li>
								<li><span class="dashicons dashicons-smartphone"></span> Mobile-friendly chat widget</li>
								<li><span class="dashicons dashicons-performance"></span> Setup in minutes</li>
							</ul>
						</div>
					</div>

					<div class="insertabot-welcome-image">
						<?php if ($welcome_svg) : ?>
							<img src="<?php echo esc_url($welcome_svg); ?>" alt="<?php echo esc_attr__('Insertabot', 'insertabot-ai-chatbot-solution'); ?>" />
						<?php endif; ?>
					</div>
				</div>
			<?php endif; ?>

			<div class="insertabot-settings-card<?php echo $has_key ? ' insertabot-has-key' : ''; ?>">
				<form method="post" action="options.php">
					<?php
						settings_fields('insertabot_settings_group');
						do_settings_sections(self::PAGE_SLUG);
						submit_button('Save Settings', 'primary', 'submit', true, ['class' => 'button-large']);
					?>
				</form>
			</div>

			<?php if ($has_key) : ?>
				<div class="insertabot-upgrade-card">
					<div class="insertabot-upgrade-content">
						<div class="insertabot-upgrade-icon"><span class="dashicons dashicons-performance"></span></div>
						<h2>Upgrade to Pro - $9.99/month</h2>
						<p class="insertabot-upgrade-subtitle">Get unlimited AI conversations + real-time web search</p>

						<div class="insertabot-upgrade-features">
							<div class="insertabot-upgrade-col">
								<h3>Free (Current)</h3>
								<ul>
									<li><span class="dashicons dashicons-yes"></span> 20 messages/day</li>
									<li><span class="dashicons dashicons-yes"></span> Basic customization</li>
								</ul>
							</div>

							<div class="insertabot-upgrade-col insertabot-upgrade-col-pro">
								<h3>Pro ($9.99/mo)</h3>
								<ul>
									<li><span class="dashicons dashicons-star-filled"></span> <strong>Unlimited</strong> playground messages</li>
									<li><span class="dashicons dashicons-star-filled"></span> <strong>500</strong> embedded messages/month</li>
									<li><span class="dashicons dashicons-star-filled"></span> <strong>Priority support</strong></li>
							</ul>
						</div>
					</div>

					<?php if ($pricing) : ?>
						<a href="<?php echo esc_url($pricing); ?>" class="button button-primary button-large" target="_blank" rel="noopener noreferrer">
							Upgrade to Pro
						</a>
					<?php endif; ?>
				</div>
			</div>
		<?php endif; ?>

		<?php if ($docs) : ?>
			<div class="insertabot-help-card">
				<h3><span class="dashicons dashicons-book"></span> Need Help?</h3>
				<p>Check out the <a href="<?php echo esc_url($docs); ?>" target="_blank" rel="noopener noreferrer"><strong>Help &amp; Documentation</strong></a> page for setup guides and common issues. For anything else, visit <a href="<?php echo esc_url($site_url); ?>" target="_blank" rel="noopener noreferrer"><strong>insertabot.io</strong></a> and use the chat widget — our AI assistant is available 24/7.</p>
			</div>
		<?php endif; ?>
	</div>
	<?php
	}

	public static function sanitize_api_base($value): string {
		$value = is_string($value) ? trim($value) : '';
		
		// If empty, use default
		if ($value === '') {
			return defined('INSERTABOT_API_URL') ? INSERTABOT_API_URL : '';
		}
		
		// Validate URL format
		if (!filter_var($value, FILTER_VALIDATE_URL)) {
			add_settings_error(
				'insertabot_settings_messages',
				'insertabot_invalid_api_base',
				esc_html__('Invalid API Base URL format.', 'insertabot-ai-chatbot-solution'),
				'error'
			);
			return defined('INSERTABOT_API_URL') ? INSERTABOT_API_URL : '';
		}
		
		$sanitized = esc_url_raw($value);
		if (empty($sanitized)) {
			add_settings_error(
				'insertabot_settings_messages',
				'insertabot_sanitize_api_base_failed',
				esc_html__('Failed to sanitize API Base URL.', 'insertabot-ai-chatbot-solution'),
				'error'
			);
			return defined('INSERTABOT_API_URL') ? INSERTABOT_API_URL : '';
		}

		return $sanitized;
	}

}