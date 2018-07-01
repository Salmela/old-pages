<!DOCTYPE html>
<html lang="fi">
<head>
  <title><?= $title ?> - Salmela</title>
  <link rel="stylesheet" title="Perus" type="text/css" href="/static/style.css">
  <meta charset="utf-8">
  <meta name="robots" content="noindex,nofollow">
  <link href="https://fonts.googleapis.com/css?family=Gentium+Basic" rel="stylesheet" type="text/css" crossorigin="anonymous">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=4.0" />
</head>
<body>
  <div id="wrap">
    <header id="header">
      <div id="headerright" class="js"><button id="font-resize-button">Aa</button> |
      <?= anchorWithParam("lang=fi", "FI") ?> |
      <?= anchorWithParam("lang=en", "EN") ?></div>
      <h1><span><a href="/">Salmela</a></span></h1>
      <div id="nav_placeholder"></div>
      <nav>
        <div id="menus">
          <ol>
            <?php foreach($links as $topLink) { ?>
            <li class="<?= onlyIfTrue($activeLink == $topLink, "active ") .
                           onlyIfTrue($topLink->children, "menu")
                        ?>"><a href="<?= $topLink->url ?>"><?= $topLink->getContent($lang) ?></a>
              <?php if($topLink->children) { ?>
              <ul>
                <?php foreach($topLink->children as $link) { ?>
                  <li><a href="<?= $link->url ?>"><?= $link->getContent($lang) ?></a></li>
                <?php } ?>
              </ul>
              <?php } ?>
            </li>
            <?php } ?>
          </ol>
        </div>
        <?php if($activeLink->children) { ?>
        <ul id="sub-menus">
          <?php foreach($activeLink->children as $link) { ?>
            <li><a href="<?= $link->url ?>"><?= $link->getContent($lang) ?></a></li>
          <?php } ?>
        </ul>
        <?php } ?>
      </nav>
    </header>
    <div id="content-wrapper">
      <div id="sidebar">
        <div id="search">
          <h2>Etsi</h2>
          <form action="/search" method="GET">
            <input type="text" id="searchBox" name="q" accesskey="f"><button type="submit" id="searchSubmit">Etsi</button>
          </form>
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
        Sivustolla käytetyt <a href="http://www.gnome.org/">GNOME</a> ikonit ovat julkaistu <a href="http://www.gnu.org/licenses/gpl-2.0.html">GNU GPL</a> -lisenssillä. Sivuston muut osat on julkaistu General Public License:llä (GPL). <a href="javascript: void(0);" class="js" id="login-link">kirjaudu sisään</a></br>
	© 2018 Aleksi Salmela
      </div>
    </div>
  </div>
  <div id="login-wrap">
  </div>
  <div id="login-dialog">
    <button id="login-close"><span>Close</span></button>
    <h2>Kirjaudu sisään</h2>
    <div><span class="first">Käyttäjä:</span><input type="text" id="username"></div>
    <div><span class="first">Salasana:</span><input type="text" id="password"></div>
    <div id="loginButtons"><span class="first">&nbsp;</span><input type="submit" value="Kirjaudu"></div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min.js" integrity="sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ=" crossorigin="anonymous"></script>
  <script type="text/javascript" src="/static/script.js"></script>
</body>
</html>
