/*

Copyright 2010-2011 Give Team. All rights reserved.

Give Team is a non-profit organization dedicated to
using the internet to encourage giving and greater
understanding.

This file may distributed and/or modified under the
terms of the Insight Maker Public License.

Insight Maker and Give Team are trademarks.

*/

Ext.form.customFields['converter'] = Ext.extend(Ext.form.customFields['converter'], {


    onTriggerClick: function()
    {
        this.suspendEvents(false);
        this.editorWindow = new Ext.ConverterWindow({
            parent: this,
            oldKeys: this.getValue(),
            interpolation: graph.getSelectionCell().getAttribute("Interpolation")
        });
        this.editorWindow.show();
    },

    listeners: {
        'keydown': function(field)
        {
            field.setEditable(false);
        },
        'beforerender': function()
        {
            if (this.regex != undefined) {
                this.validator = function(value)
                {
                    return this.regex.test(value);
                };
            }

        }
    }
});



Ext.ConverterWindow = function(args)
 {
    var obj = this;

    obj.args = args;

    var discreteStore = null;
    function makeDiscrete() {
        var oldKeys = "";
        for (var i = 0; i < store.getCount(); i++)
        {
            if (i > 0) {
                oldKeys = oldKeys + ";";
            }
            oldKeys = oldKeys + store.getAt(i).data.xVal + "," + store.getAt(i).data.yVal;
        }
        var data = [];
        var items = oldKeys.split(";");
        var oldXY = [];
        for (var i = 0; i < items.length; i++) {
            var xy = items[i].split(",")
            if (i > 0) {
                data.push({
                    xVal: parseFloat(xy[0]),
                    yVal: parseFloat(oldXY[1])
                });
            }

            data.push({
                xVal: parseFloat(xy[0]),
                yVal: parseFloat(xy[1])
            });
            oldXY = xy;
        }

        if (discreteStore == null) {
            discreteStore = new Ext.data.Store({
                fields: dataFields,
                data: data
            });
        } else {
            discreteStore.removeAll();
            discreteStore.loadData(data);
        }
    }


    var data = [];
    var items = obj.args.oldKeys.split(";");
    for (var i = 0; i < items.length; i++) {
        var xy = items[i].split(",")
        data.push({
            xVal: parseFloat(xy[0]),
            yVal: parseFloat(xy[1])
        });
    }

    var dataFields = [{
        name: 'xVal',
        type: 'float'
    },
    {
        name: 'yVal',
        type: 'float'
    }];
    var store = new Ext.data.Store({
        fields: dataFields,
        data: data,
        sorters: ['xVal']
    });

    var editor = new Ext.grid.plugin.RowEditing({
        saveText: 'Apply'
    });

    var gridPan = new Ext.grid.GridPanel({
        store: store,
        width: 600,
        region: 'center',
        margins: '0 5 5 5',
        plugins: [editor],
        viewConfig: {
            headersDisabled: true,
            markDirty: false
        },
        tbar: [{
            iconCls: 'units-add-icon',
            text: 'Add Point',
            handler: function() {
                var e = {
                    xVal: 0,
                    yVal: 0
                };
                editor.completeEdit();
                var index = 0;
                store.insert(index, e);
                gridPan.getView().refresh();
                gridPan.getSelectionModel().selectRange(index, index);
                editor.startEdit(index, index);
            }
        },
        {
            id: "converterRemoveBut",
            iconCls: 'units-remove-icon',
            text: 'Remove Point',
            disabled: true,
            handler: function() {
                editor.completeEdit();
                var s = gridPan.getSelectionModel().getSelection();
                for (var i = 0, r; r = s[i]; i++) {
                    store.remove(r);
                }
            }
        }],

        columns: [
        new Ext.grid.RowNumberer(),
        {
            id: 'xVal',
            header: 'Input Value',
            dataIndex: 'xVal',
            flex: 1,
            sortable: false,
            menuDisabled: true,
            editor: {
                xtype: 'numberfield',
                allowBlank: false,
                decimalPrecision: 10
            }
        },
        {
            header: 'Output Value',
            dataIndex: 'yVal',
            flex: 1,
            sortable: false,
            menuDisabled: true,
            editor: {
                xtype: 'numberfield',
                allowBlank: false,
                decimalPrecision: 10
            }
        }
        ]
    });

    makeDiscrete();
    var chartStore;
    if (obj.args.interpolation == "Linear") {
        chartStore = store;
    } else {
        chartStore = discreteStore;
    }

    var sourceName = "";

    if (graph.getSelectionCell().getAttribute("Source") == "Time") {
        sourceName = "Time";
    } else {
        sourceName = getCellbyID(graph.getSelectionCell().getAttribute("Source")).getAttribute("name");
    }

    var chart = new Ext.Panel({
        width: 600,
        height: 200,
        layout: 'fit',
        margins: '5 5 0',
        region: 'north',
        split: true,
        minHeight: 100,
        maxHeight: 500,

        items: {
            xtype: 'chart',
            store: chartStore,
            animate: true,
            shadow: false,
            axes: [{
                type: 'Numeric',
                position: 'left',
                fields: ["yVal"],
                title: "Output",
                grid: true,
				labelTitle: {
					font: '14px Verdana'
				}
            },
            {
                type: 'Numeric',
                position: 'bottom',
                fields: ["xVal"],
                title: "Input (" + sourceName + ")",
                grid: true,
				labelTitle: {
					font: '14px Verdana'
				}
            }],

            series: [{
                type: 'line',
                axis: 'left',
                showMarkers: true,
                highlight: false,
                smooth: false,
                style: {
                    'stroke-width': 2
                },
                xField: 'xVal',
                yField: "yVal",
                tips: {
                    trackMouse: true,
                    width: 100,
                    renderer: function(storeItem, item) {
                        this.setTitle("<center>(" + item.value[0] + ", " + item.value[1] + ")</center>");
                    }
                }
            }]
        }
    });

    obj.win = new Ext.Window({
        title: 'Converter Data Specification',
        layout: 'border',
        closeAction: 'destroy',
        border: false,
        modal: true,
        resizable: false,
        shadow: true,
        buttonAlign: 'right',
        layoutConfig: {
            columns: 1
        },
        width: 508,
        height: 500,
        items: [chart, gridPan],
        buttons: [
        {
            scale: "large",
            iconCls: "cancel-icon",
            text: 'Cancel',
            handler: function()
            {
                obj.win.close();
                obj.args.parent.resumeEvents();
            }
        },
        {
            scale: "large",
            iconCls: "apply-icon",
            text: 'Apply',
            handler: function()
            {
                obj.args.parent.setValue(getKeys());
                obj.win.close();
                obj.args.parent.resumeEvents();
                grid.plugins[0].completeEdit();
            }
        }]

    });

    function getKeys() {
        var s = "";
        for (var i = 0; i < store.getCount(); i++)
        {
            if (i > 0) {
                s = s + ";";
            }
            s = s + store.getAt(i).data.xVal + "," + store.getAt(i).data.yVal;
        }
        return s
    }

    gridPan.getSelectionModel().on('selectionchange',
    function(sm) {
        Ext.getCmp("converterRemoveBut").setDisabled(sm.getCount() < 1);
    });



    store.on('update',
    function() {
        store.sort('xVal', 'ASC');
        makeDiscrete();
    });

    store.on('dataChanged',
    function() {
        makeDiscrete();
    });

    obj.show = function()
    {
        obj.win.show();
    }
}

