/*

Copyright 2010-2011 Give Team. All rights reserved.

Give Team is a non-profit organization dedicated to
using the internet to encourage giving and greater
understanding.

This file may distributed and/or modified under the
terms of the Insight Maker Public License.

Insight Maker and Give Team are trademarks.

*/

function ribbonPanelItems() {
    var z = ribbonPanel.getDockedItems()[0];
    return z;
}

function main() {
    setTopLinks();
    setSaveEnabled(false);
}

function confirmClose(override) {
    if (!ribbonPanelItems().getComponent('save').getComponent('savebut').disabled) {
        return "You have made unsaved changes to this interface. If you close now, they will be lost.";
    }
}

var refstore = new Ext.data.Store({
    storeId: 'myStore',
    idIndex: 1,
    fields: [{name:'type',type:"string"}, {name:'name',type:"string"}, {name:'data',type:"string"}, {name:'frame',type:"string"}],
    data: []
});

refstore.loadData(Ext.Array.map(storeData, function(x){
	return {type: x[0], name: x[1], data: x[2], frame: x[3]};
}));

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

var list = new Ext.grid.Panel({
	xtype:"grid",
    store: refstore,
    border: false,
    reserveScrollOffset: true,
    columns: [{
        text: '',
        flex: 1,xtype:'templatecolumn',
        dataIndex: 'type',
        sortable: false,
        tpl: "<img src='/builder/images/{type}.png'>"
    },
    {
        text: 'Name',
        flex: 4,
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

var listPanel = new Ext.Panel({
    region: 'west',
    split: false,
    layout: 'fit',
    width: 200,
    collapsible: false,
    bbar: [
    {
        iconCls: 'page-icon',
        text: 'Add Page',
        handler: function() {
            refstore.add({
                'type': 'page',
                'name': 'NewPage',
                'data': '',
                'frame': "Default"
            });
            setSaveEnabled(true);
        }
    },
    {
        iconCls: 'macro-icon',
        text: 'Add Macro',
        handler: function() {
            refstore.add({
                'type': 'macro',
                'name': 'NewMacro',
                'data': '',
                'frame': "None"
            });
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
    selectOnFocus: true,
    enableKeyEvents: true,
    fieldLabel: "Name",
    allowBlank: false,
    maskRe: /[\w\d]/,
    listeners: {
        'keyup': function(field, e) {
            if (field.getValue() != "") {
                var item = uiItem();
                list.getSelectionModel().getSelection()[0].set("name", field.getValue());
list.getSelectionModel().getSelection()[0].commit();
                setSaveEnabled(true);
            }
        }
    }
});

var codeArea = new Ext.form.TextArea({
    id: 'myCode',
    name: 'myCode',
    value: "",
    fieldLabel: "Code",
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
    queryMode: 'local',
    typeAhead: true,
    forceSelection: true,
    triggerAction: 'all',
    fieldLabel: "Frame",editable:true,
    store:  [["None", "No Frame"], ["Default", "Default Web Frame"]],
    listeners: {
        'select': function(field, e) {
            uiItem().data["frame"] = field.getValue();
            setSaveEnabled(true);
        }
    }
});

var editPanel = new Ext.Panel({
    region: 'center',
    split: false,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    collapsible: false,
    items: [nameField, codeArea, frameBox]
});


var ribbonPanel = new Ext.Panel({
    id: 'ribbonPanel',
    region: 'north',
    split: false,
    collapsible: false,
    border: false,
    tbar: [ {
            id: 'editGroup',
            xtype: 'buttongroup',
            columns: 1,
            height: 95,
            title: 'Edit',
            items: [{
                iconAlign: 'top',
                scale: 'large',
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
    padding: '19 5 5 5',
    items:
    [
        listPanel, editPanel, ribbonPanel]
});

setEnabled()

 function setEnabled() {
    if (uiItem() != null) {
        nameField.enable();
        codeArea.enable();
        Ext.getCmp('delete-but').enable();
        frameBox.enable();
		Ext.getCmp('testbut').enable();
    } else {
        nameField.disable();
        codeArea.disable();
        Ext.getCmp('delete-but').disable();
        frameBox.disable();
		Ext.getCmp('testbut').disable();
    }
}

function uiItem() {
    if (list.getSelectionModel().getCount() > 0) {
        items = list.getSelectionModel().getSelection();
        return (items[0]);
    } else {
        return null;
    }
}

function setSaveEnabled(e) {
    var b = ribbonPanelItems().getComponent('save').getComponent('savebut');
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

    return Ext.JSON.encode(saveData);
}

ribbonPanel.doComponentLayout();