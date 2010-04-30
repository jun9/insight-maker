<?php

include_once("./mxPHP/mxServer.php");

session_start();

$document = $_GET['id'];
$sid = session_id();
$root = "hubnexus";

if (! is_dir($root."/".$document))
{
  mkdir($root."/".$document);
  chmod($root."/".$document, 0777);
}

$filename = $root."/".$document."/".$sid;
$delta = $root."/".$document."/delta.xml";
if (isset($_GET["init"]))
{
  session_start();
  session_commit();

  header("Pragma: public");
  header("Expires: 0");
  header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
  header("Content-Type: application/xhtml+xml");

  // Gives the client a unique namespace that
  // is used as a prefix for new cell ids.
  $ns = md5(uniqid(rand(), true));
  //mxLog::debug("session $sid initialized: ns=$ns");
  echo "<state session-id=\"$sid\" namespace=\"$ns\">";

  if (is_file($delta))
  {
    echo "<delta>";
    $fp = fopen($delta, "r+");
    fpassthru($fp);
    fclose($fp);
    echo "</delta>";
  }
  
  echo "</state>";

  // Deletes existing buffer
  if (is_file($filename))
  {
    unlink($filename);
  }
  
  touch($filename);
  chmod($filename, 0777);
}
else
{
  
  // Gets the XML parameter from the POST request and converts all linefeeds
  // into a HTML entity. This is required for correct handling of the XML on
  // the client side.
  if (isset($_POST["xml"]))
  {
	  $xml = str_replace("\n", "&#xa;", stripslashes($_POST["xml"]));
	
	  // Appends the change to all connected sessions except the incoming
	  // session and the global delta file
	  if ($xml != null)
	  {
	    //mxLog::debug("received changes from ".session_id().": ".strlen($xml)." bytes");
	  
	    // Makes sure the global delta file exists so that the change is
	    // appended below
	    if (!is_file($delta)) {
	      touch($delta);
	      chmod($delta, 0777);
	    }
	        
	    // Clears out the delta file if this change contains a mxRootChange
	    // in which case the previous changes will no longer be visible and
	    // just waste bandwidth.
	    if (strpos($xml, "mxRootChange") > 0)
	    {
	      $fp = fopen($delta, "r+");
	      fpassthru($fp);
	      ftruncate($fp, 0);
	      fflush($fp);
	      fclose($fp);
	    }
	 

	    // Dispatches the XML to all sessions except the incoming session
	    // TODO: Remove dead sessions
	    $fp = opendir($root."/".$document);

	    while($filename = readdir($fp))
	    {
	      if ($filename!= "." &&
	        $filename != ".." &&
	        !is_dir("$root/$document/$filename") &&
	        $filename != session_id())
	      {
	       
	        $tmp = fopen("$root/$document/$filename", "a");
	        fwrite($tmp, $xml);
	        fflush($tmp);
	        fclose($tmp);
	      }
	    }
	  
	    flush();
	  }
  }
  else
  {

    // Makes sure to cancel existing pending requests before they consume the
    // change data after a refresh, where the request must be served instead.
    $requestid = md5(uniqid(rand(), true));
    $_SESSION['requestid'] = $requestid;
    session_commit();
  
    if (!is_file($filename))
    {
      touch($filename);
      chmod($filename, 0777);
    }
    else
    {
      // Keeps the request for 10 secs and asks for changes each second
      $timeout = 10;
      $count = 0;
      while (is_file($filename) &&
           filesize($filename) == 0 &&
           $count < $timeout &&
           $_SESSION['requestid'] == $requestid)
       {
         sleep(1);
         clearstatcache();
         $count++;
                 
         // Sync the session state
         session_start();
         session_commit();
      }
      
      // Sync the session state
      session_start();
      session_commit();

      if ($_SESSION['requestid'] != $requestid)
      {
        
      }
      else if (filesize($filename) > 0)
      {
        header("Pragma: public");
        header("Expires: 0");
        header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
        header("Content-Type: application/xhtml+xml");
        
        // Sends the changes to the client
        echo "<delta>";
        $fp = fopen($filename, "r+");
        fpassthru($fp);
        ftruncate($fp, 0);
        fflush($fp);
        fclose($fp);
        echo "</delta>";
      }
      else
      {
        touch($filename);
      }
    }
  }
}

?>
