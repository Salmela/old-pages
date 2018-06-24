<!DOCTYPE html>
<html lang="fi">
<head>
  <title>Otsikko</title>
  <link rel="stylesheet" title="Perus" type="text/css" href="style.css">
  <script type="text/javascript" src="script.js"></script>
  <meta charset="utf-8">
  <meta name="robots" content="noindex,nofollow">
  <link href='http://fonts.googleapis.com/css?family=Gentium+Basic' rel='stylesheet' type='text/css'>
</head>
<body onload="login.init(); search.init(); content.init();">
  <div id="wrap">
    <header id="header">
      <div id="headerright"><a href="javascript: void(0);" onclick="login.show()">kirjaudu sisään</a></div>
      <h1><span>Sivusto</span></h1>
      <div id="nav_placeholder"></div>
      <nav>
        <div id="menus">
          <ol>
            <li id="main"><a href="#main" onclick="content.load('main');">Etusivu</a></li>
            <li id="demo" class="menu"><a href="#demo" onclick="content.load('demo');">Demoja</a>
              <ul>
                <li><a href="#demo" onclick="content.load('demo');">Javascript</a></li>
                <li><a href="javascript: void(0)" onclick="window.open('nanoInkscape/draw.htm', 'piirrä', 'width=300, height=300');">Gtk</a></li>
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
          <input type="text" id="searchBox" name="searchBox" placeholder="ei toimi vielä" accesskey="f"><button type="submit" id="searchSubmit">Etsi</button>
        </div>
        <div id="statistics">
          <h2>Tilastot</h2>
          <p>Kävijöistä käyttää:</p>
<?php
/*	mysql_connect("localhost", "fooshell_admin", "z7q9e7i3s6") or die("Unable to connect to db. " . mysql_error());
	mysql_select_db("fooshell_test") or die("Could not select database. " . mysql_error());

	$ip = ip2long($_SERVER['REMOTE_ADDR']);
	$ua = $_SERVER['HTTP_USER_AGENT'];

	$query = "SELECT * FROM visitors WHERE ip = $ip;";
	$result = mysql_query($query) or die("Could not query database. " . mysql_error());
	//$row = mysql_fetch_assoc($result) or die("Could not fetch from database. " . mysql_error());

	if(mysql_num_rows($result) == 0) {
		$os = "unknown";
		$browser = "unknown";
		$browser_ver = "";
		$layout_engine = "";

		if(stristr($ua, "linux")) $os = "linux";
		else if(stristr($ua, "windows")) $os = "windows";
		else if(stristr($ua, "mac")) $os = "mac";

		if(stristr($ua, "webkit/")) $layout_engine = "webkit";
		else if(stristr($ua, "khtml/")) $layout_engine = "khtml";
		else if(stristr($ua, "trident/")) $layout_engine = "trident";
		else if(stristr($ua, "gecko/")) $layout_engine = "gecko";
		else if(stristr($ua, "presto/")) $layout_engine = "presto";

		if(($p = stripos($ua, "firefox")) !== false) {
			$browser = "firefox";
			sscanf(substr($ua, $p + 8), "%s", $browser_ver);
		} else if(($p = stripos($ua, "chrome")) !== false) {
			$browser = "chrome";
			sscanf(substr($ua, $p + 7), "%s", $browser_ver);
		} else if(($p = stripos($ua, "opera")) !== false) {
			$browser = "opera";
			sscanf(substr($ua, $p + 6), "%s", $browser_ver);
		} else if(($p = stripos($ua, "ie")) !== false) {
			$browser = "ie";
			sscanf(substr($ua, $p + 3), "%s", $browser_ver);
		} else if(($p = stripos($ua, "safari")) !== false) {
			$browser = "safari";
			sscanf(substr($ua, $p + 7), "%s", $browser_ver);
		} 

		echo "'$ip', '$browser', '$browser_ver', '$os'";
		$browser = mysql_real_escape_string($browser);
		$browser_ver = mysql_real_escape_string($browser_ver);
		$os = mysql_real_escape_string($os);
		$query = "INSERT INTO visitors (ip, browser, browser_ver, os) VALUES('$ip', '$browser', '$browser_ver', '$os')";
		mysql_query($query) or die("Could not query database. " . mysql_error());

		$query = "INSERT INTO browser_usage (name,ammount,type) VALUES ('$browser $browser_ver',1,0)
		          ON DUPLICATE KEY UPDATE ammount = ammount + 1";
		mysql_query($query) or die("Could not query database. " . mysql_error());

		$query = "INSERT INTO browser_usage (name,ammount,type) VALUES ('$os',1,1)
		          ON DUPLICATE KEY UPDATE ammount = ammount + 1";
		mysql_query($query) or die("Could not query database. " . mysql_error());
	}
	$query = "SELECT SUM(ammount) AS sum FROM browser_usage WHERE type=0";
	$result = mysql_query($query) or die("Could not query database. " . mysql_error());
	$row = mysql_fetch_assoc($result);
	$total = $row["sum"];

	$query = "SELECT * FROM browser_usage WHERE type=0";
	$result = mysql_query($query) or die("Could not query database. " . mysql_error());
	$count = mysql_num_rows($result);

	//$browsers = array(array("Firefox", 0.90), array("Chrome", 0.10));
	$colors = array("#8ae234", "#fce94f", "#fcaf3e", "#729fcf", "#ad7fa8", "#e9b96e", "#ef2929");
	$r = 75;
	$w = $r*2;
echo<<<END
<svg width="$w" height="$w" xmlns="http://www.w3.org/2000/svg" version="1.1">
END;
	$cosi2 = $r - $r * 1;
	$sini2 = $r + 0;
	$rad = 0;
	$html = "";
	for($i = 0; $i < $count, $row = mysql_fetch_assoc($result); $i++) {
		$rad += $row["ammount"] / $total * 2 * M_PI;
		$cosi = $r - cos($rad) * $r;
		$sini = $r + sin($rad) * $r;
		$flag = ($row["ammount"] > 0.5 * $total) ? 1 : 0;
		echo "<path d=\"M$r,$r L$sini2,$cosi2 A$r,$r 0 $flag,1 $sini,$cosi z\" fill=\"{$colors[$i]}\" stroke=\"blue\" stroke-width=\"1\" />";
		$cosi2 = $cosi;
		$sini2 = $sini;
		$html .= "<span style=\"background:{$colors[$i]}; border: 1px solid #000;\">&nbsp;&nbsp;</span> {$row["name"]}<br/>";
	}

echo<<<END
</svg>
<div>
END;
	echo $html;
echo "</div>";
*/
?>
        </div>
      </div>
      <article id="content">
        <h1>Ladataan...</h1>
        <p>
          Jos sivu ei näy käytät liian vanhaa selainta, voit hankkia paremman selaimen osoitteesta <a href="http://www.mozilla-europe.org/en/">http://www.mozilla-europe.org/en/</a> 
        </p>
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
</body>
</html>
