<?php
/**
 * Insertabot Security Class
 * Handles encryption, decryption, and secure storage of sensitive data
 * GDPR Compliant data protection
 */

if (!defined('ABSPATH')) {
    wp_die('Direct access not allowed.');
}

class Insertabot_Security {

    /**
     * Legacy encryption method (for backwards compatibility)
     */
    private const LEGACY_CIPHER_METHOD = 'AES-256-CBC';

    /**
     * Encryption version prefix for identifying encryption method
     */
    private const SODIUM_PREFIX = 'sodium:';

    /**
     * Cached result of sodium availability check
     */
    private static $sodium_available = null;

    /**
     * Check if Sodium extension is available
     *
     * @return bool
     */
    private static function sodium_available() {
        if (self::$sodium_available === null) {
            self::$sodium_available = extension_loaded('sodium') && function_exists('sodium_crypto_secretbox');
        }
        return self::$sodium_available;
    }

    /**
     * Get encryption key derived from WordPress salts
     *
     * @return string 32-byte key for Sodium
     */
    private static function get_encryption_key() {
        // Use WordPress salts to create a unique encryption key
        $salt = defined('AUTH_KEY') ? AUTH_KEY : '';
        $salt .= defined('SECURE_AUTH_KEY') ? SECURE_AUTH_KEY : '';
        $salt .= defined('LOGGED_IN_KEY') ? LOGGED_IN_KEY : '';

        if (empty($salt)) {
            // Generate a secure fallback key using WordPress functions
            $salt = wp_salt('auth') . wp_salt('secure_auth') . wp_salt('logged_in');
            if (empty($salt)) {
                // Final fallback - use a cryptographically secure random value
                $salt = 'insertabot_' . wp_generate_password(32, true, true);
            }
        }

        // Create a 256-bit (32-byte) key - required for both Sodium and AES-256
        return hash('sha256', $salt, true);
    }

    /**
     * Encrypt sensitive data using Sodium (XSalsa20-Poly1305)
     * Falls back to AES-256-CBC if Sodium is unavailable
     *
     * @param string $data Data to encrypt
     * @return string|false Encrypted data or false on failure
     */
    public static function encrypt($data) {
        if (empty($data)) {
            return '';
        }

        // Use Sodium if available (modern, recommended approach)
        if (self::sodium_available()) {
            return self::encrypt_sodium($data);
        }

        // Fallback to OpenSSL for older PHP installations
        return self::encrypt_legacy($data);
    }

    /**
     * Encrypt using Sodium (XSalsa20-Poly1305 authenticated encryption)
     *
     * @param string $data Data to encrypt
     * @return string|false Encrypted data or false on failure
     */
    private static function encrypt_sodium($data) {
        try {
            $key = self::get_encryption_key();

            // Generate random nonce (24 bytes for XSalsa20)
            $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);

            // Encrypt with authenticated encryption (includes MAC automatically)
            $ciphertext = sodium_crypto_secretbox($data, $nonce, $key);

            // Clear sensitive data from memory
            sodium_memzero($key);

            // Prefix with version identifier, combine nonce + ciphertext, base64 encode
            return self::SODIUM_PREFIX . base64_encode($nonce . $ciphertext);

        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Legacy encrypt using AES-256-CBC (for environments without Sodium)
     *
     * @param string $data Data to encrypt
     * @return string|false Encrypted data or false on failure
     */
    private static function encrypt_legacy($data) {
        try {
            $key = self::get_encryption_key();
            $iv_length = openssl_cipher_iv_length(self::LEGACY_CIPHER_METHOD);

            if ($iv_length === false) {
                return false;
            }

            $iv = random_bytes($iv_length);

            if ($iv === false) {
                return false;
            }

            // amazonq-ignore-next-line
            $encrypted = openssl_encrypt(
                $data,
                self::LEGACY_CIPHER_METHOD,
                $key,
                OPENSSL_RAW_DATA,
                $iv
            );

            if ($encrypted === false) {
                return false;
            }

            // Add HMAC for integrity verification
            $hmac = hash_hmac('sha256', $iv . $encrypted, $key, true);

            // Combine IV, encrypted data, and HMAC, then base64 encode
            return base64_encode($iv . $encrypted . $hmac);

        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Decrypt sensitive data (auto-detects encryption method)
     *
     * @param string $encrypted_data Encrypted data
     * @return string|false Decrypted data or false on failure
     */
    public static function decrypt($encrypted_data) {
        if (empty($encrypted_data)) {
            return $encrypted_data;
        }

        // Check if encrypted with Sodium (has prefix)
        if (strpos($encrypted_data, self::SODIUM_PREFIX) === 0) {
            return self::decrypt_sodium($encrypted_data);
        }

        // Legacy AES-256-CBC decryption
        return self::decrypt_legacy($encrypted_data);
    }

    /**
     * Decrypt using Sodium
     *
     * @param string $encrypted_data Encrypted data with sodium: prefix
     * @return string|false Decrypted data or false on failure
     */
    private static function decrypt_sodium($encrypted_data) {
        if (!self::sodium_available()) {
            return false;
        }

        try {
            $key = self::get_encryption_key();

            // Remove prefix and decode
            $data = base64_decode(substr($encrypted_data, strlen(self::SODIUM_PREFIX)), true);

            if ($data === false || strlen($data) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES) {
                return false;
            }

            // Extract nonce and ciphertext
            $nonce = substr($data, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
            $ciphertext = substr($data, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);

            // Decrypt (also verifies MAC automatically)
            $decrypted = sodium_crypto_secretbox_open($ciphertext, $nonce, $key);

            // Clear sensitive data from memory
            sodium_memzero($key);

            if ($decrypted === false) {
                return false;
            }

            return $decrypted;

        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Legacy decrypt using AES-256-CBC
     *
     * @param string $encrypted_data Encrypted data
     * @return string|false Decrypted data or false on failure
     */
    private static function decrypt_legacy($encrypted_data) {
        try {
            $key = self::get_encryption_key();
            $data = base64_decode($encrypted_data, true);

            if ($data === false) {
                return false;
            }

            $iv_length = openssl_cipher_iv_length(self::LEGACY_CIPHER_METHOD);

            if ($iv_length === false || strlen($data) <= ($iv_length + 32)) {
                return false;
            }

            $iv = substr($data, 0, $iv_length);
            $encrypted = substr($data, $iv_length, -32);
            $stored_hmac = substr($data, -32);

            if (strlen($iv) !== $iv_length) {
                return false;
            }

            // Verify HMAC before decryption
            $expected_hmac = hash_hmac('sha256', $iv . $encrypted, $key, true);
            if (!hash_equals($expected_hmac, $stored_hmac)) {
                return false;
            }

            $decrypted = openssl_decrypt(
                $encrypted,
                self::LEGACY_CIPHER_METHOD,
                $key,
                OPENSSL_RAW_DATA,
                $iv
            );

            if ($decrypted === false) {
                return false;
            }

            return $decrypted;

        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Securely store API key
     * 
     * @param string $api_key The API key to store
     * @return bool Success status
     */
    public static function store_api_key($api_key) {
        if (empty($api_key)) {
            delete_option('insertabot_api_key_encrypted');
            return true;
        }
        
        // Validate API key format before storing
        $validated = self::validate_api_key($api_key);
        if (is_wp_error($validated)) {
            return false;
        }
        
        $encrypted = self::encrypt($api_key);
        
        if ($encrypted === false) {
            return false;
        }
        
        return update_option('insertabot_api_key_encrypted', $encrypted, false);
    }
    
    /**
     * Retrieve and decrypt API key
     * 
     * @return string The decrypted API key
     */
    public static function get_api_key() {
        $encrypted = get_option('insertabot_api_key_encrypted', '');
        
        if (empty($encrypted)) {
            return '';
        }
        
        $decrypted = self::decrypt($encrypted);
        
        return $decrypted !== false ? $decrypted : '';
    }
    
    /**
     * Sanitize and validate API key format
     * 
     * @param string $api_key The API key to validate
     * @return string|WP_Error Sanitized key or WP_Error on failure
     */
    public static function validate_api_key($api_key) {
        $api_key = sanitize_text_field(trim($api_key));
        
        // Check format: should start with ib_sk_
        if (!empty($api_key) && !preg_match('/^ib_sk_[a-zA-Z0-9_]{32,}$/', $api_key)) {
            return new WP_Error(
                'invalid_api_key',
                __('Invalid API key format. Key should start with "ib_sk_" followed by at least 32 characters.', 'insertabot-ai-chatbot-solution')
            );
        }
        
        return $api_key;
    }
    
    /**
     * Hash API key for logging purposes (never log full key)
     *
     * @param string $api_key The API key
     * @return string Hashed key (first 4 chars + hash of rest)
     */
    public static function hash_api_key_for_log($api_key) {
        if (strlen($api_key) < 8) {
            return '***';
        }

        // Show only first 4 chars to minimize exposure
        $prefix = substr($api_key, 0, 4);
        $hash = substr(hash('sha256', $api_key), 0, 8);

        return $prefix . '...' . $hash;
    }
    
    /**
     * Log security events
     *
     * @param string $event Event description
     * @param array $context Additional context
     */
    public static function log_event($event, $context = array()) {
        // Allow developers to disable logging via filter
        if (!apply_filters('insertabot_enable_security_logging', true)) {
            return;
        }

        $log_entry = array(
            'timestamp' => current_time('mysql'),
            'event' => $event,
            'user_id' => get_current_user_id(),
            'ip' => self::get_client_ip(),
            'context' => $context
        );

        $logs = get_option('insertabot_security_logs', array());

        // Keep only last 100 entries
        if (count($logs) >= 100) {
            array_shift($logs);
        }

        $logs[] = $log_entry;
        update_option('insertabot_security_logs', $logs, false);
    }
    
    /**
     * Get client IP address (GDPR: anonymize last octet)
     * 
     * @param bool $anonymize Whether to anonymize the IP
     * @return string IP address
     */
    public static function get_client_ip($anonymize = true) {
        $ip = '';
        
        try {
            if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
                $ip = sanitize_text_field(wp_unslash($_SERVER['HTTP_CLIENT_IP']));
            } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
                $forwarded = sanitize_text_field(wp_unslash($_SERVER['HTTP_X_FORWARDED_FOR']));
                // Extract first IP from comma-separated list
                $ip = trim(explode(',', $forwarded)[0]);
            } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
                $ip = sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR']));
            }
        } catch (Exception $e) {
            return '0.0.0.0';
        }
        
        $ip = filter_var($ip, FILTER_VALIDATE_IP);
        
        if ($anonymize && $ip) {
            // Anonymize IP for GDPR compliance
            $is_ipv4 = filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4);
            if ($is_ipv4) {
                // IPv4: set last octet to 0
                $parts = explode('.', $ip);
                if (count($parts) === 4) {
                    $parts[3] = '0';
                    $ip = implode('.', $parts);
                }
            } elseif (!$is_ipv4 && filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
                // IPv6: set last 80 bits to 0
                $parts = explode(':', $ip);
                if (count($parts) >= 6) {
                    for ($i = 5; $i < 8; $i++) {
                        if (isset($parts[$i])) {
                            $parts[$i] = '0';
                        }
                    }
                    $ip = implode(':', $parts);
                }
            }
        }
        
        return $ip ?: '0.0.0.0';
    }
    
    /**
     * Verify nonce for AJAX requests
     * 
     * @param string $nonce The nonce to verify
     * @param string $action The action name
     * @return bool Whether nonce is valid
     */
    public static function verify_nonce($nonce, $action = 'insertabot_action') {
        if (empty($nonce) || !is_string($nonce)) {
            return false;
        }
        return wp_verify_nonce($nonce, $action) !== false;
    }
    
    /**
     * Generate nonce for AJAX requests
     * 
     * @param string $action The action name
     * @return string The nonce
     */
    public static function create_nonce($action = 'insertabot_action') {
        return wp_create_nonce($action);
    }
    
    /**
     * Check if user has permission to manage plugin
     * 
     * @return bool
     */
    public static function current_user_can_manage() {
        return current_user_can('manage_options');
    }
    
    /**
     * Sanitize widget configuration data
     *
     * @param array $config Configuration array
     * @return array Sanitized configuration
     */
    public static function sanitize_widget_config($config) {
        $sanitized = array();

        if (isset($config['primary_color'])) {
            $color = sanitize_text_field($config['primary_color']);
            // Validate hex color format (#RRGGBB)
            if (preg_match('/^#[a-fA-F0-9]{6}$/', $color) === 1) {
                $sanitized['primary_color'] = $color;
            }
        }

        if (isset($config['position'])) {
            $allowed_positions = array('bottom-right', 'bottom-left', 'top-right', 'top-left');
            $position = is_string($config['position']) ? $config['position'] : '';
            $sanitized['position'] = in_array($position, $allowed_positions, true)
                ? $position
                : 'bottom-right';
        }

        if (isset($config['bot_name'])) {
            $sanitized['bot_name'] = sanitize_text_field($config['bot_name']);
        }

        if (isset($config['bot_avatar_url'])) {
            // Sanitize URL and validate it's a valid image URL
            $url = esc_url_raw($config['bot_avatar_url']);
            if (!empty($url) && filter_var($url, FILTER_VALIDATE_URL)) {
                $sanitized['bot_avatar_url'] = $url;
            }
        }

        if (isset($config['greeting_message'])) {
            $sanitized['greeting_message'] = sanitize_textarea_field($config['greeting_message']);
        }

        if (isset($config['placeholder_text'])) {
            $sanitized['placeholder_text'] = sanitize_text_field($config['placeholder_text']);
        }

        if (isset($config['system_prompt'])) {
            $sanitized['system_prompt'] = sanitize_textarea_field($config['system_prompt']);
        }

        return $sanitized;
    }
}
