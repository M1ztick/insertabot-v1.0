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
 * Return the API key for use by the client-side widget bridge.
 *
 * The key is never placed in page markup — it is fetched at runtime by
 * widget-bridge.js and passed directly to the dynamically loaded widget
 * script via the data-api-key attribute. This keeps the raw key out of
 * HTML source while still allowing the widget to authenticate with the
 * Insertabot API for all site visitors.
 *
 * @param WP_REST_Request $request The REST request object.
 * @return WP_REST_Response|WP_Error Response object or WP_Error on failure.
 */
function insertabot_widget_token_endpoint( WP_REST_Request $request ) {
    if ( ! class_exists( 'Insertabot_Security' ) ) {
        return new WP_Error( 'no_security', 'Security helper missing', array( 'status' => 500 ) );
    }

    $api_key = Insertabot_Security::get_api_key();
    if ( empty( $api_key ) ) {
        return new WP_Error( 'no_api_key', 'API key not configured', array( 'status' => 400 ) );
    }

    return rest_ensure_response(
        array(
            'api_key' => $api_key,
        )
    );
}
