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
          // callback(adj.fromNode, adj.toNode);
          var metrics = new that.data();
          var opts = [ 500, 1000, 2000 ];

          if (!adj.data.metrics) metrics.capacity = opts[Math.round(Math.random() * (opts.length - 1))];
          else metrics.capacity = adj.data.metrics.capacity;
          
          metrics.bandwidth = 10 + Math.random() * metrics.capacity - 10;
          
          // fill in metrics
          adj.data.metrics = metrics;
        });
      });
    }

  };

})();
