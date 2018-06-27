<?php
header("Content-type: text/plain");

require_once("page.php");


echo Page::getPage($_GET["page"])->getContent();
?>
