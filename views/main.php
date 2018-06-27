<?php
$db_url = getenv("DATABASE_URL");
$db = parse_url($db_url);

if (False && $db_url) {
	$pdo = new PDO("pgsql:" . sprintf(
	    "host=%s;port=%s;user=%s;password=%s;dbname=%s",
	    $db["host"],
	    $db["port"],
	    $db["user"],
	    $db["pass"],
	    ltrim($db["path"], "/")
	)) or die("Unable to connect to db. " . mysql_error());;

	$ip = ip2long($_SERVER['REMOTE_ADDR']);

	$search_query = $pdo->prepare("SELECT * FROM visitors WHERE ip = ?");
	$search_query->bindParam(1, $ip);
	$search_query->execute();

	$result = $search_query->fetch();
	if (!$result) {
		$os = "unknown";
		$browser = "unknown";
		$browser_ver = "";
		$layout_engine = "";

		$ua = $_SERVER['HTTP_USER_AGENT'];
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
		$insert = $pdo->prepare("INSERT INTO visitors (ip, browser, browser_ver, os) VALUES(?, ?, ?, ?)");
		$insert->execute(array($ip, $browser, $browser_ver, $os));

		$insert = $pdo->prepare("INSERT INTO browser_usage (name,ammount,type) VALUES (?,1,?)
			  ON CONFLICT DO UPDATE SET ammount = ammount + 1");
		$insert->execute(array("$browser $browser_ver", 0));
		$insert->execute(array("$os", 1));
	}
	$query = $pdo->prepare("SELECT SUM(ammount) AS sum FROM browser_usage WHERE type=0");
	$query->execute();
	$row = $query->fetch();
	$total = $row["sum"];

	$query = $pdo->prepare("SELECT * FROM browser_usage WHERE type=0");
	$result = $query->execute();
	$rows = $query->fetchAll();
} else {
	$rows = array(
		array("ammount" => 0.1, "name" => "test"),
		array("ammount" => 0.6, "name" => "test2"),
		array("ammount" => 0.2, "name" => "test3"),
		array("ammount" => 0.2, "name" => "test4")
	);
	$total = 1.0;
}

//$browsers = array(array("Firefox", 0.90), array("Chrome", 0.10));
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
