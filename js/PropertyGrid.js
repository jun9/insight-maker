
Ext.namespace('Ext.ux.wam');
Ext.onReady(function() {
	Ext.getBody().createChild({
		tag: 'style',
		type: 'text/css',
		html: '.x-props-grid .x-item-disabled .x-grid3-cell-inner {color: gray !important; font-style: italic !important}'
	});
})

Ext.ux.wam.PropertyRecord = Ext.data.Record.create([
    {name:'name',type:'string'},
	{name:'text',type:'string'},
	'value',
	{
		name:'disabled',
		type:'boolean'
	},
	'editor',
	'group',
	'renderer'
]);



Ext.ux.wam.PropertyColumnModel = function(store){
	this.store = store;
    Ext.ux.wam.PropertyColumnModel.superclass.constructor.call(this, [
        {header: Ext.grid.PropertyColumnModel.prototype.nameText, width:50, sortable: false, dataIndex:'name', id: 'name'},
        {header: Ext.grid.PropertyColumnModel.prototype.valueText, width:50, sortable: false,  resizable:false, dataIndex: 'value', id: 'value'},
		{header: 'group', hidden: true, dataIndex:'group',id:'group'}
    ]);

    this.bselect = Ext.DomHelper.append(document.body, {
        tag: 'select', cls: 'x-grid-editor x-hide-display', children: [
            {tag: 'option', value: 'True', html: 'True'},
            {tag: 'option', value: 'False', html: 'False'}
        ]
    });
    var booleanEditor = new Ext.form.ComboBox({
	            triggerAction : 'all',
	            mode : 'local',
	            valueField : 'boolValue',
	            displayField : 'name',
	            editable:false,
	            selectOnFocus: true,
	            forceSelection: true,
	            store : {
	                xtype : 'arraystore',
	                idIndex : 0,
	                fields : ['boolValue','name'],
	                data : [[false,'No'],[true,'Yes']]
	                }
	});

    this.editors = {
        'date' : new Ext.grid.GridEditor(new Ext.form.DateField({selectOnFocus:true})),
        'string' : new Ext.grid.GridEditor(new Ext.form.TextField({selectOnFocus:true})),
        'number' : new Ext.grid.GridEditor(new Ext.form.NumberField({selectOnFocus:true, style:'text-align:left;'}))
        ,'boolean': new Ext.grid.GridEditor(booleanEditor)
    };
    this.renderCellDelegate = this.renderCell.createDelegate(this);
    this.renderPropDelegate = this.renderProp.createDelegate(this);
};

Ext.extend(Ext.ux.wam.PropertyColumnModel, Ext.grid.ColumnModel, {
    // private
    renderDate : function(dateVal){
        return dateVal.dateFormat(Ext.grid.PropertyColumnModel.prototype.dateFormat);
    },

    // private
    renderBool : function(bVal){
        return bVal ? 'Yes' : 'No';
    },

    // private
    isCellEditable : function(colIndex, rowIndex){
        return (colIndex == 1) && (this.store.getAt(rowIndex).data['disabled']!==true);
    },
	
    // private
    getRenderer : function(col){
        return col == 1 ?
            this.renderCellDelegate : this.renderPropDelegate;
    },

    // private
    renderProp : function(value,metadata,record){
        return record.data['text'] || record.data['name'];
    },

    // private
    renderCell : function(value,metadata,record){
        var rv = value;
		if (record.data['renderer'] == "") {
			if (value instanceof Date) {
				rv = this.renderDate(value);
			}
			else 
				if (typeof value == 'boolean') {
					rv = this.renderBool(value);
				}
			rv = Ext.util.Format.htmlEncode(rv);
		}
		else {
			rv = record.data['renderer'].call(this, value);
		} 
		return rv;
    },

    // private
    getCellEditor : function(colIndex, rowIndex){
        var p = this.store.getAt(rowIndex);
		var val = p.data['value'];
        if(p.data['editor']!==""){
            return p.data['editor'];
        }
        if(val instanceof Date){
            return this.editors['date'];
        }else if(typeof val == 'number'){
            return this.editors['number'];
        }else if(typeof val == 'boolean'){
            return this.editors['boolean'];
        }else{
            return this.editors['string'];
        }
    }
});


Ext.ux.wam.PropertyGrid = Ext.extend(Ext.grid.EditorGridPanel, {
  
    // private config overrides
    enableColumnMove:false,
    stripeRows:false,
    collapsible: false,
    trackMouseOver: false,
    clicksToEdit:1,
    enableHdMenu : false,
    /*viewConfig : {
        forceFit:true,
		getRowClass: function(record) {
			return (record.data['disabled']==true) ? "x-item-disabled" : "";
		}
    },*/

    // private
    initComponent : function(){
        this.lastEditRow = null;
        var cm = new Ext.ux.wam.PropertyColumnModel(this.store);
        this.store.sort('name', 'ASC');
        this.addEvents(

            'beforepropertychange',

            'propertychange'
        );
        this.cm = cm;
        Ext.ux.wam.PropertyGrid.superclass.initComponent.call(this);

        this.selModel.on('beforecellselect', function(sm, rowIndex, colIndex){
            if (this.store.getAt(rowIndex).data['disabled']==true) {return false;}
			if(colIndex === 0){
                this.startEditing.defer(200, this, [rowIndex, 1]);
                return false;
            }
        }, this);
    },

    // private
    onRender : function(){
        Ext.ux.wam.PropertyGrid.superclass.onRender.apply(this, arguments);

        this.getGridEl().addClass('x-props-grid');
    }
});