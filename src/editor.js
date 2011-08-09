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
    injectInto: 'infovis',
    Navigation: {
      enable: true,
      panning: false, //'avoid nodes',
      zooming: 80 //zoom speed. higher is more sensible
    },
    Node: {
      overridable: true,
      dim: 20
    },
    Edge: {
      overridable: true,
      color: '#23A4FF',
      lineWidth: 1
    },
    Label: {
      type: 'HTML', //Native or HTML
      // TODO: can't move nodes properly with HTML labels - may need to overide navigation class
      size: 10,
      style: 'bold'
    },
    Events: {
      enable: true,
      type: 'Native', // use the default events system
      onMouseEnter: function() {
        fd.canvas.getElement().style.cursor = 'move';
      },
      onMouseLeave: function() {
        fd.canvas.getElement().style.cursor = '';
      },
      onDragMove: function(node, eventInfo, e) {
        var pos = eventInfo.getPos();  
        node.pos.setc(pos.x, pos.y);  
        //fd.plot();
        //fd.refresh();
        fd.plot();
        //if (over) over.refresh();
      },
      onClick: function(node, eventInfo, e) {
        //if(!node) return;
        
        //var positions = [];
        //fd.graph.eachNode(function(node) {
        //    positions.push({ id: node.id, x: node.pos.x, y: node.pos.y });
        //});
        //jQuery.post('../src/networkmap.php?method=savePositions', { positions: positions });
      },
      onRightClick: function(node, eventInfo, e) {
        if (node) fd.zoomNode(node);
      }
    },
    iterations: 200,
    debug: true,
    levelDistance: 130,
    bgAlpha: 0.25,
    onCreateLabel: function(domElement, node){
      domElement.innerHTML = node.name;

      var style = domElement.style;
      style.fontSize = "0.8em";
      style.color = "#000";
      style.backgroundColor = "rgba(255,255,255,0.90)";
      style.padding = "1px";
      style.whiteSpace= "nowrap";
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

  jQuery('#infovis').bind('plotbegin', function(e, viz, canvas, ctx) {
    var gridDim = { width: 40, height: 40 },
        canvasSize = canvas.getSize(),
        so = canvas.scaleOffsetX,
        tx = canvas.translateOffsetX,
        ty = canvas.translateOffsetY;

    size = { width: canvasSize.width / so, height: canvasSize.height / so };

    ctx.save();
    ctx.strokeStyle = 'rgb(100,100,100)';
    ctx.lineWidth = 1.5 / so;

    ctx.beginPath();
    for (var c = 0; c < size.width / gridDim.width / 2; c++) {
      
      ctx.moveTo(c * gridDim.width, -size.height / 2);
      ctx.lineTo(c * gridDim.width, size.height / 2);
      ctx.moveTo(c * -gridDim.width, -size.height / 2);
      ctx.lineTo(c * -gridDim.width, size.height / 2);
      
      
      for (var r = 0; r < size.height / gridDim.height / 2; r++) {
        ctx.moveTo(-size.width / 2, r * gridDim.height);
        ctx.lineTo(size.width / 2, r * gridDim.height);
        ctx.moveTo(-size.width / 2, r * -gridDim.height);
        ctx.lineTo(size.width / 2, r * -gridDim.height);
      }
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  });

  var over;

  // add buttons
  var txtLoad = jQuery('<input type="text" />');
  var btnLoad = jQuery('<input type="button" value="load" />').click(function() {
    $NetworkMap.Json.load('../public/' + txtLoad.val(), function(json) {
      fd.loadJSON(json);
      fd.refresh();
      if (!over) over = new $NetworkMap.Views.OverviewManager(fd, jQuery('#overview'), 180, 150);
    });
  });
  
  // add buttons
  var txtSave = jQuery('<input type="text" />');
  var btnSave = jQuery('<input type="button" value="save" />').click(function() {
    var positions = fd.getPositions();

    jQuery.each(fd.json, function(index, node) {
      if (node.data.pos && positions[node.id]) {
        node.data.pos = { x: positions[node.id].x, y: positions[node.id].y };
      }
    });

    $NetworkMap.Json.save('../src/save.php', fd.json, txtSave.val());
  });

  jQuery(document.body)
    .append(txtSave)
    .append(btnSave)
    .append('<p>')
    .append(txtLoad)
    .append(btnLoad);

}

