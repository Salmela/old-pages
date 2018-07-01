<?php

require_once("page.php");

class Search implements View {
	private function getQuery() {
		if (!isset($_GET["q"])) {
			return "";
		}

		return $_GET["q"];
	}

	private function getSearchResult($query, $lang) {
		global $pageMap;
		$results = array();
		foreach ($pageMap as $page) {
			if ($query && $page->isSearchable() && strpos($page->generateContent($lang), $query) !== false) {
				$results[] = $page;
			}
		}
		return $results;
	}

	private function normalize($token) {
		if (class_exists("Normalizer")) {
			return Normalizer::normalize(mb_strtolower($token, "UTF-8"));
		} else {
			return mb_strtolower($token, "UTF-8");
		}
	}

	private function getTokenizer($content) {
		preg_match_all("/<\/?[a-z1-9]+(?:\s[^>]*)?>|[\\p{L}]+/u", $content, $tokens, PREG_SET_ORDER);
		$textTokens = [];
		foreach ($tokens as $match) {
			$token = $match[0];
			if ($token[0] != "<" && strlen(trim($token)) != 0) {
				$textTokens[] = $this->normalize($token);
			}
		}
		return $textTokens;
	}

	static function getHeaders($content) {
		preg_match_all("/<h[1-9][^>]*>(.*)<\/h[1-9]>/", $content, $headers, PREG_SET_ORDER);
		return $headers;
	}

	function generateContent($lang) {
		$query = $this->getQuery();
		$results = $this->getSearchResult($query, $lang);

		$generated = array();
		foreach ($results as $page) {
			$content = $page->generateContent($lang);
			$textTokens = $this->getTokenizer($content);
			//var_dump($textTokens);
			$headers = $this::getHeaders($content);

			$position = array_search($query, $textTokens);
			$offset = max(0, $position - 4);
			$fragment = array_slice($textTokens, max(0, $position - 4), $position - $offset);
			$fragment[] = "<strong>" . $textTokens[$position] . "</strong>";
			$offset = $position + 1;
			$fragment = array_merge($fragment, array_slice($textTokens, $offset,
				min(count($textTokens), $position + 4) - $offset));
			$generated[] = array(
				"url" => "/" . $page->getPageId(),
				"title" => $headers[0][1],
				"excerpt" => join(" ", $fragment)
			);
		}

		ob_start();
		require("templates/$lang/search.php");
		return ob_get_clean();
	}
}

?>
