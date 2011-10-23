Ext.data.JsonP.Ext_fx_Manager({"tagname":"class","html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'><a href='#!/api/Ext.Base' rel='Ext.Base' class='docClass'>Ext.Base</a><div class='subclass '><strong>Ext.fx.Manager</strong></div></div><h4>Mixins</h4><div class='dependency'><a href='#!/api/Ext.fx.Queue' rel='Ext.fx.Queue' class='docClass'>Ext.fx.Queue</a></div><h4>Requires</h4><div class='dependency'><a href='#!/api/Ext.util.MixedCollection' rel='Ext.util.MixedCollection' class='docClass'>Ext.util.MixedCollection</a></div><div class='dependency'><a href='#!/api/Ext.fx.target.Element' rel='Ext.fx.target.Element' class='docClass'>Ext.fx.target.Element</a></div><div class='dependency'><a href='#!/api/Ext.fx.target.CompositeElement' rel='Ext.fx.target.CompositeElement' class='docClass'>Ext.fx.target.CompositeElement</a></div><div class='dependency'><a href='#!/api/Ext.fx.target.Sprite' rel='Ext.fx.target.Sprite' class='docClass'>Ext.fx.target.Sprite</a></div><div class='dependency'><a href='#!/api/Ext.fx.target.CompositeSprite' rel='Ext.fx.target.CompositeSprite' class='docClass'>Ext.fx.target.CompositeSprite</a></div><div class='dependency'><a href='#!/api/Ext.fx.target.Component' rel='Ext.fx.target.Component' class='docClass'>Ext.fx.target.Component</a></div><h4>Files</h4><div class='dependency'><a href='source/Manager3.html#Ext-fx-Manager' target='_blank'>Manager.js</a></div></pre><div class='doc-contents'><p class='private'><strong>NOTE</strong> This is a private utility class for internal use by the framework. Don't rely on its existence.</p><p>Animation Manager which keeps track of all current animations and manages them on a frame by frame basis.</p>\n</div><div class='members'><div id='m-cfg'><div class='definedBy'>Defined By</div><h3 class='members-title'>Config options</h3><div class='subsection'><div id='cfg-forceJS' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.fx.Manager' rel='Ext.fx.Manager' class='definedIn docClass'>Ext.fx.Manager</a><br/><a href='source/Manager3.html#Ext-fx-Manager-cfg-forceJS' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.fx.Manager-cfg-forceJS' class='name expandable'>forceJS</a><span> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span></div><div class='description'><div class='short'>Turn off to not use CSS3 transitions when they are available ...</div><div class='long'><p>Turn off to not use CSS3 transitions when they are available</p>\n<p>Defaults to: <code>true</code></p></div></div></div><div id='cfg-interval' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.fx.Manager' rel='Ext.fx.Manager' class='definedIn docClass'>Ext.fx.Manager</a><br/><a href='source/Manager3.html#Ext-fx-Manager-cfg-interval' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.fx.Manager-cfg-interval' class='name expandable'>interval</a><span> : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a></span></div><div class='description'><div class='short'>Default interval in miliseconds to calculate each frame. ...</div><div class='long'><p>Default interval in miliseconds to calculate each frame.  Defaults to 16ms (~60fps)</p>\n<p>Defaults to: <code>16</code></p></div></div></div></div></div><div id='m-property'><div class='definedBy'>Defined By</div><h3 class='members-title'>Properties</h3><div class='subsection'><div id='property-self' class='member first-child inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Base' rel='Ext.Base' class='definedIn docClass'>Ext.Base</a><br/><a href='source/Base3.html#Ext-Base-property-self' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Base-property-self' class='name expandable'>self</a><span> : <a href=\"#!/api/Ext.Class\" rel=\"Ext.Class\" class=\"docClass\">Ext.Class</a></span><strong class='protected-signature'>protected</strong></div><div class='description'><div class='short'>Get the reference to the current class from which this object was instantiated. ...</div><div class='long'><p>Get the reference to the current class from which this object was instantiated. Unlike <a href=\"#!/api/Ext.Base-method-statics\" rel=\"Ext.Base-method-statics\" class=\"docClass\">statics</a>,\n<code>this.self</code> is scope-dependent and it's meant to be used for dynamic inheritance. See <a href=\"#!/api/Ext.Base-method-statics\" rel=\"Ext.Base-method-statics\" class=\"docClass\">statics</a>\nfor a detailed comparison</p>\n\n<pre><code>Ext.define('My.Cat', {\n    statics: {\n        speciesName: 'Cat' // My.Cat.speciesName = 'Cat'\n    },\n\n    constructor: function() {\n        alert(this.self.speciesName); / dependent on 'this'\n\n        return this;\n    },\n\n    clone: function() {\n        return new this.self();\n    }\n});\n\n\nExt.define('My.SnowLeopard', {\n    extend: 'My.Cat',\n    statics: {\n        speciesName: 'Snow Leopard'         // My.SnowLeopard.speciesName = 'Snow Leopard'\n    }\n});\n\nvar cat = new My.Cat();                     // alerts 'Cat'\nvar snowLeopard = new My.SnowLeopard();     // alerts 'Snow Leopard'\n\nvar clone = snowLeopard.clone();\nalert(Ext.getClassName(clone));             // alerts 'My.SnowLeopard'\n</code></pre>\n</div></div></div></div></div><div id='m-method'><div class='definedBy'>Defined By</div><h3 class='members-title'>Methods</h3><div class='subsection'><div id='method-addAnim' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.fx.Manager' rel='Ext.fx.Manager' class='definedIn docClass'>Ext.fx.Manager</a><br/><a href='source/Manager3.html#Ext-fx-Manager-method-addAnim' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.fx.Manager-method-addAnim' class='name expandable'>addAnim</a>( <span class='pre'><a href=\"#!/api/Ext.fx.Anim\" rel=\"Ext.fx.Anim\" class=\"docClass\">Ext.fx.Anim</a> anim</span> )</div><div class='description'><div class='short'>Add an Anim to the manager. ...</div><div class='long'><p>Add an Anim to the manager. This is done automatically when an Anim instance is created.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>anim</span> : <a href=\"#!/api/Ext.fx.Anim\" rel=\"Ext.fx.Anim\" class=\"docClass\">Ext.fx.Anim</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-callOverridden' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Base' rel='Ext.Base' class='definedIn docClass'>Ext.Base</a><br/><a href='source/Base3.html#Ext-Base-method-callOverridden' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Base-method-callOverridden' class='name expandable'>callOverridden</a>( <span class='pre'><a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a>/Arguments args</span> ) : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><strong class='protected-signature'>protected</strong></div><div class='description'><div class='short'>Call the original method that was previously overridden with override\n\nExt.define('My.Cat', {\n    constructor: functi...</div><div class='long'><p>Call the original method that was previously overridden with <a href=\"#!/api/Ext.Base-static-method-override\" rel=\"Ext.Base-static-method-override\" class=\"docClass\">override</a></p>\n\n<pre><code>Ext.define('My.Cat', {\n    constructor: function() {\n        alert(\"I'm a cat!\");\n\n        return this;\n    }\n});\n\nMy.Cat.override({\n    constructor: function() {\n        alert(\"I'm going to be a cat!\");\n\n        var instance = this.callOverridden();\n\n        alert(\"Meeeeoooowwww\");\n\n        return instance;\n    }\n});\n\nvar kitty = new My.Cat(); // alerts \"I'm going to be a cat!\"\n                          // alerts \"I'm a cat!\"\n                          // alerts \"Meeeeoooowwww\"\n</code></pre>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>args</span> : <a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a>/Arguments<div class='sub-desc'><p>The arguments, either an array or the <code>arguments</code> object</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a></span><div class='sub-desc'><p>Returns the result after calling the overridden method</p>\n</div></li></ul></div></div></div><div id='method-callParent' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Base' rel='Ext.Base' class='definedIn docClass'>Ext.Base</a><br/><a href='source/Base3.html#Ext-Base-method-callParent' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Base-method-callParent' class='name expandable'>callParent</a>( <span class='pre'><a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a>/Arguments args</span> ) : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><strong class='protected-signature'>protected</strong></div><div class='description'><div class='short'>Call the parent's overridden method. ...</div><div class='long'><p>Call the parent's overridden method. For example:</p>\n\n<pre><code>Ext.define('My.own.A', {\n    constructor: function(test) {\n        alert(test);\n    }\n});\n\nExt.define('My.own.B', {\n    extend: 'My.own.A',\n\n    constructor: function(test) {\n        alert(test);\n\n        this.callParent([test + 1]);\n    }\n});\n\nExt.define('My.own.C', {\n    extend: 'My.own.B',\n\n    constructor: function() {\n        alert(\"Going to call parent's overriden constructor...\");\n\n        this.callParent(arguments);\n    }\n});\n\nvar a = new My.own.A(1); // alerts '1'\nvar b = new My.own.B(1); // alerts '1', then alerts '2'\nvar c = new My.own.C(2); // alerts \"Going to call parent's overriden constructor...\"\n                         // alerts '2', then alerts '3'\n</code></pre>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>args</span> : <a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a>/Arguments<div class='sub-desc'><p>The arguments, either an array or the <code>arguments</code> object\nfrom the current method, for example: <code>this.callParent(arguments)</code></p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a></span><div class='sub-desc'><p>Returns the result from the superclass' method</p>\n</div></li></ul></div></div></div><div id='method-collectTargetData' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.fx.Manager' rel='Ext.fx.Manager' class='definedIn docClass'>Ext.fx.Manager</a><br/><a href='source/Manager3.html#Ext-fx-Manager-method-collectTargetData' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.fx.Manager-method-collectTargetData' class='name expandable'>collectTargetData</a>( <span class='pre'><a href=\"#!/api/Ext.fx.Anim\" rel=\"Ext.fx.Anim\" class=\"docClass\">Ext.fx.Anim</a> anim, <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a> timestamp</span> )</div><div class='description'><div class='short'>Collect target attributes for the given Anim object at the given timestamp ...</div><div class='long'><p>Collect target attributes for the given Anim object at the given timestamp</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>anim</span> : <a href=\"#!/api/Ext.fx.Anim\" rel=\"Ext.fx.Anim\" class=\"docClass\">Ext.fx.Anim</a><div class='sub-desc'><p>The Anim instance</p>\n</div></li><li><span class='pre'>timestamp</span> : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><div class='sub-desc'><p>Time after the anim's start time</p>\n</div></li></ul></div></div></div><div id='method-initConfig' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Base' rel='Ext.Base' class='definedIn docClass'>Ext.Base</a><br/><a href='source/Base3.html#Ext-Base-method-initConfig' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Base-method-initConfig' class='name expandable'>initConfig</a>( <span class='pre'><a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> config</span> ) : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><strong class='protected-signature'>protected</strong></div><div class='description'><div class='short'>Initialize configuration for this class. ...</div><div class='long'><p>Initialize configuration for this class. a typical example:</p>\n\n<pre><code>Ext.define('My.awesome.Class', {\n    // The default config\n    config: {\n        name: 'Awesome',\n        isAwesome: true\n    },\n\n    constructor: function(config) {\n        this.initConfig(config);\n\n        return this;\n    }\n});\n\nvar awesome = new My.awesome.Class({\n    name: 'Super Awesome'\n});\n\nalert(awesome.getName()); // 'Super Awesome'\n</code></pre>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>config</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a></span><div class='sub-desc'><p>mixins The mixin prototypes as key - value pairs</p>\n</div></li></ul></div></div></div><div id='method-removeAnim' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.fx.Manager' rel='Ext.fx.Manager' class='definedIn docClass'>Ext.fx.Manager</a><br/><a href='source/Manager3.html#Ext-fx-Manager-method-removeAnim' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.fx.Manager-method-removeAnim' class='name expandable'>removeAnim</a>( <span class='pre'><a href=\"#!/api/Ext.fx.Anim\" rel=\"Ext.fx.Anim\" class=\"docClass\">Ext.fx.Anim</a> anim</span> )</div><div class='description'><div class='short'>Remove an Anim from the manager. ...</div><div class='long'><p>Remove an Anim from the manager. This is done automatically when an Anim ends.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>anim</span> : <a href=\"#!/api/Ext.fx.Anim\" rel=\"Ext.fx.Anim\" class=\"docClass\">Ext.fx.Anim</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-statics' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Base' rel='Ext.Base' class='definedIn docClass'>Ext.Base</a><br/><a href='source/Base3.html#Ext-Base-method-statics' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Base-method-statics' class='name expandable'>statics</a>( <span class='pre'></span> ) : <a href=\"#!/api/Ext.Class\" rel=\"Ext.Class\" class=\"docClass\">Ext.Class</a><strong class='protected-signature'>protected</strong></div><div class='description'><div class='short'>Get the reference to the class from which this object was instantiated. ...</div><div class='long'><p>Get the reference to the class from which this object was instantiated. Note that unlike <a href=\"#!/api/Ext.Base-property-self\" rel=\"Ext.Base-property-self\" class=\"docClass\">self</a>,\n<code>this.statics()</code> is scope-independent and it always returns the class from which it was called, regardless of what\n<code>this</code> points to during run-time</p>\n\n<pre><code>Ext.define('My.Cat', {\n    statics: {\n        totalCreated: 0,\n        speciesName: 'Cat' // My.Cat.speciesName = 'Cat'\n    },\n\n    constructor: function() {\n        var statics = this.statics();\n\n        alert(statics.speciesName);     // always equals to 'Cat' no matter what 'this' refers to\n                                        // equivalent to: My.Cat.speciesName\n\n        alert(this.self.speciesName);   // dependent on 'this'\n\n        statics.totalCreated++;\n\n        return this;\n    },\n\n    clone: function() {\n        var cloned = new this.self;                      // dependent on 'this'\n\n        cloned.groupName = this.statics().speciesName;   // equivalent to: My.Cat.speciesName\n\n        return cloned;\n    }\n});\n\n\nExt.define('My.SnowLeopard', {\n    extend: 'My.Cat',\n\n    statics: {\n        speciesName: 'Snow Leopard'     // My.SnowLeopard.speciesName = 'Snow Leopard'\n    },\n\n    constructor: function() {\n        this.callParent();\n    }\n});\n\nvar cat = new My.Cat();                 // alerts 'Cat', then alerts 'Cat'\n\nvar snowLeopard = new My.SnowLeopard(); // alerts 'Cat', then alerts 'Snow Leopard'\n\nvar clone = snowLeopard.clone();\nalert(Ext.getClassName(clone));         // alerts 'My.SnowLeopard'\nalert(clone.groupName);                 // alerts 'Cat'\n\nalert(My.Cat.totalCreated);             // alerts 3\n</code></pre>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Ext.Class\" rel=\"Ext.Class\" class=\"docClass\">Ext.Class</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div></div></div></div></div>","allMixins":["Ext.fx.Queue"],"meta":{},"requires":["Ext.util.MixedCollection","Ext.fx.target.Element","Ext.fx.target.CompositeElement","Ext.fx.target.Sprite","Ext.fx.target.CompositeSprite","Ext.fx.target.Component"],"deprecated":null,"extends":"Ext.Base","inheritable":false,"static":false,"superclasses":["Ext.Base","Ext.fx.Manager"],"singleton":true,"code_type":"ext_define","alias":null,"statics":{"property":[],"css_var":[],"css_mixin":[],"cfg":[],"method":[],"event":[]},"subclasses":[],"uses":[],"protected":false,"mixins":["Ext.fx.Queue"],"members":{"property":[{"tagname":"property","deprecated":null,"static":false,"owner":"Ext.Base","template":null,"required":null,"protected":true,"name":"self","id":"property-self"}],"css_var":[],"css_mixin":[],"cfg":[{"tagname":"cfg","deprecated":null,"static":false,"owner":"Ext.fx.Manager","template":null,"required":false,"protected":false,"name":"forceJS","id":"cfg-forceJS"},{"tagname":"cfg","deprecated":null,"static":false,"owner":"Ext.fx.Manager","template":null,"required":false,"protected":false,"name":"interval","id":"cfg-interval"}],"method":[{"tagname":"method","deprecated":null,"static":false,"owner":"Ext.fx.Manager","template":false,"required":null,"protected":false,"name":"addAnim","id":"method-addAnim"},{"tagname":"method","deprecated":null,"static":false,"owner":"Ext.Base","template":false,"required":null,"protected":true,"name":"callOverridden","id":"method-callOverridden"},{"tagname":"method","deprecated":null,"static":false,"owner":"Ext.Base","template":false,"required":null,"protected":true,"name":"callParent","id":"method-callParent"},{"tagname":"method","deprecated":null,"static":false,"owner":"Ext.fx.Manager","template":false,"required":null,"protected":false,"name":"collectTargetData","id":"method-collectTargetData"},{"tagname":"method","deprecated":null,"static":false,"owner":"Ext.Base","template":false,"required":null,"protected":true,"name":"initConfig","id":"method-initConfig"},{"tagname":"method","deprecated":null,"static":false,"owner":"Ext.fx.Manager","template":false,"required":null,"protected":false,"name":"removeAnim","id":"method-removeAnim"},{"tagname":"method","deprecated":null,"static":false,"owner":"Ext.Base","template":false,"required":null,"protected":true,"name":"statics","id":"method-statics"}],"event":[]},"private":true,"component":false,"name":"Ext.fx.Manager","alternateClassNames":[],"id":"class-Ext.fx.Manager","mixedInto":[],"xtypes":{},"files":[{"href":"Manager3.html#Ext-fx-Manager","filename":"Manager.js"}]});