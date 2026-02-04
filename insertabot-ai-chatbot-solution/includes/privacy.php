<?php
/**
 * Insertabot Privacy handlers
 * Registers personal data exporter and eraser callbacks for WP privacy tools
 *
 * @package Insertabot
 */

if ( ! defined( 'ABSPATH' ) ) {
    wp_die( 'Direct access not allowed.' );
}

add_filter( 'wp_privacy_personal_data_exporters', 'insertabot_register_personal_data_exporter' );
add_filter( 'wp_privacy_personal_data_erasers', 'insertabot_register_personal_data_eraser' );

/**
 * Register exporter with WP privacy tools
 *
 * @param array $exporters Array of exporters.
 * @return array Modified array of exporters.
 */
function insertabot_register_personal_data_exporter( array $exporters ) {
    $exporters['insertabot-logs'] = array(
        'exporter_friendly_name' => __( 'Insertabot security logs', 'insertabot-ai-chatbot-solution' ),
        'callback'               => 'insertabot_personal_data_exporter',
    );
    return $exporters;
}

/**
 * Number of logs to process per page for pagination
 */
define( 'INSERTABOT_PRIVACY_LOGS_PER_PAGE', 100 );

/**
 * Export personal data tied to an email address (security logs)
 *
 * @param string $email_address Email address to export data for.
 * @param int    $page          Page number (1-indexed).
 * @return array Export data array.
 */
function insertabot_personal_data_exporter( $email_address, $page = 1 ) {
    $user = get_user_by( 'email', $email_address );
    if ( ! $user ) {
        return array(
            'data' => array(),
            'done' => true,
        );
    }

    $user_id  = $user->ID;
    $per_page = INSERTABOT_PRIVACY_LOGS_PER_PAGE;
    $page     = max( 1, (int) $page );
    $offset   = ( $page - 1 ) * $per_page;

    $logs = (array) get_option( 'insertabot_security_logs', array() );

    if ( empty( $logs ) ) {
        return array(
            'data' => array(),
            'done' => true,
        );
    }

    // Get paginated subset of logs
    $total_logs   = count( $logs );
    $logs_page    = array_slice( $logs, $offset, $per_page, true );
    $is_last_page = ( $offset + $per_page ) >= $total_logs;

    $data        = array();
    $group_label = __( 'Insertabot security logs', 'insertabot-ai-chatbot-solution' );

    foreach ( $logs_page as $index => $log ) {
        if ( isset( $log['user_id'] ) && (int) $log['user_id'] === $user_id ) {
            $item_id = 'insertabot-log-' . $index;
            $entries = array(
                array(
                    'name'  => 'timestamp',
                    'value' => $log['timestamp'] ?? '',
                ),
                array(
                    'name'  => 'event',
                    'value' => $log['event'] ?? '',
                ),
                array(
                    'name'  => 'ip',
                    'value' => $log['ip'] ?? '',
                ),
                array(
                    'name'  => 'context',
                    'value' => isset( $log['context'] ) ? wp_json_encode( $log['context'] ) : '',
                ),
            );

            $data[] = array(
                'group_id'    => 'insertabot-logs',
                'group_label' => $group_label,
                'item_id'     => $item_id,
                'data'        => $entries,
            );
        }
    }

    return array(
        'data' => $data,
        'done' => $is_last_page,
    );
}

/**
 * Register eraser with WP privacy tools
 *
 * @param array $erasers Array of erasers.
 * @return array Modified array of erasers.
 */
function insertabot_register_personal_data_eraser( array $erasers ) {
    $erasers['insertabot-logs'] = array(
        'eraser_friendly_name' => __( 'Insertabot security logs', 'insertabot-ai-chatbot-solution' ),
        'callback'             => 'insertabot_personal_data_eraser',
    );
    return $erasers;
}

/**
 * Erase personal data tied to an email address (security logs)
 *
 * Note: Security logs are capped at 100 entries, so we process all at once
 * rather than paginating. This is more efficient for small, bounded datasets.
 *
 * @param string $email_address Email address to erase data for.
 * @param int    $page          Page number (unused - completes in one pass).
 * @return array Erase result array.
 */
function insertabot_personal_data_eraser( $email_address, $page = 1 ) {
    $result = array(
        'items_removed'  => false,
        'items_retained' => false,
        'messages'       => array(),
        'done'           => true,
    );

    $user = get_user_by( 'email', $email_address );
    if ( ! $user ) {
        return $result;
    }

    $user_id = $user->ID;
    $logs    = (array) get_option( 'insertabot_security_logs', array() );

    if ( empty( $logs ) ) {
        return $result;
    }

    // Filter out logs belonging to this user
    $filtered_logs = array();
    $removed       = 0;

    foreach ( $logs as $log ) {
        if ( isset( $log['user_id'] ) && (int) $log['user_id'] === $user_id ) {
            $removed++;
        } else {
            $filtered_logs[] = $log;
        }
    }

    if ( $removed > 0 ) {
        $updated = update_option( 'insertabot_security_logs', $filtered_logs, false );
        if ( $updated ) {
            $result['items_removed'] = true;
            $result['messages'][]    = sprintf(
                /* translators: %d: number of log entries removed */
                _n(
                    '%d security log entry removed',
                    '%d security log entries removed',
                    $removed,
                    'insertabot-ai-chatbot-solution'
                ),
                $removed
            );
        } else {
            $result['items_retained'] = true;
            $result['messages'][]     = __( 'Failed to update security logs', 'insertabot-ai-chatbot-solution' );
        }
    }

    return $result;
}
