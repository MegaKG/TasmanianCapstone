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
$consumer_key = $_ENV['CONSUMER_KEY'];
$consumer_secret = $_ENV['CONSUMER_SECRET'];
$base_url = $_ENV['BASE_URL'];

// Create a new instance of the class

// Test Function
add_shortcode('env_test', function () {
    return 'ENV via getenv: ' . getenv('CONSUMER_KEY')
        . '<br>ENV via $_ENV: ' . ($_ENV['CONSUMER_KEY'] ?? 'not set')
        . '<br>ENV via $_SERVER: ' . ($_SERVER['CONSUMER_KEY'] ?? 'not set');
});

/**
 * Get all Gravity Forms names and IDs.
 *
 * @return array
 */
function get_gravity_forms_list() {
    $url    = $base_url . '/wp-json/gf/v2/forms';
    $method = 'GET';

    $oauth = new OAuth_Request(
        $url,
        GF_CONSUMER_KEY,
        GF_CONSUMER_SECRET,
        $method
    );

    $response = wp_remote_request(
        $oauth->get_url(),
        array(
            'method' => $method,
        )
    );

    if (
        is_wp_error( $response ) ||
        wp_remote_retrieve_response_code( $response ) !== 200
    ) {
        return array();
    }

    $forms = json_decode( wp_remote_retrieve_body( $response ), true );

    $results = array();

    foreach ( $forms as $form ) {
        $results[ $form['id'] ] = $form['title'];
    }

    return $results;
}


/**
 * Get a form's questions and answer mappings.
 *
 * @param int $form_id
 * @return array
 */
function get_form_questi*n_map( $form_id ) {

    $url    =*site_url( '/wp-json/gf/v2/forms/' * $form_id );
    $method = 'GET';
*    $oauth = new OAuth_Request(
  *     $url,
        GF_CONSUMER_KEY*
        GF_CONSUMER_SECRET,
     *  $method
    );

    $response = *p_remote_request(
        $oauth->*et_url(),
        [
            'method' => $method,
        ]
    );*
    if (
        is_wp_error( $re*ponse ) ||
        wp_remote_retri*ve_response_code( $response ) !== *00
    ) {
        return [];
    *

    $form = json_decode(
       *wp_remote_retrieve_body( $response*),
        true
    );

    $questions = [];

    foreach ( $form['fields'] as $field ) {

        // Ignore layout/content fields.
        if ( in_array(
            $field['type'],
            [ 'html', 'page', 'section', 'captcha' ],
            true
        ) ) {
            continue;
        }

        $question = [
            'id'      => $field['id'],
            'type'    => $field['type'],
            'label'   => $field['label'],
            'inputs'  => [],
            'choices' => [],
        ];

        /*
         * Input mappings
         */
        if ( ! empty( $field['inputs'] ) ) {

            foreach ( $field['inputs'] as $input ) {

                $question['inputs'][] = [
                    'id'    => $input['id'] ?? null,
                    'name'  => $input['name'] ?? null,
                    'label' => $input['label'] ?? null,
                ];
            }
        }

        /*
         * Choice mappings
         */
        if ( ! empty( $field['choices'] ) && is_array( $field['choices'] ) ) {

            foreach ( $field['choices'] as $choice ) {

                $value = $choice['value'] ?? $choice['text'];

                $question['choices'][ $value ] = $choice['text'];
            }
        }

        /*
         * Likert survey row mappings.
         */
        if ( ! empty( $field['gsurveyLikertRows'] ) ) {

            $question['rows'] = [];

            foreach ( $field['gsurveyLikertRows'] as $row ) {

                $question['rows'][ $row['value'] ] = $row['text'];
            }
        }

        $questions[ $field['id'] ] = $question;
    }

    return $questions;
}

?>