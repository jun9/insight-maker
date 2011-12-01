// Defines a new class for all icons
function mxIconSet(state)
 {
    this.images = [];
    var graph = state.view.graph;
    var md = (mxClient.IS_TOUCH) ? 'touchstart': 'mousedown';

    if (isValued(state.cell) && is_editor) {
        //equation
        var img = mxUtils.createImage('/builder/images/equal.png');
        img.setAttribute('title', '');
        img.style.position = 'absolute';
        img.style.cursor = 'pointer';
        img.style.width = '16px';
        img.style.height = '16px';
        img.style.left = state.x + 2;
        img.style.top = state.y + 2;
		
		if(state.width<2){
        	img.style.left = state.x + state.width - 20;
		}

        mxEvent.addListener(img, md,
        mxUtils.bind(this,
        function(evt)
        {
            // Disables dragging the image
            mxEvent.consume(evt);
        })
        );

        mxEvent.addListener(img, 'click',
        mxUtils.bind(this,
        function(evt)
        {
            if (state.cell.value.nodeName == "Converter") {
                var editorWindow = new Ext.ConverterWindow({
                    parent: "",
                    cell: state.cell,
                    oldKeys: state.cell.getAttribute("Data"),
                    interpolation: state.cell.getAttribute("Interpolation")
                });
                editorWindow.show();
            } else {
                var editorWindow = new Ext.EquationWindow({
                    parent: "",
                    cell: state.cell,
                    code: getValue(state.cell)
                });
                editorWindow.show();
            }

            mxEvent.consume(evt);
        })
        );

        state.view.graph.container.appendChild(img);
        this.images.push(img);
    }


    if (Ext.String.trim(state.cell.value.getAttribute("Note")) != "") {
        // Note
        var img = mxUtils.createImage('/builder/images/note.png');
        img.setAttribute('title', '');
        img.style.position = 'absolute';
        img.style.cursor = 'pointer';
        img.style.width = '16px';
        img.style.height = '16px';
        img.style.left = state.x + state.width - 18;
        img.style.top = state.y + 2;
		if(state.width<2){
        	img.style.left = state.x + 2;
		}
        mxEvent.addListener(img, md,
        mxUtils.bind(this,
        function(evt)
        {
            // Disables dragging the image
            mxEvent.consume(evt);
        })
        );

        mxEvent.addListener(img, 'click',
        mxUtils.bind(this,
        function(evt)
        {
            var x = Ext.getCmp("note" + state.cell.id);
            if (isUndefined(x)) {
                var tooltip = new Ext.ToolTip(
                {
                    html: "<big>" + state.cell.value.getAttribute("Note") + "</big>",
                    autoHide: false,
                    closable: true,
                    draggable: true,
                    id: "note" + state.cell.id,
                    title: state.cell.value.getAttribute("name")
                });
                //console.log(evt);
                tooltip.showAt([evt.clientX + 17, evt.clientY - 8]);
                mxEvent.consume(evt);
            } else {
                x.destroy();
            }
        })
        );

        state.view.graph.container.appendChild(img);
        this.images.push(img);
    };
}
mxIconSet.prototype.destroy = function()
 {
    if (this.images != null)
    {
        for (var i = 0; i < this.images.length; i++)
        {
            var img = this.images[i];
            img.parentNode.removeChild(img);
        }
    }

    this.images = null;
};


function setupHoverIcons() {

    var iconTolerance = 20;

    // Shows icons if the mouse is over a cell
    graph.addMouseListener(
    {
        currentState: null,
        currentIconSet: null,
        mouseDown: function(sender, me)
        {
            // Hides icons on mouse down
            if (this.currentState != null)
            {
                this.dragLeave(me.getEvent(), this.currentState);
                this.currentState = null;
            }
        },
        mouseMove: function(sender, me)
        {
            // Ignores event if over current cell (with tolerance)
            if (this.currentState != null)
            {
                var tol = iconTolerance;
                var tmp = new mxRectangle(me.getGraphX() - tol,
                me.getGraphY() - tol, 2 * tol, 2 * tol);

                if (mxUtils.intersects(tmp, this.currentState))
                {
                    return;
                }
            }

            var tmp = graph.view.getState(me.getCell());

            // Ignores everything but vertices
            if (graph.isMouseDown || (tmp != null && !(graph.getModel().isEdge(tmp.cell) || graph.getModel().isVertex(tmp.cell))))
            {
                tmp = null;
            }

            if (tmp != this.currentState)
            {
                if (this.currentState != null)
                {
                    this.dragLeave(me.getEvent(), this.currentState);
                }

                this.currentState = tmp;

                if (this.currentState != null)
                {
                    this.dragEnter(me.getEvent(), this.currentState);
                }
            }
        },
        mouseUp: function(sender, me) {},
        dragEnter: function(evt, state)
        {
            if (this.currentIconSet == null)
            {

                this.currentIconSet = new mxIconSet(state);
            }
        },
        dragLeave: function(evt, state)
        {
            if (this.currentIconSet != null)
            {
                this.currentIconSet.destroy();
                this.currentIconSet = null;
            }
        }
    });
}