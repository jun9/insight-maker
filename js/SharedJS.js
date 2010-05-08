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

Ext.onReady(function() {
    setTimeout(function() {
        Ext.get('loading').remove();
        Ext.get('loading-mask').fadeOut({
            remove: true
        });
    },
    250);
});

function replace_html(el, html) {
    if (el) {
        var oldEl = (typeof el === "string" ? document.getElementById(el) : el);
        var newEl = document.createElement(oldEl.nodeName);

        // Preserve any properties we care about (id and class in this example)
        newEl.id = oldEl.id;
        newEl.className = oldEl.className;

        //set the new HTML and insert back into the DOM
        newEl.innerHTML = html;
        if (oldEl.parentNode)
        oldEl.parentNode.replaceChild(newEl, oldEl);
        else
        oldEl.innerHTML = html;

        //return a reference to the new element in case we need it
        return newEl;
    }
};


function setTopLinks() {
    var links = "";
    if (drupal_node_ID == -1) {
        links = '<div style="float:right;padding:0.2em;"><nobr><a href="http://InsightMaker.com/help" target="_Blank">Help</a> | <a href="http://InsightMaker.com/directory" target="_Blank">Find More Insights</div>';
    } else {
        if (is_editor) {
            if (editLocation == 'graph') {
                links = '<div style="float:left;padding:0.2em;"><a href="http://InsightMaker.com/insight/' + drupal_node_ID + '/view">Edit Insight User Interface</a>';
            } else {
                links = '<div style="float:left;padding:0.2em;"><a href="http://InsightMaker.com/insight/' + drupal_node_ID + '/">Edit Insight Model</a>';
            }
            links = links + ' | <a href="http://InsightMaker.com/node/' + drupal_node_ID + '/edit">Edit Insight Properties</a></div>';
        } else {
           links = links + '<div style="float:left;padding:0.2em;"><a href="http://InsightMaker.com/node/' + drupal_node_ID + '/">Insight Properties</a></div>';
        }
        links = links + '<div style="float:right;padding:0.2em;"><nobr>';
        if(is_embed){
        	links = links + '<a target="_Blank" href="http://InsightMaker.com/insight/' + drupal_node_ID + '">Full Screen Insight</a> | ';
        }else{
        	links = links + '<a target="_Blank" href="http://InsightMaker.com/insight/">Make a New Insight</a> | ';
        	links = links + '<a target="_Blank" href="http://InsightMaker.com/node/' + drupal_node_ID + '/clone">Duplicate Insight</a> | ';
        }
        links = links + '<a href="http://InsightMaker.com/help" target="_Blank">Help</a> | <a href="http://InsightMaker.com/directory" target="_Blank">Find More Insights</a></nobr></div>';
    }
    replace_html(document.getElementById("toplinks-holder"), links);
}