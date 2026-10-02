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

// Test Function
add_shortcode('env_test', function () {
    // Test the query
    error_log(print_r(get_gravity_forms_list(), true));

    $consumer_key = $_ENV['CONSUMER_KEY'];
    $consumer_secret = $_ENV['CONSUMER_SECRET'];
    $base_url = $_ENV['BASE_URL'];

    return '<br>Key: ' . $consumer_key . '<br>Secret: ' . $consumer_secret . '<br>Base URL: ' . $base_url;
});


?>