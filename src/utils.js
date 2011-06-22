$NetworkMap.Utils = {};

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
