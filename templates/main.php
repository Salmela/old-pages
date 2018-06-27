<!DOCTYPE html>
<html lang="fi">
<head>
  <title>Otsikko</title>
  <link rel="stylesheet" title="Perus" type="text/css" href="style.css">
  <meta charset="utf-8">
  <meta name="robots" content="noindex,nofollow">
  <link href="https://fonts.googleapis.com/css?family=Gentium+Basic" rel="stylesheet" type="text/css" crossorigin="anonymous">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=4.0" />
</head>
<body>
  <div id="wrap">
    <header id="header">
      <div id="headerright" class="js"><button id="font-resize-button">Aa</button> | <a href="javascript: void(0);" onclick="login.show()">kirjaudu sisään</a></div>
      <h1><span>Sivusto</span></h1>
      <div id="nav_placeholder"></div>
      <nav>
        <div id="menus">
          <ol>
            <li id="main"><a href="#main" onclick="content.load('main');">Etusivu</a></li>
            <li id="demo" class="menu"><a href="#demo" onclick="content.load('demo');">Demoja</a>
              <ul>
                <li><a href="#demo" onclick="content.load('demo');">Javascript</a></li>
                <li><a href="javascript: void(0)" onclick="window.open('nanoInkscape/draw.htm', 'piirrä', 'width=300, height=300');">nanoInkscape</a></li>
              </ul>
            </li>
            <li id="links" class="menu"><a href="#links" onclick="content.load('links');">Linkkejä</a>
              <ul>
                <li><a href="http://www.google.com">Google</a></li>
                <li><a href="http://www.kernel.org">Linux</a></li>
                <li><a href="http://www.wikipedia.org">Wikipedia</a></li>
              </ul>
            </li>
          </ol>
        </div>
      </nav>
    </header>
    <div id="content-wrapper">
      <div id="sidebar">
        <div id="search">
          <h2>Etsi</h2>
          <input type="text" id="searchBox" name="searchBox" accesskey="f"><button type="submit" id="searchSubmit">Etsi</button>
        </div>
        <div id="statistics">
          <h2>Tilastot</h2>
          <p>Kävijöistä käyttää:</p>
          <svg width="<?=$pie_width?>" height="<?=$pie_width?>" xmlns="http://www.w3.org/2000/svg" version="1.1">
          <?php foreach($sectors as $sector) { ?>
		<path d="<?=$sector["path"]?>" fill="<?=$sector["color"]?>" stroke="blue" stroke-width="1" />
          <?php } ?>
          </svg>
          <?=$html?>
        </div>
      </div>
      <article id="content">
        <?= $content ?>
      </article>
      <div id="copyrights">
        Teksti on saatavilla <a href="http://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution/Share-Alike</a> -lisenssillä.
        Sivustolla käytetyt <a href="http://www.gnome.org/">GNOME</a> ikonit ovat julkaistu <a href="http://www.gnu.org/licenses/gpl-2.0.html">GNU GPL</a> -lisenssillä. Sivuston muut osat on julkaistu General Public License:llä (GPL).</br>
	© Aleksi Salmela
      </div>
    </div>
  </div>
  <div id="loginWrap" onClick="login.unshow()">
  </div>
  <div id="loginDialog">
    <button id="loginClose" onClick="login.unshow()">Close</button>
    <h2>Kirjaudu sisään</h2>
    <div><span class="first">Käyttäjä:</span><input type="text"></div>
    <div><span class="first">Salasana:</span><input type="text"></div>
    <div id="loginButtons"><span class="first">&nbsp;</span><input type="submit" value="Kirjaudu"></div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min.js" integrity="sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ=" crossorigin="anonymous"></script>
  <script type="text/javascript" src="script.js"></script>
</body>
</html>
