/*

Copyright 2010 Give Team. All rights reserved.

Give Team is a non-profit organization dedicated to
using the internet to encourage giving and greater
understanding.

This file may distributed and/or modified under the
terms of the Insight Maker Public License.

Insight Maker and Give Team are trademarks.

*/

function main() {
    setTopLinks();
    setSaveEnabled(false);
}

function confirmClose(override) {
    if (!ribbonPanel.getTopToolbar().items.get('save').get('savebut').disabled) {
        return "You have made unsaved changes to this interface. If you close now, they will be lost.";
    }
}

var refstore = new Ext.data.ArrayStore({
    autoDestroy: true,
    storeId: 'myStore',
    idIndex: 1,
    fields: ['type', 'name', 'data', 'frame'],
    data: storeData
});

function ReplaceAll(Source,stringToFind,stringToReplace){
  var temp = Source;
    var index = temp.indexOf(stringToFind);
        while(index != -1){
            temp = temp.replace(stringToFind,stringToReplace);
            index = temp.indexOf(stringToFind);
        }
        return temp;
}

refstore.each(function(r) {
    r.data["data"]=ReplaceAll(r.data["data"],"scriptscript","script");
});

var list = new Ext.ListView({
    store: refstore,
    multiSelect: false,
    singleSelect: true,
    mode: 'local',
    deferEmptyText: false,
    emptyText: '<div style="padding: 0.4em">No user interface elements. Start by adding a new page...</div>',
    border: true,
    reserveScrollOffset: true,
    columns: [{
        header: '',
        width: 0.13,
        dataIndex: 'type',
        sortable: false,
        tpl: "<img src='/builder/images/{type}.png'>"
    },
    {
        header: 'Name',
        width: 0.7,
        dataIndex: 'name',
        sortable: false
    }],
    listeners: {
        'selectionChange': function(view, selections) {
            if (uiItem() != null) {
                nameField.setValue(uiItem().data["name"]);
                codeArea.setValue(uiItem().data["data"]);
                frameBox.setValue(uiItem().data["frame"]);
                setEnabled()
            } else {
                setEnabled();
                codeArea.setValue("");
                nameField.setValue("");
                frameBox.setValue("");
            }
        }
    }
});

var myRecordDef = refstore.recordType;
var listPanel = new Ext.Panel({
    region: 'west',
    split: false,
    layout: 'fit',
    width: 200,
    collapsible: false,
    margins: '3 0 3 3',
    cmargins: '3 3 3 3',
    bbar: [
    {
        iconCls: 'page-icon',
        text: 'Add Page',
        handler: function() {
            refstore.add(new myRecordDef({
                'type': 'page',
                'name': 'NewPage',
                'data': '',
                'frame': "Default"
            }));
            setSaveEnabled(true);
        }
    },
    {
        iconCls: 'macro-icon',
        text: 'Add Macro',
        handler: function() {
            refstore.add(new myRecordDef({
                'type': 'macro',
                'name': 'NewMacro',
                'data': '',
                'frame': "None"
            }));
            setSaveEnabled(true);
        }
    },
    '->', {
        id: 'delete-but',
        iconCls: 'delete-icon',
        cls: 'x-btn-icon',
        handler: function() {
            refstore.remove(uiItem());
            setSaveEnabled(true);
        }
    }
    ],
    items: list
});


var nameField = new Ext.form.TextField({
    id: 'nameField',
    name: 'nameField',
    region: 'north',
    selectOnFocus: true,
    enableKeyEvents: true,
    fieldLabel: "Name",
    allowBlank: false,
    maskRe: /[\w\d]/,
    listeners: {
        'keyup': function(field, e) {
            if (field.getValue() != "") {
                var item = uiItem();
                item.data["name"] = field.getValue();
                list.refreshNode(list.getSelectedIndexes()[0]);
                setSaveEnabled(true);
            }
        }
    }
});

var codeArea = new Ext.form.TextArea({
    id: 'myCode',
    name: 'myCode',
    region: 'center',
    value: "",
    enableKeyEvents: true,
    listeners: {
        'keyup': function(field, e) {
            uiItem().data["data"] = field.getValue();
            setSaveEnabled(true);
        }
    },
    flex: 1
});


var frameBox = new Ext.form.ComboBox({
    id: 'fCombo',
    name: 'fCombo',
    region: 'south',
    mode: 'local',
    typeAhead: true,
    forceSelection: true,
    triggerAction: 'all',
    fieldLabel: "Frame",
    store: new Ext.data.ArrayStore({
        id: 0,
        fields: [
        'myId',
        'displayText'
        ],
        data: [["None", "No Frame"], ["Default", "Default Web Frame"]]
    }),
    listeners: {
        'select': function(field, e) {
            uiItem().data["frame"] = field.getValue();
            setSaveEnabled(true);
        }
    },
    valueField: 'myId',
    displayField: 'displayText'
});

var editPanel = new Ext.Panel({
    region: 'center',
    split: false,
    layout: 'vbox',
    layoutConfig: {
        align: 'stretch',
        pack: 'start',
    },
    collapsible: false,
    margins: '3 0 3 3',
    cmargins: '3 3 3 3',
    items: [nameField, codeArea, frameBox]
});

var ribbonPanel = new Ext.Panel({
    id: 'ribbonPanel',
    region: 'north',
    layout: 'fit',
    split: true,
    items: this.graphPanel,
    split: false,
    width: 230,
    collapsible: false,
    border: true,
    tbar: [ {
            id: 'editGroup',
            xtype: 'buttongroup',
            columns: 1,
            height: 95,
            title: 'Edit',
            items: [{
                iconAlign: 'top',
                scale: 'large',
                cls: 'x-btn-as-arrow',
                rowspan: 3,
                text: 'Test Item',
                iconCls: 'test-icon',
                tooltip: 'Test the page or macro in a new window',
                id: 'testbut',
                handler: function()
                {
                	window.open("http://InsightMaker.com/insight/" + drupal_node_ID + "/view/" + uiItem().data["name"],'Test Window','width=400,height=200,toolbar=yes,location=yes,directories=yes,status=yes,menubar=yes,scrollbars=yes,copyhistory=yes,resizable=yes');
                },
                scope: this
            }]},
        '->',
    {
        id: 'save',
        xtype: 'buttongroup',
        columns: 1,
        height: 95,
        title: 'Save',
        items: [{
            iconAlign: 'top',
            scale: 'large',
            cls: 'x-btn-as-arrow',
            rowspan: 3,
            text: 'Save Interface',
            iconCls: 'save-icon',
            tooltip: 'Save Interface',
            id: 'savebut',
            handler: function()
            {
                Ext.Ajax.request({
                    url: '/builder/SaveDesigner.php',
                    method: 'POST',
                    params: {
                        data: flattenUI(),
                        nid: drupal_node_ID
                    },

                    success: function(result, request) {
                        setSaveEnabled(false);
                    },
                    failure: function(result, request) {
                        Ext.MessageBox.show({
                            title: 'Error',
                            msg: 'The Insight UI could not be saved. Please try again later.',
                            buttons: Ext.MessageBox.OK,
                            animEl: 'mb9',
                            icon: Ext.MessageBox.ERROR
                        });
                    }
                });
            },
            scope: this
        }]
    }
    ]
});

var viewport = new Ext.Viewport(
{
    layout: 'border',
    items:
    [{
        xtype: 'panel',
        margins: '24 5 5 5',
        region: 'center',
        layout: 'border',
        split: true,
        border: false,
        items:
        [
        listPanel, editPanel, ribbonPanel
        ]
    }
    ]
});

setEnabled()

 function setEnabled() {
    if (uiItem() != null) {
        nameField.enable();
        codeArea.enable();
        Ext.getCmp('delete-but').enable();
        frameBox.enable();
    } else {
        nameField.disable();
        codeArea.disable();
        Ext.getCmp('delete-but').disable();
        frameBox.disable();
    }
}

function uiItem() {
    if (list.getSelectionCount() > 0) {
        items = list.getSelectedRecords();
        return (items[0]);
    } else {
        return null;
    }
}

function setSaveEnabled(e) {
    var b = ribbonPanel.getTopToolbar().items.get('save').get('savebut');
    if (e) {
        b.setDisabled(false);
        b.setText('Save Interface');
    } else {
        b.setDisabled(true);
        b.setText('Interface Saved');
    }
}

function flattenUI() {
    var saveData = [];
    refstore.each(function(r) {
        saveData.push([r.data["type"], r.data["name"], r.data["data"], r.data["frame"]]);
    });

    return Ext.util.JSON.encode(saveData);
}