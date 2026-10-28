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

function getAnswer($answers, $question) {
    return $answers['answers'][$question] ?? null;
}

function getLikertValue($answers, $question, $likert_mapping) {
    $answer = getAnswer($answers, $question);
    return $answer !== null ? ($likert_mapping[$answer] ?? null) : null;
}

// Function to do weighted average
function calculateWeightedAverage($values, $weights) {
    $sum = 0;
    $sumWeights = 0;

    foreach ($values as $index => $value) {
        // Skip null values
        if ($value === null) {
            continue;
        }
        $sum += $value * $weights[$index];
        $sumWeights += $weights[$index];
    }
    // Handle division by zero
    if ($sumWeights === 0) {
        return 1;
    }
    return $sum / $sumWeights;
}

function calculateInsightValuesFor($answers) {
    global $likert_mapping;

    $InsightSelfAwareValue = getLikertValue($answers,'I have a very good understanding of why I do the things I do.',$likert_mapping);
    $InsightSelfAwareValue2 = getLikertValue($answers,'I am often confused about my feelings.',$likert_mapping);
    $InsightSocialAwareValue = getLikertValue($answers,'It is difficult for me to understand why people feel the way they do.',$likert_mapping);
    $InsightSocialAwareValue2 = getLikertValue($answers,'I can tell how people are feeling by listening to the tone of their voice.',$likert_mapping);
    $InsightClarityOfPurpose = getLikertValue($answers,'I change my mind frequently.',$likert_mapping);
    $InsightSituationalAwareValue = getLikertValue($answers,'Right now, I am conscious of all objects around me.',$likert_mapping);
    $InsightSituationalAwareValue2 = getLikertValue($answers,'Right now, I am keenly aware of everything in my environment.',$likert_mapping);
    $InsightSelfCompassion = getLikertValue($answers,'I regularly remTo what extent do you agree with the following statements (I have a very good understanding of why I do the things I do.)ind myself that failure and challenges are part of the human experience.',$likert_mapping);
    $InsightSelfCompassion2 = getLikertValue($answers,'In the past seven days I engaged in supportive and comforting self-talk',$likert_mapping);
    $InsightStrategicForesight = getLikertValue($answers,'Most of my objectives are focused on achieving targets due in the next six months.',$likert_mapping);
    $InsightStrategicForesight2 = getLikertValue($answers,'What percentage of your current objectives stretch on for more than two years into the future?',$likert_mapping);
    $InsightBalancedProcessing = getLikertValue($answers,'I am very uncomfortable objectively considering my limitations and shortcomings.',$likert_mapping);
    $InsightBalancedProcessing2 = getLikertValue($answers,'I often deny the validity of any compliments that I receive.',$likert_mapping);

    // The return array
    return [
        'Self Awareness' => calculateWeightedAverage([$InsightSelfAwareValue,$InsightSelfAwareValue2], [0.5, 0.5]),
        'Social Awareness' => calculateWeightedAverage([$InsightSocialAwareValue,$InsightSocialAwareValue2], [0.5, 0.5]),
        'Clarity Of Purpose' => $InsightClarityOfPurpose,
        'Situational Awareness' => calculateWeightedAverage([$InsightSituationalAwareValue,$InsightSituationalAwareValue2], [0.5, 0.5]),
        'Self Compassion' => calculateWeightedAverage([$InsightSelfCompassion,$InsightSelfCompassion2], [0.5, 0.5]),
        'Strategic Foresight' => calculateWeightedAverage([$InsightStrategicForesight,$InsightStrategicForesight2], [0.5, 0.5]),
        'Balanced Processing' => calculateWeightedAverage([$InsightBalancedProcessing,$InsightBalancedProcessing2], [0.5, 0.5]),
    ];
}

function calculateInfluenceValuesFor($answers) {
    global $likert_mapping;

    $InfluenceToleranceAmbiguity = getLikertValue($answers,'I like to surround myself with things that are familiar to me',$likert_mapping);
    $InfluenceToleranceAmbiguity2 = getLikertValue($answers,'A good job is one where what is to be done and how it is to be done are always clear',$likert_mapping);
    $InfluenceToleranceAmbiguity3 = getLikertValue($answers,'I like parties where I know most of the people more than ones where all or most of the people are complete strangers',$likert_mapping);
    $InfluenceToleranceComplexity = getLikertValue($answers,'If I were a scientist, it would bother me that my work would never be completed (because they always make new discoveries)',$likert_mapping);
    $InfluenceToleranceComplexity2 = getLikertValue($answers,'A good manager won’t make a decision until they have every possible piece of information about a matter.',$likert_mapping);
    $InfluenceToleranceComplexity3 = getLikertValue($answers,'Being unable to predict the future is exciting.',$likert_mapping);
    $InfluenceInformalInfluence = getLikertValue($answers,'I don’t need a position or title to inspire others',$likert_mapping);
    $InfluenceInformalInfluence2 = getLikertValue($answers,'Having a leadership position is the easiest way to influence others',$likert_mapping);
    $InfluenceEstablishNetworks = getLikertValue($answers,'I tend to avoid eye contact while waiting near other people',$likert_mapping);
    $InfluenceEstablishNetworks2 = getLikertValue($answers,'I will actively seek deep conversation with new people at a social event.',$likert_mapping);
    $InfluenceCollaboration = getLikertValue($answers,'I seek opportunities to meet with colleagues who disagree with me',$likert_mapping);
    $InfluenceCollaboration2 = getLikertValue($answers,'Managers need to focus on objectives more than team members',$likert_mapping);
    $InfluenceCreativeDecisionMaking = getLikertValue($answers,'I enjoy the opportunity to create new things',$likert_mapping);
    $InfluenceCreativeDecisionMaking2 = getLikertValue($answers,'I frequently imagine new ways of doing and being.',$likert_mapping);
    $InfluenceCreativeDecisionMaking3 = getLikertValue($answers,'It is easy to hold multiple possible futures at the same time.',$likert_mapping);
    $InfluenceCreativeDecisionMaking4 = getLikertValue($answers,'When I need to make a decision, I usually deploy an existing model first.',$likert_mapping);

    // The return array
    return [
        'Tolerance For Ambiguity' => calculateWeightedAverage([$InfluenceToleranceAmbiguity,$InfluenceToleranceAmbiguity2,$InfluenceToleranceAmbiguity3], [0.3, 0.3, 0.4]),
        'Tolerance For Complexity' => calculateWeightedAverage([$InfluenceToleranceComplexity,$InfluenceToleranceComplexity2,$InfluenceToleranceComplexity3], [0.3, 0.3, 0.4]),
        'Capacity For Informal Influence' => calculateWeightedAverage([$InfluenceInformalInfluence,$InfluenceInformalInfluence2], [0.5, 0.5]),
        'Capacity To Establish Networks' => calculateWeightedAverage([$InfluenceEstablishNetworks,$InfluenceEstablishNetworks2], [0.5, 0.5]),
        'Capacity For Collaboration' => calculateWeightedAverage([$InfluenceCollaboration,$InfluenceCollaboration2], [0.5, 0.5]),
        'Creative Decision Making' => calculateWeightedAverage([$InfluenceCreativeDecisionMaking,$InfluenceCreativeDecisionMaking2,$InfluenceCreativeDecisionMaking3,$InfluenceCreativeDecisionMaking4], [0.25, 0.25, 0.25, 0.25])
    ];
}


function calculateImpactValuesFor($answers) {
    global $likert_mapping;

    $ImpactRoleBehaviour = getLikertValue($answers,'I volunteer to help my workplace with tasks that need doing that might be out of my general scope.',$likert_mapping);
    $ImpactFosterBelonging = getLikertValue($answers,'I actively attempt to enable two very different friends of mine to build relationships.',$likert_mapping);
    $ImpactFosterBelonging2 = getLikertValue($answers,'At work, I focus on my work rather than building quality relationships with colleagues.',$likert_mapping);
    $ImpactFosterMotivation = getLikertValue($answers,'If I were interviewing a new staff member, I would emphasize how satisfying the work can be over wages.',$likert_mapping);
    $ImpactFosterMotivation2 = getLikertValue($answers,'I explain the benefit of a task prior to asking someone to do it.',$likert_mapping);
    $ImpactFosterMotivation3 = getLikertValue($answers,'People around me are primarily working for money or promotions.',$likert_mapping);
    $ImpactPlaceAttachment = getLikertValue($answers,'Tasmania will always be my home, even if I move away.',$likert_mapping);
    $ImpactPlaceAttachment2 = getLikertValue($answers,'I have limited attachment to the city I live in.',$likert_mapping);
    $ImpactPlaceAttachment3 = getLikertValue($answers,'At work, I prioritise on finishing only my own tasks.',$likert_mapping);

    // The return array
    return [
        'Extra Role Behaviours' => $ImpactRoleBehaviour,
        'Capacity To Foster Belonging' => calculateWeightedAverage([$ImpactFosterBelonging,$ImpactFosterBelonging2], [0.5, 0.5]),
        'Capacity To Foster Intrinsic Motivation' => calculateWeightedAverage([$ImpactFosterMotivation,$ImpactFosterMotivation2,$ImpactFosterMotivation3], [0.3, 0.3, 0.4]),
        'Place Attachment' => calculateWeightedAverage([$ImpactPlaceAttachment,$ImpactPlaceAttachment2,$ImpactPlaceAttachment3], [0.3, 0.3, 0.4])
    ];
}
?>