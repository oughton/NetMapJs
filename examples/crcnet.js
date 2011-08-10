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
  jQuery.getJSON('crc.json', function(data) {
    var json = [];
    
    jQuery.each(data, function(index, obj) {
      var host = {};

      jQuery.each(obj, function(key, val) {
        switch(key) {
          case 'alias': 
            //host['name'] = val;
            break;
          case 'address':
            break;
          case 'host_name':
            host['id'] = val;
            host['name'] = val;
            break;
          case 'parents':
            host['adjacencies'] = [{ nodeTo: val }];
            break;
          default:
        }
      });
      
      if (host.id)
        json.push(host);
    });

    makeViz(json);
  });
  
  function makeViz(json) {
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
      injectInto: 'infovis',
      Navigation: {
        enable: true,
        panning: true, //'avoid nodes',
        zooming: 40 //zoom speed. higher is more sensible
      },
      Node: {
        overridable: true,
        dim: 2
      },
      Edge: {
        overridable: true,
        color: '#23A4FF',
        lineWidth: 1,
        type: 'line'
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
          
          if (edge) {
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
          }
        }
      },
      //Number of iterations for the FD algorithm
      iterations: 5000,
      layout: 'ForceDirected',
      levelDistance: 20,
      bgAlpha: 0.25,
      onCreateLabel: function(domElement, node){
        var _preventDefault = function(evt) { evt.preventDefault(); };
        var style = domElement.style;
        domElement.innerHTML = node.name;
        style.fontSize = "0.8em";
        style.color = "#ddd";
        jQuery(domElement).bind("dragstart", _preventDefault).bind("selectstart", _preventDefault);
      },
      onPlaceLabel: function(domElement, node){
        var style = domElement.style;
        var left = parseInt(style.left);
        var top = parseInt(style.top);
        var w = domElement.offsetWidth;
        style.left = (left - w / 2) + 'px';
        style.top = top + 'px';
      }
    });
    
    $NetworkMap.Utils.Metrics.initJSON(json);

    // load JSON data.
    fd.loadJSON(json);
    $NetworkMap.Utils.Metrics.updateMetrics(fd);
    
    // debug test
    var debug = new $NetworkMap.Debug.GraphicalOutput(fd);
    debug.enable();

    fd.canvas.scale(0.25, 0.25);

    fd.computeIncremental({
      iter: 40,
      property: 'end',
      onStep: function(perc){
        debug.logWrite(perc + '% loaded...');
        fd.end();
      },
      onComplete: function(){
        debug.logWrite('done');
        fd.end();
      }
    });

    // overview test
    var over = new $NetworkMap.Views.OverviewManager(fd, jQuery('#overview'), 180, 150);
  }
}
