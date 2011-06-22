$NetworkMap.Utils = {};

$NetworkMap.Utils.Metrics = (function() {
  
  return {
    data: function() {
      return {
        bandwidth: null,
        capacity: null,
        loss: null,
        latency: null
      }
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
