<?php
// MXGraph -> Intermediate Representation Converter
	require_once("./mxPHP/mxServer.php");

	$primSep = "<insight-PrimSep>";
	$propSep = "<insight-PropSep>";
	
	function sanitizeName($name, $defaultName){
		if (strlen($name) > 0 && (!preg_match("/[^A-Za-z0-9 ]/",$name)) && preg_match("/[A-Za-z]/", substr($name,0, 1))){
			return $name;
		}else{
			return $defaultName;
		}
	}
	
	function childrenCells($cell) {
	    $myCells = array();
	    for($i=0; $i < $cell->getChildCount(); $i++){
			array_push($myCells, $cell->getChildAt($i));
			$childrenChildren = childrenCells($cell->getChildAt($i));
			array_splice($myCells, count($myCells), 0, $childrenChildren);
		}
		for ($i = count($myCells) - 1; $i >= 0; $i--) {
			if (is_null($myCells[$i]) || is_null($myCells[$i]->value)) {
		         unset($myCells[$i]);
		     }
		}
		return $myCells;
	}
	
	function cleanNote($note){
		//returns a note with the new lines stripped from it and replaced with "\n".
		// Order of replacement
		$order   = array("\r\n", "\n", "\r");
		$replace = '\\n';
		
		// Processes \r\n's first so they aren't converted twice.
		return str_replace($order, $replace, $note);
	}
	
	function simguaPrimitives($cells){
		$scells = array();
		foreach($cells as $cell){
			if(isSimguaPrimitive($cell)){
				array_push($scells, $cell);
			}
		}
		return $scells;
	}
	
	function isSimguaPrimitive($cell){
		if(is_null($cell) || is_null($cell->value)){
			return false;
		}
		$n=$cell->value->nodeName;
		return ($n == "Folder" || $n == "Stock" || $n == "Converter" || $n == "Parameter" || $n == "Display" || $n == "Link" || $n == "Flow" || $n == "Setting");
		}
		
	function connectionValue($cell){
		if(is_null($cell) || $cell->value->nodeName=="Folder"){
			return "";
		}else{
			return $cell->id;
		}
	}
	
	function getID($value) {
	    return $value->id;
	};
	
	$graph = new mxGraph();
	$insightdoc = mxUtils::parseXml($modelData);
	$insightdec = new mxCodec($insightdoc);
	$insightdec->decode($insightdoc->documentElement, $graph->model);
	
	function orig($cell){
		if(is_null($cell) || $cell->value->nodeName=="Picture"){
			return null;
		}
		if($cell->value->nodeName == "Ghost"){
			global $graph;
			$cellTab=$graph->model->getCells();
			return $cellTab[$cell->getAttribute("Source")];
		}else{
			return $cell;
		}
	}
	


	$myCells = simguaPrimitives(childrenCells($graph->model->getRoot()));
	$primitives = array();
	
	if (count($myCells)==0){die("Empty Model. To correct this error, try deleting and recreating all your links. If the model still does not work, delete and recreate all your flows.");}
	 
	foreach($myCells as $cell){
		$properties = array();
		$type = $cell->value->nodeName;
		switch($type){
			case "Setting":
				array_push($properties, "setting");
				array_push($properties, "");
				array_push($properties, "");
				array_push($properties, "");
				array_push($properties, $cell->getAttribute("TimeUnits"));
				array_push($properties, $cell->getAttribute("TimeLength"));
				array_push($properties, $cell->getAttribute("TimeStep"));
				array_push($properties, $cell->getAttribute("Units"));
				array_push($properties, $cell->getAttribute("TimeStart"));
				array_push($properties, $cell->getAttribute("SolutionAlgorithm"));
				break;
			case "Stock":
				array_push($properties, "stock");
				array_push($properties, $cell->id);
				array_push($properties, $cell->getAttribute("name"));
				array_push($properties, cleanNote($cell->getAttribute("Note")));
				array_push($properties, str_replace("\\n","\n",$cell->getAttribute("InitialValue")));
				array_push($properties, $cell->getAttribute("StockMode"));
				array_push($properties, $cell->getAttribute("Delay"));
				array_push($properties, $cell->getAttribute("Volume"));
				array_push($properties, $cell->getAttribute("NonNegative"));
				array_push($properties, $cell->getAttribute("Units"));
				array_push($properties, $cell->getAttribute("MaxConstraintUsed"));
				array_push($properties, $cell->getAttribute("MaxConstraint"));
				array_push($properties, $cell->getAttribute("MinConstraintUsed"));
				array_push($properties, $cell->getAttribute("MinConstraint"));
				array_push($properties, $cell->getAttribute("ShowSlider"));
				array_push($properties, $cell->getAttribute("SliderMax"));
				array_push($properties, $cell->getAttribute("SliderMin"));
				break;
			case "Parameter":
				array_push($properties, "parameter");
				array_push($properties, $cell->id);
				array_push($properties, $cell->getAttribute("name"));
				array_push($properties, cleanNote($cell->getAttribute("Note")));
				array_push($properties, str_replace("\\n","\n",$cell->getAttribute("Equation")));
				array_push($properties, $cell->getAttribute("Units"));
				array_push($properties, $cell->getAttribute("MaxConstraintUsed"));
				array_push($properties, $cell->getAttribute("MaxConstraint"));
				array_push($properties, $cell->getAttribute("MinConstraintUsed"));
				array_push($properties, $cell->getAttribute("MinConstraint"));
				array_push($properties, $cell->getAttribute("ShowSlider"));
				array_push($properties, $cell->getAttribute("SliderMax"));
				array_push($properties, $cell->getAttribute("SliderMin"));
				break;
			case "Converter":
				array_push($properties, "converter");
				array_push($properties, $cell->id);
				array_push($properties, $cell->getAttribute("name"));
				array_push($properties, cleanNote($cell->getAttribute("Note")));
				array_push($properties, $cell->getAttribute("Source"));
				array_push($properties, $cell->getAttribute("Interpolation"));
				$items = split(";", $cell->getAttribute("Data"));
				$inps = array();
				$outs = array();
				for ($i = 0; $i < count($items); $i++) {
					$temp = split(",", $items[$i]);
					array_push($inps, $temp[0]);
					array_push($outs, $temp[1]);
				}
				array_push($properties, join(",",$inps));
				array_push($properties, join(",",$outs));
				array_push($properties, $cell->getAttribute("Units"));
				array_push($properties, $cell->getAttribute("MaxConstraintUsed"));
				array_push($properties, $cell->getAttribute("MaxConstraint"));
				array_push($properties, $cell->getAttribute("MinConstraintUsed"));
				array_push($properties, $cell->getAttribute("MinConstraint"));
				break;
			case "Flow":
				array_push($properties, "flow");
				array_push($properties, $cell->id);
				array_push($properties, $cell->getAttribute("name"));
				array_push($properties, cleanNote($cell->getAttribute("Note")));
				array_push($properties, connectionValue(orig($cell->source)));
				array_push($properties, connectionValue(orig($cell->target)));
				array_push($properties, str_replace("\\n","\n",$cell->getAttribute("FlowRate")));
				array_push($properties, $cell->getAttribute("OnlyPositive"));
				array_push($properties, $cell->getAttribute("TimeIndependent"));
				array_push($properties, $cell->getAttribute("Units"));
				array_push($properties, $cell->getAttribute("MaxConstraintUsed"));
				array_push($properties, $cell->getAttribute("MaxConstraint"));
				array_push($properties, $cell->getAttribute("MinConstraintUsed"));
				array_push($properties, $cell->getAttribute("MinConstraint"));
				array_push($properties, $cell->getAttribute("ShowSlider"));
				array_push($properties, $cell->getAttribute("SliderMax"));
				array_push($properties, $cell->getAttribute("SliderMin"));
				break;
			case "Link":
				array_push($properties, "link");
				array_push($properties, $cell->id);
				array_push($properties, sanitizeName($cell->getAttribute("name"), "Link"));
				array_push($properties, cleanNote($cell->getAttribute("Note")));
				array_push($properties, connectionValue(orig($cell->source)));
				array_push($properties, connectionValue(orig($cell->target)));
				break;
			case "Display":
				array_push($properties, "display");
				array_push($properties, $cell->id);
				array_push($properties, $cell->getAttribute("name"));
				array_push($properties, cleanNote($cell->getAttribute("Note")));
				array_push($properties, $cell->getAttribute("Type"));
				$p = $cell->getAttribute("Primitives");
				if($cell->getAttribute("ScatterplotOrder") == "Y Primitive, X Primitive"){
					$items = split(",", $p);
					$temp = $items[1];
					$items[1] = $items[0];
					$items[0] = $temp;
					$p = join(",", $items);
				}
				array_push($properties, $p);
				array_push($properties, $cell->getAttribute("ThreeDimensional"));
				array_push($properties, $cell->getAttribute("xAxis"));
				array_push($properties, $cell->getAttribute("yAxis"));
				break;
			case "Folder":
				array_push($properties, "folder");
				array_push($properties, $cell->id);
				array_push($properties, sanitizeName($cell->getAttribute("name"), "Folder"));
				array_push($properties, cleanNote($cell->getAttribute("Note")));
				$children = simguaPrimitives(childrenCells($cell));
				$children = join(",",array_map("getID", $children));
				array_push($properties, $children);
				break;
		}
		array_push($primitives, join($propSep, $properties));
	}
	$modelData = join($primSep, $primitives);
	//exit("Error: ".$modelData." End");
?>
