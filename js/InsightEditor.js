/*

Copyright 2010-2011 Give Team. All rights reserved.

Give Team is a non-profit organization dedicated to
using the internet to encourage giving and greater
understanding.

This file may distributed and/or modified under the
terms of the Insight Maker Public License.

Insight Maker and Give Team are trademarks.

*/

window.onerror = function (err, file, line) {
	alert("Javascript Error\n\n"+err+"\n\n("+file+" "+line+")\n\nIf this error persists, please contact us for support.");
	return true;
}

mxUtils.alert = function(message)
 {
    Ext.example.msg(message, '', '');
};


GraphEditor = {};
var mainPanel;
var ribbonPanel;
var configPanel
var sizeChanging;
var graph;
var ghost;
var sliders = [];
var settingCell;
function main()
 {
    Ext.QuickTips.init();


    mxEvent.disableContextMenu(document.body);

    mxConstants.DEFAULT_HOTSPOT = 0.3;


    graph = new mxGraph();

    var history = new mxUndoManager();
    var node = mxUtils.load('/builder/resources/default-style.xml').getDocumentElement();
    var dec = new mxCodec(node.ownerDocument);
    dec.decode(node, graph.getStylesheet());

    graph.alternateEdgeStyle = 'vertical';
    graph.connectableEdges = true;
    graph.disconnectOnMove = false;
    graph.edgeLabelsMovable = true;
    graph.enterStopsCellEditing = true;
    graph.allowLoops = false;


    mxEdgeHandler.prototype.addEnabled = true;
    mxEdgeHandler.prototype.removeEnabled = true;

    graph.isHtmlLabel = function(cell)
    {
        var isHTML = cell != null && cell.value != null && (cell.value.nodeName != "Folder" && cell.value.nodeName != "Flow" && cell.value.nodeName != "Display" && cell.value.nodeName != "Picture");

        return isHTML;
    };
    graph.isWrapping = graph.isHtmlLabel;

    graph.isCellLocked = function(cell) {
        return (!is_editor);
    }
    graph.isCellSelectable = function(cell) {
        return (cell.value.nodeName != "Setting");
        //(is_editor && (cell.value.nodeName!="Setting"));
    }
    graph.isCellEditable = function(cell) {
        return (cell.value.nodeName != "Setting" && cell.value.nodeName != "Ghost");
    }

    graph.convertValueToString = function(cell)
    {
        if (mxUtils.isNode(cell.value))
        {
            if (cell.value.nodeName == "Link" && orig(cell).getAttribute("name") == "Link") {
                return "";
            } else {
                return orig(cell).getAttribute("name");
            }
        }
        return '';
    };

    var cellLabelChanged = graph.cellLabelChanged;
    graph.labelChanged = function(cell, newValue, evt)
    {
        if ((!isPrimitive(cell)) || cell.value.nodeName == "Link" || cell.value.nodeName == "Folder" || validPrimitiveName(newValue)) {
            var edit = new mxCellAttributeChange(cell, "name", newValue);
            graph.getModel().execute(edit);
			selectionChanged(false);
            return cell;
        } else {
            mxUtils.alert("Primitive names must only contain numbers, letters and spaces; and they must start with a letter.");
        }
    };

    var getEditingValue = graph.getEditingValue;
    graph.getEditingValue = function(cell)
    {
        if (mxUtils.isNode(cell.value))
        {
            return cell.getAttribute('name');
        }
    };

    var doc = mxUtils.createXmlDocument();

    var textAreaThing = doc.createElement('Text');
    textAreaThing.setAttribute('name', 'Text Area');

    var folder = doc.createElement('Folder');
    folder.setAttribute('name', 'New Folder');
    folder.setAttribute('Note', '');

    ghost = doc.createElement('Ghost');
    ghost.setAttribute('Source', '');

    var picture = doc.createElement('Picture');
    picture.setAttribute('name', '');
    picture.setAttribute('Note', '');
    picture.setAttribute('Image', 'Positive Feedback Clockwise');
    picture.setAttribute('FlipHorizontal', false);
    picture.setAttribute('FlipVertical', false);

    var doc = mxUtils.createXmlDocument();
    var display = doc.createElement('Display');
    display.setAttribute('name', 'New Display');
    display.setAttribute('Note', '');
    display.setAttribute('Type', 'Time Series');
    display.setAttribute('xAxis', 'Time (%u)');
    display.setAttribute('yAxis', '%o');
    display.setAttribute('ThreeDimensional', false);
    display.setAttribute('Primitives', '');
    display.setAttribute('AutoAddPrimitives', false);
    display.setAttribute('ScatterplotOrder', 'X Primitive, Y Primitive');
	display.setAttribute('Image', 'Display');

    function setValuedProperties(cell) {
        cell.setAttribute('Units', "Unitless")
        cell.setAttribute('MaxConstraintUsed', false)
        cell.setAttribute('MinConstraintUsed', false)
        cell.setAttribute('MaxConstraint', '100');
        cell.setAttribute('MinConstraint', '0');
        cell.setAttribute('ShowSlider', false);
        cell.setAttribute('SliderMax', 100);
        cell.setAttribute('SliderMin', 0);
    }

    var stock = doc.createElement('Stock');
    stock.setAttribute('name', 'New Stock');
    stock.setAttribute('Note', '');
    stock.setAttribute('InitialValue', '0');
    stock.setAttribute('StockMode', 'Store');
    stock.setAttribute('Delay', '10');
    stock.setAttribute('Volume', '100');
    stock.setAttribute('NonNegative', false);
    setValuedProperties(stock);
	stock.setAttribute('Image', 'None');

    var variable = doc.createElement('Parameter');
    variable.setAttribute('name', 'New Variable');
    variable.setAttribute('Note', '');
    variable.setAttribute('Equation', '0');
    setValuedProperties(variable);
	variable.setAttribute('Image', 'None');
	
    var converter = doc.createElement('Converter');
    converter.setAttribute('name', 'New Converter');
    converter.setAttribute('Note', '');
    converter.setAttribute('Source', 'Time');
    converter.setAttribute('Data', '0,0;1,1;2,4;3,9');
    converter.setAttribute('Interpolation', 'Linear');
    setValuedProperties(converter);
	converter.setAttribute('Image', 'None');

    var flow = doc.createElement('Flow');
    flow.setAttribute('name', 'New Flow');
    flow.setAttribute('Note', '');
    flow.setAttribute('FlowRate', '0');
    flow.setAttribute('OnlyPositive', true);
    flow.setAttribute('TimeIndependent', false);
    setValuedProperties(flow);

    var link = doc.createElement('Link');
    link.setAttribute('name', 'Link');
    link.setAttribute('Note', '');
    link.setAttribute('BiDirectional', false);

    var setting = doc.createElement('Setting');
    setting.setAttribute('Note', '');
    setting.setAttribute('Version', '8');
    setting.setAttribute('TimeLength', '100');
    setting.setAttribute('TimeStart', '0');
    setting.setAttribute('TimeStep', '1');
    setting.setAttribute('TimeUnits', 'Years');
    setting.setAttribute('Units', "");
    setting.setAttribute("HiddenUIGroups", ["Validation", "User Interface"]);
    setting.setAttribute("SolutionAlgorithm", "RK1");
    setting.setAttribute("BackgroundColor", "white");

    mainPanel = Ext.create('Ext.Panel', {
        region: 'center',
        border: false
    });

    mainPanel.on('resize',
    function()
    {
        graph.sizeDidChange();
    });

    configPanel = Ext.create('Ext.Panel', ConfigPanel(graph, history));
    ribbonPanel = Ext.create('Ext.Panel', RibbonPanel(graph, history, mainPanel, configPanel));

    var viewport = new Ext.Viewport(
    {
        layout: 'border',
        padding: '19 5 5 5',
        items: [ribbonPanel]
    });


    var connectionChangeHandler = function(sender, evt) {
        var item = evt.getProperty("edge");
        if (item.value.nodeName == "Link") {
            linkBroken(item);
        }
    };
    graph.addListener(mxEvent.CELL_CONNECTED, connectionChangeHandler);

    mainPanel.body.dom.style.overflow = 'auto';
    if (mxClient.IS_MAC && mxClient.IS_SF)
    {
        graph.addListener(mxEvent.SIZE,
        function(graph)
        {
            graph.container.style.overflow = 'auto';
        });
    }


    graph.model.addListener(mxEvent.CHANGED,
    function(graph)
    {
        setSaveEnabled(true);
    });

    graph.model.addListener(mxEvent.CHANGE,
    function(sender, evt)
    {
        var changes = evt.getProperty('changes');

        if ((changes.length < 10) && changes.animate)
        {
            mxEffects.animateChanges(graph, changes);
        }
    });

    graph.addListener(mxEvent.CELLS_REMOVED,
    function(sender, evt)
    {
        var cells = evt.getProperty('cells');
        for (var i = 0; i < cells.length; i++) {
            deletePrimitive(cells[i]);
            if (cells[i].value.nodeName = "Folder") {
                var children = childrenCells(cells[i]);
                if (children != null) {
                    for (var j = 0; j < children.length; j++) {
                        deletePrimitive(children[j]);
                    }
                }
            }
        }
        selectionChanged(true);
    });

    graph.addListener(mxEvent.CLICK,
    function(sender, evt)
    {

        cell = evt.getProperty('cell');
        var realEvt = evt.getProperty('event');
        if (!evt.isConsumed()) {
            var panel = ribbonPanelItems().getComponent('valued');

            if ((cell == null || cell.value.nodeName=="Folder") && nodeInsertSelected()) {
                var pt = graph.getPointForEvent(realEvt);
                var parent;
				var x0,y0;
 				if(cell != null && cell.value.nodeName=="Folder"){
					parent=cell;
					x0=cell.geometry.getPoint().x;
					
					y0=cell.geometry.getPoint().y;
			}else{
				parent  = graph.getDefaultParent();
				x0=0;
				y0=0;
			}

                var vertex;
                graph.getModel().beginUpdate();
                try
                {
                    if (panel.getComponent('stock').pressed) {
                        vertex = graph.insertVertex(parent, null, stock.cloneNode(true), pt.x - 50-x0, pt.y - 25-y0, 100, 40, 'stock');
                    } else if (panel.getComponent('variable').pressed) {
                        vertex = graph.insertVertex(parent, null, variable.cloneNode(true), pt.x - 50-x0, pt.y - 25-y0, 120, 50, "parameter");
                    } else if (panel.getComponent('text').pressed) {
                        vertex = graph.insertVertex(parent, null, textAreaThing.cloneNode(true), pt.x - 100-x0, pt.y - 25-y0, 200, 50, "textArea");
                        vertex.setConnectable(false);
                    } else if (panel.getComponent('display').pressed) {
                        vertex = graph.insertVertex(parent, null, display.cloneNode(true), pt.x - 32-x0, pt.y - 32-y0, 64, 64, "display");
                        vertex.setConnectable(false);
                    } else if (panel.getComponent('converter').pressed) {
                        vertex = graph.insertVertex(parent, null, converter.cloneNode(true), pt.x - 50-x0, pt.y - 25-y0, 120, 50, "converter");
                    } else if (panel.getComponent('picture').pressed) {
                        vertex = graph.insertVertex(parent, null, picture.cloneNode(true), pt.x - 24-x0, pt.y - 24-y0, 64, 64, "picture");
                        vertex.setConnectable(true);
                        setPicture(vertex);
                    }
                    /*
                    panel.getComponent('stock').toggle(false);
                    panel.getComponent('variable').toggle(false);
                    panel.getComponent('text').toggle(false);
                    panel.getComponent('display').toggle(false);
                    panel.getComponent('converter').toggle(false);
                    panel.getComponent('picture').toggle(false);
                    */


                    if (isValued(vertex)) {
                        var displays = primitives("Display");
                        for (var i = 0; i < displays.length; i++) {
                            var d = displays[i];
                            if (isTrue(d.getAttribute("AutoAddPrimitives"))) {
                                var s = d.getAttribute("Primitives");
                                if (typeof(s) == "undefined") {
                                    d.setAttribute("Primitives", vertex.id);
                                } else {
                                    var items = s.split(",");
                                    items.push(vertex.id);
                                    d.setAttribute("Primitives", items.join(","));
                                }
                            }
                        }
                    }
                }
                finally
                {

                    graph.setSelectionCell(vertex);
                    graph.getModel().endUpdate();
                    evt.consume();
                    graph.cellEditor.startEditing(vertex);
                }
            } else if (cell == null) {
                graph.clearSelection();
            }
        }
    });

    // Initializes the graph as the DOM for the panel has now been created	
    graph.init(mainPanel.body.dom);
    graph.setConnectable(drupal_node_ID == -1);
    graph.setDropEnabled(true);
    graph.setSplitEnabled(false);
    graph.connectionHandler.connectImage = new mxImage('/builder/images/connector.gif', 16, 16);
    graph.setPanning(true);
    graph.setTooltips(true);
    graph.connectionHandler.setCreateTarget(false);

    var rubberband = new mxRubberband(graph);

    var parent = graph.getDefaultParent();
    graph.getModel().beginUpdate();

    try
    {
        settingCell = graph.insertVertex(parent, null, setting, 20, 20, 80, 40);
        settingCell.visible = false;
        var firstdisp = graph.insertVertex(parent, null, display.cloneNode(true), 50, 20, 64, 64, "roundImage;image=/builder/images/DisplayFull.png;");
        firstdisp.setAttribute("AutoAddPrimitives", true);
        firstdisp.setConnectable(false);
        firstdisp.setAttribute("name", "Data Display");
    }
    finally
    {
        graph.getModel().endUpdate();
    }

    graph.getEdgeValidationError = function(edge, source, target)
    {
        if (mxUtils.isNode(this.model.getValue(edge), "link")) {
            if (source != null) {
                source.setConnectable(true);
            }
            if (target != null) {
                target.setConnectable(true);
            }
        }
        if (mxUtils.isNode(this.model.getValue(edge), "flow") || (this.model.getValue(edge) == null && ribbonPanelItems().getComponent('connect').getComponent('flow').pressed)) {
            if (source !== null && source.isConnectable())
            {

                if (!mxUtils.isNode(this.model.getValue(source), "stock"))
                {
                    return 'Flows must either end in Stocks or not be connected to anything.';
                }
            }
            if (target !== null && target.isConnectable())
            {
                if (!mxUtils.isNode(this.model.getValue(target), "stock"))
                {
                    return 'Flows must either end in Stocks or not be connected to anything.';
                }
            }
        }
        if (mxUtils.isNode(this.model.getValue(edge), "link") || (this.model.getValue(edge) == null && ribbonPanelItems().getComponent('connect').getComponent('link').pressed)) {
            if (source !== null)
            {
                if (mxUtils.isNode(this.model.getValue(source), "link"))
                {
                    return 'Links cannot be connected to links.';
                }
            }
            if (target !== null)
            {
                if (mxUtils.isNode(this.model.getValue(target), "link"))
                {
                    return 'Links cannot be connected to links.';
                }
            }
        }
        var x = mxGraph.prototype.getEdgeValidationError.apply(this, arguments);
        setConnectability();
        return x;
    };


    if (true && is_editor && drupal_node_ID != -1) {
        var sharer = new mxSession(graph.getModel(), "/builder/hub.php?init&id=" + drupal_node_ID, "/builder/hub.php?id=" + drupal_node_ID, "/builder/hub.php?id=" + drupal_node_ID);
        sharer.start();
        sharer.createUndoableEdit = function(changes)
        {
            var edit = mxSession.prototype.createUndoableEdit(changes);
            edit.changes.animate = true;
            return edit;
        }
    }

    if (graph_source_data != null && graph_source_data.length > 0)
    {
        var doc = mxUtils.parseXml(graph_source_data);
        var dec = new mxCodec(doc);
        dec.decode(doc.documentElement, graph.getModel());
        if (getSetting().getAttribute("Version") < 3) {
            var converters = primitives("Converter");
            for (var i = 0; i < converters.length; i++) {
                var inps = converters[i].getAttribute("Inputs").split(",");
                var outs = converters[i].getAttribute("Outputs").split(",");
                var s = "";
                for (var j = 0; j < inps.length; j++) {
                    if (j > 0) {
                        s = s + ";";
                    }
                    s = s + inps[j] + "," + outs[j];
                }
                converters[i].setAttribute("Data", s);
            }
            getSetting().setAttribute("Version", 3);
        }
        if (getSetting().getAttribute("Version") < 4) {
            getSetting().setAttribute("SolutionAlgorithm", "RK1");
            getSetting().setAttribute("Version", 4)
        }

        if (getSetting().getAttribute("Version") < 5) {
            var stocks = primitives("Stock");
            for (var i = 0; i < stocks.length; i++) {
                stocks[i].setAttribute("NonNegative", false);
            }
            getSetting().setAttribute("Version", 5);
        }

        if (getSetting().getAttribute("Version") < 6) {
            var pictures = primitives("Picture");
            for (var i = 0; i < pictures.length; i++) {
                pictures[i].setAttribute("FlipHorizontal", false);
                pictures[i].setAttribute("FlipVertical", false);
            }
            getSetting().setAttribute("Version", 6);
        }

        if (getSetting().getAttribute("Version") < 7) {
            var links = primitives("Link");
            for (var i = 0; i < links.length; i++) {
                links[i].setAttribute("BiDirectional", false);
            }
            getSetting().setAttribute("Version", 7);
        }

		if (getSetting().getAttribute("Version") < 8) {
            var items = primitives("Stock").concat(primitives("Parameter"), primitives("Converter"));
            for (var i = 0; i < items.length; i++) {
                items[i].setAttribute("Image", "None");
            }
			items = primitives("Display");
            for (var i = 0; i < items.length; i++) {
                items[i].setAttribute("Image", "Display");
            }
            getSetting().setAttribute("Version", 8);
        }

		if (getSetting().getAttribute("Version") < 9) {
            getSetting().setAttribute("BackgroundColor", "white");
            getSetting().setAttribute("Version", 9);
        }

        setConnectability();
    }
	loadBackgroundColor();

    if (is_editor) {
        var mgr = new mxAutoSaveManager(graph);
        mgr.autoSaveThreshold = 0;
        mgr.save = function()
        {
            if (graph_title != "") {
                sendGraphtoServer(graph);
            }
        };
    }

    var listener = function(sender, evt)
    {
        history.undoableEditHappened(evt.getProperty('edit'));
    };

    graph.getModel().addListener(mxEvent.UNDO, listener);
    graph.getView().addListener(mxEvent.UNDO, listener);


    var toolbarItems = ribbonPanelItems();
    var selectionListener = function()
    {
        var selected = !graph.isSelectionEmpty();

        toolbarItems.getComponent('valued').getComponent('folder').setDisabled(graph.getSelectionCount() <= 0);
        toolbarItems.getComponent('valued').getComponent('ghostBut').setDisabled(graph.getSelectionCount() != 1 || (!isValued(graph.getSelectionCell())) || graph.getSelectionCell().value.nodeName == "Flow" || graph.getSelectionCell().value.nodeName == "Ghost");
        toolbarItems.getComponent('actions').getComponent('paste').setDisabled(!selected);
        toolbarItems.getComponent('actions').getComponent('cut').setDisabled(!selected);
        toolbarItems.getComponent('actions').getComponent('copy').setDisabled(!selected);
        toolbarItems.getComponent('actions').getComponent('delete').setDisabled(!selected);
        toolbarItems.getComponent('style').getComponent('fillcolor').setDisabled(false);
        toolbarItems.getComponent('style').getComponent('fontcolor').setDisabled(!selected);
        toolbarItems.getComponent('style').getComponent('linecolor').setDisabled(!selected);
        toolbarItems.getComponent('style').getComponent('bold').setDisabled(!selected);
        toolbarItems.getComponent('style').getComponent('italic').setDisabled(!selected);
        toolbarItems.getComponent('style').getComponent('underline').setDisabled(!selected);
        fontCombo.setDisabled(!selected);
        sizeCombo.setDisabled(!selected);
        toolbarItems.getComponent('style').getComponent('align').setDisabled(!selected);
        toolbarItems.getComponent('style').getComponent('movefront').setDisabled(!selected);
        toolbarItems.getComponent('style').getComponent('moveback').setDisabled(!selected);
        toolbarItems.getComponent('connect').getComponent('reverse').setDisabled(!(selected && (cellsContainNodename(graph.getSelectionCells(), "Link") || cellsContainNodename(graph.getSelectionCells(), "Flow"))));

        setStyles();
    };

    graph.getSelectionModel().addListener(mxEvent.CHANGED, selectionListener);

    // Updates the states of the undo/redo buttons in the toolbar
    var historyListener = function()
    {
        toolbarItems.getComponent('actions').getComponent('undo').setDisabled(!history.canUndo());
        toolbarItems.getComponent('actions').getComponent('redo').setDisabled(!history.canRedo());
    };

    history.addListener(mxEvent.ADD, historyListener);
    history.addListener(mxEvent.UNDO, historyListener);
    history.addListener(mxEvent.REDO, historyListener);

    // Updates the button states once
    selectionListener();
    historyListener();


    var previousCreateGroupCell = graph.createGroupCell;

    graph.createGroupCell = function()
    {
        var group = previousCreateGroupCell.apply(this, arguments);
        group.setStyle('folder');
        group.setValue(folder.cloneNode(true));

        return group;
    };

    graph.connectionHandler.factoryMethod = function()
    {
        var style;
        var parent;
        var value;
        var conn;
        if (ribbonPanelItems().getComponent('connect').getComponent('link').pressed) {
            style = 'entity';
            parent = link.cloneNode(true);
            conn = false;
        } else {
            style = '';
            parent = flow.cloneNode(true);
            conn = false;
        }
        var cell = new mxCell(parent, new mxGeometry(0, 0, 100, 100), style);
        cell.geometry.setTerminalPoint(new mxPoint(0, 100), true);
        cell.geometry.setTerminalPoint(new mxPoint(100, 0), false);
        cell.edge = true;
        cell.connectable = conn;

        return cell;
    };

    graph.getTooltipForCell = function(cell)
    {
        if (cell != null && cell.value.getAttribute("Note") != null && cell.value.getAttribute("Note").length > 0) {
            return cell.value.getAttribute("Note");
        } else {
            return "";
        }
    }

    // Redirects tooltips to ExtJs tooltips. First a tooltip object
    // is created that will act as the tooltip for all cells.
    var tooltip = new Ext.ToolTip(
    {
        html: '',
        hideDelay: 0,
        dismissDelay: 0,
		showDelay: 0
    });

    // Installs the tooltip by overriding the hooks in mxGraph to
    // show and hide the tooltip.
    graph.tooltipHandler.show = function(tip, x, y)
    {
        if (tip != null && tip.length > 0)
        {
            tooltip.update(tip);
            tooltip.showAt([x, y + mxConstants.TOOLTIP_VERTICAL_OFFSET]);
        } else {
            tooltip.hide();
        }
    };

    graph.tooltipHandler.hide = function()
    {
        tooltip.hide();
    };

	graph.tooltipHandler.hideTooltip = function()
    {
        tooltip.hide();
    };

	// Enables guides
	mxGraphHandler.prototype.guidesEnabled = true;

    // Alt disables guides
    mxGuide.prototype.isEnabledForEvent = function(evt)
    {
    	return !mxEvent.isAltDown(evt);
    };

    var undoHandler = function(sender, evt)
    {
        var changes = evt.getProperty('edit').changes;
        graph.setSelectionCells(graph.getSelectionCellsForChanges(changes));
    };

    history.addListener(mxEvent.UNDO, undoHandler);
    history.addListener(mxEvent.REDO, undoHandler);


    graph.container.focus();

    if (!is_topBar) {
        toggle_toolbar();
    }
    if (!is_sideBar) {
        configPanel.collapse(Ext.Component.DIRECTION_RIGHT, false);
    }

    var keyHandler = new mxKeyHandler(graph);

    keyHandler.bindKey(13,
    function()
    {
        graph.foldCells(false);
    });

    keyHandler.bindKey(8,
    function()
    {
        graph.removeCells(graph.getSelectionCells(), false);
    });

    keyHandler.bindKey(33,
    function()
    {
        graph.exitGroup();
    });

    keyHandler.bindKey(34,
    function()
    {
        graph.enterGroup();
    });

    keyHandler.bindKey(36,
    function()
    {
        graph.home();
    });

    keyHandler.bindKey(35,
    function()
    {
        graph.refresh();
    });

    keyHandler.bindKey(37,
    function()
    {
        graph.selectPreviousCell();
    });

    keyHandler.bindKey(38,
    function()
    {
        graph.selectParentCell();
    });

    keyHandler.bindKey(39,
    function()
    {
        graph.selectNextCell();
    });

    keyHandler.bindKey(40,
    function()
    {
        graph.selectChildCell();
    });

    keyHandler.bindKey(46,
    function()
    {
        graph.removeCells(graph.getSelectionCells(), false);
    });

    keyHandler.bindKey(107,
    function()
    {
        graph.zoomIn();
    });

    keyHandler.bindKey(109,
    function()
    {
        graph.zoomOut();
    });

    keyHandler.bindKey(113,
    function()
    {
        graph.startEditingAtCell();
    });

    keyHandler.bindControlKey(65,
    function()
    {
        graph.selectAll();
    });

    keyHandler.bindControlKey(89,
    function()
    {
        history.redo();
    });

    keyHandler.bindControlKey(90,
    function()
    {
        history.undo();
    });

    keyHandler.bindControlKey(88,
    function()
    {
        mxClipboard.cut(graph);
    });

    keyHandler.bindControlKey(67,
    function()
    {
        mxClipboard.copy(graph);
    });

    keyHandler.bindControlKey(86,
    function()
    {
        mxClipboard.paste(graph);
    });

    keyHandler.bindControlKey(71,
    function()
    {
        graph.setSelectionCell(graph.groupCells(null, 20));
    });

    keyHandler.bindControlKey(85,
    function()
    {
        graph.setSelectionCells(graph.ungroupCells());
    });

    graph.getSelectionModel().addListener(mxEvent.CHANGE,
    function(sender, evt)
    {
        selectionChanged(false);
    });


    var primitiveRenderer = function(prims) {
        var items = prims.split(",");

        var myCells = primitives();
        if (myCells != null) {
            for (var i = 0; i < myCells.length; i++)
            {
                if (items.indexOf(myCells[i].id) > -1) {
                    items[items.indexOf(myCells[i].id)] = myCells[i].getAttribute("name");
                }
            }
        }
        return items.join(", ");
    };

    var equationRenderer = function(eq) {
        var res = eq;
        if (/\\n/.test(res)) {
            var vals = res.match(/(.*?)\\n/);
            res = vals[1] + "...";
        }

        res = res.replace(/</g, "&lt;");
        res = res.replace(/>/g, "&gt;");
        res = res.replace(/\[(.*?)\]/g, "<font color='Green'>[$1]</font>");
        res = res.replace(/(&lt;.*?&gt;)/g, "<font color='Orange'>$1</font>");
        res = res.replace(/\b([\d\.]+)\b/g, "<font color='DeepSkyBlue'>$1</font>");

        return res;
    };

	var labelRenderer = function(eq) {
        var res = eq;

        res = res.replace(/(%.)/g, "<font color='DeepSkyBlue'>$1</font>");

        return res;
    };

	function pictureEditor(){
		var picNames = ["None",
        'Positive Feedback Clockwise', 'Positive Feedback Counterclockwise',
        'Negative Feedback Clockwise', 'Negative Feedback Counterclockwise',
        'Unknown Feedback Clockwise', 'Unknown Feedback Counterclockwise', 'Plus', 'Minus',
        'Checkmark', 'Prohibited', 'Idea', 'Book', 'Clock', 'Computer', 'Dice', 'Gear', 'Hammer', 'Smiley', 'Heart', 'Question', 'Warning', 'Info', 'Key', 'Lock', 'Loudspeaker', 'Footprints', 'Mail', 'Network', 'Notes', 'Pushpin', 'Paperclip', 'People', 'Person', 'Wallet', 'Money', 'Flag', 'Trash', "Display"
        ];

		return new Ext.form.ComboBox({
            triggerAction: "all",
            store: new Ext.data.Store({
                fields: [{name:'text', type:'string'}],
                data: Ext.Array.map(picNames, function(x){return {text:x}})
            }),
            queryMode: 'local',
			forceSelection:false,
            selectOnFocus: true,
			listConfig: {
			        getInnerTpl: function() {
			            return '<center><div class="x-combo-list-item" style=\"white-space:normal\";><img src="/builder/images/SD/{text}.png" width=48 height=48/></div></center>';
			        }
			    }
        });
	}

    var allPrimitives = [];

    selectionChanged(false);

    function selectionChanged(forceClear) {
        if (! (typeof grid == "undefined")) {
            grid.plugins[0].completeEdit();
            //access the cell editing plugin, then terminate
            configPanel.removeAll()
        }

        allPrimitives = neighborhood(cell).map(function(x) {
            return [x.id, x.getAttribute("name")];
        });


        var cell = graph.getSelectionCell();
        if (forceClear) {
            cell = null;
        }

        var properties = [];
        var cellType;
        if (cell != null) {
            cellType = cell.value.nodeName;
        }

        if (cell != null && graph.getSelectionCells().length == 1 && (!(cellType == "Text" || cellType == "Ghost"))) {
            configPanel.setTitle(cellType == "Parameter" ? "Variable": cellType);


            properties = [
            {
                'name': 'Note',
                'text': 'Note',
                'value': cell.getAttribute("Note"),
                'group': '  General',
                'editor': new Ext.form.TextArea({
                    grow: true
                })
            },
            {
                'name': 'name',
                'text': '(name)',
                'value': cell.getAttribute("name"),
                'group': '  General'
            }
            ];


			if(cell.getAttribute("Image",-99) != -99){
				properties.push({
	                'name': 'Image',
	                'text': 'Displayed Image',
	                'value': cell.getAttribute("Image"),
	                'group': '  User Interface',
	                'editor': pictureEditor()
	            });
			}
			
            if (isValued(cell)) {
                if (cell.value.nodeName != "Converter") {
                    properties.push({
                        'name': 'ShowSlider',
                        'text': 'Show Value Slider',
                        'value': isTrue(cell.getAttribute("ShowSlider")),
                        'group': 'User Interface'
                    });

                    properties.push({
                        'name': 'SliderMax',
                        'text': 'Slider Max',
                        'value': parseFloat(cell.getAttribute("SliderMax")),
                        'group': 'User Interface'
                    });

                    properties.push({
                        'name': 'SliderMin',
                        'text': 'Slider Min',
                        'value': parseFloat(cell.getAttribute("SliderMin")),
                        'group': 'User Interface'
                    });
                }

                properties.push({
                    'name': 'Units',
                    'text': 'Units',
                    'value': cell.getAttribute("Units"),
                    'group': 'Validation',
                    'editor': new Ext.form.customFields['units']({})
                });

                properties.push({
                    'name': 'MaxConstraintUsed',
                    'text': 'Max Constraint',
                    'value': isTrue(cell.getAttribute("MaxConstraintUsed")),
                    'group': 'Validation'
                });

                properties.push({
                    'name': 'MaxConstraint',
                    'text': 'Max Constraint',
                    'value': parseFloat(cell.getAttribute("MaxConstraint")),
                    'group': 'Validation'
                });


                properties.push({
                    'name': 'MinConstraintUsed',
                    'text': 'Min Constraint',
                    'value': isTrue(cell.getAttribute("MinConstraintUsed")),
                    'group': 'Validation'
                });

                properties.push({
                    'name': 'MinConstraint',
                    'text': 'Min Constraint',
                    'value': parseFloat(cell.getAttribute("MinConstraint")),
                    'group': 'Validation'
                });

            }

        } else {
            configPanel.setTitle("");
        }
        selectedPrimitive = cell;

        var iHs;
        var slidersShown = false;
        if (cell == null || cellType == "Text" || graph.getSelectionCells().length > 1) {
            //no primitive has been selected. Stick in empty text and sliders.
            if (drupal_node_ID == -1) {
                iHs = "<br><br><center><a href='/builder/resources/QuickStart.pdf' target='_blank'><img src='/builder/images/Help.jpg' /></a><br/><br/><br/>Or take a look at the <a href='http://InsightMaker.com/help' target='_blank'>Detailed Insight Maker Manual</a><br/><br/>There is also a <a href=' http://www.systemswiki.org/index.php?title=Thoughts_on_Interaction' target='_blank'>free, on-line education course</a> which teaches you how to think in a systems manner using Insight Maker.</center>";
            } else {
                iHs = "<big>" + graph_description + "</big>";
                var slids = sliderPrimitives();
                if (slids.length > 0) {
                    slidersShown = true;
                    iHs = iHs + "<table width=100%>";
                    for (var counter = 0; counter < slids.length; counter++) {
                        iHs = iHs + "<tr><td align=center colspan=2>" + slids[counter].getAttribute("name") + "</td></tr><tr><td><div id='slider" + slids[counter].id + "'><\/div></td><td><input type=text id='sliderVal" + slids[counter].id + "' size=5><\/td><\/tr>";
                    }
                    iHs = iHs + "<\/table>";
                }

            }

        } else if (cellType == "Stock") {
            iHs = 'A stock stores a material or a resource. Lakes and Bank Accounts are both examples of stocks. One stores water while the other stores money. <hr/><br/><h1>Initial Value Examples:</h1><center><table class="undefined"><tr><td align=center>Static Value</td></tr><tr><td align=center><i>10</i></td></tr><tr><td>Mathematical Equation</td></tr><tr><td align=center><i>cos(2.78)+7*2</i></td></tr><tr><td align=center>Referencing Other Primitives</td></tr><tr><td align=center><i>5+[My Variable]</i></td></tr></table></center>';
            properties.push({
                'name': 'InitialValue',
                'text': 'Initial Value =',
                'value': cell.getAttribute("InitialValue"),
                'group': ' Configuration',
                'editor': new Ext.form.customFields['code']({}),
                'renderer': equationRenderer
            });

            properties.push({
                'name': 'NonNegative',
                'text': 'Non-Negative',
                'value': isTrue(cell.getAttribute("NonNegative")),
                'group': ' Configuration'
            });

            properties.push({
                'name': 'StockMode',
                'text': 'Stock Type',
                'value': cell.getAttribute("StockMode"),
                'group': 'Serialization',
                'editor': new Ext.form.ComboBox({
                    triggerAction: "all",
                    store: ['Store', 'Tank', 'Conveyor'],
                    selectOnFocus: true
                })
            });
            properties.push({
                'name': 'Delay',
                'text': 'Delay',
                'value': parseFloat(cell.getAttribute("Delay")),
                'group': 'Serialization'
            });
            properties.push({
                'name': 'Volume',
                'text': 'Volume',
                'value': parseFloat(cell.getAttribute("Volume")),
                'group': 'Serialization'
            });




        } else if (cellType == "Parameter") {
            iHs = "A variable is a dynamically updated variable in your model that synthesizes available data or provides a constant value for uses in your equations. The birth rate of a population or the maximum volume of water in a lake are both possible uses of variables.<hr/><br/><h1>Value Examples:</h1><center><table class='undefined'><tr><td align=center>Static Value</td></tr><tr><td align=center><i>7.2</i></td></tr><tr><td>Using Current Simulation Time</td></tr><tr><td align=center><i>seconds^2+6</i></td></tr><tr><td align=center>Referencing Other Primitives</td></tr><tr><td align=center><i>[Lake Volume]*2</i></td></tr></table></center>";
            properties.push({
                'name': 'Equation',
                'text': 'Value/Equation =',
                'value': cell.getAttribute("Equation"),
                'group': ' Configuration',
                'editor': new Ext.form.customFields['code']({}),
                'renderer': equationRenderer
            });
        } else if (cell.value.nodeName == "Link") {
            iHs = "Links connect the different parts of your model. If one primitive in your model refers to another in its equation, the two primitives must either be directly connected or connected through a link. Once connected with links, square-brackets may be used to reference values of other primitives. So if you have a stock call <i>Bank Balance</i>, you could refer to it in another primitive's equation with <i>[Bank Balance]</i>.";
            properties.push({
                'name': 'BiDirectional',
                'text': 'Bi-Directional',
                'value': isTrue(cell.getAttribute("BiDirectional")),
                'group': ' Configuration'
            });
            //the following hack allows the link description value to appear. It deals with the problem of overflow being hidden for the grid, the panel, and a couple of other things around the grid
            properties.push({
                'name': 'zfiller',
                'text': '.',
                'value': "",
                'group': '  General',
                'disabled': true
            });
            properties.push({
                'name': 'zzfiller',
                'text': '.',
                'value': "",
                'group': '  General',
                'disabled': true
            });
        } else if (cell.value.nodeName == "Folder") {
            iHs = "Folders group together similar items in a logical way. You can collapse and expand folders to hide or reveal model complexity.";
            //the following hack allows the folder description value to appear. It deals with the problem of overflow being hidden for the grid, the panel, and a couple of other things around the grid
            properties.push({
                'name': 'zfiller',
                'text': '.',
                'value': "",
                'group': '  General',
                'disabled': true
            });
            properties.push({
                'name': 'zzfiller',
                'text': '.',
                'value': "",
                'group': '  General',
                'disabled': true
            });
            properties.push({
                'name': 'zzzfiller',
                'text': '.',
                'value': "",
                'group': '  General',
                'disabled': true
            });
        } else if (cell.value.nodeName == "Flow") {
            iHs = "Flows represent the transfer of material from one stock to another. For example given the case of a lake, the flows for the lake might be: River Inflow, River Outflow, Precipitation, and Evaporation. Flows are given a flow rate and they operator over one unit of time; in effect: flow per one second or per one minute. <hr><br><h1>Flow Rate Examples:</h1><center><table class='undefined'><tr><td align=center>Using the Current Simulation Time</td></tr><tr><td align=center><i>minutes/3</i></td></tr><tr><td align=center>Referencing Other Primitives</td></tr><tr><td align=center><i>[Lake Volume]*0.05+[Rain]/4</i></td></tr></table></center>";
            properties.push({
                'name': 'FlowRate',
                'text': 'Flow Rate =',
                'value': cell.getAttribute("FlowRate"),
                'group': ' Configuration',
                'editor': new Ext.form.customFields['code']({}),
                'renderer': equationRenderer
            });
            properties.push({
                'name': 'OnlyPositive',
                'text': 'Only Positive Rates',
                'value': isTrue(cell.getAttribute("OnlyPositive")),
                'group': ' Configuration'
            });
        } else if (cellType == "Display") {
            iHs = "Displays configure the display of the the results of the simulation. You can have graphical charts or interactive tables as your displays. You can have an unlimited number of displays in your Insight. By default, displays show nothing; add nodes to the display's 'Displayed Items' field to make them visible in displays.";
            properties.push({
                'name': 'Type',
                'text': 'Display Type',
                'value': cell.getAttribute("Type"),
                'group': ' Configuration',
                'editor': new Ext.form.ComboBox({
                    triggerAction: "all",
                    store: ['Time Series', 'Scatterplot', 'Tabular', 'Steady State'],
                    selectOnFocus: true
                })
            });

            properties.push({
                'name': 'AutoAddPrimitives',
                'text': 'Auto Add Nodes',
                'value': isTrue(cell.getAttribute("AutoAddPrimitives")),
                'group': ' Configuration'
            });
            properties.push({
                'name': 'ScatterplotOrder',
                'text': 'Scatterplot Order',
                'value': cell.getAttribute("ScatterplotOrder"),
                'group': 'Charts',
                'editor': new Ext.form.ComboBox({
                    triggerAction: "all",
                    store: ['X Primitive, Y Primitive', 'Y Primitive, X Primitive'],
                    selectOnFocus: true
                })
            });
            properties.push({
                'name': 'xAxis',
                'text': 'x-Axis Label',
                'value': cell.getAttribute("xAxis"),
                'group': 'Charts',renderer:labelRenderer
            });
            properties.push({
                'name': 'yAxis',
                'text': 'y-Axis Label',
                'value': cell.getAttribute("yAxis"),
                'group': 'Charts',renderer:labelRenderer
            });
            properties.push({
                'name': 'Primitives',
                'text': 'Displayed Items',
                'value': cell.getAttribute("Primitives"),
                'group': ' Configuration',
                'editor': new Ext.form.ComboBox({
                    store: allPrimitives,
                    queryMode: 'local',
                    triggerAction: 'all'
                    ,editable:false,
                    hideOnSelect: false
                    ,
                    multiSelect: true,
                    forceSelection: true,
                    typeAhead: true,
					listConfig: {emptyText:"No primitives exist in your model"}
                }),
                'renderer': primitiveRenderer
            });

        } else if (cellType == "Ghost") {
            iHs = "This item is a 'Ghost' of another primitive. It mirrors the values and properties of its source primitive. You cannot edit the properties of the Ghost. You need to instead edit the properties of its source.";
        } else if (cellType == "Converter") {
            iHs = "Converters store a table of input and output data. When the input source takes on one of the input values, the converter takes on the corresponding output value. If no specific input value exists for the current input source value, then the nearest input neighbors are avaeraged.";
            var n = neighborhood(cell);
            var dat = [["Time", "Time"]]
            for (var i = 0; i < n.length; i++)
            {
                dat.push([n[i].id, n[i].getAttribute("name")]);
            }
            var converterStore = new Ext.data.ArrayStore({
                id: 0,
                fields: [
                'myId',
                'displayText'
                ],
                data: dat
            });

            properties.push({
                'name': 'Source',
                'text': 'Input Source',
                'value': cell.getAttribute("Source"),
                'group': ' Configuration',
                'editor': new Ext.form.ComboBox({
                    triggerAction: "all",
                    queryMode: 'local',
                    store: converterStore,
                    selectOnFocus: true,
                    valueField: 'myId',editable:false,
                    displayField: 'displayText'
                }),
                'renderer': primitiveRenderer
            });
            properties.push({
                'name': 'Data',
                'text': 'Data',
                'value': cell.getAttribute("Data"),
                'group': 'Input/Output Table',
                'editor': new Ext.form.customFields['converter']({
                })
            });
            properties.push({
                'name': 'Interpolation',
                'text': 'Interpolation',
                'value': cell.getAttribute("Interpolation"),
                'group': ' Configuration',
                'editor': new Ext.form.ComboBox({
                    triggerAction: "all",
                    store: ['None', 'Linear'],editable:false,
                    selectOnFocus: true
                })
            });
        } else if (cellType == "Picture") {
            iHs = "Pictures provide useful information in a friendly to use manner.";

            properties.push({
                'name': 'FlipHorizontal',
                'text': 'Flip Horizontal',
                'value': isTrue(cell.getAttribute("FlipHorizontal")),
                'group': ' Configuration'
            });
            properties.push({
                'name': 'FlipVertical',
                'text': 'Flip Vertical',
                'value': isTrue(cell.getAttribute("FlipVertical")),
                'group': ' Configuration'
            });
        }
		configPanel.removeAll();
        createGrid(properties, iHs);

        if (slidersShown == true) {
            var slids = sliderPrimitives();
            sliders = [];

            if (slids.length > 0) {
                var slider_width;
                if (is_embed) {
                    slider_width = 110;
                } else {
                    slider_width = 215;
                }

                for (var i = 0; i < slids.length; i++) {
                    var perc = Math.floor( - (Math.log(slids[i].getAttribute("SliderMax")) / Math.log(10) - 4));
                    sliders.push(new Ext.Slider({
                        renderTo: 'slider' + slids[i].id,
                        width: slider_width,
                        minValue: parseFloat(slids[i].getAttribute("SliderMin")),
                        sliderCell: slids[i],
                        value: parseFloat(getValue(slids[i])),
                        maxValue: parseFloat(slids[i].getAttribute("SliderMax")),
                        decimalPrecision: perc,
                        listeners: {
                            change: function(slider, newValue)
                            {
                                var other = "sliderVal" + slider.sliderCell.id;
                                Ext.get(other).dom.value = parseFloat(newValue);
                                setValue(slider.sliderCell, parseFloat(newValue));
                            }
                        }
                    }));


               
                    Ext.get("sliderVal" + sliders[i].sliderCell.id).dom.value = parseFloat(getValue(slids[i]));

                }
                for (counter = 0; counter < slids.length; counter++) {
                    var f;
                    eval("f = function(e){var v=parseFloat(Ext.get('sliderVal" + slids[counter].id + "').getValue(), 10); if(! isNaN(v)){sliders[" + counter + "].setValue(v);}}");
                    Ext.get('sliderVal' + slids[counter].id).on('keyup', f);
                }

            }
        }
    }

    if (drupal_node_ID == -1) {
        setSaveEnabled(true);
    } else {
        setSaveEnabled(false);
    }

    updateWindowTitle();

    if (!saved_enabled) {
        ribbonPanelItems().getComponent('savegroup').setVisible(false);
    }

    handelCursors();
    setTopLinks();

    if ((!is_editor) && (is_zoom == 1)) {
        graph.getView().setScale(0.25);
        graph.fit();
        graph.fit();
    }
};


var surpressCloseWarning = false;
function confirmClose() {
    if (!surpressCloseWarning) {
        if ((!saved_enabled) || ribbonPanelItems().getComponent('savegroup').getComponent('savebut').disabled) {

            }
        else {
            return "You have made unsaved changes to this Insight. If you close now, they will be lost.";
        }
    } else {
        surpressCloseWarning = false;
    }
}


Ext.example = function() {
    var msgCt;

    function createBox(t, s) {
         return '<div class="msg"><h3>' + t + '</h3><p>' + s + '</p></div>';
    }
    return {
        msg : function(title, format){
            if(!msgCt){
                msgCt = Ext.core.DomHelper.insertFirst(document.body, {id:'msg-div'}, true);
            }
            var s = Ext.String.format.apply(String, Array.prototype.slice.call(arguments, 1));
            var m = Ext.core.DomHelper.append(msgCt, createBox(title, s), true);
            m.hide();
            m.slideIn('t').ghost("t", { delay: 4500, remove: true});
        }
    };
} ();


Ext.round = function(n, d) {
    var result = Number(n);
    if (typeof d == 'number') {
        d = Math.pow(10, d);
        result = Math.round(n * d) / d;
    }
    return result;
};



