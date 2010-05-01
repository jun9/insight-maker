<?php
/**
 * $Id: mxGdCanvas.php,v 1.93 2010/02/19 11:13:22 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */
class mxGdCanvas
{

	/**
	 * Class: mxGdCanvas
	 *
	 * Canvas for drawing graphs using the GD library. This class requires GD
	 * support (GDLib). Note that rounded corners, gradients and word wrapping
	 * are not supported by GD.
	 * 
	 * Variable: antialias
	 *
	 * Specifies if antialiasing should be enabled. Default is true.
	 */
	var $antialias = true;

	/**
	 * Variable: enableTtf
	 *
	 * Specifies if truetype fonts are enabled if available. Default is <mxConstants.TTF_ENABLED>.
	 */
	var $enableTtf;

	/**
	 * Variable: shadowColor
	 *
	 * Holds the color object for the shadow color defined in
	 * <mxConstants.W3C_SHADOWCOLOR>.
	 */
	var $shadowColor;

	/**
	 * Defines the base path for images with relative paths. Trailing slash
	 * is required. Default is an empty string.
	 */
	var $imageBasePath;

	/**
	 * Variable: imageCache
	 *
	 * Holds the image cache.
	 */
	var $imageCache = array();
	
	/**
	 * Variable: image
	 *
	 * Holds the image.
	 */
	var $image;
	
	/**
	 * Variable: height
	 *
	 * Holds the height.
	 */
	var $scale;

	/**
	 * Constructor: mxGdCanvas
	 *
	 * Constructs a new GD canvas. Use a HTML color definition for
	 * the optional background parameter, eg. white or #FFFFFF.
	 * The buffered <image> is only created if the given
	 * width and height are greater than 0.
	 */
	function mxGdCanvas($width=0, $height=0, $scale=1, $background=null, $imageBasePath = "")
	{
	 	$this->imageBasePath = $imageBasePath;
	 	$this->scale = $scale;
	 	$this->enableTtf = mxConstants::$TTF_ENABLED;
	 	
	 	if ($width > 0 &&
	 		$height > 0)
	 	{
			$this->image = @imageCreateTrueColor($width, $height);
			
			if ($this->antialias &&
				function_exists("imageantialias"))
			{
				imageantialias($this->image, true);
	 		}
			
			if ($background != null)
			{
				$color = $this->getColor($background);
				imageFilledRectangle($this->image,
					0, 0, $width, $height, $color);
			}
			
			$this->shadowColor = $this->getColor(mxConstants::$W3C_SHADOWCOLOR);
		}
	}

	/**
	 * Function: loadImage
	 * 
	 * Returns an image instance for the given URL. If the URL has
	 * been loaded before than an instance of the same instance is
	 * returned as in the previous call.
	 */
	function loadImage($image)
	{
		$img =& $this->imageCache[$image];
		
		if ($img == null)
		{
			if (preg_match("/.jpeg/i", "$image"))
			{
				$img = imagecreatefromjpeg($image);
			}
			else if (preg_match("/.jpg/i", "$image"))
			{
				$img = imagecreatefromjpeg($image);
			}
			else if (preg_match("/.png/i", "$image"))
			{
				$img = imagecreatefrompng($image);
			}
			else if (preg_match("/.gif/i", "$image"))
			{
				$img = imagecreatefromgif($image);
			}

			if ($img != null)
			{
				$this->imageCache[$image] =& $img;
			}
		}
		
		return $img;
	}

	/**
	 * Function: drawVertex
	 * 
	 * Draws the given vertex.
	 */
	function drawVertex($x, $y, $w, $h, $style)
	{
        // Cannot support rotation for vertices as GD does not support it
		$stroke = mxUtils::getValue($style, mxConstants::$STYLE_STROKECOLOR);
		$fill = mxUtils::getValue($style, mxConstants::$STYLE_FILLCOLOR);
		$shape = mxUtils::getValue($style, mxConstants::$STYLE_SHAPE);
		$strokeWidth = mxUtils::getValue($style, mxConstants::$STYLE_STROKEWIDTH, 1) * $this->scale;
		
		if ($fill != null && $stroke != null)
		{
			if (isset($this->image))
			{
				imagesetthickness($this->image, $strokeWidth);
			}
	
			// Draws the vertex
			if (mxUtils::getValue($style, mxConstants::$STYLE_SHAPE, "") !=
            	mxConstants::$SHAPE_SWIMLANE)
			{
				$this->drawShape($shape, $x, $y, $w,
					$h, $fill, $stroke, $style);
			}
			else
			{
				$start = mxUtils::getNumber($style, mxConstants::$STYLE_STARTSIZE,
					mxConstants::$DEFAULT_STARTSIZE) * $this->scale;

				// TODO: Clone style, remove fill and rounded and take into account
				// the label orientation
				//if (mxUtils::getValue($style, mxConstants::$STYLE_HORIZONTAL, true))
				{
					$this->drawShape($shape, $x, $y, $w,
						min($h, $start), $fill, $stroke, $style);
					$this->drawShape($shape, $x, $y, $w,
						$h, null, $stroke, $style);
				}
			}
	
			if (isset($this->image))
			{
				imagesetthickness($this->image, 1);
			}
		}
	}

	/**
	 * Function: drawEdge
	 * 
	 * Draws the given edge.
	 */
	function drawEdge($pts, $style)
	{
		if (sizeof($pts) > 1)
		{
			$dashed = mxUtils::getNumber($style, mxConstants::$STYLE_DASHED);
			$stroke = mxUtils::getValue($style, mxConstants::$STYLE_STROKECOLOR);
			$strokeWidth = mxUtils::getNumber($style, mxConstants::$STYLE_STROKEWIDTH, 1) * $this->scale;
			
			if (isset($this->image))
			{
				// KNOWN: Stroke widhts are ignored by GD
				imagesetthickness($this->image, $strokeWidth);
			}
	
			// Draws the start marker
			$marker = mxUtils::getValue($style, mxConstants::$STYLE_STARTARROW);
	
			$p0 = $pts[0];
			$pt = $pts[1];
			$offset = null;
			
			if ($marker != null)
			{
				$size = mxUtils::getNumber($style, mxConstants::$STYLE_STARTSIZE,
					mxConstants::$DEFAULT_MARKERSIZE);
				$offset = $this->drawMarker($marker, $pt, $p0, $size, $stroke);
			}
			else
			{
				$dx = $pt->x - $p0->x;
				$dy = $pt->y - $p0->y;
	
				$dist = max(1, sqrt($dx * $dx + $dy * $dy));
				$nx = $dx * $strokeWidth / $dist;
				$ny = $dy * $strokeWidth / $dist;
				
				$offset = new mxPoint($nx / 2, $ny / 2);
			}

			// Applies offset to the point
			if ($offset != null)
			{
				$p0 = $p0->copy();
				$p0->x += $offset->x;
				$p0->y += $offset->y;
				
				$offset = null;
			}
		
			// Draws the end marker
			$len = sizeof($pts);
			$marker = mxUtils::getValue($style, mxConstants::$STYLE_ENDARROW);
			
			$pe = $pts[$len - 1];
			$pt = $pts[$len - 2];
			
			if ($marker != null)
			{
				$size = mxUtils::getNumber($style, mxConstants::$STYLE_ENDSIZE,
					mxConstants::$DEFAULT_MARKERSIZE);
				$offset = $this->drawMarker($marker, $pt, $pe, $size, $stroke);
			}
			else
			{
				$dx = $pt->x - $p0->x;
				$dy = $pt->y - $p0->y;
	
				$dist = max(1, sqrt($dx * $dx + $dy * $dy));
				$nx = $dx * $strokeWidth / $dist;
				$ny = $dy * $strokeWidth / $dist;
				
				$offset = new mxPoint($nx / 2, $ny / 2);
			}

			// Applies offset to the point			
			if ($offset != null)
			{
				$pe = $pe->copy();
				$pe->x += $offset->x;
				$pe->y += $offset->y;
				
				$offset = null;
			}

			// Draws the line segments
			$pt = $p0;
			
		 	for ($i = 1; $i < $len - 1; $i++)
		 	{
		 		$tmp = $pts[$i];
		 		$this->drawLine($pt->x, $pt->y, $tmp->x, $tmp->y, $stroke, $dashed);
		 		$pt = $tmp;
			}
			
			$this->drawLine($pt->x, $pt->y, $pe->x, $pe->y, $stroke, $dashed);
			
			if (isset($this->image))
			{
				imagesetthickness($this->image, 1);
			}
		}
	}
	
	/**
	 * Function: drawLabel
	 * 
	 * Draws the given label.
	 */
	function drawLabel($label, $x, $y, $w, $h, $style, $isHtml=false)
	{
		$this->drawText($label, $x, $y, $w, $h, $style);
	}
	
	/**
	 * Function: drawMarker
	 * 
	 * Draws the specified marker.
	 */
	function drawMarker($type, $p0, $pe, $size, $stroke)
	{
		$offset = null;

		// Computes the norm and the inverse norm
		$dx = $pe->x - $p0->x;
		$dy = $pe->y - $p0->y;

		$dist = max(1, sqrt($dx*$dx+$dy*$dy));
		$absSize = $size * $this->scale;
		$nx = $dx * $absSize / $dist;
		$ny = $dy * $absSize / $dist;
		
		$pe = $pe->copy();
		$pe->x -= $nx / (2 * $size);
		$pe->y -= $ny / (2 * $size);

		if ($type == mxConstants::$ARROW_CLASSIC ||
			$type == mxConstants::$ARROW_BLOCK)
		{
			$poly = array($pe->x, $pe->y,
				$pe->x - $nx - $ny / 2,
				$pe->y - $ny + $nx / 2);

			if ($type == mxConstants::$ARROW_CLASSIC)
			{
				array_push($poly, $pe->x - $nx * 3 / 4, $pe->y - $ny * 3 / 4);
			}
			
			array_push($poly, $pe->x + $ny / 2 - $nx, $pe->y - $ny - $nx / 2);
			$this->drawPolygon($poly, $stroke, $stroke, false);
			
			$offset = new mxPoint(-$nx * 3 / 4, -$ny * 3 / 4);
		}
		else if ($type == mxConstants::$ARROW_OPEN)
		{
			$nx *= 1.2;
			$ny *= 1.2;
			
			$this->drawLine($pe->x - $nx -  $ny / 2, $pe->y - $ny + $nx / 2,
				$pe->x - $nx / 6, $pe->y - $ny / 6, $stroke);
			$this->drawLine($pe->x - $nx / 6, $pe->y - $ny / 6,
				$pe->x + $ny / 2 - $nx, $pe->y - $ny - $nx / 2, $stroke);

			$offset = new mxPoint(-$nx / 4, -$ny / 4);
		}
		else if ($type == mxConstants::$ARROW_OVAL)
		{
			$nx *= 1.2;
			$ny *= 1.2;
			$absSize *= 1.2;
			
			$tmp = $absSize / 2;
			$x = $pe->x - $nx / 2 - $tmp;
			$y = $pe->y - $ny / 2 - $tmp;
			
			$this->drawOval($x, $y, $absSize, $absSize, $stroke, $stroke, false);
			
			$offset = new mxPoint(-$nx / 2, -$ny / 2);
		}
		else if ($type == mxConstants::$ARROW_DIAMOND)
		{
			$nx *= 1.2;
			$ny *= 1.2;
			
			$poly = array($pe->x + $nx / 2, $pe->y + $ny / 2,
				$pe->x - $ny / 2, $pe->y + $nx / 2,
				$pe->x - $nx / 2, $pe->y - $ny / 2,
				$pe->x + $ny, $pe->y - $nx / 2);
			$this->drawPolygon($poly, $stroke, $stroke, false);
		}
		
		return $offset;
	}

	/**
	 * Function: getImage
	 *
	 * Returns an image that represents this canvas.
	 */
	function getImage()
	{
		return $this->image;
	}

	/**
	 * Function: setImage
	 *
	 * Sets the image that represents the canvas.
	 */
	function setImage($img)
	{
		$this->image = $img;
	}

	/**
	 * Function: getImageForStyle
	 *
	 * Returns an image that represents this canvas.
	 */
	function getImageForStyle($style)
	{
		$filename = mxUtils::getValue($style, mxConstants::$STYLE_IMAGE, "");

		if ($filename != null && strpos($filename, "/") > 0)
		{
			$filename = $this->imageBasePath.$filename;
		}

		return $filename;
	}
	
	/**
	 * Function: drawLine
	 *
	 * Draws the given line.
	 */
	function drawLine($x0, $y0, $x1, $y1, $stroke=null, $dashed=false)
	{
		$stroke = $this->getColor($stroke, "black");
		
		if ($dashed)
		{
			// ImageDashedLine only works for vertical lines and
			// ImageSetStyle doesnt work with antialiasing.
			if ($this->antialias &&
				function_exists("imageantialias"))
			{
				imageantialias($this->image, false);
	 		}
	 		
			$st = array($stroke, $stroke, $stroke, $stroke,
				IMG_COLOR_TRANSPARENT, IMG_COLOR_TRANSPARENT,
				IMG_COLOR_TRANSPARENT, IMG_COLOR_TRANSPARENT);
			imageSetStyle($this->image, $st);
			imageLine($this->image, $x0, $y0, $x1, $y1, IMG_COLOR_STYLED);

			if ($this->antialias &&
				function_exists("imageantialias"))
			{
				imageantialias($this->image, true);
	 		}
		}
		else
		{
			imageLine($this->image, $x0, $y0, $x1, $y1, $stroke);
		}
	}
	
	/**
	 * Function: drawShape
	 *
	 * Draws the given shape.
	 */
	function drawShape($shape, $x, $y, $w, $h, $fill=null, $stroke=null, $style=null)
	{
		$shadow = mxUtils::getValue($style, mxConstants::$STYLE_SHADOW);

 		if ($shape == mxConstants::$SHAPE_IMAGE)
 		{
			$image = $this->getImageForStyle($style);
			
			if ($image != null)
			{
				$this->drawImage($x, $y, $w, $h, $image);
			}
		}
		else if ($shape == mxConstants::$SHAPE_ELLIPSE)
 		{
 			$this->drawOval($x, $y, $w, $h, $fill, $stroke, $shadow);
 		}
 		else if ($shape == mxConstants::$SHAPE_LINE)
 		{
			$direction = mxUtils::getValue($style, mxConstants::$STYLE_DIRECTION, mxConstants::$STYLE_EAST);
 			
            if ($direction == mxConstants::$STYLE_EAST ||
            	$direction == mxConstants::$STYLE_WEST)
            {
                $mid = $y + $h / 2;
                $this->drawLine($x, $mid, $x + $w, $mid, $stroke);
            }
            else
            {
                $mid = $x + $w / 2;
                $this->drawLine($mid, $y, $mid, $y + $h, $stroke);
            }
 			
 		}
 		else if ($shape == mxConstants::$SHAPE_DOUBLE_ELLIPSE)
 		{
 			$this->drawOval($x, $y, $w, $h, $fill, $stroke, $shadow);
 			
 			$inset = (3 + 1) * $this->scale;
 			$x += $inset;
 			$y += $inset;
 			$w -= 2 * $inset;
 			$h -= 2 * $inset;
 			$this->drawOval($x, $y, $w, $h, null, $stroke, false);
 		}
 		else if ($shape == mxConstants::$SHAPE_RHOMBUS)
 		{
			$this->drawRhombus($x, $y, $w, $h, $fill, $stroke, $shadow);
 		}
 		else if ($shape == mxConstants::$SHAPE_TRIANGLE)
 		{
			$dir = mxUtils::getValue($style, mxConstants::$STYLE_DIRECTION);
			$this->drawTriangle($x, $y, $w, $h, $fill, $stroke, $shadow, $dir);
 		}
 		else if ($shape == mxConstants::$SHAPE_HEXAGON)
 		{
			$dir = mxUtils::getValue($style, mxConstants::$STYLE_DIRECTION);
			$this->drawHexagon($x, $y, $w, $h, $fill, $stroke, $shadow, $dir);
 		}
 		else if ($shape == mxConstants::$SHAPE_CYLINDER)
 		{
		 	$this->drawCylinder($x, $y, $w, $h, $fill, $stroke, $shadow);
 		}
 		else if ($shape == mxConstants::$SHAPE_CLOUD)
 		{
		 	$this->drawCloud($x, $y, $w, $h, $fill, $stroke, $shadow);
 		}
 		else if ($shape == mxConstants::$SHAPE_ACTOR)
 		{
		 	$this->drawActor($x, $y, $w, $h, $fill, $stroke, $shadow);
 		}
 		else
 		{
			$round = mxUtils::getValue($style, mxConstants::$STYLE_ROUNDED);
 			$this->drawRect($x, $y, $w, $h, $fill, $stroke, $shadow, $round);
 			
 			if ($shape == mxConstants::$SHAPE_LABEL)
 			{
				$image = $this->getImageForStyle($style);
				
				if ($image != null)
				{
	 				$imgAlign = mxUtils::getValue($style, mxConstants::$STYLE_IMAGE_ALIGN);
	 				$imgValign = mxUtils::getValue($style, mxConstants::$STYLE_IMAGE_VERTICAL_ALIGN);
	 				$imgWidth = mxUtils::getNumber($style, mxConstants::$STYLE_IMAGE_WIDTH,
	 					mxConstants::$DEFAULT_IMAGESIZE) * $this->scale;
	 				$imgHeight = mxUtils::getNumber($style, mxConstants::$STYLE_IMAGE_HEIGHT,
	 					mxConstants::$DEFAULT_IMAGESIZE) * $this->scale;
	 				$spacing = mxUtils::getNumber($style, mxConstants::$STYLE_SPACING, 2) * $this->scale;
	 				
	 				$imgX = $x;
	 				
	 				if ($imgAlign == mxConstants::$ALIGN_LEFT)
	 				{
	 					$imgX += $spacing;
	 				}
	 				else if ($imgAlign == mxConstants::$ALIGN_RIGHT)
	 				{
	 					$imgX += $w - $imgWidth - $spacing;
	 				}
	 				else // CENTER
	 				{
	 					$imgX += ($w - $imgWidth) / 2;
	 				}
	 				
	 				$imgY = $y;
	 				
	 				if ($imgValign == mxConstants::$ALIGN_TOP)
	 				{
	 					$imgY += $spacing;
	 				}
	 				else if ($imgValign == mxConstants::$ALIGN_BOTTOM)
	 				{
	 					$imgY += $h - $imgHeight - $spacing;
	 				}
	 				else // MIDDLE
	 				{
	 					$imgY += ($h - $imgHeight) / 2;
	 				}
	
					$this->drawImage($imgX, $imgY, $imgWidth, $imgHeight, $image);
				} 				
 			}
		}
	}

	/**
	 * Function: drawPolygon
	 *
	 * Draws the given polygon.
	 */
	function drawPolygon($points, $fill=null, $stroke=null, $shadow=false)
	{
		if (isset($this->image))
		{
		 	if ($fill != null)
		 	{
		 		$n = sizeof($points) / 2;
		 		
				if ($shadow)
				{
					imageFilledPolygon($this->image, $this->offset($points),
						$n, $this->shadowColor);	
				}
				
			 	$fill = $this->getColor($fill);
				imageFilledPolygon($this->image, $points, $n, $fill);
			}
			
		 	if ($stroke != null)
		 	{
			 	$stroke = $this->getColor($stroke);
				imagePolygon($this->image, $points, $n, $stroke);
			}
		}
	}
	
	/**
	 * Function: drawRect
	 *
	 * Draws then given rectangle. Rounded is currently ignored.
	 */
	function drawRect($x, $y, $w, $h, $fill=null, $stroke=null, $shadow=false, $rounded=false)
	{
		// TODO: Rounded rectangles
	 	if ($fill != null)
	 	{
			if ($shadow)
			{
				imageFilledRectangle($this->image,
					$x + mxConstants::$SHADOW_OFFSETX ,
					$y + mxConstants::$SHADOW_OFFSETY,
					$x + mxConstants::$SHADOW_OFFSETX + $w,
					$y + mxConstants::$SHADOW_OFFSETX + $h,
					$this->shadowColor);
			}
			
		 	$fill = $this->getColor($fill);
			imageFilledRectangle($this->image, $x, $y, $x+$w, $y+$h, $fill);
		}
		
	 	if ($stroke != null)
	 	{
		 	$stroke = $this->getColor($stroke);
			imageRectangle($this->image, $x, $y, $x+$w, $y+$h, $stroke);
		}
	}
	
	/**
	 * Function: drawOval
	 *
	 * Draws then given ellipse.
	 */
	function drawOval($x, $y, $w, $h, $fill=null, $stroke=null, $shadow=false)
	{
	 	if ($fill != null)
	 	{
			if ($shadow)
			{
				imageFilledEllipse($this->image,
					$x + $w / 2 + mxConstants::$SHADOW_OFFSETX,
					$y + $h / 2 + mxConstants::$SHADOW_OFFSETY,
					$w, $h, $this->shadowColor);	
			}
			
		 	$fill = $this->getColor($fill);
			imageFilledEllipse($this->image, $x + $w / 2, $y + $h / 2,
				$w, $h, $fill);
		}
		
	 	if ($stroke != null)
	 	{
		 	$stroke = $this->getColor($stroke);
			imageEllipse($this->image, $x + $w / 2, $y + $h / 2,
				$w, $h, $stroke);
		}
	}

	/**
	 * Function: drawRhombus
	 *
	 * Draws then given rhombus.
	 */
	function drawRhombus($x, $y, $w, $h, $fill=null, $stroke=null, $shadow=false)
	{
		$halfWidth = $x + $w / 2;
		$halfHeight = $y + $h / 2;

		$points = array($halfWidth, $y, $x + $w, $halfHeight,
			$halfWidth, $y + $h, $x, $halfHeight, $halfWidth, $y);
			
		$this->drawPolygon($points, $fill, $stroke, $shadow);
	}
	
	/**
	 * Function: drawTriangle
	 *
	 * Draws then given triangle.
	 */
	function drawTriangle($x, $y, $w, $h, $fill=null, $stroke=null, $shadow=false, $direction=null)
	{
		if ($direction == mxConstants::$DIRECTION_NORTH)
		{
			$points = array($x, $y + $h, $x + $w / 2, $y,
				$x + $w, $y + $h, $x, $y + $h);
		}
		else if ($direction == mxConstants::$DIRECTION_SOUTH)
		{
			$points = array($x, $y, $x + $w / 2, $y + $h,
				$x + $w, $y, $x, $y);
		}
		else if ($direction == mxConstants::$DIRECTION_WEST)
		{
			$points = array($x + $w, $y, $x, $y + $h / 2,
				$x + $w, $y + $h, $x + $w, $y);
		}
		else // east
		{
			$points = array($x, $y, $x + $w, $y + $h / 2,
				$x, $y + $h, $x, $y);
		}
		
		$this->drawPolygon($points, $fill, $stroke, $shadow);
	}
		
	/**
	 * Function: drawHexagon
	 *
	 * Draws then given haxagon.
	 */
	function drawHexagon($x, $y, $w, $h, $fill=null, $stroke=null, $shadow=false, $direction=null)
	{
		if ($direction == mxConstants::$DIRECTION_NORTH ||
			$direction == mxConstants::$DIRECTION_SOUTH)
		{
			$points = array($x + 0.5 * $w, $y, $x + $w, $y + 0.25 * $h,
				$x + $w, $y + 0.75 * $h, $x + 0.5 * $w, $y + $h,
				$x, $y + 0.75 * $h, $x, $y + 0.25 * $h);
		}
		else
		{
			$points = array($x + 0.25 * $w, $y, $x + 0.75 * $w, $y,
				$x + $w, $y + 0.5 * $h, $x + 0.75 * $w, $y + $h,
				$x + 0.25 * $w, $y + $h, $x, $y + 0.5 * $h);
		}
		
		$this->drawPolygon($points, $fill, $stroke, $shadow);
	}
	
	/**
	 * Function: drawCylinder
	 *
	 * Draws then given cylinder.
	 */
	function drawCylinder($x, $y, $w, $h, $fill=null, $stroke=null, $shadow=false)
	{
		$h4 = $h / 4;
	 	$h8 = $h4 / 2;

	 	if ($fill != null)
	 	{
	 		$this->drawOval($x, $y, $w, $h4, $fill, null, $shadow);
	 		$this->drawRect($x, $y + $h8, $w, $h - $h4, $fill, null, $shadow);
	 		$this->drawOval($x, $y + $h - $h4, $w, $h4, $fill, null, $shadow);
		}
		
	 	if ($stroke != null)
	 	{
	 		$this->drawOval($x, $y, $w, $h4, null, $stroke, false);
	 		$this->drawLine($x, $y + $h8, $x, $y + $h - $h8, $stroke);
	 		$this->drawLine($x + $w, $y + $h8, $x + $w, $y + $h - $h8, $stroke);
	 		$this->drawOval($x, $y + $h - $h4, $w, $h4, null, $stroke, false);
		}

		// Hides lower arc for filled cylinder
	 	if ($stroke != null &&
	 		$fill != null)
	 	{
	 		$this->drawRect($x + 1, $y + $h - $h4, $w - 2, $h8, $fill, null, false);
		}
	}
	
	/**
	 * Function: drawCloud
	 *
	 * Draws then given cloud.
	 */
	function drawCloud($x, $y, $w, $h, $fill=null, $stroke=null, $shadow=false)
	{
		if ($fill != null)
	 	{
			if ($shadow)
			{
				$dx = mxConstants::$SHADOW_OFFSETX;
				$dy = mxConstants::$SHADOW_OFFSETY;
				
				imageFilledEllipse($this->image, $x + 0.2 * $w + $dx, $y + 0.42 * $h + $dy, 0.3 * $w, 0.29 * $h, $this->shadowColor);
				imageFilledEllipse($this->image, $x + 0.4 * $w + $dx, $y + 0.25 * $h + $dy, 0.4 * $w, 0.4 * $h, $this->shadowColor);
				imageFilledEllipse($this->image, $x + 0.75 * $w + $dx, $y + 0.35 * $h + $dy, 0.5 * $w, 0.4 * $h, $this->shadowColor);
				imageFilledEllipse($this->image, $x + 0.2 * $w + $dx, $y + 0.65 * $h + $dy, 0.3 * $w, 0.3 * $h, $this->shadowColor);
				imageFilledEllipse($this->image, $x + 0.55 * $w + $dx, $y + 0.62 * $h + $dy, 0.6 * $w, 0.6 * $h, $this->shadowColor);
				imageFilledEllipse($this->image, $x + 0.88 * $w + $dx, $y + 0.63 * $h + $dy, 0.3 * $w, 0.3 * $h, $this->shadowColor);
			}

			$fill = $this->getColor($fill);
			imageFilledEllipse($this->image, $x + 0.2 * $w, $y + 0.42 * $h, 0.3 * $w, 0.29 * $h, $fill);
			imageFilledEllipse($this->image, $x + 0.4 * $w, $y + 0.25 * $h, 0.4 * $w, 0.4 * $h, $fill);
			imageFilledEllipse($this->image, $x + 0.75 * $w, $y + 0.35 * $h, 0.5 * $w, 0.4 * $h, $fill);
			imageFilledEllipse($this->image, $x + 0.2 * $w, $y + 0.65 * $h, 0.3 * $w, 0.3 * $h, $fill);
			imageFilledEllipse($this->image, $x + 0.55 * $w, $y + 0.62 * $h, 0.6 * $w, 0.6 * $h, $fill);
			imageFilledEllipse($this->image, $x + 0.88 * $w, $y + 0.63 * $h, 0.3 * $w, 0.3 * $h, $fill);
		}

	 	if ($stroke != null)
	 	{
			$stroke = $this->getColor($stroke);
			imageArc($this->image, $x + 0.2 * $w, $y + 0.42 * $h, 0.3 * $w, 0.29 * $h, 125, 270, $stroke);
			imageArc($this->image, $x + 0.4 * $w, $y + 0.25 * $h, 0.4 * $w, 0.4 * $h, 170, 345, $stroke);
			imageArc($this->image, $x + 0.75 * $w, $y + 0.35 * $h, 0.5 * $w, 0.4 * $h, 230, 55, $stroke);
			imageArc($this->image, $x + 0.2 * $w, $y + 0.65 * $h, 0.3 * $w, 0.3 * $h, 50, 235, $stroke);
			imageArc($this->image, $x + 0.55 * $w, $y + 0.62 * $h, 0.6 * $w, 0.6 * $h, 33, 145, $stroke);
			imageArc($this->image, $x + 0.88 * $w, $y + 0.63 * $h, 0.3 * $w, 0.3 * $h, 290, 120, $stroke);
		}
	}
		
	/**
	 * Function: drawActor
	 *
	 * Draws then given cloud.
	 */
	function drawActor($x, $y, $w, $h, $fill=null, $stroke=null, $shadow=false)
	{
		if ($fill != null)
	 	{
			if ($shadow)
			{
				$dx = mxConstants::$SHADOW_OFFSETX;
				$dy = mxConstants::$SHADOW_OFFSETY;
					
				imageFilledEllipse($this->image, $x + 0.5 * $w + $dx, $y + 0.2 * $h + $dy, 0.4 * $w, 0.4 * $h, $this->shadowColor);
				imageFilledEllipse($this->image, $x + 0.2 * $w + $dx, $y + 0.6 * $h + $dy, 0.4 * $w, 0.4 * $h, $this->shadowColor);
				imageFilledEllipse($this->image, $x + 0.8 * $w + $dx, $y + 0.6 * $h + $dy, 0.4 * $w, 0.4 * $h, $this->shadowColor);
				imageFilledRectangle($this->image, $x + 0.2 * $w + $dx, $y + 0.4 * $h + $dy, $x + 0.8 * $w + $dx, $y + 0.6 * $h + $dy, $this->shadowColor);
				imageFilledRectangle($this->image, $x + $dx, $y + 0.6 * $h + $dy, $x + $w + $dx, $y + $h + $dy, $this->shadowColor);
			}

			$fill = $this->getColor($fill);
			imageFilledEllipse($this->image, $x + 0.5 * $w, $y + 0.2 * $h, 0.4 * $w, 0.4 * $h, $fill);
			imageFilledEllipse($this->image, $x + 0.2 * $w, $y + 0.6 * $h, 0.4 * $w, 0.4 * $h, $fill);
			imageFilledEllipse($this->image, $x + 0.8 * $w, $y + 0.6 * $h, 0.4 * $w, 0.4 * $h, $fill);
			imageFilledRectangle($this->image, $x + 0.2 * $w, $y + 0.4 * $h, $x + 0.8 * $w, $y + 0.6 * $h, $fill);
			imageFilledRectangle($this->image, $x, $y + 0.6 * $h, $x + $w, $y + $h, $fill);
		}

	 	if ($stroke != null)
	 	{
			$stroke = $this->getColor($stroke);
			imageEllipse($this->image, $x + 0.5 * $w, $y + 0.2 * $h, 0.4 * $w, 0.4 * $h, $stroke);
			imageLine($this->image, $x + 0.2 * $w, $y + 0.4 * $h, $x + 0.8 * $w, $y + 0.4 * $h, $stroke);
			imageArc($this->image, $x + 0.2 * $w, $y + 0.6 * $h, 0.4 * $w, 0.4 * $h, 180, 270, $stroke);
			imageArc($this->image, $x + 0.8 * $w, $y + 0.6 * $h, 0.4 * $w, 0.4 * $h, 270, 360, $stroke);
			imageLine($this->image, $x, $y + 0.6 * $h, $x, $y + $h, $stroke);
			imageLine($this->image, $x, $y + $h, $x + $w, $y + $h, $stroke);
			imageLine($this->image, $x + $w, $y + $h, $x + $w, $y + 0.6 * $h, $stroke);
		}
	}
	
	/**
	 * Function: drawImage
	 *
	 * Draws a given image.
	 */
	function drawImage($x, $y, $w, $h, $image)
	{
		$img = $this->loadImage($image);

		if ($img != null)
		{
			imageCopyResized($this->image, $img, $x, $y, 0, 0,
				$w, $h, imagesx($img), imagesy($img));
		}
	}

	/**
	 * Function: drawText
	 */
	function drawText($string, $x, $y, $w, $h, $style)
	{
		if ($string != null &&
			strlen($string) > 0)
		{
			// Draws the label background and border
			$bg = mxUtils::getValue($style,
				mxConstants::$STYLE_LABEL_BACKGROUNDCOLOR);
			$border = mxUtils::getValue($style,
				mxConstants::$STYLE_LABEL_BORDERCOLOR);
	
			if ($bg != null ||
				$border != null)
			{			
				$bounds->width += 2;
				$bounds->x -= 2;
				$bounds->y -= 1;
	
				$this->drawRect($x, $y, $w, $h, $bg, $border, false);
			}

			// Draws the label string			
			if ($this->enableTtf &&
				function_exists("imagettftext"))
			{
				$this->drawTtfText($string, $x, $y, $w, $h, $style);
			}
			else
			{
				$this->drawFixedText($string, $x, $y, $w, $h, $style);
			}
		}
	}
	
	/**
	 * Function: getTrueTypeFont
	 * 
	 * Returns the truetype font to be used to draw the text with the given style.
	 */
	 function getTrueTypeFont($style)
	 {
	 	return mxUtils::getTrueTypeFont($style);
	 }
	
	/**
	 * Function: getTrueTypeFontSize
	 * 
	 * Returns the truetype font size to be used to draw the text with the
	 * given style. This returns the fontSize in the style of the default
	 * fontsize multiplied with <ttfSizeFactor>.
	 */
	 function getTrueTypeFontSize($style)
	 {
	 	return mxUtils::getTrueTypeFontSize(
	 		mxUtils::getValue($style, mxConstants::$STYLE_FONTSIZE,
			mxConstants::$DEFAULT_FONTSIZE) * $this->scale);
	 }

	/**
	 * Function: drawTtfString
	 */
	function drawTtfText($string, $x, $y, $w, $h, $style)
	{
		$lines = explode("\n", $string);
		$lineCount = sizeof($lines);
		
		if ($lineCount > 0)
		{
			// Gets the orientation and alignment
			$horizontal = mxUtils::getValue($style, mxConstants::$STYLE_HORIZONTAL, true);
			$align = mxUtils::getValue($style, mxConstants::$STYLE_ALIGN, mxConstants::$ALIGN_CENTER);

			if ($align == mxConstants::$ALIGN_LEFT)
			{
				if ($horizontal)
				{
					$x += mxConstants::$LABEL_INSET;
				}
				else
				{
					$y -= mxConstants::$LABEL_INSET;
				}
			}
			else if ($align == mxConstants::$ALIGN_RIGHT)
			{
				if ($horizontal)
				{
					$x -= mxConstants::$LABEL_INSET;
				}
				else
				{
					$y += mxConstants::$LABEL_INSET;
				}
			}

			// Gets the font
			$fontSize = $this->getTrueTypeFontSize($style);
			$font = $this->getTrueTypeFont($style);

			// Gets the color
			$fontColor = mxUtils::getValue($style, mxConstants::$STYLE_FONTCOLOR);
	 		$color = $this->getColor($fontColor, "black");
	 		
	 		$dy = ((($horizontal) ? $h : $w) - 2 * mxConstants::$LABEL_INSET) / $lineCount;

			if ($horizontal)
			{
	 			$y += 0.8 * $dy + mxConstants::$LABEL_INSET;				
			}
			else
			{
				$y += $h;
				$x += $dy;
			}

			// Draws the text line by line
			for ($i = 0; $i < $lineCount; $i++)
			{
				$left = $x;
				$top = $y;
				$tmp = imagettfbbox($fontSize, 0, $font, $lines[$i]);
				$lineWidth = $tmp[2] - $tmp[0];
	
				if ($align == mxConstants::$ALIGN_CENTER)
				{
					if ($horizontal)
					{
						$left += ($w - $lineWidth) / 2;
					}
					else
					{
						$top -= ($h - $lineWidth) / 2;
					}
				}
				else if ($align == mxConstants::$ALIGN_RIGHT)
				{
					if ($horizontal)
					{
						$left += $w - $lineWidth;
					}
					else
					{
						$top -= $h - $lineWidth;
					}
				}
				
				$this->drawTtfTextLine($lines[$i], $left, $top, $w, $h,
					$color, $fontSize, $font, ($horizontal) ? 0 : 90);
					
				if ($horizontal)
				{
					$y += $dy;
				}
				else
				{
					$x += $dy;
				}
			}
		}
	}
	
	/**
	 * Function: drawTtxTextLine
	 *
	 * Draws a single line of the given true type font text. The w and h are
	 * the width and height of the complete text box that contains this line.
	 */
	function drawTtfTextLine($line, $x, $y, $w, $h, $color, $fontSize, $font, $rot)
	{
		imagettftext($this->image, $fontSize, $rot, $x, $y, $color, $font, $line);
	}
	
	/**
	 * Function: getFixedFontSize
	 * 
	 * Returns the fixed font size for GD (1 t0 5) for the given font properties
	 */
	function getFixedFontSize($fontSize, $fontFamily, $fontStyle=null)
	{
		return mxUtils::getFixedFontSize($fontSize, $fontFamily);
	}
	
	/**
	 * Function: drawString
	 */
	function drawFixedText($string, $x, $y, $w, $h, $style)
	{
		$lines = explode("\n", $string);
		$lineCount = sizeof($lines);
		
		if ($lineCount > 0)
		{
			// Gets the orientation and alignment
			$horizontal = mxUtils::getValue($style, mxConstants::$STYLE_HORIZONTAL, true);
			$align = mxUtils::getValue($style, mxConstants::$STYLE_ALIGN, mxConstants::$ALIGN_CENTER);

			if ($align == mxConstants::$ALIGN_LEFT)
			{
				if ($horizontal)
				{
					$x += mxConstants::$LABEL_INSET;
				}
				else
				{
					$y -= mxConstants::$LABEL_INSET;
				}
			}
			else if ($align == mxConstants::$ALIGN_RIGHT)
			{
				if ($horizontal)
				{
					$x -= mxConstants::$LABEL_INSET;
				}
				else
				{
					$y += mxConstants::$LABEL_INSET;
				}
			}

			if ($horizontal)
			{
	 			$y += 2 * mxConstants::$LABEL_INSET;				
			}
			else
			{
				$y += $h;
				$x += 2 * mxConstants::$LABEL_INSET;
			}

			// Gets the font
			$fontSize = mxUtils::getValue($style, mxConstants::$STYLE_FONTSIZE,
				mxConstants::$DEFAULT_FONTSIZE) * $this->scale;
			$fontFamily = mxUtils::getValue($style, mxConstants::$STYLE_FONTFAMILY,
				mxConstants::$DEFAULT_FONTFAMILY);
			$font = $this->getFixedFontSize($fontSize, $fontFamily);

			// Gets the color
			$fontColor = mxUtils::getValue($style, mxConstants::$STYLE_FONTCOLOR);
	 		$color = $this->getColor($fontColor, "black");
	 		
	 		$dx = imageFontWidth($font);
	 		$dy = ((($horizontal) ? $h : $w) - 2 * mxConstants::$LABEL_INSET) / $lineCount;

			// Draws the text line by line
			for ($i = 0; $i < $lineCount; $i++)
			{
				$left = $x;
				$top = $y;
				$lineWidth = strlen($lines[$i]) * $dx;
	
				if ($align == mxConstants::$ALIGN_CENTER)
				{
					if ($horizontal)
					{
						$left += ($w - $lineWidth) / 2;
					}
					else
					{
						$top -= ($h - $lineWidth) / 2;
					}
				}
				else if ($align == mxConstants::$ALIGN_RIGHT)
				{
					if ($horizontal)
					{
						$left += $w - $lineWidth;
					}
					else
					{
						$top -= $h - $lineWidth;
					}
				}

				$this->drawFixedTextLine($lines[$i], $font,
						$left, $top, $color, $horizontal);
				
				if ($horizontal)
				{
					$y += $dy;
				}
				else
				{
					$x += $dy;
				}
			}
		}
	}
	
	/**
	 * Function: drawFixedTextLine
	 *
	 * Draws the given fixed text line.
	 */
	function drawFixedTextLine($text, $font, $left, $top, $color, $horizontal = true)
	{
		if ($horizontal)
		{
			imageString($this->image, $font, $left, $top,
				$text, $color);
		}
		else
		{
			imageStringUp($this->image, $font, $left, $top,
				$text, $color);
		}
	}

	/**
	 * Function: getColor
	 *
	 * Allocates the given color and returns a reference to it. Supported
	 * color names are black, red, green, blue, orange, yellow, pink,
	 * turqoise, white, gray and any hex codes between 000000 and FFFFFF.
	 */
	function getColor($hex, $default=null)
	{
		if ($hex == null)
		{
			$hex = $default;
		}
		
		$result = null;
		$hex = strtolower($hex);
		
		if ($hex == "black")
		{
			$result = imageColorAllocate($this->image, 0, 0, 0);
		}
		else if ($hex == "red")
		{
			$result = imageColorAllocate($this->image, 255, 0, 0);
		}
		else if ($hex == "green")
		{
			$result = imageColorAllocate($this->image, 0, 255, 0);
		}
		else if ($hex == "blue")
		{
			$result = imageColorAllocate($this->image, 0, 0, 255);
		}
		else if ($hex == "orange")
		{
			$result = imageColorAllocate($this->image, 255, 128, 64);
		}
		else if ($hex == "yellow")
		{
			$result = imageColorAllocate($this->image, 255, 255, 0);
		}
		else if ($hex == "pink")
		{
			$result = imageColorAllocate($this->image, 255, 0, 255);
		}
		else if ($hex == "turqoise")
		{
			$result = imageColorAllocate($this->image, 0, 255, 255);
		}
		else if ($hex == "white")
		{
			$result = imageColorAllocate($this->image, 255, 255, 255);
		}
		else if ($hex == "gray")
		{
			$result = imageColorAllocate($this->image, 128, 128, 128);
		}
		else if ($hex == "none")
		{
			$result = null;
		}
		else
		{
	       	$rgb = array_map("hexdec", explode("|",
	       		wordwrap(substr($hex, 1), 2, "|", 1)));
			$result = imageColorAllocate($this->image,
				$rgb[0], $rgb[1], $rgb[2]);
		}

	 	return $result;
	}
	
	/**
	 * Function: offset
	 *
	 * Creates a new array of x, y sequences where the each coordinate is
	 * translated by dx and dy, respectively.
	 */
	function offset($points, $dx=null, $dy=null)
	{
		$result = array();
		
		if ($points != null)
		{
			if ($dx == null)
			{
				$dx = mxConstants::$SHADOW_OFFSETX;
			}
			
			if ($dy == null)
			{
				$dy = mxConstants::$SHADOW_OFFSETY;
			}
			
			for ($i = 0; $i < sizeof($points) - 1; $i = $i + 2)
			{
				array_push($result, $points[$i] + $dx);
				array_push($result, $points[$i + 1] + $dy);
			}
		}
		
		return $result;
	}
	
	/**
	 * Destructor: destroy
	 *
	 * Destroys all allocated resources.
	 */
	function destroy()
	{
		imageDestroy($this->image);
	}
	
	/**
	 * Function: drawGraph
	 * 
	 * Draws the given graph using this canvas.
	 */
	public static function drawGraph($graph, $clip=null, $background=null)
	{
	 	if ($clip == null)
	 	{
	 		$clip = $graph->getGraphBounds();
	 	}
	 	
	 	// TODO: Support custom origin in mxGdCanvas
	 	// $x = round($clip->x);
	 	// $y = round($clip->y);
	 	// $width = round($clip->width - $x + $clip->x) + 1;
	 	// $height = round($clip->height - $y + $clip->y) + 1;
	 	$width = round($clip->width + $clip->x) + 1;
	 	$height = round($clip->width + $clip->x) + 1;
	 	
	 	$canvas =& new mxGdCanvas($width, $height,
	 		$graph->view->scale, $background);
	 	
	 	$graph->draw($canvas, $graph->model->getRoot());
	 	$image = $canvas->getImage();
	 	//TODO: $canvas->destroy();
	 	
	 	return $image;
	}

}
?>
