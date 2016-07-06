<?php
include 'world_cities_array.php';
$arr = [];
$count = 0;

foreach($cities_array as $place) {
    if ($count++ % 2 == 1) {
        $arr[] = [
            floatval($place['latitude']),
            floatval($place['longitude'])
        ];
    }
}

file_put_contents(
    './src/places.js',
    'window.places = '.json_encode($arr).';'
);
echo 'Done!';
