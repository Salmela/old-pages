<?php
header("Content-type: text/plain");

switch ($_GET["page"]) {
case "main":
	echo <<<END
<h1>Etusivu</h1>
<p>Tein tämän sivun kouluni vapaa-valintaisena työnä, huhtikuussa 2011. Sivun tarkoituksena oli HTML5 ja CSS3 testaus. Aikaa sivun tekemisessä oli vain 8 koulu tuntia, joten tein sivuja myös kotona. Päätin että sivu pitää näkyä kaikilla selaimilla edes jotenkin siedettävässä muodossa (jopa IE:issä).</p>
END;
	break;
case "demo":
	echo <<<END
<h1>Demot</h1>
<p id="headertext">Tämä sivu on sisältää HTML5 ja CSS3 teknologiaa käyttäviä demoja.</p>

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
	break;

case "links":
	echo <<<END
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
	break;
default:
	echo <<<END
<h1>404 Sivua ei löydy</h1>
END;
	break;
}
?>
