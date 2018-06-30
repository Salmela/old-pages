<?php

require_once("page.php");

if (!isset($_GET["q"])) {
	die("Expect query 'q' GET parameter");
}

$query = $_GET["q"];
$isEmpty = true;
echo "<div class=\"section\">";
echo "<h1>Haku tulokset</h1>";

$results = array();
foreach ($pageMap as $page) {
	if ($query && strpos($page->getContent(), $query)) {
		$results[] = $page;
	}
}
if (empty($results)) {
	echo "<p>No results found</p>";
} else {
	echo "<ol>";
	foreach ($results as $page) {
		echo "<li><a href=\"/" . $page->getPageId() . "\">" . $page->getPageId() . "</a></li>";
	}
	echo "</ol>";
}
echo "</div>";

?>
