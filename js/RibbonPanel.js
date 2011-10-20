/*

Copyright 2010-2011 Give Team. All rights reserved.

Give Team is a non-profit organization dedicated to
using the internet to encourage giving and greater
understanding.

This file may distributed and/or modified under the
terms of the Insight Maker Public License.

Insight Maker and Give Team are trademarks.

*/

var scratchPadStatus ="";

function ribbonPanelItems() {
    var z = ribbonPanel.getDockedItems()[0];
    return z;
}

var config_columns;
if ((!is_editor) || is_embed) {
    config_columns = 1;
} else {
    config_columns = 2;
}
var sizeCombo;
var fontCombo;
RibbonPanel = function(graph, history, mainPanel, configPanel)
 {
    Ext.Ajax.timeout = 60000;

    var handlePrimToggle = function(item, pressed) {
        var topItems = ribbonPanelItems();

        if (item.id == "flow" && pressed) {
            topItems.getComponent('connect').getComponent('link').toggle(false);
        } else if (item.id == "link" && pressed) {
            topItems.getComponent('connect').getComponent('flow').toggle(false);
        }
        if (item.id == "stock" && pressed) {
            topItems.getComponent('valued').getComponent('variable').toggle(false);
            topItems.getComponent('valued').getComponent('text').toggle(false);
            topItems.getComponent('valued').getComponent('display').toggle(false);
            topItems.getComponent('valued').getComponent('converter').toggle(false);
            topItems.getComponent('valued').getComponent('picture').toggle(false);
        } else if (item.id == "variable" && pressed) {
            topItems.getComponent('valued').getComponent('stock').toggle(false);
            topItems.getComponent('valued').getComponent('text').toggle(false);
            topItems.getComponent('valued').getComponent('display').toggle(false);
            topItems.getComponent('valued').getComponent('converter').toggle(false);
            topItems.getComponent('valued').getComponent('picture').toggle(false);
        } else if (item.id == "text" && pressed) {
            topItems.getComponent('valued').getComponent('stock').toggle(false);
            topItems.getComponent('valued').getComponent('variable').toggle(false);
            topItems.getComponent('valued').getComponent('display').toggle(false);
            topItems.getComponent('valued').getComponent('converter').toggle(false);
            topItems.getComponent('valued').getComponent('picture').toggle(false);
        } else if (item.id == "display" && pressed) {
            topItems.getComponent('valued').getComponent('stock').toggle(false);
            topItems.getComponent('valued').getComponent('variable').toggle(false);
            topItems.getComponent('valued').getComponent('text').toggle(false);
            topItems.getComponent('valued').getComponent('converter').toggle(false);
            topItems.getComponent('valued').getComponent('picture').toggle(false);
        } else if (item.id == "converter" && pressed) {
            topItems.getComponent('valued').getComponent('stock').toggle(false);
            topItems.getComponent('valued').getComponent('variable').toggle(false);
            topItems.getComponent('valued').getComponent('text').toggle(false);
            topItems.getComponent('valued').getComponent('display').toggle(false);
            topItems.getComponent('valued').getComponent('picture').toggle(false);
        } else if (item.id == "picture" && pressed) {
            topItems.getComponent('valued').getComponent('stock').toggle(false);
            topItems.getComponent('valued').getComponent('variable').toggle(false);
            topItems.getComponent('valued').getComponent('text').toggle(false);
            topItems.getComponent('valued').getComponent('display').toggle(false);
            topItems.getComponent('valued').getComponent('converter').toggle(false);
        }
        handelCursors();
        setConnectability();
        graph.setConnectable(connectionType() != "None");
    }

    var executeLayout = function(layout, animate, ignoreChildCount)
    {
        var cell = graph.getSelectionCell();

        if (cell == null ||
        (!ignoreChildCount &&
        graph.getModel().getChildCount(cell) == 0))
        {
            cell = graph.getDefaultParent();
        }

        graph.getModel().beginUpdate();
        try
        {
            layout.execute(cell);
        }
        catch(e)
        {
            throw e;
        }
        finally
        {
            // Animates the changes in the graph model except
            // for Camino, where animation is too slow
            if (animate && navigator.userAgent.indexOf('Camino') < 0)
            {
                // New API for animating graph layout results asynchronously
                var morph = new mxMorphing(graph);
                morph.addListener(mxEvent.DONE,
                function()
                {
                    graph.getModel().endUpdate();
                });

                morph.startAnimation();
            }
            else
            {
                graph.getModel().endUpdate();
            }
        }

    };
    var runHandler = function()
    {
        if (!hasDisplay()) {
            Ext.MessageBox.show({
                title: 'No Display',
                msg: 'You must add at least one Display to your insight in order to show you the results.',
                buttons: Ext.MessageBox.OK,
                animEl: 'mb9',
                icon: Ext.MessageBox.ERROR
            });
        } else {
            Ext.MessageBox.show({
                msg: 'Simulation Running...',
                width: 300,
                wait: true,
                waitConfig: {
                    interval: 300
                },
                icon: 'run-icon',
                animEl: 'mb7'
            });
            var myCode = getGraphXml(graph);


            Ext.Ajax.request({
                url: '/builder/run.php',
                method: 'POST',
                params: {
                    code: myCode
                },

                success: function(result, request) {
                    parseResult(result.responseText);
                },
                failure: function(result, request) {
                    Ext.MessageBox.hide();
                    Ext.MessageBox.show({
                        title: 'Simulation Error',
                        msg: 'The simulation could not be completed. Perhaps the server is not running. Please try again in a few minutes.',
                        buttons: Ext.MessageBox.OK,
                        animEl: 'mb9',
                        icon: Ext.MessageBox.ERROR
                    });
                }
            });
        }
    };

    var fillColorMenu = Ext.create("Ext.menu.ColorPicker",
    {
        allowReselect: true,
        handler: function(cm, color)
        {
            if (typeof(color) == "string")
            {

                graph.getModel().beginUpdate();
                graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, '#' + color);
                graph.setCellStyles(mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, '#' + color);

                if (graph.isSelectionEmpty()) {
                    getSetting().setAttribute("BackgroundColor", '#' + color);
                    loadBackgroundColor();
                }

                graph.getModel().endUpdate();
            }
        }
    });
    fillColorMenu.add("-");
    fillColorMenu.add({
        text: 'Transparent',
        handler: function()
        {

            graph.getModel().beginUpdate();
            graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, mxConstants.NONE);
            graph.setCellStyles(mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, mxConstants.NONE);
            if (graph.isSelectionEmpty()) {

                getSetting().setAttribute("BackgroundColor", 'white');
                loadBackgroundColor();

            }

            graph.getModel().endUpdate();
        }
    });
    var fontColorMenu = new Ext.menu.ColorPicker(
    {
        allowReselect: true,
        handler: function(cm, color)
        {
            if (typeof(color) == "string")
            {
                graph.setCellStyles(mxConstants.STYLE_FONTCOLOR, '#' + color);
            }
        }
    });

    var lineColorMenu = new Ext.menu.ColorPicker(
    {
        allowReselect: true,
        handler: function(cm, color)
        {
            if (typeof(color) == "string")
            {
                graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, '#' + color);
            }
        }
    });
    lineColorMenu.add("-");
    lineColorMenu.add({
        text: 'Transparent',
        handler: function()
        {
            graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, mxConstants.NONE);
        }
    });

    var fonts = Ext.create('Ext.data.Store', {
        fields: [{
            type: 'string',
            name: 'label'
        },
        {
            type: 'string',
            name: 'font'
        }],
        data: [{
            label: 'Comic',
            font: 'Comic Sans MS'
        },
        {
            label: 'Helvetica',
            font: 'Helvetica'
        },
        {
            label: 'Verdana',
            font: 'Verdana'
        },
        {
            label: 'Times New Roman',
            font: 'Times New Roman'
        },
        {
            label: 'Garamond',
            font: 'Garamond'
        },
        {
            label: 'Courier New',
            font: 'Courier New'
        }]
    });

    fontCombo = new Ext.form.ComboBox(
    {
        store: fonts,
        displayField: 'label',
        valueField: 'font',
        queryMode: 'local',
        width: 120,
        colspan: 3,
        triggerAction: 'all',
        emptyText: 'Select a font...',
        selectOnFocus: true,
        listeners: {
            select: function(p, entry)
            {
                if (entry != null)
                {
                    graph.setCellStyles(mxConstants.STYLE_FONTFAMILY, p.getValue());
                }
            }
        }
    });

    // Handles typing a font name and pressing enter
    fontCombo.on('specialkey',
    function(field, evt)
    {
        if (evt.keyCode == 10 ||
        evt.keyCode == 13)
        {
            var family = field.getValue();

            if (family != null &&
            family.length > 0)
            {
                graph.setCellStyles(mxConstants.STYLE_FONTFAMILY, family);
                this.setValue(family);
            }
        }
    });

    // Defines the font size menu
    var sizes = Ext.create('Ext.data.Store', {
        fields: [{
            type: 'string',
            name: 'label'
        },
        {
            type: 'float',
            name: 'size'
        }],
        data: [{
            label: '6pt',
            size: 6
        },
        {
            label: '8pt',
            size: 8
        },
        {
            label: '9pt',
            size: 9
        },
        {
            label: '10pt',
            size: 10
        },
        {
            label: '12pt',
            size: 12
        },
        {
            label: '14pt',
            size: 14
        },
        {
            label: '18pt',
            size: 18
        },
        {
            label: '24pt',
            size: 24
        },
        {
            label: '30pt',
            size: 30
        },
        {
            label: '36pt',
            size: 36
        },
        {
            label: '48pt',
            size: 48
        },
        {
            label: '60pt',
            size: 60
        }]
    });

    sizeCombo = new Ext.form.ComboBox(
    {
        colspan: 2,
        store: sizes,
        displayField: 'label',
        valueField: 'size',
        queryMode: 'local',
        width: 50,
        triggerAction: 'all',
        emptyText: '12pt',
        selectOnFocus: true,
        listeners: {
            select: function(p, entry)
            {
                if (entry != null)
                {
                    graph.setCellStyles(mxConstants.STYLE_FONTSIZE, p.getValue());
                }
            }
        }
    });

    // Handles typing a font size and pressing enter
    sizeCombo.on('specialkey',
    function(field, evt)
    {
        if (evt.keyCode == 10 ||
        evt.keyCode == 13)
        {
            var size = parseInt(field.getValue());

            if (!isNaN(size) &&
            size > 0)
            {
                this.setValue(size);
                graph.setCellStyles(mxConstants.STYLE_FONTSIZE, size);
            }
        }
    });

    var zoomMenu = {
        items: [

        {
            text: '400%',
            scope: this,
            handler: function(item)
            {
                graph.getView().setScale(4);
            }
        },
        {
            text: '200%',
            scope: this,
            handler: function(item)
            {
                graph.getView().setScale(2);
            }
        },
        {
            text: '150%',
            scope: this,
            handler: function(item)
            {
                graph.getView().setScale(1.5);
            }
        },
        {
            text: '100%',
            scope: this,
            handler: function(item)
            {
                graph.getView().setScale(1);
            }
        },
        {
            text: '75%',
            scope: this,
            handler: function(item)
            {
                graph.getView().setScale(0.75);
            }
        },
        {
            text: '50%',
            scope: this,
            handler: function(item)
            {
                graph.getView().setScale(0.5);
            }
        },
        {
            text: '25%',
            scope: this,
            handler: function(item)
            {
                graph.getView().setScale(0.25);
            }
        },
        '-',
        {
            text: 'Zoom In',
            iconCls: 'zoomin-icon',
            scope: this,
            handler: function(item)
            {
                graph.zoomIn();
            }
        },
        {
            text: 'Zoom Out',
            iconCls: 'zoomout-icon',
            scope: this,
            handler: function(item)
            {
                graph.zoomOut();
            }
        },
        '-',
        {
            text: 'Actual Size',
            iconCls: 'zoomactual-icon',
            scope: this,
            handler: function(item)
            {
                graph.zoomActual();
            }
        },
        {
            text: 'Fit Window',
            iconCls: 'fit-icon',
            scope: this,
            handler: function(item)
            {
                graph.fit();
            }
        }]
    };
	if( (! is_embed) && is_editor){
		zoomMenu.items.push(
        '-',
        {
            text: 'Vertical Hierarchical Layout',
            scope: this,
            handler: function(item)
            {
                var layout = new mxHierarchicalLayout(graph);
                executeLayout(layout, true);
            }
        },
        {
            text: 'Horizontal Hierarchical Layout',
            scope: this,
            handler: function(item)
            {
                var layout = new mxHierarchicalLayout(graph,
                mxConstants.DIRECTION_WEST);
                executeLayout(layout, true);
            }
        },
        '-',
        {
            text: 'Organic Layout',
            scope: this,
            handler: function(item)
            {
                var layout = new mxFastOrganicLayout(graph);
                layout.forceConstant = 80;
                executeLayout(layout, true);
            }
        },
        {
            text: 'Circle Layout',
            scope: this,
            handler: function(item)
            {
                executeLayout(new mxCircleLayout(graph), true);
            }
        });
	}


    var configWin;


    return (
    {
        id: 'ribbonPanel',
        xtype: 'panel',
        layout: 'border',
        region: 'center',
        split: true,
        border: false,
        items: [mainPanel, configPanel],
        collapsible: false,
        tbar: new Ext.toolbar.Toolbar({
            enableOverflow: true,
            items: [

            {
                hidden: (!is_editor) || is_embed,
                xtype: 'buttongroup',
                columns: 4,
                height: 95,
                title: 'Add Primitives',
                id: 'valued',
                items: [{
                    iconAlign: 'top',
                    scale: 'large',
                    cls: 'x-btn-as-arrow',
                    rowspan: 3,
                    id: 'stock',
                    text: 'Stock',
                    iconCls: 'stock-icon',
                    tooltip: 'Create a new Stock by clicking on the canvas',
                    enableToggle: true,
                    toggleHandler: handlePrimToggle,
                    pressed: drupal_node_ID == -1,
                    scope: this
                },
                {
                    iconAlign: 'top',
                    scale: 'large',
                    cls: 'x-btn-as-arrow',
                    rowspan: 3,
                    id: 'variable',
                    text: 'Variable',
                    iconCls: 'parameter-icon',
                    tooltip: 'Create a new Variable by clicking on the canvas',
                    enableToggle: true,
                    toggleHandler: handlePrimToggle,
                    pressed: false,

                    scope: this
                }
                ,
                {
                    id: 'display',
                    text: 'Display',
                    iconCls: 'display-icon',
                    tooltip: 'Create a new chart or table Display by clicking on the canvas',
                    enableToggle: true,
                    toggleHandler: handlePrimToggle,
                    pressed: false,
                    scope: this
                },
                {
                    id: 'text',
                    text: 'Text',
                    iconCls: 'font-icon',
                    tooltip: 'Create a new Text Area by clicking on the canvas',
                    enableToggle: true,
                    toggleHandler: handlePrimToggle,
                    pressed: false,
                    scope: this
                },
                {
                    id: 'converter',
                    text: 'Converter',
                    iconCls: 'converter-icon',
                    tooltip: 'Create a new Converter by clicking on the canvas',
                    enableToggle: true,
                    toggleHandler: handlePrimToggle,
                    pressed: false,
                    scope: this
                },
                {
                    id: 'picture',
                    text: 'Picture',
                    iconCls: 'picture-icon',
                    tooltip: 'Create a new Picture by clicking on the canvas',
                    enableToggle: true,
                    toggleHandler: handlePrimToggle,
                    pressed: false,
                    scope: this
                },
                {
                    id: 'ghostBut',
                    text: 'Ghost',
                    iconCls: 'ghost-icon',
                    tooltip: 'Create a linked clone of the selected primitive which can help you organize your model',
                    scope: this,
                    handler: function()
                    {
                        var item = graph.getSelectionCell();
                        var parent = graph.getDefaultParent();

                        var vertex;
                        var style = item.getStyle();
                        style = mxUtils.setStyle(style, "opacity", 30);
                        graph.getModel().beginUpdate();

                        vertex = graph.insertVertex(parent, null, ghost.cloneNode(true), item.getGeometry().getCenterX() + 10, item.getGeometry().getCenterY() + 10, item.getGeometry().width, item.getGeometry().height, style);
                        vertex.setConnectable(item.isConnectable());
                        vertex.value.setAttribute("Source", item.id);
                        graph.setSelectionCell(vertex);
                        graph.getModel().endUpdate();

                    }
                },
                {
                    id: 'folder',
                    text: 'Folder',
                    iconCls: 'folder-icon',
                    tooltip: 'Creates a new Folder containing the selected primitives',
                    scope: this,
                    handler: function()
                    {
                        var group = graph.groupCells(null, 20);
                        graph.setSelectionCell(group);
                        graph.orderCells(true);
                    }
                }

                ]
            },
            {
                hidden: (!is_editor) || is_embed,
                xtype: 'buttongroup',
                columns: 1,
                height: 95,
                title: 'Connections',
                id: 'connect',
                items: [{
                    id: 'link',
                    text: 'Use Links',
                    iconCls: 'link-small-icon',
                    tooltip: 'Use Links to connect nodes',
                    enableToggle: true,
                    toggleHandler: handlePrimToggle,
                    pressed: false,

                    scope: this
                },
                {
                    id: 'flow',
                    text: 'Use Flows',
                    iconCls: 'flow-small-icon',
                    tooltip: 'Use Flows to connect nodes',
                    enableToggle: true,
                    toggleHandler: handlePrimToggle,
                    pressed: drupal_node_ID == -1,

                    scope: this
                },
                {
                    id: 'reverse',
                    text: 'Reverse',
                    iconCls: 'reverse-icon',
                    tooltip: 'Reverse connection direction',
                    handler: function()
                    {
                        graph.getModel().beginUpdate();

                        var myCells = graph.getSelectionCells();
                        if (myCells != null) {
                            for (var i = 0; i < myCells.length; i++)
                            {
                                if (myCells[i].isEdge()) {
                                    var geo = myCells[i].getGeometry();

                                    var tmp = myCells[i].source;
                                    var edit = new mxTerminalChange(graph.getModel(), myCells[i], myCells[i].target, true);
                                    graph.getModel().execute(edit);
                                    edit = new mxTerminalChange(graph.getModel(), myCells[i], tmp, false);
                                    graph.getModel().execute(edit);

                                    tmp = geo.sourcePoint;
                                    geo.sourcePoint = geo.targetPoint;
                                    geo.targetPoint = tmp;
                                    if (geo.points != null) {
                                        geo.points.reverse();
                                    }
                                    edit = new mxGeometryChange(graph.getModel(), myCells[i], geo);
                                    graph.getModel().execute(edit);
                                }
                            }
                        }
                        graph.getModel().endUpdate();


                    },
                    scope: this
                }

                ]
            },
            {
                hidden: (!is_editor) || is_embed,
                xtype: 'buttongroup',
                columns: 2,
                height: 95,
                title: 'Actions',
                id: 'actions',
                items: [

                {
                    id: 'undo',
                    text: 'Undo',
                    iconCls: 'undo-icon',
                    tooltip: 'Undo',
                    handler: function()
                    {
                        history.undo();
                    },
                    scope: this
                },
                {
                    id: 'redo',
                    text: 'Redo',
                    iconCls: 'redo-icon',
                    tooltip: 'Redo',
                    handler: function()
                    {
                        history.redo();
                    },
                    scope: this
                },
                {
                    id: 'copy',
                    text: 'Copy',
                    iconCls: 'copy-icon',
                    tooltip: 'Copy',
                    handler: function()
                    {
                        mxClipboard.copy(graph);
                    },
                    scope: this
                },
                {
                    id: 'cut',
                    text: 'Cut',
                    iconCls: 'cut-icon',
                    tooltip: 'Cut',
                    handler: function()
                    {
                        mxClipboard.cut(graph);
                    },
                    scope: this
                },
                {
                    text: 'Paste',
                    iconCls: 'paste-icon',
                    tooltip: 'Paste',
                    id: 'paste',
                    handler: function()
                    {
                        mxClipboard.paste(graph);
                    },
                    scope: this
                },
                {
                    id: 'delete',
                    text: 'Delete',
                    iconCls: 'delete-icon',
                    tooltip: 'Delete',
                    handler: function()
                    {
                        graph.removeCells(graph.getSelectionCells(), false);
                    },
                    scope: this
                }]
            },
            {
                hidden: (!is_editor) || is_embed,
                xtype: 'buttongroup',
                columns: 5,
                height: 95,
                title: 'Style',
                id: 'style',
                items: [

                fontCombo,

                sizeCombo,

                {
                    id: 'fontcolor',
                    text: '',
                    tooltip: 'Font Color',
                    iconCls: 'fontcolor-icon',
                    menu: fontColorMenu
                },
                {
                    id: 'linecolor',
                    text: '',
                    tooltip: 'Line Color',
                    iconCls: 'linecolor-icon',
                    menu: lineColorMenu
                },
                {
                    id: 'fillcolor',
                    text: '',
                    colspan: 1,
                    tooltip: 'Fill Color',
                    iconCls: 'fillcolor-icon',
                    menu: fillColorMenu
                },
                {
                    id: 'moveback',
                    text: '',
                    tooltip: 'Move to Back',
                    iconCls: 'back-icon',
                    handler: function()
                    {
                        graph.orderCells(true);
                    },
                    scope: this
                },
                {
                    id: 'movefront',
                    text: '',
                    tooltip: 'Move to Front',
                    iconCls: 'front-icon',
                    handler: function()
                    {
                        graph.orderCells(false);
                    },
                    scope: this
                },
                {
                    id: 'bold',
                    text: '',
                    iconCls: 'bold-icon',
                    tooltip: 'Bold',
                    handler: function()
                    {
                        graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, mxConstants.FONT_BOLD);
                        setStyles();
                    },
                    scope: this
                },
                {
                    id: 'italic',
                    text: '',
                    tooltip: 'Italic',
                    iconCls: 'italic-icon',
                    handler: function()
                    {
                        graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, mxConstants.FONT_ITALIC);
                        setStyles();
                    },
                    scope: this
                },
                {
                    id: 'underline',
                    text: '',
                    enableToggle: true,
                    tooltip: 'Underline',
                    iconCls: 'underline-icon',
                    handler: function()
                    {
                        graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, mxConstants.FONT_UNDERLINE);
                        setStyles();
                    },
                    scope: this
                },
                {
                    id: 'align',
                    text: '',
                    iconCls: 'left-icon',
                    tooltip: 'Text Alignment',
                    handler: function() {},
                    menu:
                    {
                        id: 'reading-menu',
                        cls: 'reading-menu',
                        items: [
                        {
                            text: 'Left',
                            checked: false,
                            group: 'rp-group',
                            scope: this,
                            iconCls: 'left-icon',
                            handler: function()
                            {
                                graph.setCellStyles(mxConstants.STYLE_ALIGN, mxConstants.ALIGN_LEFT);
                            }
                        },
                        {
                            text: 'Center',
                            checked: true,
                            group: 'rp-group',
                            scope: this,
                            iconCls: 'center-icon',
                            handler: function()
                            {
                                graph.setCellStyles(mxConstants.STYLE_ALIGN, mxConstants.ALIGN_CENTER);
                            }
                        },
                        {
                            text: 'Right',
                            checked: false,
                            group: 'rp-group',
                            scope: this,
                            iconCls: 'right-icon',
                            handler: function()
                            {
                                graph.setCellStyles(mxConstants.STYLE_ALIGN, mxConstants.ALIGN_RIGHT);
                            }
                        },
                        '-',
                        {
                            text: 'Top',
                            checked: false,
                            group: 'vrp-group',
                            scope: this,
                            iconCls: 'top-icon',
                            handler: function()
                            {
                                graph.setCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_TOP);
                            }
                        },
                        {
                            text: 'Middle',
                            checked: true,
                            group: 'vrp-group',
                            scope: this,
                            iconCls: 'middle-icon',
                            handler: function()
                            {
                                graph.setCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE);
                            }
                        },
                        {
                            text: 'Bottom',
                            checked: false,
                            group: 'vrp-group',
                            scope: this,
                            iconCls: 'bottom-icon',
                            handler: function()
                            {
                                graph.setCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_BOTTOM);
                            }
                        }]
                    }
                },
                {
                    id: "zoomMenuButton",
                    text: '',
                    iconCls: 'zoom-icon',
                    handler: function() {},
                    menu: zoomMenu
                }
                ]
            },
            {
                hidden: (is_editor || is_embed),
                id: 'control-no-edit',
                xtype: 'buttongroup',
                columns: 1,
                height: 95,
                title: 'Explore',
                items: [{
                    iconAlign: 'top',
                    scale: 'large',
                    cls: 'button',
                    rowspan: 3,
                    text: 'Zoom',
                    iconCls: 'zoom-large-icon',
                    tooltip: 'Zoom Diagram',
                    id: 'zoomlargebutgrouped',
                    handler: function(menu) {},
                    menu: zoomMenu
                }]
            },
            {

                hidden: (is_embed || (!is_editor)),
                xtype: 'buttongroup',
                columns: config_columns,
                height: 95,
                title: 'Tools',
                id: "configgroup",
                items: [
                {
                    iconAlign: 'top',
                    scale: 'large',
                    cls: 'x-btn-as-arrow',
                    rowspan: 3,
                    id: 'config',
                    text: 'Time Settings',
                    iconCls: 'clock-icon',
                    tooltip: 'Configure Insight Time Settings',
                    handler: function()
                    {
                        var setting = getSetting();
                        var solutionAlgorithms = Ext.create('Ext.data.Store', {
                            fields: [
                            'abbr', "name"],
                            data: [{
                                'abbr': 'RK1',
                                'name': 'Fast (Euler)'
                            },
                            {
                                'abbr': 'RK4',
                                'name': 'Accurate (RK4)'
                            }]
                        });

                        if (!configWin) {
                            configWin = new Ext.Window({
                                layout: 'fit',
                                modal: true,
                                width: 370,
                                title: "Simulation Time Settings",
                                height: 380,
                                resizable: false,
                                closeAction: 'hide',
                                plain: true,
                                items: [new Ext.FormPanel({
                                    fieldDefaults: {
                                        labelWidth: 150
                                    },
                                    frame: true,
                                    id: 'timeForm',

                                    bodyStyle: 'padding:5px 5px 0',
                                    width: 450,
                                    defaults: {
                                        width: 330
                                    },
                                    defaultType: 'textfield',

                                    items: [new Ext.form.NumberField({
                                        fieldLabel: 'Simulation Start',
                                        name: 'stimestart',
                                        id: 'stimestart',
                                        allowBlank: false,
                                        minValue: 0,
                                        decimalPrecision: 8
                                    }),
                                    new Ext.form.NumberField({
                                        fieldLabel: 'Simulation Length',
                                        name: 'stimelength',
                                        id: 'stimelength',
                                        allowBlank: false,
                                        minValue: 0,
                                        decimalPrecision: 8
                                    }),
                                    new Ext.form.NumberField({
                                        fieldLabel: 'Simulation Time Step',
                                        name: 'stimestep',
                                        id: 'stimestep',
                                        allowBlank: false,
                                        minValue: 0.00000001,
                                        step: .1,
                                        decimalPrecision: 8
                                    }),
                                    {
                                        xtype: 'radiogroup',
                                        id: "tunits",
                                        fieldLabel: 'Time Units',
                                        itemCls: 'x-check-group-alt',
                                        columns: 1,
                                        items: [
                                        {
                                            boxLabel: 'Seconds',
                                            name: 'tunits',
                                            inputValue: "Seconds"
                                        },
                                        {
                                            boxLabel: 'Minutes',
                                            name: 'tunits',
                                            inputValue: "Minutes"
                                        },
                                        {
                                            boxLabel: 'Hours',
                                            name: 'tunits',
                                            inputValue: "Hours"
                                        },
                                        {
                                            boxLabel: 'Days',
                                            name: 'tunits',
                                            inputValue: "Days"
                                        },
                                        {
                                            boxLabel: 'Weeks',
                                            name: 'tunits',
                                            inputValue: "Weeks"
                                        },
                                        {
                                            boxLabel: 'Months',
                                            name: 'tunits',
                                            inputValue: "Months"
                                        },
                                        {
                                            boxLabel: 'Years',
                                            name: 'tunits',
                                            inputValue: "Years"
                                        }
                                        ]
                                    },
                                    new Ext.form.ComboBox({
                                        fieldLabel: "Analysis Algorithm",
                                        typeAhead: true,
                                        triggerAction: 'all',
                                        queryMode: 'local',
                                        selectOnFocus: true,
                                        forceSelection: true,
                                        store: solutionAlgorithms,
                                        displayField: 'name',
                                        valueField: 'abbr',
                                        id: 'sSolutionAlgo',
                                        editable: false
                                    })
                                    ],

                                    buttons: [{
                                        scale: "large",
                                        iconCls: "cancel-icon",
                                        text: 'Cancel',
                                        handler: function() {
                                            configWin.hide();
                                        }
                                    },
                                    {
                                        iconCls: "apply-icon",
                                        scale: "large",
                                        text: 'Apply',
                                        handler: function() {
                                            graph.getModel().beginUpdate();

                                            var edit = new mxCellAttributeChange(
                                            setting, "SolutionAlgorithm",
                                            Ext.getCmp('sSolutionAlgo').getValue());
                                            graph.getModel().execute(edit);

                                            var edit = new mxCellAttributeChange(
                                            setting, "TimeLength",
                                            Ext.getCmp('stimelength').getValue());
                                            graph.getModel().execute(edit);

                                            edit = new mxCellAttributeChange(
                                            setting, "TimeStart",
                                            Ext.getCmp('stimestart').getValue());
                                            graph.getModel().execute(edit);

                                            edit = new mxCellAttributeChange(
                                            setting, "TimeStep",
                                            Ext.getCmp('stimestep').getValue());
                                            graph.getModel().execute(edit);


                                            edit = new mxCellAttributeChange(
                                            setting, "TimeUnits",
                                            Ext.getCmp('timeForm').getForm().getValues()['tunits']);
                                            graph.getModel().execute(edit);

                                            graph.getModel().endUpdate();

                                            configWin.hide();
                                        }
                                    }
                                    ]
                                })]

                            })

                        }
                        Ext.getCmp('stimestart').setValue(setting.getAttribute("TimeStart"));
                        Ext.getCmp('tunits').items.items[["Seconds", "Minutes", "Hours", "Days", "Weeks", "Months", "Years"].indexOf(setting.getAttribute("TimeUnits"))].setValue(true);
                        Ext.getCmp('stimelength').setValue(setting.getAttribute("TimeLength"));
                        Ext.getCmp('stimestep').setValue(setting.getAttribute("TimeStep"));
                        Ext.getCmp("sSolutionAlgo").setValue(setting.getAttribute("SolutionAlgorithm"));
                        configWin.show();
                    },
                    scope: this
                },
                {
                    hidden: (!is_editor) || is_embed,
                    id: 'download',
                    text: 'Download',
                    iconCls: 'download-icon',
                    tooltip: 'Download the Insight to Your Computer',
                    handler: function()
                    {
                        Ext.MessageBox.buttonText.yes = 'Download';
                        Ext.MessageBox.buttonText.no = 'Cancel';
                        Ext.Msg.show({
                            icon: Ext.MessageBox.INFO,
                            title: 'Download Insight',
                            msg: 'You may download your Insights for further analysis or backup purposes. Insights are saved in a text-based format. One software package that can edit and carry out advanced analysis on the downloaded Insights is <a href="http://simgua.com" target="_blank">Simgua</a>.',
                            buttons: Ext.MessageBox.YESNO,
                            fn: function(btn) {
                                if (btn == "yes") {
                                    downloadModel();
                                }
                            }
                        });
                    },
                    scope: this
                },

                {
                    id: 'embed_but',
                    text: 'Embed',
                    hidden: (!is_editor) || is_embed,
                    iconCls: 'embed-icon',
                    tooltip: 'Embed this Insight in Another Web Page',
                    handler: function()
                    {
                        if (drupal_node_ID == -1) {
                            Ext.MessageBox.show({
                                title: 'Save this Insight',
                                msg: 'You must save this Insight before you can embed it in another webpage.',
                                buttons: Ext.MessageBox.OK,
                                animEl: 'mb9',
                                icon: Ext.MessageBox.ERROR
                            });
                        } else {

                            Ext.MessageBox.show({
                                title: 'Embed',
                                msg: 'To embed this Insight in another webpage (such as a blog or a private site), copy and paste the following code into the source HTML code of your webpage:<br><br><center><textarea rows=3 cols=100>&lt;IFRAME SRC="http://InsightMaker.com/insight/' + drupal_node_ID + '/embed?topBar=1&sideBar=1&zoom=1" TITLE="Embedded Insight" width=600 height=420&gt;&lt;/IFRAME&gt;</textarea></center>',
                                buttons: Ext.MessageBox.OK,
                                animEl: 'mb9',
                                icon: Ext.MessageBox.INFO
                            });
                        }
                    },
                    scope: this
                },
				{
                    hidden: (!is_editor) || is_embed,
                    id: 'scratchpad',
                    text: 'Scratchpad',
                    iconCls: 'scratchpad-icon',
                    tooltip: 'Draw notes on your diagram',enableToggle:true,
                    handler: function()
                    {
						if(scratchPadStatus=="shown"){
							Ext.get("mainGraph").setDisplayed("none");
							scratchPadStatus="hidden";
						}else if(scratchPadStatus=="hidden"){
							Ext.get("mainGraph").setDisplayed("block");
							scratchPadStatus="shown";
						}else{
							Ext.get("mainGraph").setDisplayed("block");
							Scratchpad($('#mainGraph'));
							scratchPadStatus="shown";
						}
                    },
                    scope: this
                }


                ]
            },
            {
                hidden: (!is_embed),
                iconAlign: 'top',
                scale: 'large',
                cls: 'button',
                rowspan: 3,
                text: 'Zoom',
                iconCls: 'zoom-large-icon',
                tooltip: 'Zoom Diagram',
                id: 'zoomlargebut',
                handler: function(menu) {},
                menu: zoomMenu
            },
            '-', {
                hidden: ((!is_editor) || is_embed),
                id: 'savegroup',
                xtype: 'buttongroup',
                columns: 1,
                height: 95,
                title: 'Save',
                items: [{
                    hidden: (!is_editor) || is_embed,
                    iconAlign: 'top',
                    scale: 'large',
                    cls: 'x-btn-as-arrow',
                    rowspan: 3,
                    text: 'Save Insight',
                    iconCls: 'save-icon',
                    tooltip: 'Save Insight',
                    id: 'savebut',
                    handler: function()
                    {
                        if (graph_title == "") {
                            updateProperties();
                        } else {
                            sendGraphtoServer(graph);
                        }
                    },
                    scope: this
                }]
            },
            {
                hidden: (!is_embed),
                iconAlign: 'top',
                scale: 'large',
                cls: 'button',
                rowspan: 3,
                id: 'run_embed',
                text: 'Run Simulation',
                iconCls: 'run-icon',
                tooltip: 'Run',
                handler: runHandler,
                scope: this
            },
            {
                hidden: is_embed,
                xtype: 'buttongroup',
                columns: 1,
                title: 'Simulate',
                height: 95,
                items: [{
                    iconAlign: 'top',
                    scale: 'large',
                    cls: 'x-btn-as-arrow',
                    rowspan: 3,
                    id: 'run',
                    text: 'Run Simulation',
                    iconCls: 'run-icon',
                    tooltip: 'Run',
                    handler: runHandler,
                    scope: this
                }]
            },
            "->",
            new Ext.Component({
                autoEl: {
                    tag: 'a',
                    href: "http://InsightMaker.com",
                    target: "_BLANK",
                    children: {
                        tag: 'img',
                        src: '/builder/images/logo.png'
                    }
                }
            })
            ]
        })

    });
};
