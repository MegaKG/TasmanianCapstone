<?php

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Rounded corners toggle
    $rounded_corners = !empty($_POST['rounded_corners']);

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

    // Uploaded Excel file
    $excel_file = $_FILES['excel_file'] ?? null;

    /*
     * Variables available:
     *
     * $rounded_corners      bool
     * $report_mode          string
     * $participant          string
     * $batch_participants   array
     * $evaluation_points    array
     * $benchmarks           array
     * $excel_file           uploaded file array
     */

}