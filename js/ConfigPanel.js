/*

Copyright 2010-2011 Give Team. All rights reserved.

Give Team is a non-profit organization dedicated to
using the internet to encourage giving and greater
understanding.

This file may distributed and/or modified under the
terms of the Insight Maker Public License.

Insight Maker and Give Team are trademarks.

*/

Ext.onReady(function() {
    Ext.getBody().createChild({
        tag: 'style',
        type: 'text/css',
        html: '.x-props-grid .x-item-disabled .x-grid-cell-inner {color: gray !important; font-style: italic !important}'
    });
})

 var converterStore = Ext.create('Ext.data.Store', {
    fields: [{
        type: 'string',
        name: 'myId'
    },
    {
        type: 'string',
        name: 'displayText'
    }],
    data: []
});

var selectedPrimitive = null;

var grid;

function getRenderer(item) {
    if ("renderer" in item) {
        return item.renderer;
    }

    var val = item.value;
    if (typeof val == 'boolean') {
        return function(bval) {
            if (isTrue(bval)) {
                return 'Yes';
            } else {
                return 'No';
            }
        };
    }

    return false;
}

function getEditor(item) {
    if ("editor" in item) {
        return item.editor;
    }
    var val = item.value;
    if (val instanceof Date) {
        return new Ext.form.DateField({
            selectOnFocus: true
        });
    } else if (typeof val == 'number') {
        return Ext.create('Ext.form.field.Number', {
            selectOnFocus: true
        });
    } else if (typeof val == 'boolean') {
        return new Ext.form.ComboBox({
            triggerAction: "all",
            store: [["false", "No"], ["true", "Yes"]],
            selectOnFocus: true, editable: false
        });
    } else {
        return new Ext.form.TextField({
            selectOnFocus: true
        });
    }
}

function createGrid(properties, description) {
    if (properties.length > 0) {
        var data = [];
        var nameDisplayPairs = [];
        var editors = [];
        var renderers = [];
        for (i = 0; i < properties.length; i++) {
            data.push({
                id: properties[i].name,
                name: properties[i].name,
                text: properties[i].text,
                value: properties[i].value,
                group: properties[i].group
            });

            if (typeof data[i].value == 'boolean') {
                data[i].value = isTrue(data[i].value).toString();
            }
            nameDisplayPairs[properties[i].name] = properties[i].text;

            editors[properties[i].name] = getEditor(properties[i]);
            if (getRenderer(properties[i]) != false) {
                renderers[properties[i].name] = getRenderer(properties[i]);
            }
        }


        // create the data store
        var gstore = Ext.create('Ext.data.Store', {
            fields: [{
                name: 'name',
                type: 'string'
            },
            {
                name: 'text',
                type: 'string'
            },
            {
                name: 'value',
                type: 'string'
            },
            {
                name: 'group',
                type: 'string'
            }],
            data: data,
            groupers: [{
                property: "group"
            }]
        });

        handleGridEnables(gstore);

        var groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
            groupHeaderTpl: '{name}', collapse:Ext.emptyFn
        });

        grid = Ext.create('Ext.grid.property.Grid', {
            width: panel_width,
            store: gstore,hideHeaders:true,
            border: false,
            id: 'propGrid',
            features: [groupingFeature],
            propertyNames: nameDisplayPairs,
            customEditors: editors,
            customRenderers: renderers,
            viewConfig: {
                getRowClass: function(record) {
                    return (record.data['disabled'] == true) ? "x-item-disabled": "";
                }
            }
        });

        configPanel.add(grid);

        grid.plugins[0].on(
        "edit",
        function(editor, e) {
            if (is_editor) {
                var itemId = (e.record.get("name"));
                e.record.commit();
                graph.getModel().beginUpdate();
                try
                {
                    if (isPrimitive(selectedPrimitive) && itemId == "name" && (!(validPrimitiveName(String(e.value)) || selectedPrimitive.value.nodeName == "Link" || selectedPrimitive.value.nodeName == "Folder"))) {
                        mxUtils.alert("Primitive names must only contain numbers, letters and spaces; and they must start with a letter.");
                    } else {
                        var edit = new mxCellAttributeChange(
                        selectedPrimitive, itemId,
                        String(e.value));
                        graph.getModel().execute(edit);
                    }

                    if (selectedPrimitive.value.nodeName == "Flow") {
                        if (isTrue(selectedPrimitive.getAttribute("OnlyPositive"))) {
                            graph.setCellStyles(mxConstants.STYLE_STARTARROW, "");
                        } else {
                            graph.setCellStyles(mxConstants.STYLE_STARTARROW, mxConstants.ARROW_OPEN);
                        }
                    }
                    if (selectedPrimitive.value.nodeName == "Link") {
                        if (!isTrue(selectedPrimitive.getAttribute("BiDirectional"))) {
                            graph.setCellStyles(mxConstants.STYLE_STARTARROW, "");
                        } else {
                            graph.setCellStyles(mxConstants.STYLE_STARTARROW, mxConstants.ARROW_CLASSIC);
                        }
                    }
                    if (itemId == "Image" || itemId == "FlipHorizontal" || itemId == "FlipVertical") {
                        setPicture(selectedPrimitive);
                    }
                    if (selectedPrimitive.value.nodeName == "Display") {
                        if (itemId == "Type") {
                            if (e.value == "Time Series") {
                                var edit = new mxCellAttributeChange(selectedPrimitive, "xAxis", "Time (%u)");
								getGridRecord(grid.store, "xAxis").set("value", "Time (%u)");
                                graph.getModel().execute(edit);
                            } else if (e.value == "Scatterplot") {
                                var edit = new mxCellAttributeChange(selectedPrimitive, "xAxis", "%o");
								getGridRecord(grid.store, "xAxis").set("value", "%o");
                                graph.getModel().execute(edit);
                                var items = selectedPrimitive.value.getAttribute("Primitives").split(",");
                                if (items.length > 2) {
                                    items.length = 2;
                                    var edit = new mxCellAttributeChange(selectedPrimitive, "Primitives", items.join(","));
									
									getGridRecord(grid.store, "Primitives").set("value", items.join(","));
                                    graph.getModel().execute(edit);
                                }
                            }
                        }
                    }

                }
                finally
                {
                    graph.getModel().endUpdate();
                }
                handleGridEnables();
            }
        });



    }

	configPanel.add(Ext.create('Ext.Component', {
        xtype: "component",
        html: description,
        margin: '5 5 5 5'
    }));

}


function handleGridEnables(gstore) {
    var store;
    if (gstore != null) {
        store = gstore;
    }
    else {
        var store = grid.getStore();
    }

    if (selectedPrimitive.value.nodeName == "Stock") {
        if (selectedPrimitive.getAttribute("StockMode") == "Store") {
            getGridRecord(store, 'Volume').set('disabled', true);
            getGridRecord(store, 'Delay').set('disabled', true);
        } else if (selectedPrimitive.getAttribute("StockMode") == "Tank") {
            getGridRecord(store, 'Volume').set('disabled', false);
            getGridRecord(store, 'Delay').set('disabled', true);
        } else if (selectedPrimitive.getAttribute("StockMode") == "Conveyor") {
            getGridRecord(store, 'Volume').set('disabled', true);
            getGridRecord(store, 'Delay').set('disabled', false);
        }
    }
    if (selectedPrimitive.value.nodeName == "Display") {
        var isntChart = !(selectedPrimitive.getAttribute("Type") == "Scatterplot" || selectedPrimitive.getAttribute("Type") == "Time Series");
        getGridRecord(store, 'xAxis').set('disabled', isntChart);
        getGridRecord(store, 'yAxis').set('disabled', isntChart);
        getGridRecord(store, 'ScatterplotOrder').set('disabled', selectedPrimitive.getAttribute("Type") != "Scatterplot");
    }

    if (isValued(selectedPrimitive)) {
        getGridRecord(store, 'MaxConstraint').set('disabled', !isTrue(selectedPrimitive.getAttribute("MaxConstraintUsed")));
        getGridRecord(store, 'MinConstraint').set('disabled', !isTrue(selectedPrimitive.getAttribute("MinConstraintUsed")));
        if (selectedPrimitive.value.nodeName != "Converter") {
            getGridRecord(store, 'SliderMax').set('disabled', !isTrue(selectedPrimitive.getAttribute("ShowSlider")));
            getGridRecord(store, 'SliderMin').set('disabled', !isTrue(selectedPrimitive.getAttribute("ShowSlider")));
        }
    }
}


var panel_width;

ConfigPanel = function()
 {
    if (is_embed) {
        panel_width = 210;
    } else {
        panel_width = 300;
    }

    return (
    {
        id: 'configPanel',
        region: 'east',
        width: panel_width,
        split: true,autoScroll:false,
        collapsible: true,
        title: "Configuration",
        border: true,
        layout: {
            type: "vbox",
            align: "stretch"
        }
    });


};

function getGridRecord(store, name) {
    return store.getAt(store.findBy(function(x) {
        return x.data.name == name
    }));
}
