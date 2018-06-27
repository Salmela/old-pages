<?php
header("Content-type: text/plain");

require_once("page.php");

$pageName = isset($_GET["page"]) ? $_GET["page"] : null;

echo Page::getPage($pageName)->getContent();
?>
