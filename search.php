<?php

require_once("page.php");

class Search implements View {
	private function getQuery() {
		if (!isset($_GET["q"])) {
			return "";
		}

		return $_GET["q"];
	}

	private function getSearchResult($query) {
		global $pageMap;
		$results = array();
		foreach ($pageMap as $page) {
			if ($query && $page->isSearchable() && strpos($page->generateContent(), $query)) {
				$results[] = $page;
			}
		}
		return $results;
	}

	private function getHeaders($content) {
		preg_match_all("/<h[1-9]>(.*)<\/h[1-9]>/", $content, $headers, PREG_SET_ORDER);
		return $headers;
	}

	function generateContent($lang) {
		$query = $this->getQuery();
		$results = $this->getSearchResult($query);

		$generated = array();
		foreach ($results as $page) {
			$content = $page->generateContent();
			$headers = $this->getHeaders($content);

			$generated[] = array(
				"url" => "/" . $page->getPageId(),
				"title" => $headers[0][1],
				"excerpt" => "test"
			);
		}

		ob_start();
		require("templates/$lang/search.php");
		return ob_get_clean();
	}
}

?>
