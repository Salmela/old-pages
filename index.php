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

	//$browsers = array(array("Firefox", 0.90), array("Chrome", 0.10));
*/
$sector_colors = array("#8ae234", "#fce94f", "#fcaf3e", "#729fcf", "#ad7fa8", "#e9b96e", "#ef2929");
$radius = 75;
$pie_width = $radius*2;
function generatePath($sini, $cosi, $sini2, $cosi2, $flag) {
	global $radius;
	return "M$radius,$radius L$sini2,$cosi2 A$radius,$radius 0 $flag,1 $sini,$cosi z";
}
$sectors = array();
$cosi2 = $radius - $radius * 1;
$sini2 = $radius + 0;
$rad = 0;
$html = "";
$i = 0;
//$row = mysql_fetch_assoc($result)
$rows = array(
	array("ammount" => 0.1, "name" => "test"),
	array("ammount" => 0.6, "name" => "test2"),
	array("ammount" => 0.2, "name" => "test3"),
	array("ammount" => 0.2, "name" => "test4")
);
$total = 1.0;
foreach($rows as $row) {
	$rad += $row["ammount"] / $total * 2 * M_PI;
	$cosi = $radius - cos($rad) * $radius;
	$sini = $radius + sin($rad) * $radius;
	$flag = ($row["ammount"] > 0.5 * $total) ? 1 : 0;
	$sectors[] = array(
		"path" => generatePath($sini, $cosi, $sini2, $cosi2, $flag),
		"color" => $sector_colors[$i]
	);
	$cosi2 = $cosi;
	$sini2 = $sini;
	$html .= "<span style=\"background:{$sector_colors[$i]}; border: 1px solid #000;\">&nbsp;&nbsp;</span> {$row["name"]}<br/>";
	$i++;
}

$pie = "test";
require "templates/main.php"
?>
