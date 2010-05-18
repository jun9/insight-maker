<?php 
	header('Content-type: application/vnd.yourlingua.simgua');
	$typeString='Content-disposition: attachment; filename=';
		if($_POST["title"]==""){
			$typeString=$typeString."MyModel.smr";
		}else{
			$typeString=$typeString.$_POST["title"].".smr";
		}
	header($typeString);
	$modelData=rawurldecode($_POST["code"]);
	$modelData=str_replace("\\'","'",str_replace("\\\"",'"',$modelData));
	require("./GraphToIntermediate.php");
?>
' This file is an Insight downloaded from http://InsightMaker.com
' It is an open file format. One application that can read and
' analyze it is Simgua. You can download Simgua from
' http://Simgua.com

<?
	echo file_get_contents('./SimguaModelCreator.smr');
?>


Dim MyModelData as String = "<?php echo $modelData;?>"


Dim MyModel as Model = SimguaModelCreator.createModel(MyModelData)

Dim m as ModelWindow = newModelWindow()
m.setModel(MyModel)
m.Layout
m.show