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
	<script type="text/javascript" src="http://mxclient.jgraph.com/demo/mxgraph/src/js/mxclient.php?version=1.8.0.0"></script>
    <script type="text/javascript" src="/builder/js/InsightEditor.js"></script>
	<script type="text/javascript" src="/builder/js/Utilities.js"></script>		
	<script type="text/javascript" src="/builder/js/RibbonPanel.js"></script>
   	<script type="text/javascript" src="/builder/js/ConfigPanel.js"></script>
   	<script type="text/javascript" src="/builder/js/EquationEditor.js"></script>
   	<script type="text/javascript" src="/builder/js/ConverterEditor.js"></script>
   	<script type="text/javascript" src="/builder/js/UnitsEditor.js"></script>
    <script type="text/javascript" src="/builder/js/jquery.js"></script> 
    <script type="text/javascript" src="/builder/js/raphael.js"></script>
    <script type="text/javascript" src="/builder/js/scratchpad.js"></script>

   	<script type="text/javascript">var editLocation="graph";</script> 	
</body>
</html>

