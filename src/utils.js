$NetworkMap.Utils = {};
$NetworkMap.Views = {};

$NetworkMap.Views = (function() {

  return {
    Overview: function(viz, mapOpts) {
      var opts = jQuery.extend(true, {
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
      
      // setup overview visualisation
      var over = new $jit.NetworkMap(opts);
      var vizSize = viz.canvas.getSize();
      var overSize = over.canvas.getSize();
      over.loadJSON(jQuery.extend(true, [], viz.json));
      
      over.canvas.resize(overSize.width, 150);
      over.canvas.scale(overSize.width / vizSize.width, overSize.width / vizSize.width);
      
      // add to listen for navigation
      jQuery(viz.canvas.getElement()).bind('redraw', function() {
        over.refresh();
      });

      jQuery(over.canvas.getElement()).bind('redraw', function() {
        var ctx = over.canvas.getCtx(),
            size = viz.canvas.getSize(), 
            p1 = viz.c2p({ x: 0, y: 0 }),
            p2 = viz.c2p({ x: size.width, y: size.height });

        ctx.save();
        ctx.strokeStyle = 'rgb(255,255,0)';
        ctx.lineWidth = 10;
        ctx.strokeRect(p1.x, p1.y, Math.abs(p2.x - p1.x), Math.abs(p2.y - p1.y));
      });

      return {
        viz: over,

        translate: function(x, y) {
          //TODO: implement moving of overview box
        }
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
