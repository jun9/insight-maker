/*

Copyright 2010 Give Team. All rights reserved.

Give Team is a non-profit organization dedicated to
using the internet to encourage giving and greater
understanding.

This file may distributed and/or modified under the
terms of the Insight Maker Public License.

Insight Maker and Give Team are trademarks.

*/

MainPanel = function(graph)
{	
	
    MainPanel.superclass.constructor.call(this,
	    {
     	   region:'center',
 	       border: false
	  	});
    
    this.on('resize', function()
        {
            graph.sizeDidChange();
        });
  };

Ext.extend(MainPanel, Ext.Panel);
