<?php
// Author: Kaelan Grainger (2026)

// Include the helper library as recommended by Gravityforms Doc
// Use helper to get oAuth authentication parameters in URL.
// Download helper library from: https://docs.gravityforms.com/wp-content/uploads/2017/01/class-oauth-request.php_.zip
require_once( 'class-oauth-request.php' );

// Include the env file loader
require_once __DIR__ . '/vendor/autoload.php';

// Load .env variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Read the keys from the .env file
$consumer_key = getenv('CONSUMER_KEY');
$consumer_secret = getenv('CONSUMER_SECRET');
$base_url = getenv('BASE_URL');

// Create a new instance of the class

// Test Function
add_shortcode('env_test', function () {
    return 'Consumer Key: ' . getenv('CONSUMER_KEY');
});



?>