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
      zooming: 80 //zoom speed. higher is more sensible
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
      type: 'arrowpipe'
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
      },
      onRightClick: function(node, eventInfo, e) {
        if (node) fd.zoomNode(node, 1, 30);
      }
    },
    bgAlpha: 0.25,
    onCreateLabel: function(domElement, node){
      if (node.data.parentID) {
        domElement.innerHTML = node.name;
      } else {
        domElement.innerHTML = node.id.substr(4);
      }

      var style = domElement.style;
      style.fontSize = "0.8em";
      style.color = "#000";
      style.backgroundColor = "rgba(255,255,255,0.90)";
      style.padding = "1px";
      style.whiteSpace= "nowrap";
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

  // load JSON data.
  $NetworkMap.Json.load('data/karen-detail.json', function(json) {
    var tx = 35, ty = 50, sx = 1.1, sy = 1.1;

    $NetworkMap.Utils.Metrics.initJSON(json);
    fd.loadJSON(json);
    $NetworkMap.Utils.Metrics.updateMetrics(fd);
    fd.refresh();
    fd.canvas.scale(sx, sy);
    fd.canvas.translate(tx, ty);
    
    // overview test
    var over = new $NetworkMap.Views.OverviewManager(fd, jQuery('#overview'), 180, 150, {}, tx, ty);


    // debug test
    //var debug = new $NetworkMap.Debug.GraphicalOutput(fd);
    //debug.enable();

    // update metrics test
    //setInterval(function() {
    //  $NetworkMap.Utils.Metrics.updateMetrics(fd);
    //  fd.plot();
    //}, 1000);
    
    //var button = jQuery('<input id="btnSave" type="button" value="save" />').click(function() {
    //  $NetworkMap.Json.save('../../src/save.php', json, 'karen-detail.json');
    //});
    //jQuery(document.body).append(button);
  });
}
