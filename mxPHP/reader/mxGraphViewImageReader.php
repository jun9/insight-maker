<?php
/**
 * $Id: mxGraphViewImageReader.php,v 1.6 2010/01/02 09:45:16 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */

class mxGraphViewImageReader
{

	/**
	 * Class: mxGraphViewImageReader
	 *
	 * A display XML to image converter. This allows to create an image of a graph
	 * without having to parse and create the graph model using the XML file
	 * created for the mxGraphView object in the thin client.
	 *
	 * To create the XML for the mxGraphView on the client:
	 *
	 * (code)
	 * var enc = new mxCodec(mxUtils.createXMLDocument());
	 * var node = enc.encode(editor.graph.view);
	 * var xml = mxUtils.getXML(node);
	 * (end)
	 * 
	 * Variable: canvas
	 *
	 * Holds the canvas.
	 */
	var $canvas;
	
	/**
	 * Variable: scale
	 * 
	 * Holds the global scale of the graph. This is set just before
	 * createCanvas is called.
	 */
	var $scale = 1;
	
	/**
	 * Variable: parser
	 *
	 * Holds the SAX parser.
	 */
	var $parser;
	
	/**
	 * Variable: background
	 *
	 * Holds the background color.
	 */
	var $background;
	
	/**
	 * Variable: border
	 *
	 * Holds the border size. Default is 0.
	 */
	var $border;

	/**
	 * Constructor: mxGraphViewImageReader
	 *
	 * Constructs a new image graph view reader.
	 */
	function mxGraphViewImageReader($background = null, $border = 0)
	{
		$this->parser = xml_parser_create();
		
		xml_parser_set_option($this->parser, XML_OPTION_CASE_FOLDING, 0);
		xml_set_object($this->parser, $this);
		xml_set_element_handler($this->parser, "startElement", "endElement");
			
		$this->background = $background;
		$this->border = $border;
	}

	/**
	 * Function: createCanvas
	 *
	 * Returns the canvas to be used for rendering.
	 */
	function createCanvas($attrs)
	{
		$width = $attrs["x"] + $attrs["width"] + $this->border + 1;
		$height = $attrs["y"] + $attrs["height"] + $this->border + 1;

		return new mxGdCanvas($width, $height, $this->scale, $this->background);
	}

	/**
	 * Function: read
	 *
	 * Reads the specified view XML string.
	 */
	function read($string)
	{
		xml_parse($this->parser, $string, true);
	}
	
	/**
	 * Function: readFile
	 *
	 * Reads the specified view XML file.
	 */
	function readFile($filename)
	{
		$fp = fopen($filename, "r");
		
		while ($data = fread($fp, 4096))
		{
			xml_parse($this->parser, $data, feof($fp)) or
			die (sprintf("XML Error: %s at line %d", 
				xml_error_string(xml_get_error_code($this->parser)),
				xml_get_current_line_number($this->parser)));
		}
		
		fclose($fp);
	}

	/**
	 * Function: startElement
	 *
	 * Invoked by the SAX parser when an element starts.
	 */
	function startElement($parser, $name, $attrs)
	{
		if ($this->canvas == null && $name == "graph")
		{
			$this->scale = mxUtils::getValue($attrs, "scale", 1);
			$this->canvas = $this->createCanvas($attrs);
		}
		else if ($this->canvas != null)
		{
			$drawLabel = false;
		
			if ($name == "vertex" ||
				$name == "group")
			{
				$this->drawVertex($attrs);
				$drawLabel = true;
			}
			else if ($name == "edge")
			{
				$this->drawEdge($attrs);
				$drawLabel = true;
			}
			
			if ($drawLabel)
			{
				$this->drawLabel($name == "edge", $attrs);
			}
		}
	}

	/**
	 * Function: drawVertex
	 *
	 * Draws the specified vertex using the canvas.
	 */
	function drawVertex($attrs)
	{
		$width = mxUtils::getNumber($attrs, "width");
		$height = mxUtils::getNumber($attrs, "height");
		
		if ($width > 0 && $height > 0)
		{
			$x = mxUtils::getNumber($attrs, "x");
			$y = mxUtils::getNumber($attrs, "y");
			
			$this->canvas->drawVertex($x, $y, $width, $height, $attrs);
		}
	}

	/**
	 * Function: drawEdge
	 *
	 * Draws the specified edge using the canvas.
	 */
	function drawEdge($attrs)
	{
		$pts = $this->parsePoints(mxUtils::getValue($attrs, "points"));
		
		if (sizeof($pts) > 0)
		{
			$this->canvas->drawEdge($pts, $attrs);
		}
	}
	
	/**
	 * Function: drawLabel
	 *
	 * Draws the specified label using the canvas.
	 */
	function drawLabel($isEdge, $attrs)
	{
		$label = mxUtils::getValue($attrs, "label");
		
		if (isset($label) && strlen($label) > 0)
		{
			$offset = new mxPoint(mxUtils::getNumber($attrs, "dx"),
				mxUtils::getNumber($attrs, "dy"));
			$vertexBounds = (!$isEdge) ?
				new mxRectangle(mxUtils::getNumber($attrs, "x"),
				mxUtils::getNumber($attrs, "y"),
				mxUtils::getNumber($attrs, "width"),
				mxUtils::getNumber($attrs, "height")) : null;
			$bounds = mxUtils::getLabelPaintBounds($label, $attrs,
				mxUtils::getValue($attrs, "html", false), $offset,
				$vertexBounds, $this->scale);
				
			$this->canvas->drawLabel($label, $bounds->x, $bounds->y,
				$bounds->width, $bounds->height, $attrs, false);
		}
	}

	/**
	 * Function: parsePoints
	 * 
	 * Parses a string that represents a list of points into an array of
	 * <mxPoints>.
	 */
	function parsePoints($str)
	{
		$pts = array();
		
		if (isset($str))
		{
		 	$len = strlen($str);
			$tmp = '';
			$x0 = null;
			$y0 = null;
		 	
		 	for ($i=0; $i<=$len; $i++)
		 	{
		 		$c = substr($str, $i, 1);
		 		
		 		if ($c == ',' ||
		 			$c == ' ' ||
		 			$c == null)
		 		{
		 			if ($x0 == null)
		 			{
		 				$x0 = $tmp;
		 			}
		 			else if ($y0 == null)
		 			{
		 				$y0 = $tmp;
		 			}
		 			else
		 			{
		 				array_push($pts, new mxPoint($x0, $y0));
		 				$x0 = null;
		 				$y0 = null;
		 			}
		 			
	 				$tmp = '';
		 		}
		 		else
		 		{
					$tmp .= $c;	 		
		 		}
		 	}
		}
	 	
	 	return $pts;
	}

	/**
	 * Function: endElement
	 *
	 * Invoked by the SAX parser when an element ends.
	 */
	function endElement($parser, $name)
	{
	 	// ignore
	}

	/**
	 * Destructor: destroy
	 *
	 * Destroy all allocated resources for this reader.
	 */
	function destroy()
	{
	 	$this->canvas->destroy();
	 	xml_parser_free($this->parser);
	}

	/**
	 * Function: convert
	 *
	 * Creates the image for the given display XML string.
	 */
	static function convert($string, $background=null)
	{
		$viewReader = new mxGraphViewImageReader($background);
		$viewReader->read($string);
		$image = $viewReader->canvas->getImage();
		
		return $image;	
	}

	/**
	 * Function: convertFile
	 *
	 * Creates the image for the given display XML file.
	 */
	static function convertFile($filename, $background=null)
	{
		$viewReader = new mxGraphViewImageReader($background);
		$viewReader->readFile($filename);
		$image = $viewReader->canvas->getImage();
		
		return $image;		
	}

}
?>
