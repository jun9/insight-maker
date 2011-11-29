<html>
<head>
    <title>Insight Maker</title>
 
 	<link rel="stylesheet" type="text/css" href="/builder/js/ext/resources/css/ext-all.css" />
 	<link rel="stylesheet" type="text/css" href="/builder/css/BoxSelect.css" />

	<meta name="keywords" content="system dynamics, systems thinking, simulation, complexity, visual modeling, environment, modeling, modelling, model, simulate" />
	<meta name="description" content="Develop and run systems thinking and system dynamics models on the internet. Open and powerful simulation tool." />

	<link rel="shortcut icon" href="/builder/favicon.ico" type="image/x-icon" />


    <link rel="stylesheet" type="text/css" href="/builder/css/insighteditor.css" />


</head>
<body  onbeforeunload="return confirmClose();">


<div id="loading-mask"></div>
<div id="loading">
  <div class="loading-indicator">
    Loading Insight Maker...<br>
    (This may take a few moments)
  </div>
</div>
<div id="toplinks-holder" name="toplinks-holder"></div>

<script type="text/javascript" src="/builder/js/ext/ext-all-debug.js"></script>


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
		if($is_topBar){
			echo "var is_topBar = true;\n";
		}else{
			echo "var is_topBar = false;\n";
		}
		if($is_sideBar){
			echo "var is_sideBar = true;\n";
		}else{
			echo "var is_sideBar = false;\n";
		}
		if($is_zoom){
			echo "var is_zoom = true;\n";
		}else{
			echo "var is_zoom = false;\n";
		}
		if($is_deleted){
			echo "var is_deleted = true;\n";
		}else{
			echo "var is_deleted = false;\n";
		}
			?>
</script>

<?php if(!is_embed){?>
<script type="text/javascript" charset="utf-8">
  var is_ssl = ("https:" == document.location.protocol);
  var asset_host = is_ssl ? "https://s3.amazonaws.com/getsatisfaction.com/" : "http://s3.amazonaws.com/getsatisfaction.com/";
  document.write(unescape("%3Cscript src='" + asset_host + "javascripts/feedback-v2.js' type='text/javascript'%3E%3C/script%3E"));
</script>


<script type="text/javascript" charset="utf-8">
  var feedback_widget_options = {};

  feedback_widget_options.display = "overlay";  
  feedback_widget_options.company = "insightmaker";
  feedback_widget_options.placement = "left";
  feedback_widget_options.color = "Navy";
  feedback_widget_options.style = "idea";
  

  var feedback_widget = new GSFN.feedback_widget(feedback_widget_options);
</script>
<?php }?>