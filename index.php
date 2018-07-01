<?php
require_once("page.php");

function getRequestInfo() {
	$uri = $_SERVER["REQUEST_URI"];

	if ($uri[0] != '/') {
		die("Expected the request_uri to start with slash");
	}

	$uriParts = preg_split("/\?/", $uri);
	$_SERVER["REQUEST_FILE"] = $uriParts[0];

	if (count($uriParts) == 2 && $uriParts[1] != "") {
		$params = preg_split("/&/", $uriParts[1]);
		foreach ($params as $param) {
			list($key, $value) = preg_split("/=/", $param);
			$_GET[urldecode($key)] = urldecode($value);
		}
	}
	return substr($_SERVER["REQUEST_FILE"], 1);
}

function view() {
	$name = getRequestInfo();

	$acceptedLanguage = substr($_SERVER["HTTP_ACCEPT_LANGUAGE"], 0, 2);
	$lanuageSetting = @$_COOKIE["LANGUAGE"] ?: $acceptedLanguage;
	$lang = @$_GET["lang"] ?: $lanuageSetting;
	if ($lanuageSetting != $lang) {
		setcookie("LANGUAGE", $lang, time() + (3600 * 24 * 30), "/");
	}
	$content = Page::getPage($name)->generateContent($lang);
	$title = Search::getHeaders($content)[0][1];

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
