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

      // POP --- Auckland
      {
        "id": "AKL",
        "name": "Auckland",
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "PMR",                  "data": {} },
            { "nodeTo": "NSH",                  "data": {} },
            //{ "nodeTo": "AUCKLANDDISTRIBUTION", "data": {} },
            //{ "nodeTo": "ANR1-AKL",             "data": {} },
            //{ "nodeTo": "UNIVERSITYOFOTAGO",    "data": {} },
            //{ "nodeTo": "MASSEYALBANY",         "data": {} },
            //{ "nodeTo": "FXNETWORKS",           "data": {} },
            //{ "nodeTo": "LANDCARE",             "data": {} },
            //{ "nodeTo": "NIWA",                 "data": {} },
            //{ "nodeTo": "AKLINTERNATIONAL",     "data": {} },
            { "nodeTo": "HLZ",                  "data": {} },
            //{ "nodeTo": "AKUNIVERSITY",         "data": {} },
            //{ "nodeTo": "MASSEYSHORECENTRE",    "data": {} },
            //{ "nodeTo": "NATIONALLIBRARY",      "data": {} },
            //{ "nodeTo": "TELSTRACLEAR",         "data": {} },
            //{ "nodeTo": "WANDPROBE",            "data": {} },
            //{ "nodeTo": "ENDACE",               "data": {} },
            //{ "nodeTo": "AUT",                  "data": {} },
            { "nodeTo": "MTA",                  "data": {} },
            { "nodeTo": "LAX",                  "data": {} }

        ]

      // POP --- Los Angeles
      }, {
        "id": "LAX",
        "name": "Los Angeles",
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "AKL",                  "data": {} }
        ]
      
      // POP --- North Shore
      }, {
        "id": "NSH",
        "name": "North Shore",
        "data": { "$type": "pop" },
        "adjacencies": [
            //{ "nodeTo": "MASSEY",               "data": {} },
            //{ "nodeTo": "REANNZNETSERVICES",    "data": {} },
            { "nodeTo": "WRK",                  "data": {} },
            { "nodeTo": "AKL",                  "data": {} },
            //{ "nodeTo": "KRISTINSCHOOL",        "data": {} }
        ]
      
      // POP --- Warkworth
      }, {
        "id": "WRK",
        "name": "Warkworth",
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "NSH",                  "data": {} },
            //{ "nodeTo": "AUT",                  "data": {} }
        ]
      
      // POP --- Sydney
      }, {
        "id": "SYD",
        "name": "Sydney",
        "data": { "$type": "pop" },
        "adjacencies": [
            //{ "nodeTo": "AKLINTERNATIONAL",     "data": {} },
            //{ "nodeTo": "EQUINIX",              "data": {} },
            //{ "nodeTo": "AUCKLANDDISTRIBUTION", "data": {} },
            //{ "nodeTo": "AARNET",               "data": {} }
            { "nodeTo": "AKL",                  "data": {} }
        ]
      
      // POP --- Mount Albert
      }, {
        "id": "MTA",
        "name": "Mount Albert",
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "AKL",                  "data": {} },
            //{ "nodeTo": "PLANTANDFOODHR",       "data": {} },
            //{ "nodeTo": "PLANTANDFOODCF",       "data": {} },
            //{ "nodeTo": "ESR",                  "data": {} }
        ]
      
      // POP --- Hamilton
      }, {
        "id": "HLZ",
        "name": "Hamilton",
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "AKL",                  "data": {} },
            //{ "nodeTo": "PLANTANDFOOD",         "data": {} },
            //{ "nodeTo": "AGRESEARCH",           "data": {} },
            //{ "nodeTo": "LANDCARE",             "data": {} },
            //{ "nodeTo": "WINTEC",               "data": {} },
            //{ "nodeTo": "LINCOLNRUAKURA",       "data": {} },
            //{ "nodeTo": "UNIVERSITYOFWAIKATO",  "data": {} },
            //{ "nodeTo": "NIWARUAKURA",          "data": {} },
            //{ "nodeTo": "WANDPROBE",            "data": {} },
            //{ "nodeTo": "ENDACE",               "data": {} },
            //{ "nodeTo": "NIWA",                 "data": {} },
            { "nodeTo": "ROT",                  "data": {} }
        ]
      
      // POP --- Rotorua
      }, {
        "id": "ROT",
        "name": "Rotorua",
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "HLZ",                  "data": {} },
            { "nodeTo": "TRG",                  "data": {} },
            { "nodeTo": "NPE",                  "data": {} },
            { "nodeTo": "MUP",                  "data": {} }
        ]
      
      // POP --- Tauranga
      }, {
        "id": "TRG",
        "name": "Tauranga",
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "ROT",                  "data": {} }
        ]
      
      // POP --- Napier
      }, {
        "id": "NPE",
        "name": "Napier",
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "GIS",                  "data": {} },
            { "nodeTo": "ROT",                  "data": {} },
            { "nodeTo": "MUP",                  "data": {} }
        ]
      
      // POP --- Gisborne
      }, {
        "id": "GIS",
        "name": "Gisborne",
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "NPE",                  "data": {} }
        ]
      
      // POP --- Massey
      }, {
        "id": "MUP",
        "name": "Massey",
        "data": { "$type": "pop" },
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
        "data": { "$type": "pop" },
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
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "PMR",                  "data": {} }
        ]
      
      // POP --- Whanganui
      }, {
        "id": "WAG",
        "name": "Whanganui",
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "PMR",                  "data": {} }
        ]
      
      // POP --- Wellington
      }, {
        "id": "WLG",
        "name": "Wellington",
        "data": { "$type": "pop" },
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
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "MUP",                  "data": {} },
            { "nodeTo": "POR",                  "data": {} },
            { "nodeTo": "WLG",                  "data": {} }
        ]
      
      // POP --- Porirua
      }, {
        "id": "POR",
        "name": "Porirua",
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "AVL",                  "data": {} }
        ]
      
      // POP --- Nelson
      }, {
        "id": "NSN",
        "name": "Nelson",
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "WLG",                  "data": {} },
            { "nodeTo": "CHC",                  "data": {} }
        ]
      
      // POP --- Christchurch
      }, {
        "id": "CHC",
        "name": "Christchurch",
        "data": { "$type": "pop" },
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
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "CHC",                  "data": {} }
        ]
      
      // POP --- Lincoln
      }, {
        "id": "LCN",
        "name": "Lincoln",
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "CHC",                  "data": {} },
            { "nodeTo": "DUD",                  "data": {} }
        ]
      
      // POP --- Dunedin
      }, {
        "id": "DUD",
        "name": "Dunedin",
        "data": { "$type": "pop" },
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
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "DUD",                  "data": {} }
        ]
      
      // POP --- Invercargill
      }, {
        "id": "IVC",
        "name": "Invercargill",
        "data": { "$type": "pop" },
        "adjacencies": [
            { "nodeTo": "DUD",                  "data": {} }
        ]
      }
  ];
  // end
  // init ForceDirected
  var fd;
  fd = new $jit.NetworkMap({
    //id of the visualization container
    injectInto: 'infovis',
    //Enable zooming and panning
    //by scrolling and DnD
    Navigation: {
      enable: true,
      //Enable panning events only if we're dragging the empty
      //canvas (and not a node).
      panning: 'avoid nodes',
      zooming: 40 //zoom speed. higher is more sensible
    },
    // Change node and edge styles such as
    // color and width.
    // These properties are also set per node
    // with dollar prefixed data-properties in the
    // JSON structure.
    Node: {
      overridable: true
    },
    Edge: {
      overridable: true,
      color: '#23A4FF',
      lineWidth: 0.4
    },
    //Native canvas text styling
    Label: {
      type: labelType, //Native or HTML
      size: 10,
      style: 'bold'
    },
    // Add node events
    Events: {
      enable: true,
      //Change cursor style when hovering a node
      onMouseEnter: function() {
        fd.canvas.getElement().style.cursor = 'move';
      },
      onMouseLeave: function() {
        fd.canvas.getElement().style.cursor = '';
      },
      //Update node positions when dragged
      onDragMove: function(node, eventInfo, e) {
          var pos = eventInfo.getPos();
          node.pos.setc(pos.x, pos.y);
          fd.plot();
      },
      //Implement the same handler for touchscreens
      onTouchMove: function(node, eventInfo, e) {
        $jit.util.event.stop(e); //stop default touchmove event
        this.onDragMove(node, eventInfo, e);
      },
      //Add also a click handler to nodes
      onClick: function(node) {
        if(!node) return;
        
        var positions = [];
        fd.graph.eachNode(function(node) {
            positions.push({ id: node.id, x: node.pos.x, y: node.pos.y });
        });
        jQuery.post('../src/networkmap.php?method=savePositions', { positions: positions });
        
        // Build the right column relations list.
        // This is done by traversing the clicked node connections.
        var html = "<h4>" + node.name + "</h4><b> connections:</b><ul><li>",
            list = [];
        node.eachAdjacency(function(adj){
          list.push(adj.nodeTo.name);
        });
        //append connections information
        //$jit.id('inner-details').innerHTML = html + list.join("</li><li>") + "</li></ul>";
      }
    },
    //Number of iterations for the FD algorithm
    iterations: 200,
    //Edge length
    levelDistance: 130,
    // Add text to the labels. This method is only triggered
    // on label creation and only for DOM labels (not native canvas ones).
    onCreateLabel: function(domElement, node){
      domElement.innerHTML = node.name;
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
      style.top = (top + 10) + 'px';
      style.display = '';
    }
  });
  // load JSON data.
  fd.loadJSON(json);
  // compute positions incrementally and animate.
  fd.computeIncremental({
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
  });
  fd.refresh();
  // end
}
