<?php
/**
 * $Id: mxCell.php,v 1.18 2010/03/22 13:07:42 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */
class mxCell
{

	/**
	 * Class: mxCell
	 * 
	 * Cells are the elements of the graph model. They represent the state
	 * of the groups, vertices and edges in a graph.
	 * 
	 * Variable: id
	 *
	 * Holds the Id. Default is null.
	 */
	var $id = null;

	/**
	 * Variable: value
	 *
	 * Holds the user object. Default is null.
	 */
	var $value = null;

	/**
	 * Variable: geometry
	 *
	 * Holds the <mxGeometry>. Default is null.
	 */
	var $geometry = null;

	/**
	 * Variable: style
	 *
	 * Holds the style as a string of the form [(stylename|key=value);].
	 * Default is null.
	 */
	var $style = null;

	/**
	 * Variable: vertex
	 *
	 * Specifies whether the cell is a vertex. Default is false.
	 */
	var $vertex = false;

	/**
	 * Variable: edge
	 *
	 * Specifies whether the cell is an edge. Default is false.
	 */
	var $edge = false;

	/**
	 * Variable: connectable
	 *
	 * Specifies whether the cell is connectable. Default is true.
	 */
	var $connectable = true;

	/**
	 * Variable: visible
	 *
	 * Specifies whether the cell is visible. Default is true.
	 */
	var $visible = true;

	/**
	 * Variable: collapsed
	 *
	 * Specifies whether the cell is collapsed. Default is false.
	 */
	var $collapsed = false;

	/**
	 * Variable: parent
	 *
	 * Reference to the parent cell.
	 */
	var $parent = null;

	/**
	 * Variable: source
	 *
	 * Reference to the source terminal.
	 */
	var $source = null;

	/**
	 * Variable: target
	 *
	 * Reference to the target terminal.
	 */
	var $target = null;

	/**
	 * Variable: children
	 *
	 * Holds the child cells.
	 */
	var $children = null; // transient

	/**
	 * Variable: edges
	 *
	 * Holds the edges.
	 */
	var $edges = null; // transient

	/**
	 * Constructor: mxCell
	 *
	 * Constructs a new cell to be used in a graph model.
	 * This method invokes <onInit> upon completion.
	 * 
	 * Parameters:
	 * 
	 * value - Optional object that represents the cell value.
	 * geometry - Optional <mxGeometry> that specifies the geometry.
	 * style - Optional formatted string that defines the style.
	 */
	function mxCell($value=null, $geometry=null, $style=null)
	{
		$this->setValue($value);
		$this->setGeometry($geometry);
		$this->setStyle($style);
	}

	/**
	 * Function: getId
	 *
	 * Returns the Id of the cell as a string.
	 */
	function getId()
	{
		return $this->id;
	}
			
	/**
	 * Function: setId
	 *
	 * Sets the Id of the cell to the given string.
	 */
	 function setId($id)
	 {
		$this->id = $id;
	}

	/**
	 * Function: getValue
	 *
	 * Returns the user object of the cell. The user
	 * object is stored in <value>.
	 */
	function getValue()
	{
		return $this->value;
	}
			
	/**
	 * Function: setValue
	 *
	 * Sets the user object of the cell. The user object
	 * is stored in <value>.
	 */
	 function setValue(&$value)
	 {
		$this->value = $value;
	}

	/**
	 * Function: getGeometry
	 *
	 * Returns the <mxGeometry> that describes the <geometry>.
	 */
	function getGeometry()
	{
		return $this->geometry;
	}
			
	/**
	 * Function: setGeometry
	 *
	 * Sets the <mxGeometry> to be used as the <geometry>.
	 */
	 function setGeometry(&$geometry)
	 {
		$this->geometry = $geometry;
	}

	/**
	 * Function: getStyle
	 *
	 * Returns a string that describes the <style>.
	 */
	function getStyle()
	{
		return $this->style;
	}
			
	/**
	 * Function: setStyle
	 *
	 * Sets the string to be used as the <style>.
	 */
	 function setStyle($style)
	 {
		$this->style = $style;
	 }

	/**
	 * Function: isVertex
	 *
	 * Returns true if the cell is a vertex.
	 */
	function isVertex()
	{
		return $this->vertex;
	}
			
	/**
	 * Function: setVertex
	 *
	 * Specifies if the cell is a vertex. This should only be assigned at
	 * construction of the cell and not be changed during its lifecycle.
	 * 
	 * Parameters:
	 * 
	 * vertex - Boolean that specifies if the cell is a vertex.
	 */
	 function setVertex($vertex)
	 {
		$this->vertex = $vertex;
	 }
	 
	/**
	 * Function: isEdge
	 *
	 * Returns true if the cell is an edge.
	 */
	function isEdge()
	{
		return $this->edge;
	}
			
	/**
	 * Function: setEdge
	 * 
	 * Specifies if the cell is an edge. This should only be assigned at
	 * construction of the cell and not be changed during its lifecycle.
	 * 
	 * Parameters:
	 * 
	 * edge - Boolean that specifies if the cell is an edge.
	 */
	 function setEdge($edge)
	 {
		$this->edge = $edge;
	 }
	
	/**
	 * Function: isConnectable
	 *
	 * Returns true if the cell is connectable.
	 */
	function isConnectable()
	{
		return $this->connectable;
	}
	
	/**
	 * Function: setConnectable
	 *
	 * Sets the connectable state.
	 * 
	 * Parameters:
	 * 
	 * connectable - Boolean that specifies the new connectable state.
	 */
	function setConnectable($connectable)
	{
		$this->connectable = $connectable;
	}

	/**
	 * Function: isVisible
	 *
	 * Returns true if the cell is visibile.
	 */
	function isVisible()
	{
		return $this->visible;
	}
	
	/**
	 * Function: setVisible
	 *
	 * Specifies if the cell is visible.
	 * 
	 * Parameters:
	 * 
	 * visible - Boolean that specifies the new visible state.
	 */
	function setVisible($visible)
	{
		$this->visible = $visible;
	}
	
	/**
	 * Function: isCollapsed
	 *
	 * Returns true if the cell is collapsed.
	 */
	function isCollapsed()
	{
		return $this->collapsed;
	}
	
	/**
	 * Function: setCollapsed
	 *
	 * Sets the collapsed state.
	 * 
	 * Parameters:
	 * 
	 * collapsed - Boolean that specifies the new collapsed state.
 	 */
	function setCollapsed($collapsed)
	{
		$this->collapsed = $collapsed;
	}

	/**
	 * Function: getParent
	 *
	 * Returns the cell's parent.
	 */
	function getParent()
	{
		return $this->parent;
	}
			
	/**
	 * Function: setParent
	 *
	 * Sets the parent cell.
	 * 
	 * Parameters:
	 * 
	 * parent - <mxCell> that represents the new parent.
	 */
	 function setParent($parent)
	 {
		$this->parent = $parent;
	}
		
	/**
	 * Function: getTerminal
	 *
	 * Returns the source or target terminal.
	 * 
	 * Parameters:
	 * 
	 * source - Boolean that specifies if the source terminal should be
	 * returned.
	 */
	function getTerminal($source)
	{
		return ($source) ? $this->source : $this->target;
	}
			
	/**
	 * Function: setTerminal
	 *
	 * Sets the source or target terminal and returns the new terminal.
	 * 
	 * Parameters:
	 * 
	 * terminal - <mxCell> that represents the new source or target terminal.
	 * isSource - Boolean that specifies if the source or target terminal
	 * should be set.
	 */
	 function setTerminal($terminal, $isSource)
	 {
	 	if ($isSource)
	 	{
	 		$this->source = $terminal;
	 	}
	 	else
	 	{
	 		$this->target = $terminal;
	 	}
	 	
	 	return $terminal;
	}
	
	/**
	 * Function: getChildCount
	 *
	 * Returns the number of child cells.
	 */
	function getChildCount()
	{
		return ($this->children == null) ? 0 : sizeof($this->children);
	}

	/**
	 * Function: getIndex
	 *
	 * Returns the index of the specified child in the child array.
	 * 
	 * Parameters:
	 * 
	 * child - Child whose index should be returned.
	 */
	function getIndex(&$child)
	{
		return mxUtils::indexOf($this->children, $child);
	}

	/**
	 * Function: getChildAt
	 *
	 * Returns the child at the specified index.
	 * 
	 * Parameters:
	 * 
	 * index - Integer that specifies the child to be returned.
	 */
	function getChildAt($index)
	{
		return ($this->children == null) ? null : $this->children[$index];
	}

	/**
	 * Function: insert
	 *
	 * Inserts the specified child into the child array at the specified index
	 * and updates the parent reference of the child. If not childIndex is
	 * specified then the child is appended to the child array. Returns the
	 * inserted child.
	 * 
	 * Parameters:
	 * 
	 * child - <mxCell> to be inserted or appended to the child array.
	 * index - Optional integer that specifies the index at which the child
	 * should be inserted into the child array.
	 */
	function insert(&$child, $index = null)
	{
		if ($child != null)
		{
			$index = ($index != null) ? $index : $this->getChildCount();
			
			$child->removeFromParent();
			$child->setParent($this);
			
			if ($this->children == null)
			{
				$this->children = array();
				array_push($this->children, $child);
			}
			else
			{
				array_splice($this->children, $index, 0, array($child));
			}
		}
		
		return $child;
	}

	/**
	 * Function: remove
	 *
	 * Removes the child at the specified index from the child array and
	 * returns the child that was removed. Will remove the parent reference of
	 * the child.
	 * 
	 * Parameters:
	 * 
	 * index - Integer that specifies the index of the child to be
	 * removed.
	 */
	function remove($index)
	{
		if ($this->children != null &&
			$index >= 0)
		{
			$child = $this->getChildAt($index);
			
			if ($child != null)
			{
				array_splice($this->children, $index, 1);
				$child->setParent(null);
			}
			
			return $child;
		}
		
		return null;
	}

	/**
	 * Function: removeFromParent
	 *
	 * Removes the cell from its parent.
	 */
	function removeFromParent()
	{
	 	if ($this->parent != null)
	 	{
	 		$index = $this->parent->getIndex($this);
	 		$this->parent->remove($index);
	 	}
	}

	/**
	 * Function: getEdgeCount
	 *
	 * Returns the number of edges in the edge array.
	 */
	function getEdgeCount()
	{
		return ($this->edges == null) ? 0 : sizeof($this->edges);
	}

	/**
	 * Function: getEdgeIndex
	 *
	 * Returns the index of the specified edge in <edges>.
	 * 
	 * Parameters:
	 * 
	 * edge - <mxCell> whose index in <edges> should be returned.
	 */
	function getEdgeIndex(&$edge)
	{
		return mxUtils::indexOf($this->edges, $edge);
	}
	
	/**
	 * Function: getEdgeAt
	 *
	 * Returns the edge at the specified index in <edges>.
	 * 
	 * Parameters:
	 * 
	 * index - Integer that specifies the index of the edge to be returned.
	 */
	function getEdgeAt($index)
	{
		return ($this->edges == null) ? null : $this->edges[$index];
	}

	/**
	 * Function: insertEdge
	 *
	 * Inserts the specified edge into the edge array and returns the edge.
	 * Will update the respective terminal reference of the edge.
	 * 
	 * Parameters:
	 * 
	 * edge - <mxCell> to be inserted into the edge array.
	 * isOutgoing - Boolean that specifies if the edge is outgoing.
	 */
	function insertEdge(&$edge, $isOutgoing)
	{
		if ($edge != null)
		{
			$edge->removeFromTerminal($isOutgoing);
			$edge->setTerminal($this, $isOutgoing);

			if ($this->edges == null ||
				$edge->getTerminal(!$isOutgoing) !== $this ||
				mxUtils::indexOf($this->edges, $edge) < 0)
			{
				if ($this->edges == null)
				{
					$this->edges = array();
				}
				
				array_push($this->edges, $edge);
			}
		}
		
		return $edge;
	}

	/**
	 * Function: removeEdge
	 *
	 * Removes the specified edge from the edge array and returns the edge.
	 * Will remove the respective terminal reference from the edge.
	 * 
	 * Parameters:
	 * 
	 * edge - <mxCell> to be removed from the edge array.
	 * isOutgoing - Boolean that specifies if the edge is outgoing.
	 */
	function removeEdge(&$edge, $isOutgoing)
	{
		if ($edge != null)
		{
			if ($edge->getTerminal(!$isOutgoing) != $this &&
				$this->edges != null)
			{
				$index = $this->getEdgeIndex($edge);
				
				if ($index >= 0)
				{
					array_splice($this->edges, $index, 1);
				}
			}
			
			$edge->setTerminal(null, $isOutgoing);
		}

		return $edge;
	}

	/**
	 * Function: removeFromTerminal
	 *
	 * Removes the edge from its source or target terminal.
	 * 
	 * Parameters:
	 * 
	 * isSource - Boolean that specifies if the edge should be removed from its
	 * source or target terminal.
	 */
	function removeFromTerminal($isSource)
	{
	 	$terminal =& $this->getTerminal($isSource);
	 	
	 	if ($terminal != null)
	 	{
	 		$terminal->removeEdge($this, $isSource);
	 	}
	}

	/**
	 * Function: getAttribute
	 *
	 * Returns the specified attribute from the user object if it is an XML
	 * node.
	 */
	function getAttribute($key, $defaultValue=null)
	{
		$userObject = $this->getValue();
		
		$value = (is_object($userObject) &&
			$userObject->nodeType == XML_ELEMENT_NODE) ?
			$userObject->getAttribute($key) : null;
			
		if ($value == null)
		{
			$value = $defaultValue;
		}
		
		return $value;
	}

	/**
	 * Function: setAttribute
	 *
	 * Sets the specified attribute on the user object if it is an XML node.
	 */
	function setAttribute($key, $value)
	{
		$userObject = $this->getValue();
		
		if (is_object($userObject) &&
			$userObject->nodeType == XML_ELEMENT_NODE)
		{
			$userObject->setAttribute($key, $value);
		}
	}
	
	/**
	 * Function: copy
	 *
	 * Returns a clone of the cell. Uses <cloneValue> to clone
	 * the user object.
	 */
	function &copy()
	{
	 	$clone = new mxCell($this->copyValue(), null, $this->style);
	 	$clone->vertex = $this->vertex;
	 	$clone->edge = $this->edge;
	 	$clone->connectable = $this->connectable;
	 	$clone->visible = $this->visible;
	 	$clone->collapsed = $this->collapsed;
		
		// Clones the geometry
		if ($this->geometry != null)
		{
			$clone->geometry = $this->geometry->copy();
		}
		
		return $clone;
	}

	/**
	 * Function: copyValue
	 *
	 * Returns a clone of the cell's user object.
	 */
	function &copyValue()
	{
		$value = $this->getValue();
		
		if ($value != null)
		{
			if (method_exists($value, "cloneNode"))
			{
				$value = $value->cloneNode(true);
			}
		}
		
		return $value;
	}

}

?>
