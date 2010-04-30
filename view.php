<?php
require("SharedPHPHeader.php");

$content_id = $_GET["page"];

$model_ui = json_decode($node->field_ui[0]['value']);

$page_found = false;
$count = count($model_ui);
$contents = "";
$frame = "";

for ($i = 0; $i < $count; $i++) {
    if($model_ui[$i][1] == $content_id){
    	$page_found=true;
    	if($model_ui[$i][0]=="page"){
    		$contents = $model_ui[$i][2];
    		$frame = $model_ui[$i][3];
    	}else{
    		$key=dechex(rand(2,10000000));
			$file = './builder/tmp/'.$key.".smr";
			while(file_exists($file)){
				$key=dechex(rand(2,10000000));
				$file = './builder/tmp/'.$key.".smr";
			};
			
			
			
			$modelData = $node->field_modeldata[0]['value'];
			$viewDat=$model_ui[$i][2];
			$frameDat=$model_ui[$i][3];
			chdir("./builder/");
			require("./GraphToIntermediate.php");
			
			$script_string =   "#!/var/www/i/insight/builder/bin/Simgua\n\n";
			$script_string = $script_string.file_get_contents('./SimguaModelCreator.smr')."\n\n";
			$script_string = $script_string."Dim Insight as Model = SimguaModelCreator.createModel(\"$modelData\")\n\n";
			$script_string = $script_string.file_get_contents('./DesignerInserts.smr')."\n\n";
			chdir("..");
			
			$fh = fopen($file, 'w') or die("can't open macro file");
			fwrite($fh, $script_string.$viewDat);
			fclose($fh);
			chmod($file,777);
			$params ="";
			foreach($_GET as $name => $value) {
				if(substr($name,0,1)=="?"){
					$name=substr($name,-(strlen($name)-1));
				}
				$params=$params."\"$name\" \"$value\" ";
			}
			
			foreach($_POST as $name => $value) {
				$params=$params."\"$name\" \"$value\" ";
			}
			exec("/var/www/i/insight/builder/bin/Simgua $file $params", $output);
			$contents = join("\n",$output)."\n";
			$frame = $frameDat;
			
    	}
    	break; 
    }
}

if(! $page_found){
?>
Page not found.
<?php
}else{
	if($frame == "Default"){
		require("SharedHTMLHeader.php");
	}
	echo $contents;
	if($frame == "Default"){
		echo "</body></html>";
	}
}
?>
