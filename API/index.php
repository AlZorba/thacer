<?php
if (isset($_GET['GTh'])) {
    // Get the contents of the JSON file 
    $strJsonFileContents = file_get_contents("./geojson/secteurs.geojson");

    // Convert to array 
    $array = json_decode($strJsonFileContents, true);

    // Build GeoJSON feature collection array for response
    $geojson = array(
        'type' => 'FeatureCollection',
        'features' => array()
    );

    if (isset($_GET['RecNum'])) {
        $search = $_GET['RecNum'];
        $Param = 'RecNum';
        $error = '';
    } else {
        $error = "400   Bad Request - wrong or missing parameter";
    }
    ;
    if (isset($_GET['GTh'])) {
        $search = $_GET['GTh'];
        $Param = 'GTh';
        $error = '';
    } else {
        $error = "400   Bad Request - wrong or missing parameter";
    }
    ;

    //  Loop through rows to build feature arrays
    foreach ($array as $userdbchild) {
        $i = -1;
        foreach ($userdbchild as $userdbchildchild) {
            $i++;
            // foreach ($userdbchildchild as $props ) {

            // foreach ($props as $prop) {

            if ($array['features'][$i]['properties'][$Param] == $search) {
                // echo $array['features'][$i]['properties']['Titre'] . $i .'. ';
                // echo $Param;

                $marker = array(
                    'type' => 'Feature',
                    'properties' => array(
                        'RecNum' => $array['features'][$i]['properties']['RecNum'],
                        'GTh' => $array['features'][$i]['properties']['GTh'],
                        'Titre' => $array['features'][$i]['properties']['Titre'],
                        'Référenc' => $array['features'][$i]['properties']['Référenc'],
                        'Description' => $array['features'][$i]['properties']['Description'],
                    ),
                    'geometry' => $array['features'][$i]['geometry']
                );

                array_push($geojson['features'], $marker);

                // }
                // }   
            }
        }
    }

} elseif (isset($_GET['CERAM'])) {
    # Build GeoJSON feature collection array
    $geojson = array(
        'type' => 'FeatureCollection',
        'features' => array()
    );

    $files = glob("./CSV/*");
    foreach ($files as $filepath) {
        if ($handle = fopen($filepath, "r")) {
            # Loop through rows to build feature arrays
            $header = NULL;
            while (($row = fgetcsv($handle, 0, ',')) !== FALSE) {
                if (!$header) {
                    $header = $row;
                } else {
                    $data = array_combine($header, $row);
                    $properties = $data;
                    # Remove x and y fields from properties (optional)
                    unset($properties[x]);
                    unset($properties[y]);
                    $properties['Corpus'] = basename($filepath, ".txt");
                    $feature = array(
                        'type' => 'Feature',
                        'geometry' => array(
                            'type' => 'Point',
                            'coordinates' => array(
                                $data[x] ? $data[x] : 0,
                                $data[y] ? $data[y] : 0
                            )
                        ),
                        'properties' => $properties
                    );
                    # Add feature arrays to feature collection array
                    array_push($geojson['features'], $feature);
                }
            }
            fclose($handle);
        }
    }
    // Requête vers l'API Heurist pour obtenir les données de céramiques
    $url = "https://heurist.huma-num.fr/h6-alpha/api/records?db=THASOS_CERAMIQUE";

    $heuristData = file_get_contents($url);
    $dataArray = json_decode($heuristData, true);

    $periodeMapping = array(
        9639 => "Archaïque",
        9640 => "Classique",
        9641 => "Hellénistique",
        9638 => "Précoloniale",
        9642 => "Romaine"
    );
    $familleMapping = array(
        9659 => "amphore",
        9658 => "céramique de cuisson",
        9652 => "commune",
        9653 => "fine",
        9651 => "stockage",
        9650 => "tablette",
        9657 => "trépied"
    );
    $categorieMapping = array(
        9662 => "Bol à reliefs",
        9663 => "Campanienne",
        9669 => "Céramique à fond blanc",
        9664 => "Chypriote",
        9665 => "Cnidienne",
        9649 => "Corinthienne",
        9655 => "Cycladique",
        9648 => "Sigillée orientale C",
        9660 => "Figures Noires",
        9646 => "Figures Rouges",
        9654 => "Orientalisante",
        9670 => "Paroi fine",
        9668 => "Pergaménienne",
        9666 => "Sigillée orientale A",
        9667 => "Sigillée orientale B",
        9647 => "Vernis noir",
        9645 => "Vernis rouge",
        9671 => "West Slope"
    );

    if ($dataArray && isset($dataArray['records'])) {
        // Boucler sur chaque enregistrement de l'API Heurist
        foreach ($dataArray['records'] as $record) {
            // Vérifier la présence des informations nécessaires et construire les propriétés
            $properties = array(
                'Corpus' => current($record['details']['1128']), // source, collection
                'ID' => current($record['details']['1128']) . current($record['details']['1123']),
                'Description' => current($record['details']['1118']),
                'Références' => current($record['details']['1119']),
                'Attribution' => current($record['details']['1124']),
                'Forme' => current($record['details']['1117']),
            );

            if (isset($record['details']['1107'])) {
                $properties['Pi'] = current($record['details']['1107']);
            }
            if (isset($record['details']['1108'])) {
                $properties['Inventaire'] = current($record['details']['1108']);
            }
            if (isset($record['details']['1111'])) {
                $properties['Provenance'] = current($record['details']['1111']);
            }
            if (isset($record['details']['1112'])) {
                $properties['secteur_ID'] = current($record['details']['1112']);
            }
            if (isset($record['details']['1114'])) {
                $properties['Catégorie'] = isset($familleMapping[current($record['details']['1114'])])
                    ? $familleMapping[current($record['details']['1114'])]
                    : "Inconnue";
            }
            if (isset($record['details']['1115'])) {
                $properties['Catégorie'] = isset($categorieMapping[current($record['details']['1115'])])
                    ? $categorieMapping[current($record['details']['1115'])]
                    : "Inconnue";
            }
            if (isset($record['details']['1120'])) {
                $properties['Période'] = isset($periodeMapping[current($record['details']['1120'])])
                    ? $periodeMapping[current($record['details']['1120'])]
                    : "Inconnue";
            }
            $geometry = array(
                'type' => 'Point',
                'coordinates' => array(
                    isset($record['details']['1121']) ? current($record['details']['1121']) : 0,
                    isset($record['details']['1122']) ? current($record['details']['1122']) : 0
                )
            );

            // Créer l'entrée Feature pour ce record
            $feature = array(
                'type' => 'Feature',
                'geometry' => $geometry,
                'properties' => $properties
            );

            // Ajouter la fonctionnalité au tableau GeoJSON
            array_push($geojson['features'], $feature);
        }
    }


} elseif (isset($_GET['INV'])) {
    // Return a json object with 3 lists of image urls. Example :
// {
//    "PHOTO":[
//        "https:\/\/thacer.archaiodata.com\/API/IMAGES\/PHOTO\/758Π.JPG",
//        "https:\/\/thacer.archaiodata.com\/API/IMAGES\/PHOTO\/758Π_2.JPG",
//        "https:\/\/thacer.archaiodata.com\/API/IMAGES\/PHOTO\/758Π_3.JPG"
//    ],
//    "THA_MACRO_PHOTO":[
//        "https:\/\/thacer.archaiodata.com\/API/IMAGES\/THA_MACRO_PHOTO\/THA23.JPG"
//    ],
//    "Profils":[
//    ]
//}

    $result = ['PHOTO' => [], 'THA_MACRO_PHOTO' => [], 'Profils' => [],];
    $INV = $_GET['INV'];
    $ANA = $_GET['ANA'];

    $dir = 'IMAGES/PHOTO/*' . $INV . '[Π_ -.]*{jpg,jpeg,JPG,gif,png}';
    $files = glob($dir, GLOB_BRACE);
    foreach ($files as $image) {
        $result['PHOTO'][] = 'https://thacer.archaiodata.com/API/' . $image;
    }

    if ($ANA != '') {
        $dir = 'IMAGES/THA_MACRO_PHOTO/*' . $ANA . '*.{jpg,jpeg,JPG,gif,png}';
        $files = glob($dir, GLOB_BRACE);
        foreach ($files as $image) {
            $result['THA_MACRO_PHOTO'][] = 'https://thacer.archaiodata.com/API/' . $image;
        }
    }

    $dir = 'IMAGES/Profils/*' . $INV . '[Π_ -.]*{jpg,jpeg,JPG,gif,png}';
    $files = glob($dir, GLOB_BRACE);
    foreach ($files as $image) {
        $result['Profils'][] = 'https://thacer.archaiodata.com/API/' . $image;
    }
    $geojson = $result;
} else {
    $error = '';
    $geojson = "400   Bad Request -  w or missing parameter";
}


header('Content-type: application/json');
if (empty($error)) {
    print json_encode($geojson, JSON_NUMERIC_CHECK);
} else {
    print $error;
}
;

?>