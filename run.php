<?php
/**
* In which we jump through some hoops to make Drupal treat
* profiles/scf/switch.php just like the root-level index.php or update.php
*/
// remove '/profiles/scf' from current working directory and set our directory
$base_dir = substr(getcwd(), 0, -8); //xxx 8 is the lengt
chdir($base_dir);
// ini_set('include_path', '.:' . $base_dir); - use of ./ makes this not work
global $base_url;
// duplicated from bootstrap.inc conf_init().
    // Create base URL
    $base_root = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') ? 'https' : 'http';

    // As $_SERVER['HTTP_HOST'] is user input, ensure it only contains
    // characters allowed in hostnames.
    $base_url = $base_root .= '://'. preg_replace('/[^a-z0-9-:._]/i', '', $_SERVER['HTTP_HOST']);

    // $_SERVER['SCRIPT_NAME'] can, in contrast to $_SERVER['PHP_SELF'], not
    // be modified by a visitor.
    if ($dir = trim(dirname($_SERVER['SCRIPT_NAME']), '\,/')) {
      $base_path = "/$dir";
      $base_url .= $base_path;
    }

$base_url = substr($base_url, 0, -8); //XXX 8 is the length

require_once './includes/bootstrap.inc';

// we need the $user variable, theming...  i think we have to go all the way
drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL); // DRUPAL_BOOTSTRAP_CONFIGURATION

//print_r($user);
if(in_array("authenticated user", $user->roles) || in_array("unsecure", $user->roles) ){
	watchdog("insight", "User ran model", array($user->uid), WATCHDOG_INFO );
	$modelData=rawurldecode($_POST["code"]);
	$modelData=str_replace("\\'","'",str_replace("\\\"",'"',$modelData));
	chdir("./builder");
	require("./GraphToIntermediate.php");
    exec("bin/Simgua run.smr Model \"".$modelData."\"", $output);
	echo join("\n",$output)."\n";
}else{
?>ACCESS DENIED<?php
}
?>