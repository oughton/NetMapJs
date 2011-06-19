$NetworkMap = {};

$NetworkMap.Utils = (function() {
  
  return {
    updateMetrics: function(viz) {
      var graph = viz.graph,
          metrics;

      // update graph metrics
      graph.eachNode(function(n) {

      });

      graph.eachAdjacency(function(adj) {
      
      });

      // redraw
      viz.refresh();
    }
  };

})();
