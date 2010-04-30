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

var converterStore = new Ext.data.ArrayStore({
    id: 0,
    fields: [
    'myId',
    'displayText'
    ],
    data: []
});

var selectedPrimitive = null;
converterSourceList = new Ext.grid.GridEditor(new Ext.form.ComboBox({
    triggerAction: "all",
    mode: 'local',
    store: converterStore,
    selectOnFocus: true,
    valueField: 'myId',
    displayField: 'displayText'
}));

var grid;

function createGrid(properties) {
    if (grid) {
        grid.destroy();
    }
    if (properties.length > 0) {
        var data = {
            properties: properties
        };


        // create the data store
        var gstore = new Ext.data.GroupingStore({
            recordType: Ext.ux.wam.PropertyRecord,
            groupField: 'group',
            sortInfo: {
                field: 'name',
                direction: 'ASC'
            },
            reader: new Ext.data.JsonReader({
                id: 'name',
                root: 'properties'
            },
            Ext.ux.wam.PropertyRecord)
        });
        gstore.loadData(data);
        handleGridEnables(gstore);



        grid = new Ext.ux.wam.PropertyGrid({
            autoHeight: true,
            width: 300,
            store: gstore,
            border: false,
            forceFit: true,
            renderTo: "gridArea",
            id: 'propGrid',
            view: new Ext.grid.GroupingView({
                forceFit: true,
                emptyGroupText: 'No Group',
                enableGroupingMenu: false,
                showGroupName: false,
                getRowClass: function(record) {
                    return (record.data['disabled'] == true) ? "x-item-disabled": "";
                }
            }),
            listeners: {
                "afteredit": {
                    fn:
                    function(e) {
                   		if(is_editor){
                        e.record.commit();
                        
                        graph.getModel().beginUpdate();
                        try
                        {
                            if (isPrimitive(selectedPrimitive) && e.record.id == "name" && (!validPrimitiveName(String(e.value)))) {
                                mxUtils.alert("Primitive names must only contain numbers, letters and spaces; and they must start with a letter.");
                            } else {
                                var edit = new mxCellAttributeChange(
                                selectedPrimitive, e.record.id,
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
                            if (selectedPrimitive.value.nodeName == "Picture") {
                                setPicture(selectedPrimitive);
                            }
                            if (selectedPrimitive.value.nodeName == "Display") {
                            	if (e.record.id == "Type"){
                            		if(e.value == "Time Series"){
                            			var edit = new mxCellAttributeChange(selectedPrimitive, "xAxis", "Time (%u)");
                            			graph.getModel().execute(edit);
                            		}else if(e.value=="Scatterplot"){
                            			var edit = new mxCellAttributeChange(selectedPrimitive, "xAxis", "%o");
                            			graph.getModel().execute(edit);
                            			var items = selectedPrimitive.value.getAttribute("Primitives").split(",");
                            			if (items.length > 2){
                            				items.length=2;
                            				var edit = new mxCellAttributeChange(selectedPrimitive, "Primitives", items.join(","));
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
                    }
                }
            }

        });


        var gridHead = grid.getGridEl().child('div[class=x-grid3-header]');
        gridHead.setStyle('display', 'none');

    }

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
            store.getById('Volume').set('disabled', true);
            store.getById('Delay').set('disabled', true);
        } else if (selectedPrimitive.getAttribute("StockMode") == "Tank") {
            store.getById('Volume').set('disabled', false);
            store.getById('Delay').set('disabled', true);
        } else if (selectedPrimitive.getAttribute("StockMode") == "Conveyor") {
            store.getById('Volume').set('disabled', true);
            store.getById('Delay').set('disabled', false);
        }
    }
    if (selectedPrimitive.value.nodeName == "Display") {
        var isntChart = !(selectedPrimitive.getAttribute("Type") == "Scatterplot" || selectedPrimitive.getAttribute("Type") == "Time Series");
        store.getById('ThreeDimensional').set('disabled', isntChart);
        store.getById('xAxis').set('disabled', isntChart);
        store.getById('yAxis').set('disabled', isntChart);
        store.getById('ScatterplotOrder').set('disabled', selectedPrimitive.getAttribute("Type") != "Scatterplot");
    }

    if (isValued(selectedPrimitive)) {
        store.getById('MaxConstraint').set('disabled', !isTrue(selectedPrimitive.getAttribute("MaxConstraintUsed")));
        store.getById('MinConstraint').set('disabled', !isTrue(selectedPrimitive.getAttribute("MinConstraintUsed")));
        if(selectedPrimitive.value.nodeName != "Converter"){
        	store.getById('SliderMax').set('disabled', !isTrue(selectedPrimitive.getAttribute("ShowSlider")));
       		store.getById('SliderMin').set('disabled', !isTrue(selectedPrimitive.getAttribute("ShowSlider")));
        }
    }
}

ConfigPanel = function()
 {
	var panel_width;
	if(is_embed){
		panel_width=180;
	}else{
		panel_width=300;
	}
	
    ConfigPanel.superclass.constructor.call(this,
    {
        id: 'configPanel',
        region: 'east',
        layout: 'fit',
        items: this.graphPanel,
        width: panel_width,
        split: false,
        collapsible: false,
        title: "Configuration",
        border: true,
        bodyCfg: {cls: 'x-panel-body', style: {'overflow-x': 'hidden', 'overflow-y':'auto'}},
        html: "<div id='gridArea' name='gridArea'></div><div id='descriptionArea' name='descriptionArea' style='padding: 0.5em'></div>"
    });


};

Ext.extend(ConfigPanel, Ext.Panel);