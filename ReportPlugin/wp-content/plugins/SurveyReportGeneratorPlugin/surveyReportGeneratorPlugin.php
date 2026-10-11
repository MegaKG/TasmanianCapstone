<?php
/*
Plugin Name: My GF OAuth Test
Description: Testing env variables + OAuth helper
Version: 1.0
Author: Kaelan Grainger
*/

// ^^^ Btw, wordpress won't load it if this comment doesn't exist

// Include the env file loader
require_once __DIR__ . '/vendor/autoload.php';

// Include the form receiver code
require_once __DIR__ . '/include/report-handler.php';

// Include the gravityforms-uplink code
require_once __DIR__ . '/include/gravityforms-uplink.php';

// Load .env variables (such as oauth creds and form config)
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load(); 

// Add redirect for static page http://localhost:8881/survey-report
add_action('init', function () {
    add_rewrite_rule(
        '^survey-report/?$',
        'index.php?survey_report=1',
        'top'
    );
});

add_filter('query_vars', function ($vars) {
    $vars[] = 'survey_report';
    return $vars;
});

add_action('template_redirect', function () {
    if (get_query_var('survey_report')) {
        wp_redirect(
            plugins_url('frontend/index.html', __FILE__),
            302
        );
        exit;
    }
});

// Test Function
add_shortcode('env_test', function () {
    // Test the query
    error_log(print_r(get_gravity_forms_list(), true));
    // Test query of question map for form id 43
    //error_log(print_r(get_form_question_map(43), true));
    //error_log(print_r(get_form_entry_names( 43, '52.3', '52.6'), true));

    $consumer_key = $_ENV['CONSUMER_KEY'];
    $consumer_secret = $_ENV['CONSUMER_SECRET'];
    $base_url = $_ENV['BASE_URL'];

    return '<br>Key: ' . $consumer_key . '<br>Secret: ' . $consumer_secret . '<br>Base URL: ' . $base_url;
});



// Handle form submission, use submodule
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    report_handle_form_submission();
}

// Accept Get as well for queries
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    report_handle_query();
}

?>