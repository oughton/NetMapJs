var labelType, useGradients, nativeTextSupport, animate;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

function init(){
  // init data
  var json = [
      {
        "id": "POP_AKL", "name": "Auckland POP",        
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_NSH", "name": "North Shore POP",     
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_WRK", "name": "Warkworth POP",       
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_LAX", "name": "Las Angeles POP",     
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_SYD", "name": "Sydney POP",          
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_MTA", "name": "Mount Albert POP",    
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_HLZ", "name": "Hamilton POP",        
        "data": { "$type": "none", "layout": "Star", "$dim": 50 }
      }, {
        "id": "POP_ROT", "name": "Rotorua POP",         
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_TRG", "name": "Tauranga POP",        
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_NPE", "name": "Napier POP",          
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_GIS", "name": "Gisborne POP",        
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_MUP", "name": "Massey POP",          
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_PMR", "name": "Palmerston North POP",
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_NPL", "name": "New Plymouth POP",    
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_WAG", "name": "Whanganui POP",       
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_AVL", "name": "Avalon POP",          
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_POR", "name": "Porirua POP",         
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_WLG", "name": "Wellington POP",      
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_NSN", "name": "Nelson POP",          
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_TPO", "name": "Tekapo POP",          
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_CHC", "name": "Christchurch POP",    
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_LCN", "name": "Lincoln POP",         
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_DUD", "name": "Dunedin POP",         
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_IVM", "name": "Invermay POP",        
        "data": { "$type": "group", "layout": "Star" }
      }, {
        "id": "POP_IVC", "name": "Invercargill POP",    
        "data": { "$type": "group", "layout": "Star" }
      },
      // POP --- Auckland
      {
        "id": "AKL",
        "name": "Auckland",
        "data": { "$type": "circle", "parentID": "POP_AKL", "root": true },
        "adjacencies": [
            { "nodeTo": "PMR",                  "data": {} },
            { "nodeTo": "NSH",                  "data": {} },
            { "nodeTo": "AUCKLANDDISTRIBUTION", "data": {} },
            { "nodeTo": "ANR1-AKL",             "data": {} },
            { "nodeTo": "UNIVERSITYOFOTAGO",    "data": {} },
            { "nodeTo": "MASSEYALBANY",         "data": {} },
            { "nodeTo": "FXNETWORKS",           "data": {} },
            { "nodeTo": "LANDCARE",             "data": {} },
            { "nodeTo": "NIWA",                 "data": {} },
            { "nodeTo": "AKLINTERNATIONAL",     "data": {} },
            { "nodeTo": "HLZ",                  "data": {} },
            { "nodeTo": "AKUNIVERSITY",         "data": {} },
            { "nodeTo": "MASSEYSHORECENTRE",    "data": {} },
            { "nodeTo": "NATIONALLIBRARY",      "data": {} },
            { "nodeTo": "TELSTRACLEAR",         "data": {} },
            { "nodeTo": "WANDPROBE",            "data": {} },
            { "nodeTo": "ENDACE",               "data": {} },
            { "nodeTo": "AUT",                  "data": {} },
            { "nodeTo": "MTA",                  "data": {} },
            { "nodeTo": "LAX",                  "data": {} }
        ]

      // POP --- Los Angeles
      }, {
        "id": "LAX",
        "name": "Los Angeles",
        "data": { "$type": "circle", "parentID": "POP_LAX", "root": true },
        "adjacencies": [
            { "nodeTo": "AKL",                  "data": {} }
        ]
      
      // POP --- North Shore
      }, {
        "id": "NSH",
        "name": "North Shore",
        "data": { "$type": "circle", "parentID": "POP_NSH", "root": true },
        "adjacencies": [
            { "nodeTo": "MASSEY",               "data": {} },
            { "nodeTo": "REANNZNETSERVICES",    "data": {} },
            { "nodeTo": "WRK",                  "data": {} },
            { "nodeTo": "AKL",                  "data": {} },
            { "nodeTo": "KRISTINSCHOOL",        "data": {} }
        ]
      
      // POP --- Warkworth
      }, {
        "id": "WRK",
        "name": "Warkworth",
        "data": { "$type": "circle", "parentID": "POP_WRK", "root": true },
        "adjacencies": [
            { "nodeTo": "NSH",                  "data": {} },
            //{ "nodeTo": "AUT",                  "data": {} }
        ]
      
      // POP --- Sydney
      }, {
        "id": "SYD",
        "name": "Sydney",
        "data": { "$type": "circle", "parentID": "POP_SYD", "root": true },
        "adjacencies": [
            //{ "nodeTo": "AKLINTERNATIONAL",     "data": {} },
            { "nodeTo": "EQUINIX",              "data": {} },
            { "nodeTo": "AUCKLANDDISTRIBUTION", "data": {} },
            { "nodeTo": "AARNET",               "data": {} },
            { "nodeTo": "AKL",                  "data": {} }
        ]
      
      // POP --- Mount Albert
      }, {
        "id": "MTA",
        "name": "Mount Albert",
        "data": { "$type": "circle", "parentID": "POP_MTA", "root": true },
        "adjacencies": [
            { "nodeTo": "AKL",                  "data": {} },
            { "nodeTo": "PLANTANDFOODHR",       "data": {} },
            { "nodeTo": "PLANTANDFOODCF",       "data": {} },
            { "nodeTo": "ESR",                  "data": {} }
        ]
      
      // POP --- Hamilton
      }, {
        "id": "HLZ",
        "name": "Hamilton",
        "data": { "$type": "circle", "parentID": "POP_HLZ", "root": true, "$dim": 100, "hideNeighbours": true },
        "adjacencies": [
            { "nodeTo": "AKL",                  "data": {} },
            { "nodeTo": "PLANTANDFOOD",         "data": {} },
            { "nodeTo": "AGRESEARCH",           "data": {} },
            { "nodeTo": "LANDCARE_HAM",         "data": {} },
            { "nodeTo": "WINTEC",               "data": {} },
            { "nodeTo": "LINCOLNRUAKURA",       "data": {} },
            { "nodeTo": "UNIVERSITYOFWAIKATO",  "data": {} },
            { "nodeTo": "NIWARUAKURA",          "data": {} },
            { "nodeTo": "WANDPROBE_HAM",        "data": {} },
            { "nodeTo": "ENDACE_HAM",           "data": {} },
            { "nodeTo": "NIWA_HAM",             "data": {} },
            { "nodeTo": "ROT",                  "data": {} }
        ]
      
      // POP --- Rotorua
      }, {
        "id": "ROT",
        "name": "Rotorua",
        "data": { "$type": "circle", "parentID": "POP_ROT", "root": true },
        "adjacencies": [
            { "nodeTo": "HLZ",                  "data": {} },
            { "nodeTo": "TRG",                  "data": {} },
            { "nodeTo": "NPE",                  "data": {} },
            { "nodeTo": "MUP",                  "data": {} },
            { "nodeTo": "Napier 450 Switch",    "data": {} },
            { "nodeTo": "Scion",                "data": {} }
        ]
      
      // POP --- Tauranga
      }, {
        "id": "TRG",
        "name": "Tauranga",
        "data": { "$type": "circle", "parentID": "POP_TRG", "root": true },
        "adjacencies": [
            { "nodeTo": "ROT",                  "data": {} },
            { "nodeTo": "Bop Polytech",         "data": {} }
        ]
      
      // POP --- Napier
      }, {
        "id": "NPE",
        "name": "Napier",
        "data": { "$type": "circle", "parentID": "POP_NPE", "root": true },
        "adjacencies": [
            { "nodeTo": "GIS",                  "data": {} },
            { "nodeTo": "ROT",                  "data": {} },
            { "nodeTo": "MUP",                  "data": {} }
        ]
      
      // POP --- Gisborne
      }, {
        "id": "GIS",
        "name": "Gisborne",
        "data": { "$type": "circle", "parentID": "POP_GIS", "root": true },
        "adjacencies": [
            { "nodeTo": "NPE",                  "data": {} }
        ]
      
      // POP --- Massey
      }, {
        "id": "MUP",
        "name": "Massey",
        "data": { "$type": "circle", "parentID": "POP_MUP", "root": true },
        "adjacencies": [
            { "nodeTo": "ROT",                  "data": {} },
            { "nodeTo": "NPE",                  "data": {} },
            { "nodeTo": "AVL",                  "data": {} },
            { "nodeTo": "PMR",                  "data": {} }
        ]
      
      // POP --- Palmerston North
      }, {
        "id": "PMR",
        "name": "Palmerston North",
        "data": { "$type": "circle", "parentID": "POP_PMR", "root": true },
        "adjacencies": [
            { "nodeTo": "AKL",                  "data": {} },
            { "nodeTo": "NPL",                  "data": {} },
            { "nodeTo": "WAG",                  "data": {} },
            { "nodeTo": "WLG",                  "data": {} },
            { "nodeTo": "MUP",                  "data": {} }
        ]
      
      // POP --- New Plymouth
      }, {
        "id": "NPL",
        "name": "New Plymouth",
        "data": { "$type": "circle", "parentID": "POP_NPL", "root": true },
        "adjacencies": [
            { "nodeTo": "PMR",                  "data": {} }
        ]
      
      // POP --- Whanganui
      }, {
        "id": "WAG",
        "name": "Whanganui",
        "data": { "$type": "circle", "parentID": "POP_WAG", "root": true },
        "adjacencies": [
            { "nodeTo": "PMR",                  "data": {} }
        ]
      
      // POP --- Wellington
      }, {
        "id": "WLG",
        "name": "Wellington",
        "data": { "$type": "circle", "parentID": "POP_WLG", "root": true },
        "adjacencies": [
            { "nodeTo": "AVL",                  "data": {} },
            { "nodeTo": "DUD",                  "data": {} },
            { "nodeTo": "CHC",                  "data": {} },
            { "nodeTo": "NSN",                  "data": {} },
            { "nodeTo": "PMR",                  "data": {} }
        ]
      
      // POP --- Avalon
      }, {
        "id": "AVL",
        "name": "Avalon",
        "data": { "$type": "circle", "parentID": "POP_AVL", "root": true },
        "adjacencies": [
            { "nodeTo": "MUP",                  "data": {} },
            { "nodeTo": "POR",                  "data": {} },
            { "nodeTo": "WLG",                  "data": {} }
        ]
      
      // POP --- Porirua
      }, {
        "id": "POR",
        "name": "Porirua",
        "data": { "$type": "circle", "parentID": "POP_POR", "root": true },
        "adjacencies": [
            { "nodeTo": "AVL",                  "data": {} }
        ]
      
      // POP --- Nelson
      }, {
        "id": "NSN",
        "name": "Nelson",
        "data": { "$type": "circle", "parentID": "POP_NSN", "root": true },
        "adjacencies": [
            { "nodeTo": "WLG",                  "data": {} },
            { "nodeTo": "CHC",                  "data": {} }
        ]
      
      // POP --- Christchurch
      }, {
        "id": "CHC",
        "name": "Christchurch",
        "data": { "$type": "circle", "parentID": "POP_CHC", "root": true },
        "adjacencies": [
            { "nodeTo": "WLG",                  "data": {} },
            { "nodeTo": "NSN",                  "data": {} },
            { "nodeTo": "TPO",                  "data": {} },
            { "nodeTo": "LCN",                  "data": {} }
        ]
      
      // POP --- Tekapo
      }, {
        "id": "TPO",
        "name": "Tekapo",
        "data": { "$type": "circle", "parentID": "POP_TPO", "root": true },
        "adjacencies": [
            { "nodeTo": "CHC",                  "data": {} }
        ]
      
      // POP --- Lincoln
      }, {
        "id": "LCN",
        "name": "Lincoln",
        "data": { "$type": "circle", "parentID": "POP_LCN", "root": true },
        "adjacencies": [
            { "nodeTo": "CHC",                  "data": {} },
            { "nodeTo": "DUD",                  "data": {} }
        ]
      
      // POP --- Dunedin
      }, {
        "id": "DUD",
        "name": "Dunedin",
        "data": { "$type": "circle", "parentID": "POP_DUD", "root": true },
        "adjacencies": [
            { "nodeTo": "WLG",                  "data": {} },
            { "nodeTo": "IVM",                  "data": {} },
            { "nodeTo": "LCN",                  "data": {} },
            { "nodeTo": "IVC",                  "data": {} }

        ]
      
      // POP --- Ivermay
      }, {
        "id": "IVM",
        "name": "Ivermay",
        "data": { "$type": "circle", "parentID": "POP_IVM", "root": true },
        "adjacencies": [
            { "nodeTo": "DUD",                  "data": {} }
        ]
      
      // POP --- Invercargill
      }, {
        "id": "IVC",
        "name": "Invercargill",
        "data": { "$type": "circle", "parentID": "POP_IVC", "root": true },
        "adjacencies": [
            { "nodeTo": "DUD",                  "data": {} }
        ]
      
      // POP_ALK.AUCKLANDDISTRIBUTION
      }, {
       "id": "POP_AKL.AUCKLANDDISTRIBUTION", 
       "name": "Auckland Distribution", 
       "data": { "$type": "group", "parentID": "POP_AKL", "layout": "Star" }

      // POP_ALK.AUCKLANDDISTRIBUTION
      }, {
        "id": "AUCKLANDDISTRIBUTION",
        "name": "Auckland Distribution",
        "data": { "$type": "circle", "parentID": "POP_AKL.AUCKLANDDISTRIBUTION", "root": true },
        "adjacencies": [
            { "nodeTo": "Te Wananaga o Raukawa","data": { "parentID": "POP_AKL.AUCKLANDDISTRIBUTION" } },
            { "nodeTo": "NEN CaSP",             "data": { "parentID": "POP_AKL.AUCKLANDDISTRIBUTION" } },
            { "nodeTo": "MIT",                  "data": { "parentID": "POP_AKL.AUCKLANDDISTRIBUTION" } },
            { "nodeTo": "Correspondence School","data": { "parentID": "POP_AKL.AUCKLANDDISTRIBUTION" } }
        ]
      }
  ];

  //implement a new node type  
  $jit.NetworkMap.Plot.NodeTypes.implement({  
    'groups': {  
      'render': function(node, canvas) {  
        this.nodeHelper.circle.render 
      },  
      'contains': function(node, pos) {  
        this.nodeHelper.circle.contains
      }  
    }  
  });  

  // end
  // init ForceDirected
  var fd = new $jit.NetworkMap({
    //id of the visualization container
    injectInto: 'infovis',
    //Enable zooming and panning
    //by scrolling and DnD
    Navigation: {
      enable: true,
      //Enable panning events only if we're dragging the empty
      //canvas (and not a node).
      panning: true, //'avoid nodes',
      zooming: 40 //zoom speed. higher is more sensible
    },
    // Change node and edge styles such as
    // color and width.
    // These properties are also set per node
    // with dollar prefixed data-properties in the
    // JSON structure.
    Node: {
      overridable: true,
      dim: 20
    },
    Edge: {
      overridable: true,
      color: '#23A4FF',
      lineWidth: 1,
      type: 'dblarrow'
    },
    //Native canvas text styling
    Label: {
      type: 'HTML', //Native or HTML
      // TODO: can't move nodes properly with HTML labels - may need to overide navigation class
      size: 10,
      style: 'bold'
    },
    // Add node events
    Events: {
      enable: true,
      type: 'Native', // use the default events system
      onMouseMove: function(node, eventInfo, e) {
        var edge = eventInfo.getEdge();

        if (this.current) this.current.remove();
        if (!edge) return;

        var n1 = edge.nodeFrom,
            n2 = edge.nodeTo,
            n1f = fd.fitsInCanvas(fd.p2c(n1.getPos())),
            n2f = fd.fitsInCanvas(fd.p2c(n2.getPos()));
        
        if (n1f && n2f || !n1f && !n2f) {
          return;
        }

        var to = n1f ? n2 : n1;
        var from = n1f ? n1 : n2;

        this.current = jQuery('<div>To ' + to.name + '</div>')
          .css({ position: 'absolute', left: e.clientX, top: e.clientY - 30, color: '#ddd' })
          .appendTo(document.body);
        
      },
      onMouseWheel: function() {
      },
      //Change cursor style when hovering a node
      onMouseEnter: function() {
        fd.canvas.getElement().style.cursor = 'move';
      },
      onMouseLeave: function() {
        fd.canvas.getElement().style.cursor = '';
      },
      //Update node positions when dragged
      onDragMove: function(node, eventInfo, e) {
        //var pos = eventInfo.getPos();  
        //node.pos.setc(pos.x, pos.y);  
        //fd.plot();  
      },
      //Implement the same handler for touchscreens
      onTouchMove: function(node, eventInfo, e) {
        //$jit.util.event.stop(e); //stop default touchmove event
        //this.onDragMove(node, eventInfo, e);
      },
      //Add also a click handler to nodes
      onClick: function(node, eventInfo, e) {
        var edge = eventInfo.getEdge();
        
        if (!edge) return;

        var n1 = edge.nodeFrom,
            n2 = edge.nodeTo,
            n1f = fd.fitsInCanvas(fd.p2c(n1.getPos())),
            n2f = fd.fitsInCanvas(fd.p2c(n2.getPos()));
        
        if (n1f && n2f || !n1f && !n2f) {
          return;
        }

        var from = n1f ? n1 : n2;
        var to = n1f ? n2 : n1;

        fd.followEdge(from, to, 2);

        if(!node) return;
        
        var positions = [];
        fd.graph.eachNode(function(node) {
            positions.push({ id: node.id, x: node.pos.x, y: node.pos.y });
        });
        jQuery.post('../src/networkmap.php?method=savePositions', { positions: positions });
      }
    },
    //Number of iterations for the FD algorithm
    iterations: 200,
    // debugging enabled/disabled
    debug: true,
    //Edge length
    levelDistance: 130,
    // Add text to the labels. This method is only triggered
    // on label creation and only for DOM labels (not native canvas ones).
    onCreateLabel: function(domElement, node){
      if (node.data.parentID) {
        domElement.innerHTML = node.name;
      } else {
        domElement.innerHTML = node.id.substr(4);
      }

      var style = domElement.style;
      style.fontSize = "0.8em";
      style.color = "#ddd";
    },
    // Change node styles when DOM labels are placed
    // or moved.
    onPlaceLabel: function(domElement, node){
      var style = domElement.style;
      var left = parseInt(style.left);
      var top = parseInt(style.top);
      var w = domElement.offsetWidth;
      style.left = (left - w / 2) + 'px';
      style.top = top + 'px';
    }
  });
  
  var pops = ['LAX', 'NSH', 'WRK', 'AKL', 'SYD', 'MTA', 'HLZ', 'TGR', 'ROT', 'GIS', 'NPE', 'MUP', 
    'PMR', 'NPL', 'WAG', 'AVL', 'POR', 'WLG', 'NSN', 'CHC', 'TPO', 'LCN', 'DUD', 'IVM', 'IVC'];

  // create sub network nodes
  jQuery.each(json, function (index, n) {
    if (!n.adjacencies) return;

    jQuery.each(n.adjacencies, function(index, adj) {
      if (pops.indexOf(adj.nodeTo) === -1) {
        json.push({ 'id': adj.nodeTo, 'name': adj.nodeTo, 'data': { parentID: n.data.parentID } });
      }
    });
  });
  
  // set the initial positions
  jQuery.each([{"id":"POP_AKL","x":"-247","y":"6"},{"id":"POP_NSH","x":"-332","y":"-33"},{"id":"POP_WRK","x":"-404","y":"6"},{"id":"POP_LAX","x":"-439","y":"-304"},{"id":"POP_SYD","x":"-450","y":"281"},{"id":"POP_MTA","x":"-256","y":"280"},{"id":"POP_HLZ","x":"-173.41241910275687","y":"-187.6474088780429"},{"id":"POP_ROT","x":"-50","y":"-187"},{"id":"POP_TRG","x":"-69","y":"-259"},{"id":"POP_NPE","x":"47","y":"-185"},{"id":"POP_GIS","x":"36","y":"-255"},{"id":"POP_MUP","x":"51","y":"-130"},{"id":"POP_PMR","x":"57","y":"77"},{"id":"POP_NPL","x":"-26","y":"257"},{"id":"POP_WAG","x":"120","y":"259"},{"id":"POP_AVL","x":"184","y":"-155"},{"id":"POP_POR","x":"235","y":"-263"},{"id":"POP_WLG","x":"213","y":"-52"},{"id":"POP_NSN","x":"217","y":"240"},{"id":"POP_TPO","x":"282","y":"240"},{"id":"POP_CHC","x":"281","y":"171"},{"id":"POP_LCN","x":"354","y":"172"},{"id":"POP_DUD","x":"359","y":"-46"},{"id":"POP_IVM","x":"441","y":"-208"},{"id":"POP_IVC","x":"435","y":"105"},{"id":"AKL","x":"-247","y":"6"},{"id":"PMR","x":"57","y":"77"},{"id":"NSH","x":"-332","y":"-33"},{"id":"HLZ","x":"-173.26349733782507","y":"-187.94525240790654"},{"id":"MTA","x":"-256","y":"280"},{"id":"LAX","x":"-439","y":"-304"},{"id":"WRK","x":"-404","y":"6"},{"id":"SYD","x":"-450","y":"281"},{"id":"PLANTANDFOOD","x":"-173.18903645535917","y":"-196.58271477395155"},{"id":"AGRESEARCH","x":"-167.23216585808672","y":"-193.3064359454517"},{"id":"LANDCARE","x":"-165.7429482087686","y":"-188.6898612325656"},{"id":"WINTEC","x":"-168.57246174247302","y":"-183.1797559300886"},{"id":"LINCOLNRUAKURA","x":"-174.52933233974545","y":"-181.24377298597503"},{"id":"UNIVERSITYOFWAIKATO","x":"-179.2203679350975","y":"-184.44559093200897"},{"id":"NIWARUAKURA","x":"-180.11389852468838","y":"-189.80677446955417"},{"id":"WANDPROBE","x":"-178.55021999290435","y":"-193.97658388764486"},{"id":"ENDACE","x":"-165.7429482087686","y":"-185.26466063913392"},{"id":"NIWA","x":"-168.79584438987075","y":"-197.029480068747"},{"id":"ROT","x":"-50","y":"-187"},{"id":"TRG","x":"-69","y":"-259"},{"id":"NPE","x":"47","y":"-185"},{"id":"MUP","x":"51","y":"-130"},{"id":"GIS","x":"36","y":"-255"},{"id":"AVL","x":"184","y":"-155"},{"id":"NPL","x":"-26","y":"257"},{"id":"WAG","x":"120","y":"259"},{"id":"WLG","x":"213","y":"-52"},{"id":"DUD","x":"359","y":"-46"},{"id":"CHC","x":"281","y":"171"},{"id":"NSN","x":"217","y":"240"},{"id":"POR","x":"235","y":"-263"},{"id":"TPO","x":"282","y":"240"},{"id":"LCN","x":"354","y":"172"},{"id":"IVM","x":"441","y":"-208"},{"id":"IVC","x":"435","y":"105"}], function(index, val1) {
 
    jQuery.each(json, function(index, val2) {
      if (val2.id == val1.id) {
        val2.data.pos = { x: Number(val1.x), y: Number(val1.y) };
      }
    });

  });

  // load JSON data.
  fd.loadJSON(json);
  // compute positions incrementally and animate.
  /*fd.computeIncremental({
    iter: 40,
    property: 'end',
    onStep: function(perc){
    },
    onComplete: function(){
      fd.animate({
        modes: ['linear'],
        transition: $jit.Trans.Elastic.easeOut,
        duration: 2500
      });
    }
  });*/
  fd.refresh();
  // end
}
