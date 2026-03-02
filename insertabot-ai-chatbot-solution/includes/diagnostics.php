<?php
/**
 * Insertabot Diagnostics
 * 
 * Add ?insertabot_debug=1 to any page to see diagnostic info (admin only)
 */

if (!defined('ABSPATH')) {
    wp_die('Direct access not allowed.');
}

add_action('wp_footer', 'insertabot_show_diagnostics');

function insertabot_show_diagnostics() {
    if (!isset($_GET['insertabot_debug']) || !current_user_can('manage_options')) {
        return;
    }

    $api_key = class_exists('Insertabot_Security') ? Insertabot_Security::get_api_key() : '';
    $customer_id = get_option('insertabot_customer_id', '');
    $api_base = get_option('insertabot_api_base', '');
    $enabled = get_option('insertabot_enabled', false);
    
    ?>
    <div style="position: fixed; bottom: 0; left: 0; right: 0; background: #000; color: #0f0; padding: 20px; font-family: monospace; font-size: 12px; z-index: 999999; max-height: 300px; overflow: auto;">
        <h3 style="color: #0f0; margin: 0 0 10px 0;">🔍 Insertabot Diagnostics</h3>
        <table style="color: #0f0; width: 100%;">
            <tr>
                <td><strong>Enabled:</strong></td>
                <td><?php echo $enabled ? '✅ Yes' : '❌ No'; ?></td>
            </tr>
            <tr>
                <td><strong>API Key:</strong></td>
                <td><?php echo !empty($api_key) ? '✅ Set (' . substr($api_key, 0, 12) . '...)' : '❌ Not set'; ?></td>
            </tr>
            <tr>
                <td><strong>Customer ID:</strong></td>
                <td><?php echo !empty($customer_id) ? '✅ ' . esc_html($customer_id) : '⚠️ Not cached (will use slow v1 tokens)'; ?></td>
            </tr>
            <tr>
                <td><strong>API Base:</strong></td>
                <td><?php echo esc_html($api_base); ?></td>
            </tr>
            <tr>
                <td><strong>Token Endpoint:</strong></td>
                <td><?php echo esc_url(rest_url('insertabot/v1/widget-token')); ?></td>
            </tr>
            <tr>
                <td><strong>Security Class:</strong></td>
                <td><?php echo class_exists('Insertabot_Security') ? '✅ Loaded' : '❌ Missing'; ?></td>
            </tr>
            <tr>
                <td><strong>Sodium Available:</strong></td>
                <td><?php echo extension_loaded('sodium') ? '✅ Yes' : '⚠️ No (using legacy encryption)'; ?></td>
            </tr>
        </table>
        <p style="margin: 10px 0 0 0; font-size: 10px; opacity: 0.7;">Check browser console for widget loading errors</p>
    </div>
    <?php
}
