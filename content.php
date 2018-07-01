<?php
header("Content-type: text/plain");
header("Cache-Control: max-age=3600");

require_once("page.php");


echo Page::getPage($_GET["page"])->generateContent();
?>
