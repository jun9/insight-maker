<?php
/**
 * $Id: mxCellCodec.php,v 1.7 2010/01/02 09:45:15 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */
class mxCellCodec extends mxObjectCodec
{

	/**
	 * Class: mxCellCodec
	 *
	 * Codec for <mxCell>s. This class is created and registered
	 * dynamically at load time and used implicitely via <mxCodec>
	 * and the <mxCodecRegistry>.
	 *
	 * Transient Fields:
	 *
	 * - children
	 * - edges
	 * - states
	 * - overlay
	 * - mxTransient
	 *
	 * Reference Fields:
	 *
	 * - parent
	 * - source
	 * - target
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
	function mxCellCodec($template)
	{
		parent::mxObjectCodec($template, array("children", "edges", "states",
			"overlay", "mxTransient"), array("parent",
			"source", "target"));
	}
	
	/**
	 * Override <mxObjectCodec.isExcluded>.
	 */
	function isExcluded($obj, $attr, $value, $isWrite)
	{
		return parent::isExcluded($obj, $attr, $value, $isWrite) ||
				($isWrite &&
			   $attr == "value" &&
			   get_class($value) == "DOMElement");
	}

	/**
	 * Override <mxObjectCodec.afterEncode>.
	 */
	function afterEncode($enc, $obj, $node)
	{
		if (get_class($obj->value) == "DOMElement")
		{
			// Wraps the graphical annotation up in the
			// user object (inversion) by putting the
			// result of the default encoding into
			// a clone of the user object (node type 1)
			// and returning this cloned user object.
			$tmp = $node;

			$node = $enc->document->importNode($obj->value, true);
			$node->appendChild($tmp);
						
			// Moves the id attribute to the outermost
			// XML node, namely the node which denotes
			// the object boundaries in the file.
			$id = $tmp->getAttribute("id");
			$node->setAttribute("id", $id);
			$tmp->removeAttribute("id");
		}

		return $node;
	}

	/**
	 * Override <mxObjectCodec.beforeDecode>.
	 */
	function beforeDecode($dec, $node, $obj)
	{
		$inner = $node;
		$className = mxCodecRegistry::getName($this->template);
		
		if ($node->nodeName != $className)
		{
			// Passes the inner graphical annotation node to the
			// object codec for further processing of the cell.
			$tmp = $node->getElementsByTagName($className)->item(0);
			
			if ($tmp != null && $tmp->parentNode == $node)
			{
				$inner = $tmp;

				// Removes annotation and whitespace from node
				$tmp2 = $tmp->previousSibling;

				while ($tmp2 != null && $tmp2->nodeType == XML_TEXT_NODE)
				{
					$tmp3 = $tmp2->previousSibling;

					if (strlen(trim($tmp2->textContent)) == 0)
					{
						$tmp2->parentNode->removeChild($tmp2);
					}
					
					$tmp2 = $tmp3;
				}
				
				// Removes more whitespace
				$tmp2 = $tmp->nextSibling;
				
				while ($tmp2 != null && $tmp2->nodeType == XML_TEXT_NODE)
				{
					$tmp3 = $tmp2->previousSibling;
										
					if (strlen(trim($tmp2->textContent)) == 0)
					{
						$tmp2->parentNode->removeChild($tmp2); ///SFR XXX FIXME
					}
					
					$tmp2 = $tmp3;
				}
				
				$tmp->parentNode->removeChild($tmp);
			}
			else
			{
				$inner = null;
			}
			
			// Creates the user object out of the XML node
			$obj->value = $node->cloneNode(true);
			$id = $obj->value->getAttribute("id");
			
			if ($id != null)
			{
				$obj->setId($id);
				$obj->value->removeAttribute("id");
			}
		}
		else
		{
			$obj->setId($node->getAttribute("id"));
		}
			
		// Preprocesses and removes all Id-references
		// in order to use the correct encoder (this)
		// for the known references to cells (all).
		if ($inner != null)
		{
			for ($i=0; $i<sizeof($this->idrefs); $i++)
			{
				$attr = $this->idrefs[$i];
				$ref = $inner->getAttribute($attr);
				
				if ($ref != null)
				{
					$inner->removeAttribute($attr);
					$object =& $dec->objects[$ref];
					
					if ($object == null)
					{
						$object = $dec->lookup($ref);
					}
					
					if ($object == null)
					{
						// Needs to decode forward reference
						$element = $dec->getElementById($ref);
						
						if ($element != null)
						{
							$decoder = mxCodecRegistry::$codecs[$element->nodeName];
							
							if (!isset($decoder))
							{
							  $decoder = $this;
							}
							$object = $decoder->decode($dec, $element);
						}
					}
					
					$obj->$attr = $object;
				}
			}
		}
		
		return $inner;
	}

}

mxCodecRegistry::register(new mxCellCodec(new mxCell()));
?>
