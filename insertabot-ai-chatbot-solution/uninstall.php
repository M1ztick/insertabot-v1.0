<?php

if (!defined('WP_UNINSTALL_PLUGIN')) {
    wp_die('Uninstall not called from WordPress.');
}

// Remove plugin options and sensitive stored data
delete_option('insertabot_enabled');
delete_option('insertabot_api_key');
delete_option('insertabot_api_base');
delete_option('insertabot_api_key_encrypted');
delete_option('insertabot_security_logs');
