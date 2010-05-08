<html>
<head>
    <title>Insight Maker</title>
 
 	<link rel="stylesheet" type="text/css" href="/builder/js/resources/css/ext-all.css" />
	<link rel="stylesheet" type="text/css" href="/builder/js/resources/css/xtheme-blue.css" />
	<link rel="stylesheet" type="text/css" href="/builder/css/lovcombo.css" />

	<meta name="keywords" content="system dynamics, systems thinking, simulation, complexity, visual modeling, environment, modeling, modelling, model, simulate" />
	<meta name="description" content="Develop and run systems thinking and system dynamics models on the internet. Open and powerful simulation tool." />

	<link rel="shortcut icon" href="/builder/favicon.ico" type="image/x-icon" />


    <link rel="stylesheet" type="text/css" href="/builder/css/insighteditor.css" />


</head>
<body onload="main();" onbeforeunload="return confirmClose();">


<div id="loading-mask"></div>
<div id="loading">
  <div class="loading-indicator">
    Loading Insight Maker...<br>
    (This may take a few moments)
  </div>
</div>
<div id="toplinks-holder" name="toplinks-holder"></div>

<script type="text/javascript" src="/builder/js/ext-base.js"></script>
<script type="text/javascript" src="/builder/js/ext-all.js"></script>
<script type="text/javascript" src="/builder/js/SharedJS.js"></script> 

<script type="text/javascript">
		<?php 
		echo "var logged_in = ".json_encode($logged_in).";\n";
		echo "var is_viewer = ".json_encode($is_viewer).";\n";
		if ($nid>-1 && $is_viewer){
			echo "var drupal_node_ID = ".$nid.";\n";
			echo "var graph_source_data = ".json_encode($node->field_modeldata[0]['value']).";\n";
			echo "var graph_title = ".json_encode($node->title).";\n";
			echo "var graph_description = ".json_encode($node->body).";\n";
			echo "var graph_tags = ".json_encode(insightica_get_tags_csv($node->nid)).";\n";
			if ($is_editor) {
				echo "var saved_enabled = true;\n";	
				echo "var is_editor = true;\n";
			}else{
				echo "var saved_enabled = false;\n";
				echo "var is_editor = false;\n";
			}
		}else{
			echo "var drupal_node_ID = -1;\n";
			echo "var graph_source_data = \"\";\n";
			echo "var graph_title = \"\";\n";
			echo "var graph_description = \"\";\n";
			echo "var graph_tags = \"\";\n";
			echo "var saved_enabled = true;\n";
			echo "var is_editor = true;\n";
		}
		if($is_embed){
			echo "var is_embed = true;\n";
		}else{
			echo "var is_embed = false;\n";
		}
		if($is_deleted){
			echo "var is_deleted = true;\n";
		}else{
			echo "var is_deleted = false;\n";
		}
			?>
</script>