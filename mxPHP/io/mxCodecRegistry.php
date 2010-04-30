<?php
/**
 * $Id: mxCodecRegistry.php,v 1.4 2010/01/02 09:45:15 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */
class mxCodecRegistry
{

	/**
	 * Class: mxCodecRegistry
	 *
	 * A class to register codecs for objects.
	 * 
	 * Variable: codecs
	 *
	 * Maps from constructor names to codecs.
	 */
	public static $codecs = array();

	/**
	 * Function: register
	 *
	 * Registers a new codec and associates the name of the template
	 * constructor in the codec with the codec object.
	 *
	 * Parameters:
	 *
	 * codec - <mxObjectCodec> to be registered.
	 */
	static function register($codec)
	{
		$name = mxCodecRegistry::getName($codec->template);
		mxCodecRegistry::$codecs[$name] = $codec;
	}

	/**
	 * Function: getCodec
	 *
	 * Returns a codec that handles objects that are constructed
	 * using the given ctor.
	 *
	 * Parameters:
	 *
	 * ctor - JavaScript constructor function. 
	 */
	static function getCodec($name)
	{
		$codec = null;
		
		if (isset($name))
		{
			$codec =& mxCodecRegistry::$codecs[$name];
				
			// Registers a new default codec for the given constructor
			// if no codec has been previously defined.
			if (!isset($codec))
			{
				try
				{
					$obj = mxCodecRegistry::getInstanceForName($name);
					
					if (isset($obj))
					{
						$codec = new mxObjectCodec($obj);
						mxCodecRegistry::register($codec);
					}
				}
				catch (Exception $e)
				{
					// ignore
				}
			}
		}
		
		return $codec;
	}

	/**
	 * Function: getInstanceForName
	 *
	 * Creates and returns a new instance for the given class name.
	 */
	static function getInstanceForName($name)
	{
		if (class_exists($name))
		{
			return new $name();
		}
		
		return null;
	}
	
	/**
	 * Function: getName
	 *
	 * Returns the codec name for the given object instance.
	 *
	 * Parameters:
	 *
	 * obj - PHP object to return the codec name for. 
	 */
	static function getName($obj)
	{
		if (is_array($obj))
		{
			return "Array";
		}

		return get_class($obj);
	}

}
?>
