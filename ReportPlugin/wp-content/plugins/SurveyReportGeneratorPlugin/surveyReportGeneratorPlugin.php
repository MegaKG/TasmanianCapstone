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


// Create a new instance of the class

// Test Function
add_shortcode('env_test', function () {
    // Test the query
    error_log(print_r(get_gravity_forms_list(), true));

    $consumer_key = $_ENV['CONSUMER_KEY'];
    $consumer_secret = $_ENV['CONSUMER_SECRET'];
    $base_url = $_ENV['BASE_URL'];

    return '<br>Key: ' . $consumer_key . '<br>Secret: ' . $consumer_secret . '<br>Base URL: ' . $base_url;
});

/**
 * Get all Gravity Forms names and IDs.
 *
 * @return array
 */
function get_gravity_forms_list() {
    $consumer_key = $_ENV['CONSUMER_KEY'];
    $consumer_secret = $_ENV['CONSUMER_SECRET'];
    $base_url = $_ENV['BASE_URL'];

    $url    = $base_url . '/wp-json/gf/v2/forms';
    $method = 'GET';

    $oauth = new OAuth_Request(
        $url,
        $consumer_key,
        $consumer_secret,
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
        error_log(print_r($response, true));
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
function get_form_question_map( $form_id ) {
    $consumer_key = $_ENV['CONSUMER_KEY'];
    $consumer_secret = $_ENV['CONSUMER_SECRET'];
    $base_url = $_ENV['BASE_URL'];

    $url    =  $base_url . '/wp-json/gf/v2/forms/' . $form_id ;
    $method = 'GET';
    $oauth = new OAuth_Request(
       $url,
        $consumer_key,
        $consumer_secret,
       $method
    );

    $response = wp_remote_request(
        $oauth->get_url(),
        [
            'method' => $method,
        ]
    );
    if (
        is_wp_error( $response ) ||
        wp_remote_retrieve_response_code( $response ) !== 200
    ) {
        return [];
    }

    $form = json_decode(
        wp_remote_retrieve_body( $response ),
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

        // Input mappings
        if ( ! empty( $field['inputs'] ) ) {

            foreach ( $field['inputs'] as $input ) {

                $question['inputs'][] = [
                    'id'    => $input['id'] ?? null,
                    'name'  => $input['name'] ?? null,
                    'label' => $input['label'] ?? null,
                ];
            }
        }

        
        // Choice mappings
        if ( ! empty( $field['choices'] ) && is_array( $field['choices'] ) ) {

            foreach ( $field['choices'] as $choice ) {

                $value = $choice['value'] ?? $choice['text'];

                $question['choices'][ $value ] = $choice['text'];
            }
        }

        // Likert survey row mappings.
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

/**
 * Get simplified entry data for a form.
 *
 * @param int $form_id
 * @return array
 */
function get_form_entries( $form_id ) {
    $consumer_key = $_ENV['CONSUMER_KEY'];
    $consumer_secret = $_ENV['CONSUMER_SECRET'];
    $base_url = $_ENV['BASE_URL'];

    $field_map = get_form_question_map( $form_id );

    $url    = $base_url . '/wp-json/gf/v2/forms/' . $form_id . '/entries';
    $method = 'GET';

    $oauth = new OAuth_Request(
        $url,
        $consumer_key,
        $consumer_secret,
        $method
    );

    $response = wp_remote_request(
        $oauth->get_url(),
        [
            'method' => $method,
        ]
    );

    if (
        is_wp_error( $response ) ||
        wp_remote_retrieve_response_code( $response ) !== 200
    ) {
        return [];
    }

    $data = json_decode(
        wp_remote_retrieve_body( $response ),
        true
    );

    $results = [];

    foreach ( $data['entries'] as $entry ) {

        $answers = [];

        foreach ( $field_map as $field_id => $field ) {

            // Multi-input fields (Name, Survey etc.)
            if ( ! empty( $field['inputs'] ) ) {

                foreach ( $field['inputs'] as $input ) {

                    $input_id = (string) $input['id'];

                    if (
                        ! isset( $entry[ $input_id ] ) ||
                        $entry[ $input_id ] === ''
                    ) {
                        continue;
                    }

                    $value = $entry[ $input_id ];

                    /*
                     * Survey / Likert answers.
                     * Example:
                     * glikertrowb86af978:glikertcol12e671c3aa
                     * Need to map to the actual results from likert
                     */
                    if ( strpos( $value, ':' ) !== false ) {

                        list( $row_id, $choice_id ) = explode(
                            ':',
                            $value,
                            2
                        );

                        $question_text =
                            $field['rows'][ $row_id ]
                            ?? $input['label'];

                        $answer_text =
                            $field['choices'][ $choice_id ]
                            ?? $choice_id;

                        $answers[ $question_text ] = $answer_text;

                    } else {

                        $answers[ $input['label'] ] = $value;
                    }
                }

            } else {

                $field_key = (string) $field_id;

                if (
                    ! isset( $entry[ $field_key ] ) ||
                    $entry[ $field_key ] === ''
                ) {
                    continue;
                }

                $value = $entry[ $field_key ];

                // Single-choice fields.
                if ( isset( $field['choices'][ $value ] ) ) {
                    $value = $field['choices'][ $value ];
                }

                $answers[ $field['label'] ] = $value;
            }
        }

        $results[] = [
            'id'           => $entry['id'],
            'date_created' => $entry['date_created'],
            'answers'      => $answers,
        ];
    }

    return $results;
}

?>