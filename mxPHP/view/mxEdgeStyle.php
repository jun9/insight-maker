<?php
/**
 * $Id: mxEdgeStyle.php,v 1.26 2010/01/02 09:45:15 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */
interface mxEdgeStyleFunction
{

	/**
	 * Interface: mxEdgeStyleFunction
	 * 
	 * Defines the requirements for an edge style function.
	 * 
	 * Function: apply
	 * 
	 * Implements an edge style function. At the time the function is called, the result
	 * array contains a placeholder (null) for the first absolute point,
	 * that is, the point where the edge and source terminal are connected.
	 * The implementation of the style then adds all intermediate waypoints
	 * except for the last point, that is, the connection point between the
	 * edge and the target terminal. The first ant the last point in the
	 * result array are then replaced with mxPoints that take into account
	 * the terminal's perimeter and next point on the edge.
	 *
	 * Parameters:
	 * 
	 * state - <mxCellState> that represents the edge to be updated.
	 * source - <mxCellState> that represents the source terminal.
	 * target - <mxCellState> that represents the target terminal.
	 * points - List of relative control points.
	 * result - Array of <mxPoints> that represent the actual points of the
	 * edge.
	 */
	public function apply($state, $source, $target, $points, &$result);

}

/**
 * Class: mxEntityRelation
 * 
 * Implements an entity relation style for edges (as used in database
 * schema diagrams).  At the time the function is called, the result
 * array contains a placeholder (null) for the first absolute point,
 * that is, the point where the edge and source terminal are connected.
 * The implementation of the style then adds all intermediate waypoints
 * except for the last point, that is, the connection point between the
 * edge and the target terminal. The first ant the last point in the
 * result array are then replaced with mxPoints that take into account
 * the terminal's perimeter and next point on the edge.
 */
class mxEntityRelation implements mxEdgeStyleFunction
{

	/**
	 * 
	 */
	public function apply($state, $source, $target, $points, &$result)
	{
		$view = $state->view;
		$model = $view->graph->model;
		
		$segment = mxUtils::getValue($style,
			mxConstants::$STYLE_STARTSIZE, mxConstants::$ENTITY_SEGMENT) *
			$state->view->scale;
	 	$isSourceLeft = false;
	 	
	 	if ($source == null)
	 	{
		 	$sourceGeometry = $model->getGeometry($source->cell);	 		
	 	
		 	if ($sourceGeometry->relative)
		 	{
		 		$isSourceLeft = $sourceGeometry->x <= 0.5;
		 	}
		 	else if ($target != null)
		 	{
		 		$isSourceLeft = $target->x + $target->width < $source->x;
		 	}
		}
		else
		{
			$pt = $state->absolutePoints[0];
			
			if ($pt == null)
			{
				return;
			}
			
			$source = new mxCellState();
			$source->x = $pt->x;
			$source->y = $pt->y;
		}
	 	
	 	$isTargetLeft = true;
	 	
	 	if ($target == null)
	 	{
		 	$targetGeometry = $model->getGeometry($target->cell);	 		
	 	
		 	if ($targetGeometry->relative)
		 	{
		 		$isTargetLeft = $targetGeometry->x <= 0.5;
		 	}
		 	else if ($source != null)
		 	{
		 		$isTargetLeft = $source->x + $source->width < $target->x;
		 	}
		}
		else
		{
			$n = sizeof($state->absolutePoints);
			$pt = $state->absolutePoints[$n - 1];
			
			if ($pt == null)
			{
				return;
			}
			
			$target = new mxCellState();
			$target->x = $pt->x;
			$target->y = $pt->y;
		}
	 	
		$x0 = ($isSourceLeft) ? $source->x : $source->x + $source->width;
		$y0 = $view->getRoutingCenterY($source);
		
		$xe = ($isTargetLeft) ? $target->x : $target->x + $target->width;
		$ye = $view->getRoutingCenterY($target);

		$seg = $segment;
		
		$dx = ($isSourceLeft) ? -$seg : $seg;
		$dep = new mxPoint($x0+$dx, $y0);
		array_push($result, $dep);
				
		$dx = ($isTargetLeft) ? -$seg : $seg;
		$arr = new mxPoint($xe+$dx, $ye);

		// Adds intermediate points if both go out on same side
		if ($isSourceLeft == $isTargetLeft)
		{
			$x = ($isSourceLeft) ?
				min($x0, $xe)-$segment :
				max($x0, $xe)+$segment;
			array_push($result, new mxPoint($x, $y0));
			array_push($result, new mxPoint($x, $ye));
		}
		else if (($dep->x < $arr->x) == $isSourceLeft)
		{
			$midY = $y0 + ($ye - $y0) / 2;
			array_push($result, new mxPoint($dep->x, $midY));
			array_push($result, new mxPoint($arr->x, $midY));
		}
		
		array_push($result, $arr);
	}

}

/**
 * Class: mxLoop
 * 
 * Implements a self-reference, aka. loop.
 */
class mxLoop implements mxEdgeStyleFunction
{

	/**
	 * 
	 */
	public function apply($state, $source, $target, $points, &$result)
	{
		$view = $state->view;
		$graph = $view->graph;
		$pt = ($points != null && sizeof($points) > 0) ? $points[0] : null;
				
		$s = $view->scale;
		
		if ($pt != null)
		{
			$pt = $view->transformControlPoint($state, $pt);
				
			if (mxUtils::contains($source, $pt->x, $pt->y))
			{
				$pt = null;
			}
		}
	
		$x = 0;
		$dx = 0;
		$y = $view->getRoutingCenterY($source);
		$dy = $s * $graph->gridSize;
		
		if ($pt == null ||
			$pt->x < $source->x ||
			$pt->x > $source->x + $source->width)
		{
			if ($pt != null)
			{
				$x = $pt->x;
				$dy = max(abs($y - $pt->y), $dy);
			}
			else
			{
				$x = $source->x + $source->width + 2 * $dy;
			}
		}
		else if ($pt != null)
		{
			$x = $view->getRoutingCenterX($source);
			$dx = max(abs($x - $pt->x), $dy);
			$y = $pt->y;
			$dy = 0;
		}
		
		array_push($result, new mxPoint($x-$dx, $y-$dy)); // isRouted = true
		array_push($result, new mxPoint($x+$dx, $y+$dy)); // isRouted = true
	}
	
}

/**
 * Class: mxElbowConnector
 * 
 * Uses either <SideToSide> or <TopToBottom> depending on the horizontal
 * flag in the cell style. <SideToSide> is used if horizontal is true or
 * unspecified. See <EntityRelation> for a description of the
 * parameters.
 */
class mxElbowConnector implements mxEdgeStyleFunction
{

	/**
	 * 
	 */
	public function apply($state, $source, $target, $points, &$result)
	{
		$pt = ($points != null && sizeof($points) > 0) ? $points[0] : null;

		$vertical = false;
		$horizontal = false;
		
		if ($source != null && $target != null)
		{
			if ($pt != null)
			{
				$left = min($source->x, $target->x);
				$right = max($source->x + $source->width,
					$target->x + $target->width);
	
				$top = min($source->y, $target->y);
				$bottom = max($source->y + $source->height,
					$target->y + $target->height);
					
				$view = $state->view;
				$pt = $view->transformControlPoint($state, $pt);
				
				$vertical = $pt->y < $top || $pt->y > $bottom;
				$horizontal = $pt->x < $left || $pt->x > $right;
			}
			else
			{
				$left = max($source->x, $target->x);
				$right = min($source->x + $source->width,
					$target->x + $target->width);
					
				$vertical = $left == $right;
				
				if (!$vertical)
				{
					$top = max($source->y, $target->y);
					$bottom = min($source->y + $source->height,
						$target->y + $target->height);
						
					$horizontal = $top == $bottom;
				}
			}
		}

		if (!$horizontal && ($vertical ||
			mxUtils::getValue($state->style, mxConstants::$STYLE_ELBOW) == mxConstants::$ELBOW_VERTICAL))
		{
			mxEdgeStyle::$TopToBottom->apply($state, $source, $target, $points, $result);
		}
		else
		{
			mxEdgeStyle::$SideToSide->apply($state, $source, $target, $points, $result);
		}
	}

}

/**
 * Class: mxSideToSide
 * 
 * Implements a vertical elbow edge. See <EntityRelation> for a description
 * of the parameters.
 */
class mxSideToSide implements mxEdgeStyleFunction
{

	/**
	 * 
	 */
	public function apply($state, $source, $target, $points, &$result)
	{
		$view = $state->view;
		$pt = ($points != null && sizeof($points) > 0) ? $points[0] : null;
		
		if ($pt != null)
		{
			$pt = $view->transformControlPoint($state, $pt);
		}
		
		if ($source == null)
		{
			$pt = $state->absolutePoints[0];
			
			if ($pt == null)
			{
				return;
			}
			
			$source = new mxCellState();
			$source->x = $pt->x;
			$source->y = $pt->y;
		}
		
		if ($target == null)
		{
			$n = sizeof($state->absolutePoints);
			$pt = $state->absolutePoints[$n - 1];
			
			if ($pt == null)
			{
				return;
			}
			
			$target = new mxCellState();
			$target->x = $pt->x;
			$target->y = $pt->y;
		}
		
		$l = max($source->x, $target->x);
		$r = min($source->x+$source->width, $target->x+$target->width);

		$x = ($pt != null) ? $pt->x : $r + ($l-$r)/2;
		
		$y1 = $view->getRoutingCenterY($source);
		$y2 = $view->getRoutingCenterY($target);
		
		if ($pt != null)
		{
			if ($pt->y >= $source->y &&
				$pt->y <= $source->y + $source->height)
			{
				$y1 = $pt->y;
			}
			
			if ($pt->y >= $target->y &&
				$pt->y <= $target->y + $target->height)
			{
				$y2 = $pt->y;
			}
		}
		
		if (!mxUtils::contains($target, $x, $y1) &&
			!mxUtils::contains($source, $x, $y1))
		{
			array_push($result, new mxPoint($x, $y1)); // isRouted = true
		}
		
		if (!mxUtils::contains($target, $x, $y2) &&
			!mxUtils::contains($source, $x, $y2))
		{
			array_push($result, new mxPoint($x, $y2)); // isRouted = true
		}

		if (sizeof($result) == 1)
		{
			if ($pt == null)
			{
				array_push($result, new mxPoint($x, $pt->y)); // isRouted = true
			}
			else
			{
				$t = max($source->y, $target->y);
				$b = min($source->y+$source->height, $target->y+$target->height);
				
				array_push($result, new mxPoint($x, $t + ($b - $t) / 2)); // isRouted = true
			}
		}
	}
	
}
	
/**
 * Class: mxTopToBottom
 * 
 * Implements a horizontal elbow edge. See <EntityRelation> for a
 * description of the parameters.
 */
class mxTopToBottom implements mxEdgeStyleFunction
{

	/**
	 * 
	 */
	public function apply($state, $source, $target, $points, &$result)
	{
		$view = $state->view;
		$pt = ($points != null && sizeof($points) > 0) ? $points[0] : null;
		
		if ($pt != null)
		{
			$pt = $view->transformControlPoint($state, $pt);
		}

		if ($source == null)
		{
			$pt = $state->absolutePoints[0];
			
			if ($pt == null)
			{
				return;
			}
			
			$source = new mxCellState();
			$source->x = $pt->x;
			$source->y = $pt->y;
		}
		
		if ($target == null)
		{
			$n = sizeof($state->absolutePoints);
			$pt = $state->absolutePoints[$n - 1];
			
			if ($pt == null)
			{
				return;
			}
			
			$target = new mxCellState();
			$target->x = $pt->x;
			$target->y = $pt->y;
		}

		$t = max($source->y, $target->y);
		$b = min($source->y+$source->height, $target->y+$target->height);

		$x = $view->getRoutingCenterX($source);
		
		if ($pt != null &&
			$pt->x >= $source->x &&
			$pt->x <= $source->x + $source->width)
		{
			$x = $pt->x;
		}
		
		$y = ($pt != null) ? $pt->y : $b + ($t-$b)/2;
		
		if (!mxUtils::contains($target, $x, $y) &&
			!mxUtils::contains($source, $x, $y))
		{
			array_push($result, new mxPoint($x, $y)); // isRouted = true
		}
		
		if ($pt != null &&
			$pt->x >= $target->x &&
			$pt->x <= $target->x + $target->width)
		{
			$x = $pt->x;
		}
		else
		{
			$x = $view->getRoutingCenterX($target);
		}
		
		if (!mxUtils::contains($target, $x, $y) &&
			!mxUtils::contains($source, $x, $y))
		{
			array_push($result, new mxPoint($x, $y)); // isRouted = true
		}

		if (sizeof($result) == 1)
		{
			if ($pt == null)
			{
				array_push($result, new mxPoint($x, $y)); // isRouted = true
			}
			else
			{
				$l = max($source->x, $target->x);
				$r = min($source->x+$source->width, $target->x+$target->width);
				
				array_push($result, new mxPoint($r + ($r - $l) / 2, $y)); // isRouted = true
			}
		}
	}
	
}

/**	
 *
 * Class: mxEdgeStyle
 * 
 * Provides various edge styles to be used as the values for
 * <mxConstants.STYLE_EDGE> in a cell style.
 */
class mxEdgeStyle
{

	/**
	 * Variable: EntityRelation
	 *
	 * Provides an entity relation style for edges (as used in database
	 * schema diagrams).
	 */
	public static $EntityRelation;

	/**
	 * Variable: Loop
	 *
	 * Provides a self-reference, aka. loop.
	 */
	public static $Loop;

	/**
	 * Variable: ElbowConnector
	 *
	 * Provides an elbow connector.
	 */
	public static $ElbowConnector;
	
	/**
	 * Variable: SideToSide
	 *
	 * Provides a side to side connector.
	 */
	public static $SideToSide;

	/**
	 * Variable: TopToBottom
	 *
	 * Provides a top to bottom connector.
	 */
	public static $TopToBottom;

}

// Instanciates the declared static members of the above class
mxEdgeStyle::$EntityRelation = new mxEntityRelation();
mxEdgeStyle::$Loop = new mxLoop();
mxEdgeStyle::$ElbowConnector = new mxElbowConnector();
mxEdgeStyle::$SideToSide = new mxSideToSide();
mxEdgeStyle::$TopToBottom = new mxTopToBottom();
?>
