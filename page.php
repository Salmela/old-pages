<?php
$pageMap = array();

/* put the data to database */
class Page {
	private $id;
	private $content;
	private $contentEnglish;
	static private $notFoundPage;

	function __construct($id, $contentFinnish, $contentEnglish) {
		global $pageMap;
		$this->id = $id;
		$this->content = $contentFinnish;
		$this->contentEnglish = $contentEnglish;

		$pageMap[$id] = $this;
	}

	function getPageId() {
		return $this->id;
	}

	function getContent($lang="fi") {
		return $lang == "fi" ? $this->content : $this->contentEnglish;
	}

	static function init() {
		self::$notFoundPage = new Page(null, "<h1>404 Sivua ei löydy</h1>", "<h1>404 Page not found</h1>");
	}

	static function getPage($pageName) {
		global $pageMap;
		if (isset($pageName) && array_key_exists($pageName, $pageMap)) {
			return $pageMap[$pageName];
		}
		return self::$notFoundPage;
	}
}

Page::init();

$content = <<<END
<div class="section">
<h1>Etusivu</h1>
<p>Tein tämän sivun kouluni vapaa-valintaisena työnä, huhtikuussa 2011. Sivun tarkoituksena oli HTML5 ja CSS3 testaus. Aikaa sivun tekemisessä oli vain 8 koulu tuntia, joten tein sivuja myös kotona. Päätin että sivu pitää näkyä kaikilla selaimilla edes jotenkin siedettävässä muodossa (jopa IE:issä).</p>
</div>
END;

$value = new Page("main", $content, null);

$content = <<<END
<h1>Demot</h1>
<p id="headertext">Tämä sivu on sisältää HTML5 ja CSS3 teknologiaa käyttäviä demoja. Kaikki demot tällä sivulla on toteutettu 2011-2013 ellei toisin mainita</p>

<div>
<h3><a href="demoes/color_wheel.html">Väripyörä</a></h3>
<img src="images/color_wheel.png" />
<p>
Tämän projektin tarkoitus oli luoda värin valitsin nanoInkscape demolleni. Käytin sitä myös teksti editori demossani. Inspiraationa käytin Gimp:istä ja inkscape:sta löytyvää värin valitsin komponenttia. Toteutukseni on kuitekin täysin tyhjästä luotu eli en tutkinut miten tämä komponentti oli luotu Inkscape:ssa ja Gimp:issä.
</p>
<p>
21-24.6.2018 Refactoroin koodia aika paljon ja tein mahdolliseksi väripyörän tilan muokkaamisen ulkopuolisen värin perusteella.
</p>
</div>

<div>
<h3>InfoTV</h3>
<img src="images/infotv.png" />
<p>
Aloitin tämän projektin yhdeksännellä luokalla korvaamaan kouluni vanhan ja kökön infotv:n. Alkuperäinen info tv oli luotu Microsoft PowerPointilla ja se toimi vain IE selaimella, kun taas oma toteutukseni toimi kaikilla muilla selaimilla paitsi silloisella IE:llä... Kouluni käytti tätä kouluni käytävillä olevissa tv:eissä muutaman vuoden, jonka jälkeen he siirtyivät google slideihin.
</p>
<p>
Tämä projekti on toteutettu WordPressin päälle ja epäilen että sen käyttö lopetettiin, koska WordPress paremmin soveltuu sen alkuperäiseen käyttötarkoitukseen eli blogien luomiseen eikä slideshowejen piirtelyyn :). En myöskään saanut mitään palautetta tai parannus ehdotuksia koko projektin aikana mikä jäi vähän harmittamaan.
</p>
<p>
Tein monta uudelleen toteutusta tästä projektista, koska en ollut tyytyväinen sen alkuperäiseen rakenteeseen. Mutta minulla silloin ei ollut motivaatiota toteuttaa mitään niistä loppuun.
</p>
</div>

<div>
<h3><a href="demoes/editor.html">Text editor</a></h3>
<img src="images/text_editor.png" />
<p>
Tein tämän WYSIWYG teksti editorin InfoTV slidejen luontiin. En kuitenkaan koskaan käyttänyt sitä enkä kunnolla viimeistellyt sitä. Touteutin sen selainten tarjoamalla contentEditable ominaisuudella, mutta se osottautui erittäin kömpelöksi.
</p>
</div>

<div>
<h3><a href="nanoInkscape/draw.htm">nanoInkscape</a></h3>
<p>
Kun olin tekemässä vava tunnilla tätä sivua, törmäsin svg javascript apiin jolla pystyi generoimaan svg kuvia. Tein tämän demon, jotta voisin leikkiä tuolla svg apilla. Tämä demo toteuttaa <a href="http://www.inkscape.org">Inkscape</a> nimisen työpöytä ohjelman perus ominaisuudet.
</p>
<p>
21-24.6.2018 Tein paljon lisää ominaisuuksia tähän demoon ja toteutin sille suht hyvän ulkoasun. <a href="nanoInkscape2/draw.htm">Alkuperäinen versio</a> toimi vain firefoxilla enään, koska svg api jota käytin oli poistettu webkitistä ja se oli korvattu yksinkertaisemmalla api:lla.
</p>
</div>

<div>
<h3><a href="demoes/image.old.html">Kuva editori</a></h3>
<p>
Näemmä tosi keskeneräinen projekti.
</p>
</div>
END;

$contentEnglish = <<<END
<h1>Demoes</h1>
<p id="headertext">This page contains some of the HTML5 and CSS demoes that I have done.</p>

<div>
<h3><a href="demoes/color_wheel.html">Color wheel</a></h3>
<img src="images/color_wheel.png" />
<p>
This project's purpose was to create color selector for nanoInkscape, but I used it also in Text editor and Photo editor experiments.
I got the idea of color wheel from Gimp and Inkscape. It has still some problems like the color of the widget won't be automatically updated if you change the color outside of the widget.
</p>
</div>

<div>
<h3>InfoTV</h3>
<img src="images/infotv.png" />
<p>
I started this project at ninth year of comprehensive school to replace my previous school's old and ugly infotv which was created with Microsoft PowerPoint. And it orginally worked only in IE, but now it works almost every browser except IE... I don't want to publish the address of the official infotv, because it's not on this server.
</p>
</div>

<div>
<h3><a href="demoes/editor.html">Text editor</a></h3>
<img src="images/text_editor.png" />
<p>
I made this WYSIWYG editor for the InfoTV, but because it was so hard to get it working well I finally desided to not use it.
</p>
</div>

<div>
<h3><a href="nanoInkscape/draw.htm">nanoInkscape</a></h3>
<p>
When I was making this site I came across with svg on web page and I wanted to try create vector graphics editor demo.
</p>
</div>

<div>
<h3><a href="demoes/image.old.html">Photo editor</a></h3>
</div>

END;
new Page("demo", $content, $contentEnglish);

$content = <<<END
<h1>Linkit</h1>
<p id="headertext">Koska Internetin alkuperäinen tarkoitus oli jakaa tietoja ja tehdä suuria verkkoja, jotka on linkitetty yhteen. Päätin tehdä linkki listan jolle lisään kaikki mielenkiintoiset sivut joita löydän. Lista on vielä aika vaatimaton, mutta muutamassa vuodessa se varmasti venyy...</p>
<div>
  <h2>HTML5</h2>
  <ul>
    <li><a href="http://www.ecma-international.org/publications/standards/Ecma-262.htm">Javascript specification</a></li>
    <li><a href="http://dev.w3.org/html5/spec/Overview.html">HTML specification</a></li>
  </ul>
</div>
<div>
  <h2>Linux</h2>
<ul>
<li><a href="http://www.gnu.org">GNU</a></li>
<li><a href="http://www.kernel.org">Linux kernel</a></li>
<li><a href="http://www.gnome.org">Gnome</a></li>
<li><a href="http://www.ubuntu.org">Ubuntu</a></li>
<li><a href="http://www.debian.org">Debian</a></li>
    <li><a href="http://www.archlinux.org">Archlinux</a></li>
  </ul>
</div>
<div>
  <h2>Muut</h2>
  <ul>
    <li><a href="http://en.wikipedia.org">Wikipedia</a></li>
    <li><a href="http://www.gutenberg.org">Project Gutenberg</a></li>
    <li><a href="http://www.textbookrevolution.org">Textbook Revolution</a></li>
    <li><a href="http://www.google.com">Google</a></li>
  </ul>
</div>
END;
new Page("links", $content, null);
?>
