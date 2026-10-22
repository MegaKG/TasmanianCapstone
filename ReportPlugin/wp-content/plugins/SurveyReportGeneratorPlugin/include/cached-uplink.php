<?php
require_once( __DIR__ . '/gravityforms-uplink.php' );

// The setup script for creating the database table
// We index via the first and last name of the user
function survey_cache_install()
{
    global $wpdb;

    $table_name = $wpdb->prefix . 'survey_response_cache';

    $charset_collate = $wpdb->get_charset_collate();

    $sql = "
    CREATE TABLE {$table_name} (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        response_type VARCHAR(32) NOT NULL,
        response_json LONGTEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        PRIMARY KEY (id),

        UNIQUE KEY participant_response (
            first_name,
            last_name,
            response_type
        )
    ) {$charset_collate};
    ";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);
}

// Helper to fetch from the cache
function get_cached_response(string $firstName, string $lastName, string $responseType)
{
    global $wpdb;

    $table = $wpdb->prefix . 'survey_response_cache';

    $result = $wpdb->get_var(
        $wpdb->prepare(
            "
            SELECT response_json
            FROM {$table}
            WHERE first_name = %s
            AND last_name = %s
            AND response_type = %s
            ",
            $firstName,
            $lastName,
            $responseType
        )
    );

    if ($result === null) {
        return null;
    }

    return json_decode($result, true);
}

// Helper to add to the cache
function save_cached_response(string $firstName, string $lastName, string $responseType, $response)
{
    global $wpdb;

    $table = $wpdb->prefix . 'survey_response_cache';

    $wpdb->replace(
        $table,
        [
            'first_name'    => $firstName,
            'last_name'     => $lastName,
            'response_type' => $responseType,
            'response_json' => wp_json_encode($response),
        ],
        [
            '%s',
            '%s',
            '%s',
            '%s'
        ]
    );
}

// The Cached versions of the uplink code
function get_cache_preprogram_response_for(string $firstName, string $lastName)
{
    $cached = get_cached_response(
        $firstName,
        $lastName,
        'preprogram'
    );

    if ($cached !== null) {
        return $cached;
    }

    $response = get_preprogram_response_for(
        $firstName,
        $lastName
    );

    if ($response !== null) {
        save_cached_response(
            $firstName,
            $lastName,
            'preprogram',
            $response
        );
    }

    return $response;
}


function get_cache_completion_response_for(string $firstName, string $lastName)
{
    $cached = get_cached_response(
        $firstName,
        $lastName,
        'completion'
    );

    if ($cached !== null) {
        return $cached;
    }

    $response = get_completion_response_for(
        $firstName,
        $lastName
    );

    if ($response !== null) {
        save_cached_response(
            $firstName,
            $lastName,
            'completion',
            $response
        );
    }

    return $response;
}

function get_cache_3month_response_for(string $firstName, string $lastName)
{
    $cached = get_cached_response(
        $firstName,
        $lastName,
        '3month'
    );

    if ($cached !== null) {
        return $cached;
    }

    $response = get_3month_response_for(
        $firstName,
        $lastName
    );

    if ($response !== null) {
        save_cached_response(
            $firstName,
            $lastName,
            '3month',
            $response
        );
    }

    return $response;
}

?>