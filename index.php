<?php
require("SharedHeader.php")
?>

<script type="text/javascript">
	if(is_deleted){
		alert("This Insight has been deleted by its author.");
		window.location="http://InsightMaker.com/";
	}
	if(drupal_node_ID==-1 && logged_in==false){
		window.location="http://InsightMaker.com/make";
		}
	if((! is_deleted) && is_viewer == false){
		alert("You do not have access to view this Insight.");
		window.location="http://InsightMaker.com/";
	}
</script>
	<div id="header"><div style="float:right;margin:5px;" class="x-small-editor"></div></div>

	<div id="property-win" class="x-hidden"></div>
	
	<form id="downloader" name="downloader" method="POST" action="/builder/downloader.php" class="x-hidden">
		<input type="hidden" name="title" value="">
		<input type="hidden" name="code" value="">
	</form>

	<script type="text/javascript" src="/builder/js/Ext.ux.util.js"></script>
	<script type="text/javascript">
	var scriptBase = 'http://InsightMaker.com/builder';
	var mxBasePath = 'http://InsightMaker.com/builder';
	var mxLoadResources = false;
	var mxLoadStylesheets = false;
	</script>
	<script type="text/javascript" src="http://mxclient.jgraph.com/demo/mxgraph/src/js/mxclient.php?version=1.8.0.6"></script>

	
	
    <script type="text/javascript" src="/builder/js/InsightEditor.js"></script>
	<script type="text/javascript" src="/builder/js/Utilities.js"></script>		
	<script type="text/javascript" src="/builder/js/RibbonPanel.js"></script>
   	<script type="text/javascript" src="/builder/js/ConfigPanel.js"></script>
   	<script type="text/javascript" src="/builder/js/EquationEditor.js"></script>
   	<script type="text/javascript" src="/builder/js/ConverterEditor.js"></script>
   	<script type="text/javascript" src="/builder/js/UnitsEditor.js"></script>
    <script type="text/javascript" src="/builder/js/Results.js"></script>
    <script type="text/javascript" src="/builder/js/jquery.js"></script> 
    <script type="text/javascript" src="/builder/js/raphael.js"></script>
    <script type="text/javascript" src="/builder/js/scratchpad.js"></script>
    <script type="text/javascript" src="/builder/js/BoxSelect.js"></script>
    <script type="text/javascript" src="/builder/js/HoverIcons.js"></script>
	<script type="text/javascript" src="/builder/js/LegendItem.js"></script>
	<script type="text/javascript" src="/builder/js/Legend.js"></script>
	<script type="text/javascript" src="/builder/js/SmartLegendItem.js"></script>
	<script type="text/javascript" src="/builder/js/SmartLegend.js"></script>

	

   	<script type="text/javascript">var editLocation="graph";</script>
	
	<script type="text/javascript" charset="utf-8">
	  var is_ssl = ("https:" == document.location.protocol);
	  var asset_host = is_ssl ? "https://s3.amazonaws.com/getsatisfaction.com/" : "http://s3.amazonaws.com/getsatisfaction.com/";
	  document.write(unescape("%3Cscript src='" + asset_host + "javascripts/feedback-v2.js' type='text/javascript'%3E%3C/script%3E"));
	</script>

	<script type="text/javascript" charset="utf-8">
	  var feedback_widget_options = {};

	  feedback_widget_options.display = "overlay";  
	  feedback_widget_options.company = "insightmaker";
	  feedback_widget_options.placement = "bottom";
	  feedback_widget_options.color = "navy";
	  feedback_widget_options.style = "question";

	  var feedback_widget = new GSFN.feedback_widget(feedback_widget_options);
	</script>
	
	<?php if($nid==-1){ ?>
		
		<!-- Google Code for New Model Conversion Page -->
		<script type="text/javascript">
		/* <![CDATA[ */
		var google_conversion_id = 1022635102;
		var google_conversion_language = "en";
		var google_conversion_format = "3";
		var google_conversion_color = "ffffff";
		var google_conversion_label = "jLRkCPLTzwIQ3tjQ5wM";
		var google_conversion_value = 0;
		/* ]]> */
		</script>
		<script type="text/javascript" src="http://www.googleadservices.com/pagead/conversion.js">
		</script>
		<noscript>
		<div style="display:inline;">
		<img height="1" width="1" style="border-style:none;" alt="" src="http://www.googleadservices.com/pagead/conversion/1022635102/?label=jLRkCPLTzwIQ3tjQ5wM&amp;guid=ON&amp;script=0"/>
		</div>
		</noscript>
	<?php }else{ ?>
		<!-- Google Code for View Model Conversion Page -->
		<script type="text/javascript">
		/* <![CDATA[ */
		var google_conversion_id = 1022635102;
		var google_conversion_language = "en";
		var google_conversion_format = "3";
		var google_conversion_color = "ffffff";
		var google_conversion_label = "UMxMCOrUzwIQ3tjQ5wM";
		var google_conversion_value = 0;
		/* ]]> */
		</script>
		<script type="text/javascript" src="http://www.googleadservices.com/pagead/conversion.js">
		</script>
		<noscript>
		<div style="display:inline;">
		<img height="1" width="1" style="border-style:none;" alt="" src="http://www.googleadservices.com/pagead/conversion/1022635102/?label=UMxMCOrUzwIQ3tjQ5wM&amp;guid=ON&amp;script=0"/>
		</div>
		</noscript>
	<?php }?>
</body>
</html>

