<?php
/**
 * $Id: mxModelCodec.php,v 1.4 2010/01/02 09:45:15 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */
class mxModelCodec extends mxObjectCodec
{

	/**
	 * Class: mxModelCodec
	 *
	 * Codec for <mxGraphModels>. This class is created and registered
	 * dynamically at load time and used implicitly via <mxCodec>
	 * and the <mxCodecRegistry>.
	 * 
	 * Constructor: mxObjectCodec
	 *
	 * Constructs a new codec for the specified template object.
	 * The variables in the optional exclude array are ignored by
	 * the codec. Variables in the optional idrefs array are
	 * turned into references in the XML. The optional mapping
	 * may be used to map from variable names to XML attributes.
	 *
	 * Parameters:
	 *
	 * template - Prototypical instance of the object to be
	 * encoded/decoded.
	 * exclude - Optional array of fieldnames to be ignored.
	 * idrefs - Optional array of fieldnames to be converted to/from
	 * references.
	 * mapping - Optional mapping from field- to attributenames.
	 */
	function mxModelCodec($template)
	{
		parent::mxObjectCodec($template);
	}
	
	/**
	 * Override <mxObjectCodec.encode>.
	 */
	function encode($enc, $obj)
	{
		$name = mxCodecRegistry::getName($obj);
		$node = $enc->document->createElement($name);
		$rootNode = $enc->document->createElement("root");
		
		$enc->encodeCell($obj->getRoot(), $rootNode);
		$node->appendChild($rootNode);
		
	    return $node;
	}

	/**
	 * Override <mxObjectCodec.decodeChild>.
	 */	
	function decodeChild($dec, $child, $obj)
	{
		if ($child->nodeName == "root")
		{
			$this->decodeRoot($dec, $child, $obj);
		}
		else
		{
			parent::decodeChild($dec, $child, $obj);
		}
	}
		
	/**
	 * Override <mxObjectCodec.decodeRoot>.
	 */
	function decodeRoot($dec, $root, $model)
	{
		$rootCell = null;
		$tmp = $root->firstChild;
		
		while ($tmp != null)
		{
			$cell = $dec->decodeCell($tmp);
			
			if ($cell != null && $cell->getParent() == null)
			{
				$rootCell = $cell;
			}
			
			$tmp = $tmp->nextSibling;
		}

		// Sets the root on the model if one has been decoded
		if ($rootCell != null)
		{
			$model->setRoot($rootCell);
		}
	}

}

mxCodecRegistry::register(new mxModelCodec(new mxGraphModel()));
?>
