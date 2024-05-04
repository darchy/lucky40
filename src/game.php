<?php

$v = 'v.1.0.0';
$vFinal = 'v.1.0.0';
$gameName = 'Lucky40';

$json = file_get_contents('../../game_versions.json');
$jsonData = json_decode($json, true);
$games = $jsonData['games'];
$gameNameMod = strtolower(str_replace(' ', '', $gameName));

for ($i = 0; $i < count($games); $i++)
{
    $gameItem = $games[$i];
    $gameItemName = strtolower(str_replace(' ', '', $gameItem['gameName']));
    
    if ($gameItemName == $gameNameMod)
    {
        $gameItemVersion = $gameItem['version'];
        $gameItemLastUpdate = $gameItem['lastUpdate'];
        $vFinal = $gameItemVersion . ', ' . $gameItemLastUpdate;
        $v = $gameItemVersion;
    }
}

?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="minimal-ui, width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<link rel="manifest" href="./assets/manifest.json">
<title>Lucky 40</title>
<script>window.version='<?php echo $vFinal; ?>';</script>
</head>

<body>

    <div id="mainContent">
        <!-- game content goes here -->
    </div>
    <div class="fakeTxtRubikBold">a</div>
    <div class="fakeTxtRubikMed">a</div>
    <div class="fakeTxtNotoSans">a</div>
    <div class="fakeTxtAzaretMed">a</div>
    
</body>
</html>
