<?php
/*
Plugin Name: My GF OAuth Test
Description: Testing env variables + OAuth helper
Version: 1.0
Author: Kaelan Grainger
*/

// ^^^ Btw, wordpress won't load it if this comment doesn't exist

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
    return 'ENV via getenv: ' . getenv('CONSUMER_KEY')
        . '<br>ENV via $_ENV: ' . ($_ENV['CONSUMER_KEY'] ?? 'not set')
        . '<br>ENV via $_SERVER: ' . ($_SERVER['CONSUMER_KEY'] ?? 'not set');
});



?>