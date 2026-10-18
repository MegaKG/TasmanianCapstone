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

function calculateInfluenceValuesFor( $answers ){
    $InfluenceToleranceAmbiguity = $likert_mapping[$answers['answers']['I like to surround myself with things that are familiar to me']];
    $InfluenceToleranceAmbiguity2 = $likert_mapping[$answers['answers']['A good job is one where what is to be done and how it is to be done are always clear']];
    $InfluenceToleranceAmbiguity3 = $likert_mapping[$answers['answers']['I like parties where I know most of the people more than ones where all or most of the people are complete strangers']];
    $InfluenceToleranceComplexity = $likert_mapping[$answers['answers']['If I were a scientist, it would bother me that my work would never be completed (because they always make new discoveries)']];
    $InfluenceToleranceComplexity2 = $likert_mapping[$answers['answers']['A good manager won’t make a decision until they have every possible piece of information about a matter.']];
    $InfluenceToleranceComplexity3 = $likert_mapping[$answers['answers']['To what extent do you agree with the following statements (Being unable to predict the future is exciting.)']];
    $InfluenceInformalInfluence = $likert_mapping[$answers['answers']['I don’t need a position or title to inspire others']];
    $InfluenceInformalInfluence2 = $likert_mapping[$answers['answers']['Having a leadership position is the easiest way to influence others']];
    $InfluenceEstablishNetworks = $likert_mapping[$answers['answers']['I tend to avoid eye contact while waiting near other people']];
    $InfluenceEstablishNetworks2 = $likert_mapping[$answers['answers']['I will actively seek deep conversation with new people at a social event.']];
    $InfluenceCollaboration = $likert_mapping[$answers['answers']['I seek opportunities to meet with colleagues who disagree with me']];
    $InfluenceCollaboration2 = $likert_mapping[$answers['answers']['Managers need to focus on objectives more than team members']];
    $InfluenceCreativeDecisionMaking = $likert_mapping[$answers['answers']['To what extent do you agree with the following statements (I enjoy the opportunity to create new things)']];
    $InfluenceCreativeDecisionMaking2 = $likert_mapping[$answers['answers']['To what extent do you agree with the following statements (I frequently imagine new ways of doing and being.)']];
    $InfluenceCreativeDecisionMaking3 = $likert_mapping[$answers['answers']['To what extent do you agree with the following statements (It is easy to hold multiple possible futures at the same time.)']];
    $InfluenceCreativeDecisionMaking4 = $likert_mapping[$answers['answers']['To what extent do you agree with the following statements (When I need to make a decision, I usually deploy an existing model first.)']];
}
?>