<?php

/*
report-handler.php
Handles the received webform data from the plugin frontend, and performs the required processing.
*/


// Include the gravityforms-uplink code
require_once __DIR__ . '/gravityforms-uplink.php';

// Include the aggregator too
require_once __DIR__ . '/aggregator.php';

// Handle query request
function report_handle_query() {
    //error_log(print_r("Query Handler was called query is ".$_GET['query'], true));
    // Get the mode of submission - if it is a query, then we handle like an API
    if (isset($_GET['query'])){
        // Get the query type
        $query_type = $_GET['query'];

        // List of Participants
        if ($query_type === 'participants') {
            // Get the participant list
            $participants = get_form_entry_names(
                $_ENV['FORM_ID_GET_PARTICIPANTS'], 
                $_ENV['FORM_GET_PARTICIPANT_FIRST_NAME_FIELD'],
                $_ENV['FORM_GET_PARTICIPANT_LAST_NAME_FIELD']);
            // Return the participant list
            error_log(print_r($participants, true));
            wp_send_json($participants);
        }

        // Get the Insight values for a given person and report
        if ($query_type === 'data') {
            error_log(print_r("Query Handler was called query is ".$_GET['query']." report is ".$_GET['report']." Name is ".$_GET['first_name']." ".$_GET['last_name'], true));
            $answer = [];
            if ($_GET['report'] === 'initial') {
                // Get Preprogram
                $answer = get_preprogram_response_for($_GET['first_name'], $_GET['last_name']);
            }

            if ($_GET['report'] === 'final') {
                // Get Completion
                $answer = get_completion_response_for($_GET['first_name'], $_GET['last_name']);
            }

            if ($_GET['report'] === 'delayed') {
                // Get Delayed
                $answer = get_3month_response_for($_GET['first_name'], $_GET['last_name']);
            }

            // prepare array to return
            $response = [
                'Insight' => calculateInsightValuesFor($answer),
                'Influence' => calculateInfluenceValuesFor($answer),
                'Impact' => calculateImpactValuesFor($answer)
            ];

            // Reply with the answer
            wp_send_json($response);
        }



    }
}

// Handle form submission
function report_handle_form_submission() {
    error_log(print_r("Form Handler was called", true));

    // Report mode (individual / batch)
    $report_mode = isset($_POST['report_mode'])
        ? sanitize_text_field($_POST['report_mode'])
        : 'individual';

    // Individual participant
    $participant = isset($_POST['participant'])
        ? sanitize_text_field($_POST['participant'])
        : '';

    // Batch participants (multi-select)
    $batch_participants = isset($_POST['batch_participants'])
        ? array_map('sanitize_text_field', (array) $_POST['batch_participants'])
        : [];

    // Evaluation points
    $evaluation_points = isset($_POST['evaluation_points'])
        ? array_map('sanitize_text_field', (array) $_POST['evaluation_points'])
        : [];

    // Benchmarks
    $benchmarks = isset($_POST['benchmarks'])
        ? array_map('sanitize_text_field', (array) $_POST['benchmarks'])
        : [];

    /*
    * Variables available:
    * $report_mode          string
    * $participant          string
    * $batch_participants   array
    * $evaluation_points    array
    * $benchmarks           array
    */

    // Dump it to the log
    error_log(print_r(
        [
            'report_mode' => $report_mode,
            'participant' => $participant,
            'batch_participants' => $batch_participants,
            'evaluation_points' => $evaluation_points,
            'benchmarks' => $benchmarks
            ],    
    true));

}