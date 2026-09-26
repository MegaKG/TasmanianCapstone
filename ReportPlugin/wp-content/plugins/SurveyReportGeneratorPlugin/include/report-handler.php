<?php

/*
report-handler.php
Handles the received webform data from the plugin frontend, and performs the required processing.
*/

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

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
    , true));

}