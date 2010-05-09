/*

Copyright 2010 Give Team. All rights reserved.

Give Team is a non-profit organization dedicated to
using the internet to encourage giving and greater
understanding.

This file may distributed and/or modified under the
terms of the Insight Maker Public License which is
available in the LICENSE.TXT file of this directory.

Insight Maker and Give Team are trademarks.

*/

RibbonPanel = function(graph, history, mainPanel, configPanel)
 {
    Ext.Ajax.timeout = 60000;

    var handlePrimToggle = function(item, pressed) {

        if (item.id == "flow" && pressed) {
            ribbonPanel.getTopToolbar().items.get('connect').get('link').toggle(false);
        } else if (item.id == "link" && pressed) {
            ribbonPanel.getTopToolbar().items.get('connect').get('flow').toggle(false);
        }
        if (item.id == "stock" && pressed) {
            ribbonPanel.getTopToolbar().items.get('valued').get('parameter').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('text').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('display').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('converter').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('picture').toggle(false);
        } else if (item.id == "parameter" && pressed) {
            ribbonPanel.getTopToolbar().items.get('valued').get('stock').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('text').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('display').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('converter').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('picture').toggle(false);
        } else if (item.id == "text" && pressed) {
            ribbonPanel.getTopToolbar().items.get('valued').get('stock').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('parameter').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('display').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('converter').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('picture').toggle(false);
        } else if (item.id == "display" && pressed) {
            ribbonPanel.getTopToolbar().items.get('valued').get('stock').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('parameter').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('text').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('converter').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('picture').toggle(false);
        } else if (item.id == "converter" && pressed) {
            ribbonPanel.getTopToolbar().items.get('valued').get('stock').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('parameter').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('text').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('display').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('picture').toggle(false);
        } else if (item.id == "picture" && pressed) {
            ribbonPanel.getTopToolbar().items.get('valued').get('stock').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('parameter').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('text').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('display').toggle(false);
            ribbonPanel.getTopToolbar().items.get('valued').get('converter').toggle(false);
        }
        handelCursors();
        setConnectability();
        graph.setConnectable(connectionType() != "None");
    }

	var runHandler =function()
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
	                
    var fillColorMenu = new Ext.menu.ColorMenu(
    {	allowReselect:true,
        handler: function(cm, color)
        {
            if (typeof(color) == "string")
            {
                graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, '#' + color);
            }
        }
    });
    fillColorMenu.add("-");
    fillColorMenu.add({
        text: 'Transparent',
        handler: function()
        {
            graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, mxConstants.NONE);
        }
    });
    var fontColorMenu = new Ext.menu.ColorMenu(
    {	allowReselect:true,
        handler: function(cm, color)
        {
            if (typeof(color) == "string")
            {
                graph.setCellStyles(mxConstants.STYLE_FONTCOLOR, '#' + color);
            }
        }
    });

    var lineColorMenu = new Ext.menu.ColorMenu(
    {	allowReselect:true,
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

    var fonts = new Ext.data.SimpleStore(
    {
        fields: ['label', 'font'],
        data: [['Comic', 'Comic Sans MS'], ['Helvetica', 'Helvetica'], ['Verdana', 'Verdana'],
        ['Times New Roman', 'Times New Roman'], ['Garamond', 'Garamond'],
        ['Courier New', 'Courier New']]
    });

    var fontCombo = new Ext.form.ComboBox(
    {
        store: fonts,
        displayField: 'label',
        mode: 'local',
        width: 120,
        colspan: 3,
        triggerAction: 'all',
        emptyText: 'Select a font...',
        selectOnFocus: true,
        onSelect: function(entry)
        {
            if (entry != null)
            {
                graph.setCellStyles(mxConstants.STYLE_FONTFAMILY, entry.data.font);
                this.collapse();
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
            }
        }
    });

    // Defines the font size menu
    var sizes = new Ext.data.SimpleStore({
        fields: ['label', 'size'],
        data: [['6pt', 6], ['8pt', 8], ['9pt', 9], ['10pt', 10], ['12pt', 12],
        ['14pt', 14], ['18pt', 18], ['24pt', 24], ['30pt', 30], ['36pt', 36],
        ['48pt', 48], ['60pt', 60]]
    });

    var sizeCombo = new Ext.form.ComboBox(
    {
        colspan: 2,
        store: sizes,
        displayField: 'label',
        mode: 'local',
        width: 50,
        triggerAction: 'all',
        emptyText: '12pt',
        selectOnFocus: true,
        onSelect: function(entry)
        {
            if (entry != null)
            {
                graph.setCellStyles(mxConstants.STYLE_FONTSIZE, entry.data.size);
                this.collapse();
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
    

    var configWin;
    var unitsWin;
	

    RibbonPanel.superclass.constructor.call(this,
    {
        id: 'ribbonPanel',
        xtype: 'panel',
        margins: '24 5 5 5',
        layout: 'border',
        region: 'center',
        split: true,
        border: false,
        items: [mainPanel, configPanel],
        collapsible: false,
        tbar: [

        {
        	hidden: (! is_editor) || is_embed,
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
                text: 'Add Stock',
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
                id: 'parameter',
                text: 'Add Parameter',
                iconCls: 'parameter-icon',
                tooltip: 'Create a new Parameter by clicking on the canvas',
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
            },{
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
        	hidden: (! is_editor) || is_embed,
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
									if (geo.points != null){
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
        	hidden: (! is_editor) || is_embed,
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
        	hidden: (! is_editor) || is_embed,
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
                tooltip: 'Fontcolor',
                iconCls: 'fontcolor-icon',
                menu: fontColorMenu
            },
            {
                id: 'linecolor',
                text: '',
                tooltip: 'Linecolor',
                iconCls: 'linecolor-icon',
                menu: lineColorMenu
            },
            {
                id: 'fillcolor',
                text: '',
                colspan: 1,
                tooltip: 'Fillcolor',
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
                },
                scope: this
            },
            {
                id: 'underline',
                text: '',
                tooltip: 'Underline',
                iconCls: 'underline-icon',
                handler: function()
                {
                    graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, mxConstants.FONT_UNDERLINE);
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
                text: '',
                iconCls: 'zoom-icon',
                handler: function(menu) {},
                menu: zoomMenu  
            }
            ]
        },
        {
        	hidden: (! is_editor) || is_embed,
            xtype: 'buttongroup',
            columns: 2,
            height: 95,
            title: 'Configure',
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

                    if (!configWin) {
                        configWin = new Ext.Window({
                            applyTo: 'config-win',
                            layout: 'fit',
                            modal: true,
                            width: 430,
                            title: "Simulation Time Settings",
                            height: 340,
                            resizable: false,
                            closeAction: 'hide',
                            plain: true,
                            items: [new Ext.FormPanel({
                                labelWidth: 150,
                                frame: true,
                                id: 'timeForm',

                                bodyStyle: 'padding:5px 5px 0',
                                width: 450,
                                defaults: {
                                    width: 230
                                },
                                defaultType: 'textfield',

                                items: [new Ext.form.NumberField({
                                    fieldLabel: 'Simulation Start',
                                    name: 'stimestart',
                                    id: 'stimestart',
                                    allowBlank: false,
                                    allowNegative: false,
                                    decimalPrecision: 8
                                }),
                                new Ext.form.NumberField({
                                    fieldLabel: 'Simulation Length',
                                    name: 'stimelength',
                                    id: 'stimelength',
                                    allowBlank: false,
                                    allowNegative: false,
                                    decimalPrecision: 8
                                }),
                                new Ext.form.NumberField({
                                    fieldLabel: 'Simulation Time Step',
                                    name: 'stimestep',
                                    id: 'stimestep',
                                    allowBlank: false,
                                    allowNegative: false,
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
                                    },{
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
                                }
                                ],

                                buttons: [{
                                    text: 'Apply',
                                    handler: function() {
                                        graph.getModel().beginUpdate();

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
                                },
                                {
                                    text: 'Cancel',
                                    handler: function() {
                                        configWin.hide();
                                    }
                                }]
                            })]

                        })

                    }
                    Ext.getCmp('stimestart').setValue(setting.getAttribute("TimeStart"));
                    Ext.getCmp('tunits').setValue(setting.getAttribute("TimeUnits"));
                    Ext.getCmp('stimelength').setValue(setting.getAttribute("TimeLength"));
                    Ext.getCmp('stimestep').setValue(setting.getAttribute("TimeStep"));
                    configWin.show();
                },
                scope: this
            },
            {
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
                id: 'units_but',
                text: 'Custom Units',
                iconCls: 'units-icon',
                tooltip: 'Define custom Insight units',
                handler: function()
                {
                    var setting = getSetting();


                    var UnitSet = Ext.data.Record.create([{
                        name: 'name',
                        type: 'string'
                    },
                    {
                        name: 'synonym',
                        type: 'string'
                    },
                    {
                        name: 'scale',
                        type: 'float'
                    }]);

                    
                    var genData = function() {
                        var data = [];
                        var items = customUnits();
                        for (var i = 0; i < items.length; i++) {
                            var ent = items[i];
                            data.push({
                                name: ent[0],
                                scale: ent[1],
                                synonym: ent[2]
                            });

                        }
                        return data;
                    }


                    var store = new Ext.data.GroupingStore({
                        reader: new Ext.data.JsonReader({
                            fields: UnitSet
                        }),
                        data: genData(),
                        sortInfo: {
                            field: 'name',
                            direction: 'ASC'
                        }
                    });

                    var editor = new Ext.ux.grid.RowEditor({
                        saveText: 'Update'
                    });

                    var grid = new Ext.grid.GridPanel({
                        store: store,
                        width: 600,
                        region: 'center',
                        margins: '0 5 5 5',
                        autoExpandColumn: 'name',
                        plugins: [editor],
                        view: new Ext.grid.GroupingView({
                            markDirty: false
                        }),
                        tbar: [{
                            iconCls: 'units-add-icon',
                            text: 'Add Units',
                            handler: function() {
                                var e = new UnitSet({
                                    name: 'New Unit',
                                    synonym: '',
                                    scale: 1
                                });
                                editor.stopEditing();
                                store.insert(0, e);
                                grid.getView().refresh();
                                grid.getSelectionModel().selectRow(0);
                                editor.startEditing(0);
                            }
                        },
                        {
                            ref: '../removeBtn',
                            iconCls: 'units-remove-icon',
                            text: 'Remove Units',
                            disabled: true,
                            handler: function() {
                                editor.stopEditing();
                                var s = grid.getSelectionModel().getSelections();
                                for (var i = 0, r; r = s[i]; i++) {
                                    store.remove(r);
                                }
                            }
                        }],

                        columns: [
                        {
                            id: 'name',
                            header: 'Name',
                            dataIndex: 'name',
                            width: 250,
                            sortable: true,
                            editor: {
                                xtype: 'textfield',
                                allowBlank: false,
                                regex: /^[a-zA-Z][a-z A-Z]*$/,
                                regexText: "The unit name may only contain letters and spaces."
                            }
                        },
                        {
                            xtype: 'numbercolumn',
                            header: 'Scale',
                            dataIndex: 'scale',
                            width: 100,
                            sortable: false,
                            editor: {
                                xtype: 'numberfield',
                                allowBlank: false,
                                decimalPrecision: 10
                            }
                        },
                        {
                            header: 'Synonym',
                            dataIndex: 'synonym',
                            width: 200,
                            sortable: false,
                            editor: {
                                xtype: 'textfield',
                                allowBlank: true,
                                regex: /^([a-zA-Z][a-z A-Z]*(\^-?[\d\.]+)?,?)*$/,
                                regexText: "The unit synonym should be of the form: Meters,Seconds^2,Kilograms^-1."
                            }
                        }]
                    });

                    var saveUnits = function() {
                        var newUnits = "";

                        if (store.getCount() > 0) {
                            newUnits = store.getAt(0).get("name") + "<>" + store.getAt(0).get("scale") + "<>" + store.getAt(0).get("synonym");
                        }
                        for (var i = 1; i < store.getCount(); i++) {
                            newUnits = newUnits + "\n" + store.getAt(i).get("name") + "<>" + store.getAt(i).get("scale") + "<>" + store.getAt(i).get("synonym");
                        }

                        graph.getModel().beginUpdate();

                        var edit = new mxCellAttributeChange(
                        setting, "Units",
                        newUnits);
                        graph.getModel().execute(edit);
                        graph.getModel().endUpdate();

                        unitsWin.hide();
                    }


                    grid.getSelectionModel().on('selectionchange',
                    function(sm) {
                        grid.removeBtn.setDisabled(sm.getCount() < 1);
                    });

                    if (!unitsWin) {
                        unitsWin = new Ext.Window({
                            applyTo: 'units-win',
                            layout: 'fit',
                            modal: true,
                            width: 430,
                            title: "Configure Custom Units",
                            height: 330,
                            resizable: false,
                            closeAction: 'hide',
                            plain: true,
                            items: [grid
                            ],

                            buttons: [{
                                text: 'Apply',
                                handler: saveUnits
                            },
                            {
                                text: 'Cancel',
                                handler: function() {
                                    unitsWin.hide();
                                }
                            }]

                        })

                    }
                    unitsWin.show();
                },
                scope: this
            },
            {
                id: 'embed_but',
                text: 'Embed',
                iconCls: 'embed-icon',
                tooltip: 'Embed this Insight in another web page',
                handler: function()
                {
                	if(drupal_node_ID==-1){
               		    Ext.MessageBox.show({
                       title: 'Save this Insight',
                       msg: 'You must save this Insight before you can embed it in another webpage.',
                       buttons: Ext.MessageBox.OK,
                       animEl: 'mb9',
                       icon: Ext.MessageBox.ERROR
               		    });
                   }else{
                   	
                   	Ext.MessageBox.show({
                   	    title: 'Embed',
                   	    msg: 'To embed this Insight in another webpage (such as a blog or a private site), copy and paste the following code into the source HTML code of your webpage:<br><br><center><textarea rows=3 cols=70>&lt;IFRAME SRC="http://InsightMaker.com/insight/'+drupal_node_ID+'/embed" TITLE="Embedded Insight" width=600 height=420&gt;&lt;/IFRAME&gt;</textarea></center>',
                   	    buttons: Ext.MessageBox.OK,
                   	    animEl: 'mb9',
                   	    icon: Ext.MessageBox.INFO
                   	});
                   }
                },
                scope: this
            }
            

            ]
        },{
        	hidden: (! is_embed),
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
        },{
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
                id: 'zoomlargebut',
                handler: function(menu) {},
                menu: zoomMenu 
            }]
        },
        '-', {
        	hidden: (! is_editor) || is_embed,
            id: 'save',
            xtype: 'buttongroup',
            columns: 1,
            height: 95,
            title: 'Save',
            items: [{
            	hidden: (! is_editor) || is_embed,
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
        },{
        	hidden: (! is_embed),
            iconAlign: 'top',
            scale: 'large',
            cls: 'button',
            rowspan: 3,
            id: 'run',
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
            height: 95,
            title: 'Analyze',
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
        },"->",
        new Ext.BoxComponent({
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

    });
};

Ext.extend(RibbonPanel, Ext.Panel);