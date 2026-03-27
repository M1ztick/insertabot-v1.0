<?php
/**
 * Plugin Name: Insertabot - AI Chatbot Solution
 * Plugin URI: https://insertabot.io
 * Description: Add a free AI chatbot to your WordPress site — no coding needed! Up to 20 free AI conversations per day. Real-time web search. Set up in minutes at insertabot.io
 * Version: 1.0.9
 * Author: Mistyk Media
 * Author URI: https://mistykmedia.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: insertabot-ai-chatbot-solution
 * Domain Path: /languages
 * Requires at least: 5.9
 * Requires PHP: 7.4
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    wp_die('Direct access not allowed.');
}

// Define plugin constants
define('INSERTABOT_VERSION', '1.0.9');
define('INSERTABOT_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('INSERTABOT_PLUGIN_URL', plugin_dir_url(__FILE__));
define('INSERTABOT_API_URL', 'https://insertabot.io');
define('INSERTABOT_WEBSITE_URL', 'https://insertabot.io');

// Load required includes
$insertabot_missing_files = array();
$insertabot_required_files = array(
    'includes/class-security.php',
    'includes/admin-settings.php',
    'includes/rest.php',
    'includes/privacy.php',
);

foreach ( $insertabot_required_files as $insertabot_file ) {
    if ( file_exists( INSERTABOT_PLUGIN_DIR . $insertabot_file ) ) {
        require_once INSERTABOT_PLUGIN_DIR . $insertabot_file;
    } else {
        $insertabot_missing_files[] = $insertabot_file;
    }
}

if ( ! empty( $insertabot_missing_files ) ) {
    add_action(
        'admin_notices',
        function () use ( $insertabot_missing_files ) {
            $file_list = implode( ', ', $insertabot_missing_files );
            printf(
                '<div class="notice notice-error"><p>%s</p></div>',
                sprintf(
                    /* translators: %s: comma-separated list of missing file names */
                    esc_html__( 'Insertabot: Missing required file(s): %s. Please reinstall the plugin.', 'insertabot-ai-chatbot-solution' ),
                    esc_html( $file_list )
                )
            );
        }
    );
    return;
}



/**
 * Main Insertabot Plugin Class
 */
class Insertabot_Plugin {
    
    private static $instance = null;
    
    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Initialize admin settings
        if (class_exists('Insertabot_Admin_Settings')) {
            Insertabot_Admin_Settings::register();
        }

        // Enqueue admin styles
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_styles'));

        // Add widget script to frontend
        add_action('wp_footer', array($this, 'add_widget_script'));

        // Register shortcode
        add_shortcode('insertabot', array($this, 'shortcode_handler'));

        // Add settings link on plugins page
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), array($this, 'add_settings_link'));
    }
    
    /**
     * Enqueue admin styles
     */
    public function enqueue_admin_styles($hook) {
        // Check for both menu page slugs (top-level menu and settings submenu)
        if ('toplevel_page_insertabot' !== $hook && 'settings_page_insertabot-settings' !== $hook) {
            return;
        }

        wp_enqueue_style(
            'insertabot-admin',
            INSERTABOT_PLUGIN_URL . 'assets/admin.css',
            array(),
            INSERTABOT_VERSION
        );
    }
    
    /**
     * Add widget script to frontend
     *
     * Note: We do NOT expose the raw API key in page markup. A small bridge script
     * fetches a short-lived token from a REST endpoint which avoids leaking secrets.
     */
    public function add_widget_script() {
        // Only add if enabled and API key is set
        if (!get_option('insertabot_enabled', false)) {
            return;
        }

        // Use encrypted storage API (do not read the raw value for output)
        $api_key = class_exists( 'Insertabot_Security' ) ? Insertabot_Security::get_api_key() : '';
        if (empty($api_key)) {
            return;
        }

        wp_enqueue_script(
            'insertabot-bridge',
            INSERTABOT_PLUGIN_URL . 'assets/widget-bridge.js',
            array(),
            INSERTABOT_VERSION,
            true
        );

        wp_localize_script(
            'insertabot-bridge',
            'insertabotConfig',
            array(
                'apiBase' => get_option('insertabot_api_base', INSERTABOT_API_URL),
                'tokenEndpoint' => esc_url_raw(rest_url('insertabot/v1/widget-token'))
            )
        );
    }
    
    /**
     * Shortcode handler
     */
    public function shortcode_handler($atts) {
        // This is handled by the widget script, just return empty
        // The widget automatically appears when the script is loaded
        return '';
    }
    
    /**
     * Add settings link on plugins page
     */
    public function add_settings_link($links) {
        $settings_link = '<a href="' . esc_url(admin_url('options-general.php?page=insertabot-settings')) . '">' . esc_html__('Settings', 'insertabot-ai-chatbot-solution') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }
}

// Initialize the plugin
function insertabot_init() {
    return Insertabot_Plugin::get_instance();
}
add_action('plugins_loaded', 'insertabot_init');

/**
 * Migrate plaintext API key (if any) to encrypted storage on init
 */
function insertabot_maybe_migrate_plaintext_key() {
    if ( ! class_exists( 'Insertabot_Security' ) ) {
        return;
    }

    $plain = get_option( 'insertabot_api_key', '' );
    
    // Skip if no plaintext key exists
    if ( empty( $plain ) ) {
        return;
    }

    $existing = Insertabot_Security::get_api_key();

    if ( is_string( $plain ) && '' !== $plain && '' === $existing ) {
        $validated = Insertabot_Security::validate_api_key( $plain );
        if ( ! is_wp_error( $validated ) ) {
            Insertabot_Security::store_api_key( $plain );
            // Remove plaintext value
            update_option( 'insertabot_api_key', '' );
        }
    }
}
add_action('init', 'insertabot_maybe_migrate_plaintext_key');

// Activation hook
register_activation_hook( __FILE__, 'insertabot_activate' );

/**
 * Plugin activation callback
 */
function insertabot_activate() {
    // Set default options
    add_option( 'insertabot_enabled', false );
    add_option( 'insertabot_api_key', '' );
    add_option( 'insertabot_api_base', INSERTABOT_API_URL );
}

// Deactivation hook
register_deactivation_hook( __FILE__, 'insertabot_deactivate' );

/**
 * Plugin deactivation callback
 */
function insertabot_deactivate() {
    // Nothing to do on deactivation
}
