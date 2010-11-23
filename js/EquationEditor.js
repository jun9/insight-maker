/*

Copyright 2010 Give Team. All rights reserved.

Give Team is a non-profit organization dedicated to
using the internet to encourage giving and greater
understanding.

This file may distributed and/or modified under the
terms of the Insight Maker Public License.

Insight Maker and Give Team are trademarks.

*/

Ext.form.customFields = {
    'code': Ext.extend(Ext.form.TriggerField, {
        enableKeyEvents: true,
        selectOnFocus: true
    }),
        'converter': Ext.extend(Ext.form.TriggerField, {
            enableKeyEvents: true,
            selectOnFocus: true
        })
};

Ext.form.customFields['code'] = Ext.extend(Ext.form.customFields['code'], {
    onTriggerClick: function()
    {
        this.editorWindow = new Ext.MultiSelectWindow({
            parent: this,
            code: this.getValue()
        });
        this.editorWindow.show();
    },

    listeners: {
        'keydown': function(field)
        {
            field.setEditable(!/\\n/.test(field.getValue()));
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

Ext.MultiSelectWindow = function(args)
 {
    var obj = this;

    obj.args = args;

    code = obj.args.code.replace(/\\n/g, "\n");

    var refstore = new Ext.data.ArrayStore({
        autoDestroy: true,
        storeId: 'myStore',
        idIndex: 0,
        fields: ['item']
    });

    var neighbors = neighborhood(selectedPrimitive).map(function(item) {
        return ['<big>' + item.getAttribute("name") + '</big>']
    });
    refstore.loadData(neighbors);

    var neighList = new Ext.ListView({
        store: refstore,
        multiSelect: false,
        mode: 'local',
        deferEmptyText: false,
        emptyText: '<div style="padding: 0.4em">No connected nodes. You may use links to connect different nodes together so they can reference each other in their equations.</div>',
        border: true,
        reserveScrollOffset: true,
        columns: [{
            header: 'References',
            width: 1,
            dataIndex: 'item',
            sortable: false
        }]
    });

    var codeEditor = new Ext.form.TextArea({
        id: 'myCode',
        name: 'myCode',
        value: code,
		emptyText: "Enter your equation here...",
        listeners: {
            specialkey: function(field, e) {
                // e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
                // e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
                if (e.getKey() == e.TAB) {
                    insertAtCursor(String.fromCharCode("      "));
                }
            }
        }
    });

    var syntax = new Ext.Panel({
        region: 'center',
        split: true,
        width: 400,
        layout: 'fit',
        collapsible: false,
        margins: '3 0 3 3',
        cmargins: '3 3 3 3',
        items: codeEditor
    });

    var refList = new Ext.Panel({
        region: 'east',
        width: 200,
        collapsible: false,
        border: true,
        margins: '3 0 3 3',
        layout: 'fit',
        cmargins: '3 3 3 3',
        items: neighList
    });

    var RBKeywords = "Controlled Inputs\r******===\r\rPulse\r***\rPulse(##Time$$, ##Height$$, ##Width$$)\r***\rCreates a pulse input at the specified time with the specified height and width. Height defaults to 1 and width defaults to 0.\r\r===\r\rStaircase\r***\rStaircase(##Start$$, ##Height$$)\r***\rCreates a staircase or step input that is initially set to 0 and after the time of start is set to height. Height defaults to 1.\r\r===\r\rRamp\r***\rRamp(##Start$$, ##Finish$$, ##Height$$)\r***\rCreates a ramp input which moves linearly from 0 to height between the start and finish times. Before start, the value is 0, after finish the value is height. Height defaults to 1.\r\r===\r\rMathematical\r******===\r\rRound\r***\rRound(##Value$$)\r***\rRounds a number to the nearest integer.\r\r===\r\rRound Up\r***\rCeil(##Value$$)\r***\rRounds a number up to the nearest integer.\r\r===\r\rRound Down\r***\rFloor(##Value$$)\r***\rRounds a number down to the nearest integer.\r\r===\r\rCos\r***\rCos(##Value$$)\r***\rFinds the cosine of a value in radians.\r\r===\r\rAcos\r***\rAcos(##Value$$)\r***\rFinds the arc-cosine of a value in radians.\r\r===\r\rSin\r***\rSin(##Value$$)\r***\rFinds the sine of a value in radians.\r\r===\r\rAsin\r***\rAsin(##Value$$)\r***\rFinds the arc-sine of a value in radians.\r\r===\r\rTan\r***\rTan(##Value$$)\r***\rFinds the tangent of a value in radians.\r\r===\r\rAtan\r***\rAtan(##Value$$)\r***\rFinds the arc-tangent of a value in radians.\r\r===\r\rLog\r***\rLog(##Value$$)\r***\rReturns the natural logarithm of a number.\r\r===\r\rExp\r***\rExp(##Value$$)\r***\rReturns e taken to a power.\r\r===\r\rMaximum\r***\rMax(##Value One$$, ##Value Two$$)\r***\rReturns the larger of two numbers.\r\r===\r\rMinimum\r***\rMin(##Value One$$, ##Value Two$$)\r***\rReturns the smaller of two numbers.\r\r===\r\rAbsolute Value\r***\rAbs(##Value$$)\r***\rReturns the absolute value of a number.\r\r===\r\rMod\r***\r##(Value One)$$ mod ##(Value Two)$$\r***\rReturns the remainder of the division of two numbers.\r\r===\r\rSquare Root\r***\rSqrt(##Value$$)\r***\rReturns the square root of a number.\r\r===\r\r\u03c0 (pi)\r***\rpi\r***\r3.14159265\r\r===\r\r\u03c6 (phi)\r***\rphi\r***\r1.61803399\r\r===\r\re\r***\re\r***\r2.71828183\r\r===\r\rTime\r******===\r\rCurrent Time\r***\rTime\r***\rThe current time in the model's base time units.\r\r===\r\rTime Step\r***\rTimeStep\r***\rThe simulation time step in the model's base time units.\r\r===\r\rTime Length\r***\rTimeLength\r***\rThe total length of the simulation in the model's base time units.\r\r===\r\rSeconds\r***\rSeconds()\r***\rThe current time in seconds. If a parameter is passed to seconds (as in seconds(74)), it returns the value of the parameter (in the model's base time units) in seconds.\r\r===\r\rMinutes\r***\rMinutes()\r***\rThe current time in minutes. If a parameter is passed to minutes (as in minutes(74)), it returns the value of the parameter (in the model's base time units) in minutes.\r\r===\r\rHours\r***\rHours()\r***\rThe current time in hours. If a parameter is passed to hours (as in hours(74)), it returns the value of the parameter (in the model's base time units) in hours.\r\r===\r\rDays\r***\rDays()\r***\rThe current time in days. If a parameter is passed to days (as in days(74)), it returns the value of the parameter (in the model's base time units)in days.\r\r===\r\rWeeks\r***\rWeeks()\r***\rThe current time in weeks. If a parameter is passed to weeks (as in weeks(74)), it returns the value of the parameter (in the model's base time units) in weeks.\r\r===\r\rMonths\r***\rMonths()\r***\rThe current time in weeks. If a parameter is passed to months (as in months(74)), it returns the value of the parameter (in the model's base time units) in months.\r\r===\r\rYears\r***\rYears()\r***\rThe current time in years. If a parameter is passed to years (as in years(74)), it returns the value of the parameter (in the model's base time units) in years.\r\r===\r\rConvert to Base Time\r***\rBaseTime(##Value$$, \"##Units$$\")\r***\rConverts the time specified by the parameter Value which is in the units specified by the string Units (\"seconds\", \"minutes\", \"hours\", \"days\", \"weeks\", or \"years\") into the model's base time units.\r\r===\r\rHistorical\r******===\r\rDelay\r***\rDelay(##<Primitive Reference>$$, ##Delay Length$$, ##Default Value$$)\r***\rReturns the value of a primitive (referenced with <...>) for a Delay Length of time ago. Default Value stands in for the primitive value in the case of negative times.\r\r===\r\rDelay1\r***\rDelay1(##<Primitive Reference>$$, ##Delay Length$$, ##Initial Value$$)\r***\rReturns a smoothed, first-order exponential delay of the value of a primitive. Initial Value is optional.\r\r===\r\rDelay3\r***\rDelay3(##<Primitive Reference>$$, ##Delay Length$$, ##Initial Value$$)\r***\rReturns a smoothed, third-order exponential delay of the value of a primitive. Initial Value is optional.\r\r===\r\rSmooth\r***\rSmooth(##<Primitive Reference>$$, ##Length$$, ##Initial Value$$)\r***\rReturns a smoothing of a primitive's past values. Results in an averaged curve fit. Length affects the weight of past values. Initial Value is optional.\r\r===\r\rMaximum\r***\rMax(##<Primitive Reference>$$)\r***\rReturns the maximum of the values a primitive has taken on over the course of the simulation.\r\r===\r\rMinimum\r***\rMin(##<Primitive Reference>$$)\r***\rReturns the minimum of the values a primitive has taken on over the course of the simulation.\r\r===\r\rMedian\r***\rMedian(##<Primitive Reference>$$)\r***\rReturns the median of the values a primitive has taken on over the course of the simulation.\r\r===\r\rMean\r***\rMean(##<Primitive Reference>$$)\r***\rReturns the mean of the values a primitive has taken on over the course of the simulation.\r\r===\r\rStandard Deviation\r***\rStdDev(##<Primitive Reference>$$)\r***\rReturns the standard deviation of the values a primitive has taken on over the course of the simulation.\r\r===\r\rRandom Numbers\r******===\r\rUniform Distribution\r***\rRand(##Minimum$$, ##Maximum$$)\r***\rGenerates a uniformly distributed random number between the minimum and maximum.\r\r===\r\rNormal Distribution\r***\rRandNormal(##Mean$$, ##Standard Deviation$$)\r***\rGenerates a normally distributed random number with a mean and a standard deviation.\r\r===\r\rLognormal Distribution\r***\rRandLognormal(##Mean$$, ##Standard Deviation$$)\r***\rGenerates a lognormally distributed random number with a mean and a standard deviation.\r\r===\r\rBinomial Distribution\r***\rRandBinomial(##Count$$, ##Probability$$)\r***\rGenerates a binomially distributed random number. The number of successes in Count random events each with Probability of success.\r\r===\r\rNegative Binomial\r***\rRandNegativeBinomial(##Successes$$, ##Probability$$)\r***\rGenerates a negative binomially distributed random number. The number of random events each with Probability of success required to generate the specified Successes.\r\r===\r\rPoisson Distribution\r***\rRandPoisson(##Lambda$$)\r***\rGenerates a Poisson distributed random number.\r\r===\r\rExponential Distribution\r***\rRandExp(##Lambda$$)\r***\rGenerates an exponentially distributed random number with the specified rate parameter.\r\r===\r\rGamma Distribution\r***\rRandGamma(##Alpha$$, ##Beta$$)\r***\rGenerates a gamma distributed random number.\r\r===\r\rFix Number Sequence\r***\rSetRandSeed(##Seed$$)\r***\rFixes the order that random numbers are generated. Seed is an arbitrary integer value such as 1, 2, or 3.\r\r===\r\rInput\/Output\r******===\r\rMessage Box\r***\rMsgBox(\"##Message$$\")\r***\rDisplays the message in a new window.\r\r===\r\rSpeak\r***\rSpeak(\"##Message$$\")\r***\rSpeaks the message using your computer's speech synthesizer.\r\r===\r\rWrite\r***\rWrite(\"##Message$$\")\r***\rWrites the message to the console.\r\r===\r\rWriteLn\r***\rWriteLn(\"##Message$$\") \r***\rWrites the message to the console and appends a new line character to it.\r\r===\r\rEnd of Line\r***\rEOL\r***\rA constant representing a new line text character.\r\r===\r\rRead String \r***\rRead(\"##Message$$\", \"##Default Value$$\")\r***\rAsks the user to input a string. Message is displayed as a prompt. You must also enter a default value for the result.\r\r===\r\rRead Number \r***\rRead(\"##Message$$\", ##Default Value$$)\r***\rAsks the user to input a double. Message is displayed as a prompt. You must also enter a default value for the result.\r\r===\r\rRead Boolean \r***\rRead(\"##Message$$\", ##Default Value$$)\r***\rAsks the user to input a boolean. Message is displayed as a prompt. You must also enter a default value for the result.\r\r===\r\rLogic Structures\r******===\r\rIf Then Else\r***\rIfThenElse(##Test Condition$$, ##Value if True$$, ##Value if False$$)\r***\rTests a condition and returns one value if the condition is true and another value if the condition is false.\r\r===\r\rVB If Then Else\r***\rIf ##Condition One$$ Then\r\t\/\/Action 1\rElseIf ##Condition Two$$ Then \r\t\/\/Action 2, Optional\rElse\r\t\/\/Other Action, Optional\rEnd If\r***\rCarries out one of a set of actions using VB Code. The action to execute is chosen based on one or more conditions.\r\r===\r\rVB While ... Wend Loop\r***\rWhile ##Condition$$ \r\t\/\/Action\rWend\r***\rRepeats the action as long as the condition is true.\r\r===\r\rVB For ... Next Loop\r***\rFor Counter as integer = ##Start$$ to ##Finish$$\r\t\/\/Action; msgbox(str(Counter))\rNext\r***\rRepeats the action, incrementing the counter from Start to Finish one step at a time.\r\r\r===\r\rVB Return a Value\r***\rReturn(##Value$$)\r***\rReturns a value (i.e. sets the value of the flow or stock) in multi-line expressions. Code execution terminates after this statement is executed.\r";

    var KW = RBKeywords.split(/\*\*\*\*\*\*===[\n\r][\n\r]/);
    //alert(KW.join("\n\n<sfr>\n"));
    for (var i = KW.length - 1; i >= 0; i--) {
        KW[i] = KW[i].split(/[\r\n\][\n\r]===[\n\r][\n\r]/);

    }
    for (var i = KW.length - 1; i > 0; i--) {
        KW[i].push(KW[i - 1][KW[i - 1].length - 1]);
    }
    var tabItems = [];
    var keyWordData = [];

    for (var i = 1; i < KW.length; i++) {
    	if(! /Input\/Output/.test(KW[i][KW[i].length - 1])){ //input/output are Simgua only functions and do not work in Insight Maker
	        var buttons = [];
	        var alength = KW[i].length - 2;
	        if (i == KW.length - 1) {
	            alength = alength + 1;
	        }
	        for (var j = 0; j < alength; j++) {
	            var item = KW[i];
	            var vals = KW[i][j].split(/[\n\r]\*\*\*[\n\r]/);
	            keyWordData[vals[0]] = vals[1].replace(/\$\$/g, "").replace(/##/g, "");
	            buttons.push(new Ext.Button({
	                text: vals[0],
	                height: 40,
	                tooltip: vals[2],
	                handler: function(btn, e) {
	                    insertAtCursor(keyWordData[btn.getText()]);
	                }
	            }));
	        }
	        tabItems.push({
	            title: KW[i][KW[i].length - 1],
	            items: buttons,
	            layout: {
	                type: 'table'
	            },
	            autoScroll: true
	        });
        }
    }


    var tabs = new Ext.TabPanel({
        activeTab: 0,
        enableTabScroll: true,
        items: tabItems,
        border: false
    });

    var help = new Ext.Panel({
        region: 'south',
        split: false,
        layout: 'fit',
        height: 85,
        collapsible: false,
        margins: '3 0 3 3',
        cmargins: '3 3 3 3',
        items: tabs
    });

    //var form = new Ext.FormPanel({layout:"border",frame:true,border:true, items: [syntax, refList, help]});
    obj.win = new Ext.Window({
        title: 'Equation Editor',
        layout: 'border',
        closeAction: 'close',
        border: false,
        modal: true,
        items: [syntax, refList, help],
        width: 600,
        height: 400,
        resizable: false,
        shadow: true,
        buttonAlign: 'right',

        buttons: [{
            text: 'OK',
            handler: function()
            {
                var newCode = codeEditor.getValue();
                newCode = newCode.replace(/\n|\r/g, "\\n");
                obj.args.parent.setValue(newCode);
				obj.args.parent.fireEvent('change', newCode);
                grid.stopEditing();
                obj.args.parent.setEditable(!/\\n/.test(newCode));
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

    neighList.on('click',
    function(view, index, node, e) {
        insertAtCursor("[" + getText(node) + "]");
    });

    obj.show = function()
    {
        obj.win.show();
		codeEditor.focus(true, true);
    }
}


function insertAtCursor(myValue) {
    var myField = document.getElementById('myCode');
	var startPosition = doGetCaretPosition(myField);
	
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
    } else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
    } else {
        myField.value += myValue;
    }
	setCaretPosition(myField, startPosition+myValue.length );
}

function doGetCaretPosition (ctrl) {
	var CaretPos = 0;	// IE Support
	if (document.selection) {
	ctrl.focus ();
		var Sel = document.selection.createRange ();
		Sel.moveStart ('character', -ctrl.value.length);
		CaretPos = Sel.text.length;
	}
	// Firefox support
	else if (ctrl.selectionStart || ctrl.selectionStart == '0')
		CaretPos = ctrl.selectionStart;
	return (CaretPos);
}

function setCaretPosition(ctrl, pos){
	if(ctrl.setSelectionRange)
	{
		ctrl.focus();
		ctrl.setSelectionRange(pos,pos);
	}
	else if (ctrl.createTextRange) {
		var range = ctrl.createTextRange();
		range.collapse(true);
		range.moveEnd('character', pos);
		range.moveStart('character', pos);
		range.select();
	}
}