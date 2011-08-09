<?php
$filename = $_GET['filename'];
if (stripos($filename, "/") != False ) {die("bad filename $filename");}
if (stripos($filename, "./") != False ) {die("bad filename $filename");}
$fh = fopen("../public/" . $filename, 'w') or die("can't open file");
fwrite($fh, json_encode($_POST['json'], JSON_NUMERIC_CHECK));
fclose($fh);
?>

