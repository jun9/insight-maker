var modelRes;
function parseResult(res) {
    modelRes = res;
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
            var items = modelRes.split("<SFRDIV>");
            var ids = items[1].split(",");
            var data = items[2];
            var cons = items[3];
            var tabs = [];
            if (/[^\s]/.test(cons)) {
                tabs.push({
                    title: "Console",
                    html: "<pre style='margin:.5em; font-size: medium; font-family: Georgia,Serif;'>" + cons + "</pre>"
                });
            }

            var rows = data.split("\n");
            var header = rows[0].replace(/\[/g, "(").replace(/\]/g, ")").split(",");

            //Extjs can't handle square brackets. Used for units
            var times = [];
            var storeData = [];
            for (k = 1; k < rows.length; k++) {
                if (Ext.String.trim(rows[k]) != "") {
                    storeData.push({});

                    var rowitems = rows[k].split(",");
                    times.push(parseFloat(rowitems[0]));
                    for (j = 0; j < header.length; j++) {
                        storeData[k - 1]["a" + j] = parseFloat(rowitems[j]);
                    }
                    storeData[k - 1]["Time"] = k - 1;
                }
            }

            var storeFields = [];
            for (var i = 0; i < header.length; i++) {
                var n = "a" + i;
                storeFields.push({
                    type: "float",
                    name: n
                });
            }

            storeFields.push({
                type: "float",
                name: "Time"
            });
            var store = new Ext.data.Store({
                fields: storeFields,
                data: storeData
            });

            for (var i = 0; i < displays.length; i++) {
                tabs.push({
                    title: displays[i].getAttribute("name"),
                    items: [renderDisplay(displays[i], store, ids, header, times)],
                    layout: "fit",
                    display: displays[i]
                });
            }


            var rendered = new Ext.TabPanel({
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
                displays: displays,
                tabs: rendered,
                expandedState: true,
                store: store,
                primitiveIds: ids,
                primitiveNames: header,
                times: times,
                width: 540,
                height: 425,
                resizable: true,
                maximizable: true,
                minimizable: true,
                layout: 'fit',
                items: [rendered],

                tbar: [{
                    iconCls: "add-icon",
                    scale: "large",
                    text: 'Add Chart/Table',
                    handler: function()
                    {
                        var parent = graph.getDefaultParent();
                        var win = this.findParentByType("window");
                        var vertex;
                        graph.getModel().beginUpdate();
                        vertex = graph.insertVertex(parent, null, display.cloneNode(true), 10, 10, 64, 64, "display");
                        vertex.visible = false;
                        graph.getModel().endUpdate();
                        win.displays.push(vertex);
                        win.tabs.add({
                            title: vertex.getAttribute("name"),
                            items: [renderDisplay(vertex, win.store, win.primitveIds, win.primitiveNames, win.times)],
                            layout: "fit",
                            display: vertex
                        });
                        win.tabs.setActiveTab(primitives("Display").length - 1);
                    }
                },
                {
                    scale: "large",
                    iconCls: "big-delete-icon",
                    text: 'Delete Chart/Table',
                    handler: function()
                    {

                        var win = this.findParentByType("window");
                        if (win.displays.length > 0) {
                            var tabs = win.tabs;
                            var tabIndex = tabs.items.indexOf(tabs.getActiveTab());

                            graph.getModel().beginUpdate();
                            graph.removeCells([win.displays[tabIndex]], false);
                            graph.getModel().endUpdate();
                            win.displays.splice(tabIndex, 1);
                            tabs.remove(tabs.getActiveTab());

                        } else {

                            mxUtils.alert("No chart or table to delete");
                        }
                    }
                },
                '->', {
                    scale: "large",
                    iconCls: "configure-icon",
                    text: 'Configure',
                    handler: function()
                    {
                        var win = this.findParentByType("window");
                        if (win.displays.length > 0) {
                            openDisplayConfigure(win);
                        } else {
                            mxUtils.alert("Add a chart or table to configure it");
                        }
                    }
                }

                ]
            });
            win.on('minimize',
            function(w) {
                if (w.expandedState) {
                    w.expandedState = false;
                    w.collapse();
                    //collapse the window
                } else {

                    w.expandedState = true;
                    win.expand();
                }
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

var displayConfigWin;
var displayConfigStore;
function openDisplayConfigure(win) {

    if (!displayConfigWin) {
        displayConfigStore = new Ext.data.JsonStore({
            fields: [
            {
                name: 'pid',
                type: 'string'
            },
            {
                name: 'pname',
                type: 'string'
            }],
            data: []
        });
        displayConfigWin = new Ext.Window({
            layout: 'fit',
            modal: true,
            autoScroll: true,
            width: 400,
            title: "Chart/Table Configuration",
            height: 410,
            resizable: false,
            closeAction: 'hide',
            plain: true,
            items: [new Ext.FormPanel({
                fieldDefaults: {
                    labelWidth: 80
                },
                frame: true,
                autoScroll: true,
                id: 'displayConfigure',

                bodyStyle: 'padding:5px 5px 0',
                width: 450,
                defaults: {
                    width: 365
                },

                items: [

                {
                    xtype: 'fieldset',
                    title: 'General Settings',
                    defaultType: 'textfield',
                    defaults: {
                        anchor: '100%'
                    },
                    layout: 'anchor',
                    items: [{
                        fieldLabel: 'Title',
                        id: 'chartTitle',
                        name: 'chartTitle',
                        allowBlank: false,
                        regex: /^[a-zA-Z][a-zA-Z0-9 ]*$/,
                        regexText: "Only letters, numbers and spaces allowed"
                    },
                    Ext.create('Ext.form.ComboBox', {
                        fieldLabel: 'Type',
                        name: 'chartType',
                        id: 'chartType',
                        allowBlank: false,
                        store: ["Time Series", "Scatterplot", "Tabular"],
                        queryMode: 'local',
                        forceSelection: true,
                        listeners: {
                            change: function(t, newV, oldV) {
                                if (t.validate()) {
                                    if (newV == "Scatterplot") {
                                        Ext.getCmp("xAxisLabel").setValue("%o");
                                        Ext.getCmp("yAxisLabel").setValue("%o");
                                    } else if (newV == "Time Series") {
                                        Ext.getCmp("xAxisLabel").setValue("Time (%u)");
                                        Ext.getCmp("yAxisLabel").setValue("");
                                    }
                                }
                            }
                        }
                    }),
                    Ext.create('Ext.ux.form.field.BoxSelect', {
                        fieldLabel: 'Data',
                        name: 'chartPrimitives',
                        id: 'chartPrimitives',
                        displayField: 'pname',
                        valueField: 'pid',
                        queryMode: 'local',
                        store: displayConfigStore,
                        emptyText: 'Select which data to display'
                    }),
					                {xtype:'checkboxfield',
					                    fieldLabel  : 'Add New',
					                    name      : 'autoAdd',
					                    id        : 'autoAdd', boxLabel: "Add series when primitives are created"
					                }

                    ]
                },

                {
                    xtype: 'fieldset',
                    title: 'Chart Settings',
                    defaultType: 'textfield',
                    defaults: {
                        anchor: '100%'
                    },
                    layout: 'anchor',
                    items: [{
                        fieldLabel: 'X-Axis Label',
                        id: 'xAxisLabel',
                        name: 'xAxisLabel'
                    },
                    {
                        fieldLabel: 'Y-Axis Label',
                        id: 'yAxisLabel',
                        name: 'yAxisLabel'
                    },
                    {
                        xtype: "displayfield",
                        labelAlign: 'center',
                        fieldLabel: 'Label Tips',
                        value: "<i>%u - Current Time Units | %o - Selected Primitives | %% - A Single '%'</i>"
                    }

                    ]
                }
                ]
            })],

            buttons: [{
                scale: "large",
                iconCls: "cancel-icon",
                text: 'Cancel',
                handler: function() {
                    displayConfigWin.hide();
                }
            },
            {
                iconCls: "apply-icon",
                scale: "large",
                text: 'Apply',
                handler: function() {
                    var d = displayConfigWin.myDisplay;
                    var w = displayConfigWin.myWin;
                    if (Ext.getCmp("chartTitle").validate() && Ext.getCmp("chartType").validate() && Ext.getCmp("chartPrimitives").validate()) {

                        graph.getModel().beginUpdate();
                        d.setAttribute("name", Ext.getCmp("chartTitle").getValue());
                        w.tabs.getActiveTab().setTitle(Ext.getCmp("chartTitle").getValue());
                        d.setAttribute("Type", Ext.getCmp("chartType").getValue());
                        d.setAttribute("AutoAddPrimitives", Ext.getCmp("autoAdd").getValue());

                        d.setAttribute("xAxis", Ext.getCmp("xAxisLabel").getValue());
                        d.setAttribute("yAxis", Ext.getCmp("yAxisLabel").getValue());
                        d.setAttribute("xAxis", Ext.getCmp("xAxisLabel").getValue());

                        d.setAttribute("Primitives", Ext.getCmp("chartPrimitives").getValue().join(","));
                        w.tabs.getActiveTab().removeAll();
                        w.tabs.getActiveTab().add(renderDisplay(d, w.store, w.primitiveIds, w.primitiveNames, w.times));
                        displayConfigWin.hide();

                        graph.getModel().endUpdate();
                    } else {
                        mxUtils.alert("Correct display configuration before applying.");
                    }
                }
            }

            ]
        });

    }

    var storeData = [];
    for (var i = 0; i < win.primitiveIds.length; i++) {
        storeData.push({
            pid: win.primitiveIds[i],
            pname: win.primitiveNames[i + 1]
        });
    }
    displayConfigStore.loadData(storeData);
    var d = win.tabs.getActiveTab().display;
    Ext.getCmp("chartTitle").setValue(d.getAttribute("name"));
    Ext.getCmp("chartType").setValue(d.getAttribute("Type"));
    Ext.getCmp("xAxisLabel").setValue(d.getAttribute("xAxis"));
    Ext.getCmp("yAxisLabel").setValue(d.getAttribute("yAxis"));
	
    Ext.getCmp("autoAdd").setValue(d.getAttribute("AutoAddPrimitives"));
	
        Ext.getCmp("chartPrimitives").setValue([]);
    if (!isUndefined(d.getAttribute("Primitives"))) {
        Ext.getCmp("chartPrimitives").setValue(d.getAttribute("Primitives").split(","));
    }
    displayConfigWin.myDisplay = d;
    displayConfigWin.myWin = win;
    displayConfigWin.show();
}



function renderDisplay(display, store, ids, names, times) {
    var type = display.getAttribute("Type");
    if (isUndefined(display.getAttribute("Primitives")) || display.getAttribute("Primitives").split(",").length == 0 || (type == "Scatterplot" && display.getAttribute("Primitives").split(",").length < 2)) {
        return {
            xtype: "box",
            html: "<br/><br/><br/><b><big><center><span style='color:darkgray'>No data to display<br/><br/>Press 'Configure' to select data</span></center></big></b>"
        };
    }
    var primitives = display.getAttribute("Primitives").split(",");

    if (type == "Tabular") {
        var cols = [{
            header: names[0],
            sortable: true,
            flex: 1,
            dataIndex: "a0"
        }];
        for (var j = 0; j < primitives.length; j++) {

            cols.push({
                header: names[ids.indexOf(primitives[j]) + 1],
                sortable: true,
                flex: 1,
                dataIndex: "a" + (ids.indexOf(primitives[j]) + 1)
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

        return grid;
    } else if (type == "Time Series") {
        var displayIds = [];
        var displayNames = [];
        var displaySeries = [];
        for (var j = 0; j < primitives.length; j++) {
            displayIds.push("a" + (ids.indexOf(primitives[j]) + 1));
            displayNames.push(names[ids.indexOf(primitives[j]) + 1]);
            displaySeries.push({
                type: 'line',
                axis: "left",
                xField: "Time",
                yField: displayIds[displayIds.length - 1],
                title: displayNames[displayNames.length - 1],
                showMarkers: true,
                smooth: false,
                markerConfig: {
                    type: 'circle',
                    radius: 3
                },
                style: {
                    'stroke-width': 3
                },
                tips: {
                    trackMouse: true,
                    width: 120,
                    renderer: function(storeItem, item) {
                        this.setTitle("<center>(" + times[item.value[0]] + ", " + item.value[1] + ")</center>");
                    }
                }
            });
        }

        var chart = Ext.create("Ext.chart.Chart", {
            xtype: 'chart',
            animate: false,
            shadow: false,
            store: store,
            theme: "Category2",
            legend: {
                position: 'top',
                boxStroke: "#fff"
            },
            axes: [{
                type: 'Numeric',
                position: 'bottom',
                fields: "Time",
                title: quickLabel(display.getAttribute("xAxis"), display.getAttribute("name"), displayNames.join(", ")),
                grid: true,
                labelTitle: {
                    font: '12px Verdana'
                },
                label: {
                    renderer: function(x) {
                        return times[x];
                    }
                }
            },
            {
                type: 'Numeric',
                position: 'left',
                fields: displayIds,
                grid: true,
                title: quickLabel(display.getAttribute("yAxis"), display.getAttribute("name"), displayNames.join(", ")),
                labelTitle: {
                    font: '12px Verdana'
                }
            }],
            series: displaySeries
        });

        return chart;

    } else if (type == "Scatterplot") {
        var displayIds = [];
        var displayNames = [];
        for (var j = 0; j < primitives.length; j++) {
            displayIds.push("a" + (ids.indexOf(primitives[j]) + 1));
            displayNames.push(names[ids.indexOf(primitives[j]) + 1]);
        }

        var chart = Ext.create("Ext.chart.Chart", {
            xtype: 'chart',
            animate: false,
            shadow: false,
            store: store,
            axes: [{
                type: 'Numeric',
                position: 'bottom',
                fields: displayIds[0],
                grid: true,
                title: quickLabel(display.getAttribute("xAxis"), display.getAttribute("name"), displayNames[0]),
                labelTitle: {
                    font: '12px Verdana'
                }
            },
            {
                type: 'Numeric',
                position: 'left',
                fields: displayIds[1],
                grid: true,
                title: quickLabel(display.getAttribute("yAxis"), display.getAttribute("name"), displayNames[1]),
                labelTitle: {
                    font: '12px Verdana'
                }
            }],
            series: [{
                type: 'scatter',
                axis: "left",
                xField: displayIds[0],
                yField: displayIds[1],
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

        return chart;
    }
}