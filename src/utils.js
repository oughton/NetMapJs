$NetworkMap.Utils = {};
$NetworkMap.Views = {};

$NetworkMap.Views = (function() {

  return {
    Overview: function(viz, mapOpts) {
      var _opts = jQuery.extend(true, {
        injectInto: 'overview',
        Node: {
          overridable: true,
          dim: 20,
          lineWidth: 5
        },
        Edge: {
          overridable: true,
          color: '#23A4FF',
          lineWidth: 3,
          type: 'line'
        },
        Label: {
          type: 'SVG'
        }
      }, mapOpts);

      var _over = new $jit.NetworkMap(_opts);
      var _container = jQuery('#' + _opts.injectInto);
      var _mouse = null;

      // translate a main canvas in sync with overview box
      var _moveBox = function(e) {
        var o = _container.offset(),
            x = e.clientX - o.left, y = e.clientY - o.top,
            canvas = viz.canvas,
            size = canvas.getSize(),
            pt1 = _over.c2p({ x: x, y: y }),
            pt2 = viz.c2p({ x: size.width / 2, y: size.height / 2 });

        canvas.translate(pt2.x - pt1.x, pt2.y - pt1.y);
      };
      
      // setup overview visualisation
      var init = function() {
        var vizSize = viz.canvas.getSize();
        var overSize = _over.canvas.getSize();
        
        _over.loadJSON(jQuery.extend(true, [], viz.json));
        _over.canvas.resize(overSize.width, 150);
        _over.canvas.scale(overSize.width / vizSize.width, overSize.width / vizSize.width);
        
        // add to listen for navigation
        jQuery(viz.canvas.getElement()).bind('redraw', function() {
          _over.refresh();
        });

        jQuery(_over.canvas.getElement()).bind('redraw', function() {
          var ctx = _over.canvas.getCtx(),
              size = viz.canvas.getSize(), 
              p1 = viz.c2p({ x: 0, y: 0 }),
              p2 = viz.c2p({ x: size.width, y: size.height });

          ctx.save();
          ctx.strokeStyle = 'rgb(255,255,0)';
          ctx.lineWidth = 10;
          ctx.strokeRect(p1.x, p1.y, Math.abs(p2.x - p1.x), Math.abs(p2.y - p1.y));
        });

        // setup mouse events
        _container.mousedown(function(e) {
          _moveBox(e);
          _mouse = e;
        });
        _container.mouseup(function() {
          _mouse = null;
        });
        _container.mousemove(function(e) {
          if (_mouse != null) _moveBox(e);
        });
      };
      
      init();

      return {
        viz: _over
      };
    },
  };
})({});

$NetworkMap.Utils.Links = (function() {
  return {
    link: function(nf, nt, id, m) {
      this.nodeFrom = nf;
      this.nodeTo = nt;
      this.id = id;
      this.metrics = m;
    }
  }
})();

$NetworkMap.Utils.Metrics = (function() {
  return {
    data: function(bandwidth, capacity, loss, latency) {
      this.bandwidth = bandwidth;
      this.capacity = capacity;
      this.loss = loss;
      this.latency = latency;
    },

    updateMetrics: function(viz, callback) {
      //TODO: get real data?
      var that = this;
      
      // update graph metrics
      viz.graph.eachNode(function(n) {
        n.eachAdjacency(function(adj) {

          jQuery.each(adj.data.links, function(index, link) {
            // callback(adj.fromNode, adj.toNode);
            var metrics = new that.data(),
                opts = [ 500, 1000, 2000 ],
                group = Math.random() * 100,
                band;

            if (!adj.data.metrics) metrics.capacity = opts[Math.round(Math.random() * (opts.length - 1))];
            else metrics.capacity = adj.data.metrics.capacity;

            // green
            if (group <= 80) {
              band = 10 + Math.random() * metrics.capacity * 0.20 - 10;

            // yellow
            } else if (group <= 95) {
              band = 10 + Math.random() * metrics.capacity * 0.75 - 10;
            
            //red
            } else {
              band = 10 + Math.random() * metrics.capacity - 10;
            }

            metrics.bandwidth = band;
            
            // fill in metrics
            link.data = { metrics: metrics };
          });
        });
      });
    }

  };

})();
