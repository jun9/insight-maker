/*

Copyright 2010-2011 Give Team. All rights reserved.

Give Team is a non-profit organization dedicated to
using the internet to encourage giving and greater
understanding.

This file may distributed and/or modified under the
terms of the Insight Maker Public License.

Insight Maker and Give Team are trademarks.

*/

var analysisCount = 0;

if (!Array.prototype.indexOf)
 {
    Array.prototype.indexOf = function(elt
    /*, from*/
    )
    {
        var len = this.length;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
        ? Math.ceil(from)
        : Math.floor(from);
        if (from < 0)
        from += len;

        for (; from < len; from++)
        {
            if (from in this &&
            this[from] === elt)
            return from;
        }
        return - 1;
    };
}


if (!Array.prototype.map)
 {
    Array.prototype.map = function(fun
    /*, thisp*/
    )
    {
        var len = this.length;
        if (typeof fun != "function")
        throw new TypeError();

        var res = new Array(len);
        var thisp = arguments[1];
        for (var i = 0; i < len; i++)
        {
            if (i in this)
            res[i] = fun.call(thisp, this[i], i, this);
        }

        return res;
    };
}

Array.prototype.unique = function() {
    var r = new Array();
    o: for (var i = 0, n = this.length; i < n; i++)
    {
        for (var x = 0, y = r.length; x < y; x++)
        {
            if (r[x] == this[i])
            {
                continue o;
            }
        }
        r[r.length] = this[i];
    }
    return r;
}

Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

function getGraphXml(graph) {
    var enc = new mxCodec(mxUtils.createXmlDocument());
    var node = enc.encode(graph.getModel());
    return mxUtils.getPrettyXml(node);
}

function sendGraphtoServer(graph) {
    Ext.Ajax.request({
        url: '/builder/save.php',
        method: 'POST',
        params: {
            data: getGraphXml(graph),
            nid: drupal_node_ID,
            title: graph_title,
            description: graph_description,
            tags: graph_tags
        },

        success: function(result, request) {
            drupal_node_ID = result.responseText;

            setSaveEnabled(false);

            updateWindowTitle();
            setTopLinks();
        },
        failure: function(result, request) {
            Ext.MessageBox.hide();
            Ext.MessageBox.show({
                title: 'Error',
                msg: 'The Insight could not be saved. Please try again later.',
                buttons: Ext.MessageBox.OK,
                animEl: 'mb9',
                icon: Ext.MessageBox.ERROR
            });
        }
    });
}

function getCellbyID(id){
	var items = primitives();
	for(i=0; i<items.length; i++){
		if(id==items[i].id){
			return items[i];
		}
	}
	return null;
}

function validPrimitiveName(name) {
    return (name.length > 0 && (!(/[^A-Za-z0-9 ]/.test(name))) && /[A-Za-z]/.test(name.substr(0, 1)));
}

function isPrimitive(cell) {
    return ! (cell.value.nodeName == 'Picture' || cell.value.nodeName == 'Text');
}

function cellsContainNodename(myCells, name) {
    for (var i = 0; i < myCells.length; i++)
    {
        if (myCells[i].value.nodeName == name) {
            return true;
        }
    }
}

function nodeInsertSelected() {
    var panel = ribbonPanelItems().getComponent('valued');
    return (panel.getComponent('stock').pressed || panel.getComponent('variable').pressed || panel.getComponent('text').pressed || panel.getComponent('display').pressed || panel.getComponent('converter').pressed || panel.getComponent('picture').pressed)
}

function connectionType() {
    if (ribbonPanelItems().getComponent('connect').getComponent('link').pressed) {
        return "Link";
    } else if (ribbonPanelItems().getComponent('connect').getComponent('flow').pressed) {
        return "Flow";
    }
    return "None";
}

function setConnectability() {
    var connectable = (connectionType() != "Flow");
    var myCells = primitives();
    if (myCells != null) {
        for (var i = 0; i < myCells.length; i++)
        {
            if (orig(myCells[i]).value.nodeName == "Flow" || orig(myCells[i]).value.nodeName == "Parameter" || orig(myCells[i]).value.nodeName == "Converter" || orig(myCells[i]).value.nodeName == "Picture") {
                myCells[i].setConnectable(connectable);
            }
        }
    }
}


function isSimguaPrimitive(cell) {
    var n = cell.value.nodeName;
    return (n == "Folder" || n == "Stock" || n == "Converter" || n == "Parameter" || n == "Display" || n == "Link");
}

function primitives(type) {
    var myCells = childrenCells(graph.getModel().getChildren(graph.getModel().getRoot())[0]);
    if (type == null) {
        return myCells;
    } else {
        var targetCells = [];
        for (var i = 0; i < myCells.length; i++)
        {
            if (myCells[i].value.nodeName == type) {
                targetCells.push(myCells[i]);
            }
        }
        return targetCells;
    }
}

function childrenCells(root) {
    var myCells = graph.getModel().getChildren(root);
    if (myCells != null) {
        var additions = [];
        for (var i = 0; i < myCells.length; i++) {
            //alert(myCells[i].value.nodeName);
            if (myCells[i].value.nodeName == "Folder") {
                additions = additions.concat(childrenCells(myCells[i]));
            }
        }
        myCells = myCells.concat(additions);
        for (var i = myCells.length - 1; i >= 0; i--) {
            if (myCells[i] == null || myCells[i].value == null) {
                myCells.splice(i, 1);
            }
        }
        return myCells;
    }
    return null;
}


function neighborhood(target) {
    var hood = [];
    var myCells = primitives();
    if (myCells != null) {
        if (target != null) {
            var flows = [];
            var links = [];
            if (target.isEdge()) {
                hood.push(orig(target.source));
                hood.push(orig(target.target));
            }
            for (var i = 0; i < myCells.length; i++)
            {
                if (myCells[i].value.nodeName == "Flow") {
                    flows.push(orig(myCells[i]));
                } else if (myCells[i].value.nodeName == "Link") {
                    links.push(orig(myCells[i]));
                }
            }
            for (var i = 0; i < flows.length; i++)
            {
                if (flows[i].source == target) {
                    hood.push(flows[i]);
                }
                if (flows[i].target == target) {
                    hood.push(flows[i]);
                }
            }
            for (var i = 0; i < links.length; i++)
            {
                if (links[i].source == target) {
                    hood.push(orig(links[i].target));
                }
                if (links[i].target == target) {
                    hood.push(orig(links[i].source));
                }
            }
        } else {
            for (var i = 0; i < myCells.length; i++)
            {
                if (isValued(myCells[i])) {
                    hood.push(orig(myCells[i]));
                }
            }
        }
    }
    return hood.clean(null).unique();
}

function doubleArray(arr) {
    var narr = [];
    for (var i = 0; i < arr.length; i++)
    {
        narr.push([arr[i], arr[i]])
    }
    return narr;
}

function isValued(cell) {
    if (cell == null || (typeof(orig(cell)) == "undefined")) {
        return false;
    }
    return (orig(cell).value.nodeName == "Converter" || orig(cell).value.nodeName == "Flow" || orig(cell).value.nodeName == "Stock" || orig(cell).value.nodeName == "Parameter");
}

function setSaveEnabled(e) {
    if (is_editor) {
        var b = ribbonPanelItems().getComponent('savegroup').getComponent('savebut');
        if (e) {
            b.setDisabled(false);
            b.setText('Save Insight');
        } else {
            b.setDisabled(true);
            b.setText('Insight Saved');
        }
    }
}

function updateWindowTitle() {
    if (!is_embed) {
        if (graph_title == "") {
            document.title = "Untitled Insight | Insight Maker";
        } else {
            document.title = graph_title + " | Insight Maker";
        }
    }
}

function hasDisplay() {
    var myCells = primitives();
    return cellsContainNodename(myCells, "Display");
}

function setPicture(cell) {
    var styleString = cell.getStyle();
    if (cell.getAttribute("Image") == "None") {
        styleString = mxUtils.setStyle(styleString, "image", "None");
        if (cell.value.nodeName == "Display" || cell.value.nodeName == "Stock") {
            styleString = mxUtils.setStyle(styleString, "shape", "rectangle");
        } else {
            styleString = mxUtils.setStyle(styleString, "shape", "ellipse");
        }
    } else {
	//alert(cell.getAttribute("Image"));
        if (cell.getAttribute("Image").substring(0, 4).toLowerCase() == "http") {
            styleString = mxUtils.setStyle(styleString, "image", cell.getAttribute("Image"));
        } else {
            styleString = mxUtils.setStyle(styleString, "image", "/builder/images/SD/" + cell.getAttribute("Image") + ".png");
        }
        if (isTrue(cell.getAttribute("FlipVertical"))) {
            styleString = mxUtils.setStyle(styleString, "imageFlipV", 1);
        } else {
            styleString = mxUtils.setStyle(styleString, "imageFlipV", 0);
        }
        if (isTrue(cell.getAttribute("FlipHorizontal"))) {
            styleString = mxUtils.setStyle(styleString, "imageFlipH", 1);
        } else {
            styleString = mxUtils.setStyle(styleString, "imageFlipH", 0);
        }
        styleString = mxUtils.setStyle(styleString, "shape", "image");
    }
    cell.setStyle(styleString);
}

function deletePrimitive(cell) {
    var myCells = primitives();
    for (var i = 0; i < myCells.length; i++)
    {
        if (myCells[i].value.nodeName == "Display") {
            if (myCells[i].getAttribute("Primitives")) {
                var items = myCells[i].getAttribute("Primitives").split(",");
                var j = items.indexOf(cell.id);
                if (j > -1) {
                    items.splice(j, 1);
                    myCells[i].setAttribute("Primitives", items.join(","));
                }
            }
        } else if (myCells[i].value.nodeName == "Converter") {
            if (myCells[i].getAttribute("Source") == cell.id) {
                myCells[i].setAttribute("Source", "Time");
            } else if (cell.value.nodeName = "Link") {
                testConverterSource(myCells[i]);
            }
        } else if (myCells[i].value.nodeName == "Ghost") {
            if (myCells[i].value.getAttribute("Source") == cell.id) {
                var k = myCells[i];

                deletePrimitive(k);
                graph.removeCells([k], false);

            }
        }
    }
}

function linkBroken(edge) {
    var myCells = primitives();
    for (var i = 0; i < myCells.length; i++)
    {
        if (myCells[i].value.nodeName == "Converter") {
            testConverterSource(myCells[i]);
        }
    }
	if((edge.getTerminal(false) != null) && edge.getTerminal(false).value.nodeName=="Converter"){
		//alert("hi");
		if(typeof(edge.getTerminal(true)) != "undefined"){
			if( isValued(edge.getTerminal(true)) ){
				edge.getTerminal(false).setAttribute("Source", edge.getTerminal(true).id);
			}
		}
	}

}

function testConverterSource(target) {
    var neigh = neighborhood(target);
    var found = false;
    for (var j = 0; j < neigh.length; j++) {
        if (target.getAttribute("Source") == neigh[j].id) {
            found = true;
        }
    }
    if (!found) {
        target.setAttribute("Source", "Time");
    }
}

function downloadModel() {
    var data = getGraphXml(graph);
    surpressCloseWarning = true;
    document.getElementById('downloader').title.value = encodeURIComponent(graph_title);
    document.getElementById('downloader').code.value = encodeURIComponent(data);
    document.getElementById('downloader').submit()
    //alert(encodeURIComponent(data));
    //location.href = "/builder/downloader.php?code=" + encodeURIComponent(data) + "&title=" + encodeURIComponent(graph_title);
}

function getSetting() {
    var myCells = primitives();

    for (var i = 0; i < myCells.length; i++)
    {
        if (myCells[i].value.nodeName == "Setting") {
            return myCells[i];
        }
    }
    alert("Settings primitive could not be found.")
    return null;
}

function parseResult(res) {
    Ext.MessageBox.hide();
    if (!/[^\s]/.test(res)) {
        Ext.MessageBox.show({
            title: 'Simulation Timeout',
            msg: 'The simulation could not be completed as it took too long. Simulations will be automatically terminated after one minute of processing.',
            buttons: Ext.MessageBox.OK,
            animEl: 'mb9',
            icon: Ext.MessageBox.ERROR
        });
    } else if (/^SUCCESS/.test(res)) {

        var displays = primitives("Display");
        res = res.substring(7);
        if (/^ERROR/.test(res)) {
            res = res.substring(5);
            Ext.MessageBox.show({
                title: 'Model Error',
                msg: 'There is an error in your model that needs to be corrected before the simulation is run.<br/><br/><b>Details</b>:<br/><br/>' + res,
                buttons: Ext.MessageBox.OK,
                animEl: 'mb9',
                icon: Ext.MessageBox.ERROR
            });
        } else {
            var items = res.split("\n<sfrdiv>\n");
            var names = items[1].split("/");
            var cons = items[2];
            var tabs = [];
            if (/[^\s]/.test(cons)) {
                tabs.push({
                    title: "Console",
                    html: "<pre style='margin:.5em; font-size: medium; font-family: Georgia,Serif;'>" + cons + "</pre>"
                });
            }
            var tableCount = 0;

            for (var i = 0; i < names.length; i++)
            {
                tableCount++;
                var data = items[2 + tableCount];
                var rows = data.split("\n");
                var header = rows[0].replace(/\[/g, "(").replace(/\]/g, ")").split(",");
				
				
                var storeData = [];
                for (k = 1; k < rows.length; k++) {
                    if (Ext.String.trim(rows[k]) != "") {
                        var rowitems = rows[k].split(",");
                        storeData.push({});
                        for (j = 0; j < header.length; j++) {
                            storeData[k - 1][header[j]] = rowitems[j];
                        }
                    }
                }

                var storeFields;
                if (names[i] == "Steady State") {
                    storeFields = Ext.Array.map(header,
                    function(x) {
                        return {
                            type: "string",
                            name: x
                        };
                    });
                } else {
                    storeFields = Ext.Array.map(header,
                    function(x) {
                        return {
                            type: "float",
                            name: x
                        };
                    });
                }

                var store = new Ext.data.Store({
                    fields: storeFields,
                    data: storeData
                });
                if (names[i] == "Tabular" || names[i] == "Steady State") {
                    var cols = [];
                    for (var j = 0; j < header.length; j++) {
                        cols.push({
                            header: header[j],
                            sortable: true,
                            flex: 1,
                            dataIndex: header[j]
                        });
                    }
                    var grid = new Ext.grid.GridPanel({
                        store: store,
                        columns: cols,
                        stripeRows: true,
                        border: false,
                        frame: false,
                        header: false

                    });

                    tabs.push({
                        title: names[i + 1],
                        items: [grid],
                        layout: "fit"
                    });
                } else if (names[i] == "Time Series") {
                    var h2 = header;
                    var displayItems = h2.splice(1, h2.length - 1);

                    var chart = Ext.create("Ext.chart.Chart", {
                        xtype: 'chart',
                        animate: false,
                        shadow: false,
                        store: store,theme:"Category2",
                        legend: {
                            position: 'top'
                        },
                        axes: [{
                            type: 'Numeric',
                            position: 'bottom',
                            fields: h2[0],
                            title: quickLabel(displays[tableCount - 1].getAttribute("xAxis"), displays[tableCount - 1].getAttribute("name"), displayItems.join(", ")),
                            grid: true
                        },
                        {
                            type: 'Numeric',
                            position: 'left',
                            fields: displayItems,
                            grid: true,
                            title: quickLabel(displays[tableCount - 1].getAttribute("yAxis"), displays[tableCount - 1].getAttribute("name"), displayItems.join(", "))

                        }],
                        series: Ext.Array.map(displayItems,
                        function(x) {
                            return {
                                type: 'line',
                                axis: "left",
                                xField: h2[0],
                                yField: x,
                                showMarkers: false,
                                highlight: true,
                                highlight: {
                                    size: 7,
                                    radius: 7
                                },
                                smooth: false,
                                style: {
                                    'stroke-width': 3
                                },
                                tips: {
                                    trackMouse: true,
                                    width: 120,
                                    renderer: function(storeItem, item) {
                                        this.setTitle("<center>(" + item.value[0] + ", " + item.value[1] + ")</center>");
                                    }
                                }
                            };
                        })
                    });
                    tabs.push({
                        title: names[i + 1],
                        items: [chart],
                        layout: "fit"
                    });
                } else if (names[i] == "Scatterplot") {
                    var h2 = header;
                    var displayItems = h2.splice(1, h2.length - 1);

                    var chart = Ext.create("Ext.chart.Chart", {
                        xtype: 'chart',
                        animate: false,
                        shadow: false,
                        store: store,
                        axes: [{
                            type: 'Numeric',
                            position: 'bottom',
                            fields: displayItems[0],
                            grid: true,
                            title: quickLabel(displays[tableCount - 1].getAttribute("xAxis"), displays[tableCount - 1].getAttribute("name"), displayItems[0])
                        },
                        {
                            type: 'Numeric',
                            position: 'left',
                            fields: displayItems[1],
                            grid: true,
                            title: quickLabel(displays[tableCount - 1].getAttribute("yAxis"), displays[tableCount - 1].getAttribute("name"), displayItems[1])
                        }],
                        series: [{
                            type: 'scatter',
                            axis: "left",
                            xField: displayItems[0],
                            yField: displayItems[1],
                            highlight: true,
                            highlight: {
                                size: 7,
                                radius: 7
                            },
                            smooth: false,
                            tips: {
                                trackMouse: true,
                                width: 120,
                                renderer: function(storeItem, item) {
                                    this.setTitle("<center>(" + item.value[0] + ", " + item.value[1] + ")</center>");
                                }
                            }
                        }
                        ]
                    });
                    tabs.push({
                        title: names[i + 1],
                        items: [chart],
                        layout: "fit"
                    });
                }

                i++;
            }


            var charts = new Ext.TabPanel({
                margins: '3 3 3 0',
                activeTab: 0,
                deferredRender: false,
                frame: false,
                border: false,
                enableTabScroll: true,
                defaults: {
                    autoScroll: true
                },
                items: tabs
            });

            analysisCount++;
            var win = new Ext.Window({
                title: 'Simulation Results ' + analysisCount,
                closable: true,
                width: 540,
                height: 425,
                resizable: true,
                maximizable: true,
                layout: 'fit',
                items: [charts]
            });

            win.show();
        }
    } else if (/^ACCESS DENIED/.test(res)) {
        Ext.MessageBox.show({
            title: 'Create an Insight Maker Account',
            msg: 'You must create an Insight Maker account before you can run Insights. This is quick and free. Just go to:<br><br><a target="_BLANK" href="http://InsightMaker.com/user/register">http://InsightMaker.com/user/register</a><br><br>If you already have an account, you can log in here:<br><br><a target="_BLANK" href="http://InsightMaker.com/user">http://InsightMaker.com/user</a>',
            buttons: Ext.MessageBox.OK,
            animEl: 'mb9',
            icon: Ext.MessageBox.ERROR
        });
    } else {
        Ext.MessageBox.show({
            title: 'Server Error',
            msg: 'A server error occurred:<br/><br/>' + res + '',
            buttons: Ext.MessageBox.OK,
            animEl: 'mb9',
            icon: Ext.MessageBox.ERROR
        });
    }
}

function getText(obj) {
    if (document.all) {
        // IE;
        return obj.innerText;
    } else {
        return obj.textContent;
    }
}

function handelCursors() {
    if (nodeInsertSelected() == false) {
        graph.container.style.cursor = 'auto';
        //graph.graphHandler.setSelectEnabled(true);
    } else {
        graph.container.style.cursor = 'crosshair';
        //graph.graphHandler.setSelectEnabled(false);
    }
}

var propertiesWin;
function updateProperties() {
    var model_title;
    if (graph_title == "") {
        model_title = "Untitled Insight";
    } else {
        model_title = graph_title;
    }

    if (!propertiesWin) {
        propertiesWin = new Ext.Window({
            applyTo: 'property-win',
            layout: {type:'vbox', align:"stretch"},
            modal: true,
            width: 400,
            title: "Save Insight",
            height: 195,
            closable: false,
            resizable: false,
            closeAction: 'hide',
	        defaults: {
	            width: 230, labelWidth:110
	        },
            items: [new Ext.form.TextField({
	            fieldLabel: 'Insight Title',
	            name: 'sinsightTitle',
	            id: 'sinsightTitle',
	            allowBlank: false,
	            selectOnFocus: true,
	            value: model_title, margin:2
	        }), new Ext.form.TextField({
	            fieldLabel: 'Tags',
	            name: 'sinsightTags',
	            id: 'sinsightTags',
	            allowBlank: true,
	            emptyText: "Environment, Business, Engineering",
	            value: graph_tags, margin:2
	        }), new Ext.form.TextArea({
	            fieldLabel: 'Insight Description',
	            name: 'sinsightDescription',
	            id: 'sinsightDescription',
	            allowBlank: true,
	            emptyText: "Enter a brief description of the Insight.",
	            value: graph_description, margin:2
	        })],

            buttons: [{
                text: 'Save',
                handler: function() {
                    propertiesWin.hide();
                    graph_title = Ext.getCmp('sinsightTitle').getValue();
                    graph_description = Ext.getCmp('sinsightDescription').getValue();
                    graph_tags = Ext.getCmp('sinsightTags').getValue();
                    setSaveEnabled(true);
                    sendGraphtoServer(graph);
                }
            },
            {
                text: 'Cancel',
                handler: function() {
                    propertiesWin.hide();
                }
            }]


        });
    } else {
        if (graph_title != "") {
            Ext.getCmp('sinsightTitle').setValue(graph_title);
            Ext.getCmp('sinsightTags').setValue(graph_tags);
            Ext.getCmp('sinsightDescription').setValue(graph_description);
        }
    }
    propertiesWin.show();
}

function isTrue(item) {
    return (item != "false" && item != "No" && item != 0) && (item == 1 || item == -1 || item == "True" || item == "true" || item == true || item == "Yes");
}

function customUnits() {
    if (typeof(getSetting().getAttribute("Units")) != "undefined") {
        var rows = getSetting().getAttribute("Units").split("\n");
        for (var i = 0; i < rows.length; i++) {
            rows[i] = rows[i].split("<>");
        }
        return rows;
    } else {
        return [];
    }
}

function sliderPrimitives() {
    var myCells = primitives();
    var slids = [];
    for (var i = 0; i < myCells.length; i++) {
        if (isTrue(myCells[i].getAttribute("ShowSlider"))) {
            slids.push(myCells[i]);
        }
    }
    return slids;
}

function getValue(cell) {
    var n = cell.value.nodeName;
    if (n == "Stock") {
        return cell.getAttribute("InitialValue");
    } else if (n == "Flow") {
        return cell.getAttribute("FlowRate");
    } else if (n == "Parameter") {
        return cell.getAttribute("Equation");
    }
}

function setValue(cell, val) {
    if (getValue(cell) != val) {
        graph.getModel().beginUpdate();
        var n = cell.value.nodeName;
        var edit;
        if (n == "Stock") {
            edit = new mxCellAttributeChange(cell, "InitialValue", String(val));
        } else if (n == "Flow") {
            edit = new mxCellAttributeChange(cell, "FlowRate", String(val));
        } else if (n == "Parameter") {
            edit = new mxCellAttributeChange(cell, "Equation", String(val));
        }
        graph.getModel().execute(edit);
        graph.getModel().endUpdate();
    }
}

function orig(cell) {
    if (cell == null) {
        return null;
    }
    if (cell.value.nodeName == "Ghost") {
        return graph.getModel().getCell(cell.value.getAttribute("Source"));
    } else {
        return cell;
    }
}

function currentStyleIs(val) {
    var tmp = graph.getCellStyle(graph.getSelectionCell())[mxConstants.STYLE_FONTSTYLE];
    for (var i = 3; i >= 1; i--) {

        tmp = tmp - val * (Math.pow(2, i));
        if (tmp < 0) {
            tmp = tmp + val * Math.pow(2, i);
        }
    }
    return (tmp >= val);
}

function setStyles() {
    var selected = !graph.isSelectionEmpty();

    if (selected) {
        ribbonPanelItems().getComponent('style').getComponent('bold').toggle(currentStyleIs(mxConstants.FONT_BOLD));
        ribbonPanelItems().getComponent('style').getComponent('italic').toggle(currentStyleIs(mxConstants.FONT_ITALIC));
        ribbonPanelItems().getComponent('style').getComponent('underline').toggle(currentStyleIs(mxConstants.FONT_UNDERLINE));
        var style = graph.getCellStyle(graph.getSelectionCell());
        sizeCombo.setValue(style[mxConstants.STYLE_FONTSIZE]);
        fontCombo.setValue(style[mxConstants.STYLE_FONTFAMILY]);
    } else {
        ribbonPanelItems().getComponent('style').getComponent('bold').toggle(false);
        ribbonPanelItems().getComponent('style').getComponent('italic').toggle(false);
        ribbonPanelItems().getComponent('style').getComponent('underline').toggle(false);
        sizeCombo.setValue("");
        fontCombo.setValue("");
    }

}

function quickLabel(label, title, objects) {
    var setting = getSetting();

    return processLabel(label, title, objects, setting.getAttribute("TimeUnits"), setting.getAttribute("TimeStep"), setting.getAttribute("SolutionAlgorithm"));
}

function processLabel(label, title, objects, units, timeStep, algorithm) {
    var ph = "<PERCENTSIGNPLACEHOLDER>";
    label = replaceAll(label, "%%", ph);

    label = replaceAll(label, "%u", units);
    label = replaceAll(label, "%t", title);
    label = replaceAll(label, "%o", objects);
    label = replaceAll(label, "%ts", timeStep);
    label = replaceAll(label, "%a", algorithm);

    label = replaceAll(label, ph, "%");

    return label;
}

function replaceAll(txt, replace, with_this) {
    return txt.replace(new RegExp(replace, 'g'), with_this);
}

function loadBackgroundColor(){
	mainPanel.body.dom.style["background-color"] = getSetting().getAttribute("BackgroundColor");
	
	mainPanel.body.dom.style.backgroundColor = getSetting().getAttribute("BackgroundColor");
}