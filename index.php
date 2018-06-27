<?php
require_once("page.php");

$uri = $_SERVER["REQUEST_URI"];

if ($uri[0] != '/') {
	die("Expected the request_uri to start with slash");
}

if ($uri == '/') {
	$name = "main";
} else {
	$name = substr($uri, 1);
}

$content = Page::getPage($name)->getContent();
require_once("views/main.php");

?>
