<?php
require_once __DIR__ . '/gravityforms-uplink.php';

// Mapping of Likert to numerical values
$likert_mapping = [
    'Strongly Agree' => 1,
    'Agree'          => 2,
    'Neutral'        => 3,
    'Disagree'       => 4,
    'Strongly Disagree' => 5
];


function calculateInsightValuesFor( $answers ) {
    $InsightSelfAwareValue = $likert_mapping[$answers['answers']['To what extent do you agree with the following statements (I have a very good understanding of why I do the things I do.)']];
    $InsightSelfAwareValue2 = $likert_mapping[$answers['answers']['To what extent do you agree with the following statements (I am often confused about my feelings.)']];
    $InsightSocialAwareValue = $likert_mapping[$answers['answers']['To what extent do you agree with the following statements (It is difficult for me to understand why people feel the way they do.)']];
    $InsightSocialAwareValue2 = $likert_mapping[$answers['answers']['I can tell how people are feeling by listening to the tone of their voice.']];
    $InsightClarityOfPurpose = $likert_mapping[$answers['answers']['To what extent do you agree with the following statements (I change my mind frequently.)']];
    $InsightSituationalAwareValue = $likert_mapping[$answers['answers']['To what extent do you agree with the following statements (Right now, I am conscious of all objects around me.)']];
    $InsightSituationalAwareValue2 = $likert_mapping[$answers['answers']['To what extent do you agree with the following statements (Right now, I am keenly aware of everything in my environment.)']];
    $InsightSelfCompassion = $likert_mapping[$answers['answers']['To what extent do you agree with the following statements (I regularly remind myself that failure and challenges are part of the human experience.)']];
    $InsightSelfCompassion2 = $likert_mapping[$answers['answers']['To what extent do you agree with the following statements (In the past seven days I engaged in supportive and comforting self-talk)']];
    $InsightStrategicForesight = $likert_mapping[$answers['answers']['To what extent do you agree with the following statements (Most of my objectives are focused on achieving targets due in the next six months.)']];
    $InsightStrategicForesight2 = $likert_mapping[$answers['answers']['What percentage of your current objectives stretch on for more than two years into the future?']];
    $InsightBalancedProcessing = $likert_mapping[$answers['answers']['To what extent do you agree with the following statements (I am very uncomfortable objectively considering my limitations and shortcomings.)']];
    $InsightBalancedProcessing2 = $likert_mapping[$answers['answers']['To what extent do you agree with the following statements (I often deny the validity of any compliments that I receive.)']];

    
    }

?>