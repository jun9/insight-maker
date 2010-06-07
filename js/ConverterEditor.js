/*

Copyright 2010 Give Team. All rights reserved.

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
        this.editorWindow = new Ext.ConverterWindow({
            parent: this,
            oldKeys: this.getValue(),
			interpolation: this.interpolation
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
		function makeDiscrete(){
			var oldKeys="";
			for (var i = 0; i < store.getCount(); i++)
			{
			  if(i>0){oldKeys=oldKeys+";";}
				oldKeys=oldKeys+store.getAt(i).data.xVal+","+store.getAt(i).data.yVal;
			}
			var data = [];
			var items = oldKeys.split(";");
			var oldXY=[];
			for(var i=0;i<items.length;i++){
				var xy=items[i].split(",")
				if(i>0){
					data.push({
			             xVal : parseFloat(xy[0]),
			             yVal: parseFloat(oldXY[1])
			        });
				}

		        data.push({
		             xVal : parseFloat(xy[0]),
		             yVal: parseFloat(xy[1])
		        });
				oldXY=xy;
			}

			if(discreteStore==null){
		    	discreteStore = new Ext.data.GroupingStore({
		        	reader: new Ext.data.JsonReader({fields: DataEntry}),
		        	data: data
		    	});
			}else{
				discreteStore.removeAll();
				discreteStore.loadData(data);
			}
		}

    var DataEntry = Ext.data.Record.create([{
        name: 'xVal',
        type: 'float'
    },{
        name: 'yVal',
        type: 'float'
    }]);

    var data = [];
	var items = obj.args.oldKeys.split(";");
	for(var i=0;i<items.length;i++){
		var xy=items[i].split(",")
        data.push({
             xVal : parseFloat(xy[0]),
             yVal: parseFloat(xy[1])
        });
	}

    var store = new Ext.data.GroupingStore({
        reader: new Ext.data.JsonReader({fields: DataEntry}),
        data: data,
        sortInfo: {field: 'xVal', direction: 'ASC'}
    });

    var editor = new Ext.ux.grid.RowEditor({
        saveText: 'Update'
    });

    var gridPan = new Ext.grid.GridPanel({
        store: store,
        width: 600,
        region:'center',
        margins: '0 5 5 5',
        plugins: [editor],viewConfig: {
		        headersDisabled: true, markDirty: false
		    },
        tbar: [{
            iconCls: 'units-add-icon',
            text: 'Add Point',
            handler: function(){
                var e = new DataEntry({
                    xVal: 0,
                    yVal: 0
                });
                editor.stopEditing();
                var index = store.findInsertIndex(e);
				store.insert(index, e);
                gridPan.getView().refresh();
                gridPan.getSelectionModel().selectRow(index);
                editor.startEditing(index);
            }
        },{
            ref: '../removeBtn',
            iconCls: 'units-remove-icon',
            text: 'Remove Point',
            disabled: true,
            handler: function(){
                editor.stopEditing();
                var s = gridPan.getSelectionModel().getSelections();
                for(var i = 0, r; r = s[i]; i++){
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
            width: 220,
            sortable: false,
            editor: {
                xtype: 'numberfield',
                allowBlank: false,
				decimalPrecision:10
            }
        },{
            header: 'Output Value',
            dataIndex: 'yVal',
            width: 220,
            sortable: false,
            editor: {
                xtype: 'numberfield',
                allowBlank: false,
				decimalPrecision:10
            }
        }
        ]
    });

	makeDiscrete();
    var chartStore;
	if(obj.args.interpolation=="Linear"){
		chartStore=store;
	}else{
		chartStore=discreteStore;
	}
	

    var chart = new Ext.Panel({
        width:600,
        height:200,
        layout:'fit',
        margins: '5 5 0',
        region: 'north',
        split: true,
        minHeight: 100,
        maxHeight: 500,

        items: {
            xtype: 'linechart',
            store: chartStore,
            url:'/builder/js/resources/charts.swf',
            xField: 'xVal',
            yAxis: new Ext.chart.NumericAxis({
                displayName: 'Outputs'
            }),
			xAxis: new Ext.chart.NumericAxis({
                displayName: 'Inputs'
            }),

            chartStyle: {
                padding: 10,
                font: {
                    name: 'Tahoma',
                    color: 0x444444,
                    size: 11
                },
                xAxis: {
                    color: 0x69aBc8,
                    majorTicks: {color: 0x69aBc8, length: 4},
                    minorTicks: {color: 0x69aBc8, length: 2},
                    majorGridLines: {size: 1, color: 0xeeeeee}
                },
                yAxis: {
                    color: 0x69aBc8,
                    majorTicks: {color: 0x69aBc8, length: 4},
                    minorTicks: {color: 0x69aBc8, length: 2},
                    majorGridLines: {size: 1, color: 0xdfe8f6}
                }
            },
            series: [{
                displayName: '',
                yField: 'yVal'
            }]
        }
    });


    obj.win = new Ext.Window({
        title: 'Converter Data Specification',
        layout: 'border',
        closeAction: 'close',
        border: false,
        modal: true,
        resizable: false,
        shadow: true,
        buttonAlign: 'right',
        layoutConfig: {
            columns: 1
        },
        width:508,
        height: 500,
        items: [chart, gridPan],
		buttons: [{
		            text: 'OK',
		            handler: function()
		            {
		                obj.args.parent.setValue(getKeys());
		                grid.stopEditing();
		                obj.args.parent.setEditable(false);
		                obj.win.close();
		            }
		        },
		        {
		            text: 'Cancel',
		            handler: function()
		            {
		                obj.win.close();
		            }
		        }]

    });
	
	function getKeys(){
		var s="";
		for (var i = 0; i < store.getCount(); i++)
		{
		  if(i>0){s=s+";";}
			s=s+store.getAt(i).data.xVal+","+store.getAt(i).data.yVal;
		}
		return s
	}
	
    gridPan.getSelectionModel().on('selectionchange', function(sm){
        gridPan.removeBtn.setDisabled(sm.getCount() < 1);
    });

	
	
	store.on('update', function(){
        store.sort('xVal', 'ASC');
		makeDiscrete();
    });

	store.on('dataChanged', function(){
        makeDiscrete();
    });
	
	obj.show = function()
	{
	    obj.win.show();
	}
}
	
