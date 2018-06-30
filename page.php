<?php
$pageMap = array();

class Page {
	private $id;
	private $contentProvider;
	static private $notFoundPage;

	function __construct($id, $contentProvider) {
		global $pageMap;
		$this->id = $id;
		$this->contentProvider = $contentProvider;

		$pageMap[$id] = $this;
	}

	function getPageId() {
		return $this->id;
	}

	function getContent($lang="fi") {
		return $this->contentProvider->getContent($lang);
	}

	static function init() {
		self::$notFoundPage = new Page(null, "<h1>404 Sivua ei löydy</h1>", "<h1>404 Page not found</h1>");
	}

	static function getPage($pageName) {
		global $pageMap;
		if (!$pageName) $pageName = "main";
		if (array_key_exists($pageName, $pageMap)) {
			return $pageMap[$pageName];
		}
		http_response_code(404);
		return self::$notFoundPage;
	}
}

interface View {
	function getContent($lang);
}

class Template implements View {
	private $templateName;

	function __construct($templateName) {
		$this->templateName = $templateName;
	}

	function getContent($lang) {
		$contents = file_get_contents(str_replace('$lang', $lang, $this->templateName));
		if ($contents === False)
			return null;
		return $contents;
	}
}

Page::init();

new Page("main", new Template('templates/$lang/main.html'));
new Page("demo", new Template('templates/$lang/demoes.html'));
new Page("links", new Template('templates/$lang/links.html'));
//new Page("search", new Template('template/$lang/.html'));

?>
