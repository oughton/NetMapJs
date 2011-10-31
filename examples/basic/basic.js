function init(){
  
  // example data
  var json = [
    {
      // This node will end up as a group node as other nodes reference it as
      // their parent.
      // Groups may be assigned a layout type, otherwise the default is used.
      // $type is the node graphic to use. 'group' is an outline of a circle. 
      // You can implement more node types.
      "id": "A", "name": "A", "data": { "$type": "group", "layout": "Star" }
    },
    {
      "id": "B", "name": "B", "data": { "$type": "group", "layout": "Star" }
    },
    {
      "id": "C", "name": "C", "data": { "$type": "group", "layout": "Star" }
    },
    {
      // This node will end up as a child of the A group node because it references
      // it as by the 'parentID' property.
      "id": "a1", "name": "a1",
      "data": { "$type": "circle", "parentID": "A", "root": true },
      "adjacencies": [ { "nodeTo": "a2" }, { "nodeTo": "a3" }, { "nodeTo": "a4" } ]
    },
    {
      "id": "a2", "name": "a2",
      "data": { "$type": "circle", "parentID": "A" },
      "adjacencies": [ { "nodeTo": "a1" } ]
    },
    {
      "id": "a3", "name": "a3", 
      "data": { "$type": "circle", "parentID": "A" },
      "adjacencies": [ { "nodeTo": "a1" } ]
    },
    {
      "id": "a4", "name": "a4", 
      "data": { "$type": "circle", "parentID": "A" },
      "adjacencies": [ { "nodeTo": "a1" }, { "nodeTo": "a2" } ]
    },
    {
      "id": "b1", "name": "b1",
      "data": { "$type": "circle", "parentID": "B", "root": true },
      "adjacencies": [ { "nodeTo": "a1" }, { "nodeTo": "b2" }, { "nodeTo": "b3" } ]
    },
    {
      "id": "b2", "name": "b2",
      "data": { "$type": "circle", "parentID": "B" },
      "adjacencies": [ { "nodeTo": "b1" } ]
    },
    {
      "id": "b3", "name": "b3", 
      "data": { "$type": "circle", "parentID": "B" },
      "adjacencies": [ { "nodeTo": "b1" } ]
    },
    {
      "id": "c1", "name": "c1",
      "data": { "$type": "circle", "parentID": "C", "root": true },
      "adjacencies": [ { "nodeTo": "a1" }, { "nodeTo": "b1" }, { "nodeTo": "c2" }, { "nodeTo": "c3" } ]
    },
    {
      "id": "c2", "name": "c2",
      "data": { "$type": "circle", "parentID": "C" },
      "adjacencies": [ { "nodeTo": "c1" } ]
    },
    {
      "id": "c3", "name": "c3",
      "data": { "$type": "circle", "parentID": "C" },
      "adjacencies": [ { "nodeTo": "c1" } ]
    }
  ];

  var nm = new $jit.NetworkMap({
    // id of the visualization container
    injectInto: 'infovis',

    // enable zooming and panning
    Navigation: {
      enable: true,
      panning: true,
      zooming: 40 // zoom speed
    },

    // Change node and edge styles such as color and width.
    // These properties are also set per node with dollar prefixed data-properties in the
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

    // use html text for labels
    Label: {
      type: 'HTML'
    },

    // add node events
    Events: {

      enable: true,

      // use the default events system
      type: 'Native', 
     
      // adds mouse move event to add edge tooltips
      onMouseMove: function(node, eventInfo, e) {
        var edge = eventInfo.getEdge();

        if (this.current) this.current.remove();
        if (!edge) return;

        var n1 = edge.nodeFrom,
            n2 = edge.nodeTo,
            n1f = nm.fitsInCanvas(nm.p2c(n1.getPos())),
            n2f = nm.fitsInCanvas(nm.p2c(n2.getPos()));
        
        if (n1f && n2f || !n1f && !n2f) {
          return;
        }

        var to = n1f ? n2 : n1;
        var from = n1f ? n1 : n2;

        this.current = jQuery('<div>To ' + to.name + '</div>')
          .css({ position: 'absolute', left: e.clientX, top: e.clientY - 30, color: '#ddd' })
          .appendTo(document.body);
      },

      // change cursor style when hovering a node
      onMouseEnter: function() {
        nm.canvas.getElement().style.cursor = 'move';
      },
      
      onMouseLeave: function() {
        nm.canvas.getElement().style.cursor = '';
      },
      
      // add a right click handler
      onRightClick: function(node, eventInfo, e) {
        if (node) nm.zoomNode(node, 1, 30);
      },

      // add a click handler to nodes
      onClick: function(node, eventInfo, e) {
        var edge = eventInfo.getEdge();
        
        if (!edge) return;

        var n1 = edge.nodeFrom,
            n2 = edge.nodeTo,
            n1f = nm.fitsInCanvas(nm.p2c(n1.getPos())),
            n2f = nm.fitsInCanvas(nm.p2c(n2.getPos()));
        
        if (n1f && n2f || !n1f && !n2f) return;

        var from = n1f ? n1 : n2;
        var to = n1f ? n2 : n1;

        nm.followEdge(from, to, 2);
      }
    },

    // default layout to use unless otherwise specified
    layout: 'Arbor',

    // the alpha of elements that should be faded out
    bgAlpha: 0.25,

    // initial label styling
    onCreateLabel: function(domElement, node){
      domElement.innerHTML = node.name;
      domElement.style.color = "#ddd";
    },

    // change node styles when DOM labels are placed or moved.
    onPlaceLabel: function(domElement, node){
      var style = domElement.style,
          left = parseInt(style.left),
          top = parseInt(style.top),
          w = domElement.offsetWidth;

      style.left = (left - w / 2) + 'px';
      style.top = top + 'px';
    }
  });
  
  // load JSON data and plot
  nm.loadJSON(json);
  nm.refresh();

  // create an overview stack using the utility object
  new $NetworkMap.Views.OverviewManager(nm, jQuery('#overview'), 180, 150, {});

  // debug test
  var debug = new $NetworkMap.Debug.GraphicalOutput(nm);
  //debug.enable();
}
