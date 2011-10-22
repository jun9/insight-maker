<?php
require("SharedHeader.php")
?>

<div id="mpanel">
	</div>
	<script type="text/javascript">
		var storeData = <?php 
		if ($node->field_ui[0]['value'] != ""){
			print(str_replace("script","scriptscript",$node->field_ui[0]['value']));
		}else{
			print("[]");
		}
		?>;
	</script>
	<script type="text/javascript" src="/builder/js/DesignerEditor.js"></script> 
	<script type="text/javascript">
		var editLocation="view";
	</script> 	

</body>
</html>

