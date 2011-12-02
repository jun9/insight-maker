/*
    Chart Legend with no additional features; some methods are refactored
    for better flexibility.
    
    This class contains almost 100% Sencha code so I am not releasing it
    but providing it as an example under the same terms as Ext JS itself.
    Hmm. Not sure I can do this, even.
    
    This class is not intended to be used directly.
*/

Ext.define('Ext.ux.chart.Legend', {
    extend: 'Ext.chart.Legend',
    
    requires: [ 'Ext.ux.chart.LegendItem' ],
    
    /**
     * @private Create all the sprites for the legend
     */
    create: function() {
        var me = this;
        me.createBox();
        me.createItems();
        if (!me.created && me.isDisplayed()) {
            me.created = true;

            // Listen for changes to series titles to trigger regeneration of the legend
            me.chart.series.each(function(series) {
                series.on('titlechange', me.redraw, me);
            });
        }
    },
    
    /**
     * @private Redraws the Legend
     */
    redraw: function() {
        var me = this;
        
        me.create();
        me.updatePosition();
    },

    /**
     * @private Create the series markers and labels
     */
    createItems: function() {
        var me = this,
            chart = me.chart,
            items = me.items;

        //remove all legend items
        me.removeItems();
        
        // Create all the item labels
        chart.series.each(function(series, i) {
            if (series.showInLegend) {
                Ext.each([].concat(series.yField), function(field, j) {
                    items.push(me.createLegendItem(series, j));
                }, this);
            }
        }, me);
        
        me.alignItems();
    },
    
    /**
     * @private Removes all legend items.
     */
    removeItems: function() {
        var me = this,
            items = me.items,
            len = items ? items.length : 0;

        if (len) {
            for (var i = 0; i < len; i++) {
                items[i].destroy();
            }
        };
        
        //empty array
        items.length = [];
    },
    
    /**
     * @private
     * Positions all items within Legend box.
     */
    alignItems: function() {
        var me = this,
            items = me.items,
            padding = me.padding,
            spacingOffset = 2,
            vertical = me.isVertical,
            math = Math,
            mfloor = math.floor,
            mmax = math.max,
            dim;
        
        dim = me.updateItemDimensions();

        var maxWidth    = dim.maxWidth,
            maxHeight   = dim.maxHeight,
            totalWidth  = dim.totalWidth,
            totalHeight = dim.totalHeight,
            spacing     = dim.spacing;

        // Store the collected dimensions for later
        me.width = mfloor((vertical ? maxWidth : totalWidth) + padding * 2);
        if (vertical && items.length === 1) {
            spacingOffset = 1;
        }
        me.height = mfloor((vertical ? totalHeight - spacingOffset * spacing : maxHeight) + (padding * 2));
        me.itemHeight = maxHeight;
    },
    
    updateItemDimensions: function() {
        var me = this,
            items = me.items,
            padding = me.padding,
            itemSpacing = me.itemSpacing,
            maxWidth = 0,
            maxHeight = 0,
            totalWidth = 0,
            totalHeight = 0,
            vertical = me.isVertical,
            math = Math,
            mfloor = math.floor,
            mmax = math.max;

        // Collect item dimensions and position each one
        // properly in relation to the previous item
        Ext.each(me.items, function(item, i) {
            var bbox = item.getBBox();

            //always measure from x=0, since not all markers go all the way to the left
            var width = bbox.width,
                height = bbox.height;

            if (i === 0) {
                spacing = vertical ? padding + height / 2 : padding;
            }
            else {
                spacing = itemSpacing / (vertical ? 2 : 1);
            }
            // Set the item's position relative to the legend box
            item.x = mfloor(vertical ? padding : totalWidth + spacing);
            item.y = mfloor(vertical ? totalHeight + spacing : padding + height / 2);

            // Collect cumulative dimensions
            totalWidth += width + spacing;
            totalHeight += height + spacing;
            maxWidth = mmax(maxWidth, width);
            maxHeight = mmax(maxHeight, height);
        }, me);

        return {
            totalWidth:  totalWidth,
            totalHeight: totalHeight,
            maxWidth:    maxWidth,
            maxHeight:   maxHeight,
            spacing:     spacing
        };
    },
    
    /**
     * @private Calculates Legend position with respect to other Chart elements.
     */
    calcPosition: function() {
        var me = this,
            x, y,
            legendWidth = me.width,
            legendHeight = me.height,
            padding = me.padding,
            chart = me.chart,
            chartBBox = chart.chartBBox,
            insets = chart.insetPadding,
            chartWidth = chartBBox.width - (insets * 2),
            chartHeight = chartBBox.height - (insets * 2),
            chartX = chartBBox.x + insets,
            chartY = chartBBox.y + insets,
            surface = chart.surface,
            mfloor = Math.floor;

        // Find the position based on the dimensions
        switch(me.position) {
            case "left":
                x = insets;
                y = mfloor(chartY + chartHeight / 2 - legendHeight / 2);
                break;
            case "right":
                x = mfloor(surface.width - legendWidth) - insets;
                y = mfloor(chartY + chartHeight / 2 - legendHeight / 2);
                break;
            case "top":
                x = mfloor(chartX + chartWidth / 2 - legendWidth / 2);
                y = insets;
                break;
            case "bottom":
                x = mfloor(chartX + chartWidth / 2 - legendWidth / 2);
                y = mfloor(surface.height - legendHeight) - insets;
                break;
            default:
                x = mfloor(me.origX) + insets;
                y = mfloor(me.origY) + insets;
        }
        
        return { x: x, y: y };
    },
    
    /**
     * @private Update the position of all the legend's sprites to match its current x/y values
     */
    updatePosition: function() {
        var me = this;

        if (me.isDisplayed()) {
            // Find the position based on the dimensions
            var pos = me.calcPosition();
            
            me.x = pos.x;
            me.y = pos.y;

            // Update the position of each item
            Ext.each(me.items, function(item) {
                item.updatePosition();
            });
            // Update the position of the outer box
            me.boxSprite.setAttributes(me.getBBox(), true);
        }
    },
    
    /**
     * @private Creates single Legend Item
     */
    createLegendItem: function(series, yFieldIndex) {
        var me = this;
        
        return Ext.create('Ext.ux.chart.LegendItem', {
            legend: me,
            series: series,
            surface: me.chart.surface,
            yFieldIndex: yFieldIndex
        });
    }
});

//@ sourceURL=uxLegend.js