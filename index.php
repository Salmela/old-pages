<?php
require_once("page.php");

function getRequestInfo() {
	$uri = $_SERVER["REQUEST_URI"];

	if ($uri[0] != '/') {
		die("Expected the request_uri to start with slash");
	}

	$uriParts = preg_split("/\?/", $uri);
	$filename = $uriParts[0];

	if (count($uriParts) == 2) {
		$params = preg_split("/&/", $uriParts[1]);
		foreach ($params as $param) {
			list($key, $value) = preg_split("/=/", $param);
			$_GET[$key] = $value;
		}
	}
	return substr($filename, 1);
}

function view() {
	$name = getRequestInfo();

	$content = Page::getPage($name)->generateContent();
	if (isset($_GET["format"]) && $_GET["format"] == "body") {
		header("Content-type: text/plain");
		header("Cache-Control: max-age=3600");
		echo $content;
	} else {
		require_once("views/main.php");
	}
}

view();

?>
