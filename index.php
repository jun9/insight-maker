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

<div id="config-win" class="x-hidden">
</div>
<div id="property-win" class="x-hidden">
</div>
<div id="units-win" class="x-hidden">
</div>

	<link rel="stylesheet" type="text/css" href="/builder/css/Ext.ux.form.LovCombo.css" />
	<script type="text/javascript" src="/builder/js/Ext.ux.util.js"></script>
	<script type="text/javascript" src="/builder/js/Ext.ux.form.LovCombo.js"></script>
	<script type="text/javascript" src="/builder/js/Ext.ux.TreeCombo.js"></script>
	<script type="text/javascript" src="/builder/js/RowEditor.js"></script>
	<script type="text/javascript">
	var scriptBase = 'http://InsightMaker.com/builder';
	var mxBasePath = 'http://InsightMaker.com/builder';
	</script>
	<script type="text/javascript" src="http://www.mxgraph.com/demo/mxgraph/src/js/mxclient.php?version=1.3.1.6&key=hnaAe6eohX6cmCE%3D"></script>
	
	<script type="text/javascript" src="/builder/js/PropertyGrid.js"></script>
    <script type="text/javascript" src="/builder/js/InsightEditor.js"></script>
	<script type="text/javascript" src="/builder/js/Utilities.js"></script>		
	<script type="text/javascript" src="/builder/js/RibbonPanel.js"></script>
    <script type="text/javascript" src="/builder/js/MainPanel.js"></script>
   	<script type="text/javascript" src="/builder/js/ConfigPanel.js"></script>
   	<script type="text/javascript" src="/builder/js/EquationEditor.js"></script>
   	<script type="text/javascript" src="/builder/js/ConverterEditor.js"></script>
   	<script type="text/javascript">var editLocation="graph";</script> 	
</body>
</html>

