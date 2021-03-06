$NetworkMap = {};

Layouts.NetworkMap = {};

/*
  Class: Layouts.NetworkMap.Arbor

  Force directed layout type. This class requires the arbor library (arborjs).
*/
Layouts.NetworkMap.Arbor = new Class({

  initialize: function(viz) {
    this.viz = viz;

    // make sure that the arbor library has been included
    if (typeof(arbor) == 'undefined') return;

    var canvas = viz.canvas,
        size = canvas.getSize();

    this.sys = arbor.ParticleSystem(1000, 600, 0.5);
    this.sys.parameters({ gravity:true });
    this.sys.renderer = (function() {
      var particleSystem;
      
      var that = {
        init: function(system) {
          particleSystem = system;
          particleSystem.screenSize(size.width, size.height);
          particleSystem.screenPadding(80);
        },

        redraw: function() {
          particleSystem.eachNode(function(node, pt) {
            viz.graph.getNode(node.name).setPos(new Complex(pt.x - size.width / 2, pt.y - size.height / 2), 'current');
          });
          viz.plot();
        }
      };

      return that;
    })();

    this.sys.stop();
  },
  
  getOptions: function(group, width, height, random) {
    var s = this.viz.canvas.getSize();
    var w = s.width, h = s.height;
    var count = group.nodes.length;
    var k2 = w * h / count, k = Math.sqrt(k2);
    var l = this.viz.config.levelDistance;
    var root = group.root ? group.root : group.nodes[0]; 
    var maxDim = 0;
    
    // adjust width and height to include node dims
    $.each(group.nodes, function(n) {
      maxDim = Math.max(n.getData('dim'), maxDim);
    });
    
    w -= maxDim * 4;
    h -= maxDim * 4;
    
    return {
      width: w,
      height: h,
      tstart: w * 0.1,
      nodef: function(x) { return k2 / (x || 1); },
      edgef: function(x) { return /* x * x / k; */ k * (x - l); },
      root: root.id
    };
  },
  
  compute: function(group, property, incremental) {
    var prop = $.splat(property || ['current', 'start', 'end']),
        graph = this.viz.graph,
        sys = this.sys,
        depth = group.depth;
    
    NodeDim.compute(this.viz.graph, prop, this.viz.config);

    jQuery.each(group.nodes, function(index, n) {
      n.eachAdjacency(function(adj) {
        var nodeFrom = adj.nodeFrom, nodeTo = adj.nodeTo;
        if (nodeFrom.data.depth == nodeTo.data.depth) {
          sys.addEdge(nodeFrom.id, nodeTo.id);
        }
      });
    });
    
    // Add in artificial edges for interconnecting groups.
    jQuery.each(graph.groups, function(index, g) {
      if (g.depth == depth + 1 && g.root) {
        g.root.eachAdjacency(function(adj) {
          var from = adj.nodeFrom.data.parentID, to = adj.nodeTo.data.parentID;

          if (from && from != to && graph.getNode(from).data.depth == graph.getNode(to).data.depth) {
            sys.addEdge(from, to);
          }
        });
      }
    });
  },
  
  computePositions: function(group, property, opt, incremental) {
  
  },
  
  computePositionStep: function(group, property, opt) {

  }
});

/*
  Class: Layouts.NetworkMap.ForceDirected
  
  Force directed layout based on thejit's implementation
*/
Layouts.NetworkMap.ForceDirected = new Class({

  initialize: function(viz) {
    this.viz = viz;
  },
  
  getOptions: function(group, width, height, random) {
    var s = this.viz.canvas.getSize();
    var w = s.width, h = s.height;
    var count = group.nodes.length;
    var k2 = w * h / count, k = Math.sqrt(k2);
    var l = this.viz.config.levelDistance;
    var root = group.root ? group.root : group.nodes[0]; 
    var maxDim = 0;
    
   // adjust width and height to include node dims
   $.each(group.nodes, function(n) {
      maxDim = Math.max(n.getData('dim'), maxDim);
    });
    
    w -= maxDim * 4;
    h -= maxDim * 4;
    
    return {
      width: w,
      height: h,
      tstart: w * 0.1,
      nodef: function(x) { return k2 / (x || 1); },
      edgef: function(x) { return /* x * x / k; */ k * (x - l); },
      root: root.id
    };
  },
  
  compute: function(group, property, incremental) {
    var prop = $.splat(property || ['current', 'start', 'end']);
    var opt = this.getOptions(group, 300, 300);
    NodeDim.compute(this.viz.graph, prop, this.viz.config);
    this.viz.graph.computeLevels(opt.root, 0, "ignore");
    $.each(group.nodes, function(n) {
      $.each(prop, function(p) {
        var pos = n.getPos(p);
        if(pos.equals(Complex.KER)) {
          pos.x = opt.width/5 * (Math.random() - 0.5);
          pos.y = opt.height/5 * (Math.random() - 0.5);
        }
        //initialize disp vector
        n.disp = {};
        $.each(prop, function(p) {
          n.disp[p] = $C(0, 0);
        });
      });
    });
    this.computePositions(group, prop, opt, incremental);
    
    if (group.id != '_TOP') {
      // map positions into parent nodes area
      $.each(group.nodes, function(n) {
        $.each(prop, function(p) {
          var p = n.getPos(p), dim = group.owner.getData('dim') / 2;
          p.x = Math.min(dim, Math.max(-dim, p.x));
          p.y = Math.min(dim, Math.max(-dim, p.y));
          p.x += group.owner.pos.x;
          p.y += group.owner.pos.y;
        });
      });
    }
  },
  
  computePositions: function(group, property, opt, incremental) {
    var times = this.viz.config.iterations, i = 0, that = this;
    if(incremental) {
      (function iter() {
        for(var total=incremental.iter, j=0; j<total; j++) {
          opt.t = opt.tstart * (1 - i++/(times -1));
          that.computePositionStep(group, property, opt);
          if(i >= times) {
            incremental.onComplete();
            return;
          }
        }
        incremental.onStep(Math.round(i / (times -1) * 100));
        setTimeout(iter, 1);
      })();
    } else {
      for(; i < times; i++) {
        opt.t = opt.tstart * (1 - i/(times -1));
        this.computePositionStep(group, property, opt);
      }
    }
  },
  
  computePositionStep: function(group, property, opt) {
    var graph = this.viz.graph;
    var min = Math.min, max = Math.max;
    var dpos = $C(0, 0);
    //calculate repulsive forces
    $.each(group.nodes, function(v) {
      //initialize disp
      $.each(property, function(p) {
        v.disp[p].x = 0; v.disp[p].y = 0;
      });
      $.each(group.nodes, function(u) {
        if(u.id != v.id) {
          $.each(property, function(p) {
            var vp = v.getPos(p), up = u.getPos(p);
            dpos.x = vp.x - up.x;
            dpos.y = vp.y - up.y;
            var norm = dpos.norm() || 1;
            v.disp[p].$add(dpos
                .$scale(opt.nodef(norm) / norm));
          });
        }
      });
    });
    //calculate attractive forces
    var T = !!graph.getNode(opt.root).visited;
    $.each(group.nodes, function(node) {
      node.eachAdjacency(function(adj) {
        // only apply forces to those nodes within this group
        if (adj.nodeFrom.data.parent !== adj.nodeTo.data.parent) {
          return;
        }

        var nodeTo = adj.nodeTo;
        if(!!nodeTo.visited === T) {
          $.each(property, function(p) {
            var vp = node.getPos(p), up = nodeTo.getPos(p);
            dpos.x = vp.x - up.x;
            dpos.y = vp.y - up.y;
            var norm = dpos.norm() || 1;
            node.disp[p].$add(dpos.$scale(-opt.edgef(norm) / norm));
            nodeTo.disp[p].$add(dpos.$scale(-1));
          });
        }
      });
      node.visited = !T;
    });
    //arrange positions to fit the canvas
    var t = opt.t, w2 = opt.width / 2, h2 = opt.height / 2;
    $.each(group.nodes, function(u) {
      $.each(property, function(p) {
        var disp = u.disp[p];
        var norm = disp.norm() || 1;
        var p = u.getPos(p);
        p.$add($C(disp.x * min(Math.abs(disp.x), t) / norm, 
            disp.y * min(Math.abs(disp.y), t) / norm));
//        p.x = min(w2, max(-w2, p.x));
//        p.y = min(h2, max(-h2, p.y));
      });
    });
  }
});

/*
  Class: Layouts.NetworkMap.Star

  Star layout type
*/
Layouts.NetworkMap.Star = new Class({

  initialize: function(viz) {
    this.viz = viz;
  },

  compute: function(group, property, incremental) {
    var prop = property || ['current', 'start', 'end'];
    var that = this, i = 0, n, circlePoints;

    n = group.root ? group.nodes.length - 1 : group.nodes.length;

    if (!group.owner) throw 'Star layout only works with a central node';

    circlePoints = this.getPointsOnCircle(group.owner.pos, group.owner.getData('dim') / 2, n);

    $.each(group.nodes, function(n) {
      var pt;

      // draw the root in the center if there is one
      if (n === group.root) {
        $.each(prop, function(p) {
          n.setPos(group.owner.pos, p);
        });
        return;
      }

      pt = circlePoints[i++];

      // fill in the nodes position for each property
      $.each(prop, function(p) {
        n.setPos($C(pt.x, pt.y), p);
      });
    });
  },

  getPointsOnCircle: function(center, radius, n) {
    var alpha = 2 * Math.PI / n, points = [], i = -1;
    
    while (++i < n) {
      points.push(center.add($C(Math.cos( alpha * i ) * radius, Math.sin( alpha * i ) * radius)));
    }

    return points;
  }
});

/*
  Class: Layouts.NetworkMap.Static

  A static layout type that loads in positions from nodes data attribute.
*/
Layouts.NetworkMap.Static = new Class({

  initialize: function(viz) {
    this.viz = viz;
  },

  compute: function(group, property, incremental) {
    var prop = property || ['current', 'start', 'end'];
    var that = this;

    $.each(group.nodes, function(n) {
      // fill in the nodes position for each property
      $.each(prop, function(p) {
        if (n.data.pos) n.setPos($C(n.data.pos.x, n.data.pos.y), p);
      });
    });
  }
});

/*
  Class: Canvas Helper Class

  Canvas helper methods that support using the Canvas in code.
*/
var CanvasHelper = new Class({
  
  /*
    Method: p2c

    Converts a position from network map space to screen space.

    Parameters:

      pos - x and y coordinate object

    Returns:

      A new x and y coordinate object in screen space.
  */
  p2c: function(pos) {
    var canvas = this.canvas,
        ctx = canvas.getCtx(),
        ox = canvas.translateOffsetX,
        oy = canvas.translateOffsetY,
        sx = canvas.scaleOffsetX,
        sy = canvas.scaleOffsetY,
        radius = canvas.getSize();
    
    return new Complex(
      pos.x * sx + ox + radius.width / 2,
      pos.y * sy + oy + radius.height / 2
    );
  },

  /*
    Method: c2p

    Converts a position from screen space to network map space.
    
    Parameters:

      pos - x and y coordinate object

    Returns:

      A new x and y coordinate object in network map space.
  */
  c2p: function(pos) {
    var canvas = this.canvas,
        ctx = canvas.getCtx(),
        ox = canvas.translateOffsetX,
        oy = canvas.translateOffsetY,
        sx = canvas.scaleOffsetX,
        sy = canvas.scaleOffsetY,
        radius = canvas.getSize();

    return new Complex(
      (pos.x - ox - radius.width / 2) / sx,
      (pos.y - oy - radius.height / 2) / sy
    );
  },

  /*
    Method: fitsInCanvas

    Check if a given point in within the bounds of the Canvas.

    Parameters:

      pos - x and y coordinate object

    Returns:
      
      True if the point is within the Canvas bounds, false otherwise.
  */
  fitsInCanvas: function(pos) {
    var size = this.canvas.getSize();
    if(pos.x >= size.width || pos.x < 0
       || pos.y >= size.height || pos.y < 0) return false;
     return true;
  }

});

/*
  Class: Groups
  
  Mixes in group handling functionality.

  TODO: use scale factor instead of scale offset (as this is not linear and not
  trivial). Eg 1.5x zoom, 2.0x zoom
*/
var Groups = new Class({
  
  /*
    Method: detailLevel

    Decides what detail level a given zoom offset is in. 

    Parameters:
      
      zoom    - the zoom offset
      levels  - an array of zoom offsets that define level boundaries

    Returns:

      An integer that is directly related to the detail level.
  */
  detailLevel: function(zoom, levels) {
    for (var i = 0; i < levels.length; i++) {
      if (!levels[i + 1] || zoom < levels[i + 1]) return i;
    }
  },

  /*
    Method: showAtLevel

    Determines whether or not something should be visible at the given level.

    Parameters:
      
      zoom    - the zoom offset
      level   - the given zoom level
      levels  - an array of zoom offsets that define level boundaries

    Returns:

      True if the given level is less than or equal to the current detail level,
      false otherwise.
  */
  showAtLevel: function(zoom, level, levels) {
    return this.detailLevel(zoom, levels) >= level;
  },

  /*
    Method: computeDimensions

    Set the sizes of map items to reflect the depth level that they fall in.
    This method change nodes dimensions.

    Parameters:

      group - the group of nodes
  */
  computeDimensions: function(group) {
    // group is not the top group
    if (group.owner) {

      // set the node size and edge width to reflect depth
      $.each(group.nodes, function(n) { 
        // nodes
        var dim = n.data.originalDim || n.getData('dim'),
            ownerDim = group.owner.getData('dim'),
            newDim = dim / Math.pow(group.owner.data.originalDim, n.data.depth);
        
        n.data.originalDim = dim;
        n.setData('dim', newDim);
        n.setData('height', newDim * 2);
        n.setData('width', newDim * 2);

        // edges
        n.eachAdjacency(function(adj) {
          if (adj.nodeTo.data.parentID == adj.nodeFrom.data.parentID) {
            adj.setData('lineWidth', newDim / dim * group.owner.Edge.lineWidth);
          } else {
            adj.setData('lineWidth', (newDim / dim * group.owner.Edge.lineWidth) * 20);
          }
        });
      });
      
    // the top group
    } else {
      $.each(group.nodes, function(n) {
        var dim = n.getData('dim');
        n.setData('width', dim * 2);
        n.setData('height', dim * 2);
        n.data.originalDim = dim;
      });
    }
  },

  /*
    Method: buildGroups

    Creates groups of nodes based on what nodes have what parents. Each group is
    assigned a depth so that it can be later match to a depth level of the
    network map.
  */
  buildGroups: function() {
    var raw = {}, groups = {}, nodes = [], flat = [], flatten, that = this,
        graph = this.graph;

    var computeLevels = function(groups, nodes, parentID, depth) {
      var group = { id: parentID, nodes: [], depth: depth, subgroups: {} };
      var more = [];

      // get the nodes that belong to this group
      jQuery.each(nodes, function(index, n) {
        var npid = n.data.parentID;

        // does this node belong to the current group
        if (!npid || npid == parentID) {
          group.nodes.push(n);
          n.data.depth = depth;

        // otherwise process it later
        } else {
          more.push(n);
        }
      });

      depth++;
      
      // build sub groups
      jQuery.each(group.nodes, function(index, n) {
        if (groups[n.id]) {
          group.subgroups[n.id] = computeLevels(groups, more, n.id, depth);
        }
      });

      return group;
    };

    graph.eachNode(function(n) {
      var group = n.data.parentID || '_TOP';
      nodes.push(n);
      if (!groups[group]) groups[group] = {};
    });
    
    raw = computeLevels(groups, nodes, '_TOP', 0);

    // fill in adjacencies
    graph.eachNode(function(n) {
      n.eachAdjacency(function(adj) {
        var from = adj.nodeFrom, to = adj.nodeTo;
        adj.data.depth = Math.max(from.data.depth, to.data.depth);
        if (from.data.parentID != to.data.parentID) {
          adj.data.depth--;
        }
      });
    });

    // create flat array of groups
    flatten = function(obj, arr) {
      var owner = graph.getNode(obj.id),
          group = { depth: obj.depth, id: obj.id, nodes: obj.nodes, owner: owner, subgroups: obj.subgroups };

      if (obj.subgroups.length < 1) return;
      arr.push(group);
      
      // set the nodes' subgroups and group
      if (owner) {
        owner.subgroups = obj.subgroups;
        owner.group = group;
      }

      jQuery.each(obj.subgroups, function(key, val) {
        flatten(val, arr);
      });
    };

    flatten(raw, flat);

    // sort by depth
    flat.sort(function(a, b) {
      if (a.depth < b.depth) return -1;
      else if (a.depth == b.depth) return 0;
      else return 1;
    });
    
    graph.groups = flat;
  },

  /*
    Method: computeLayouts

    Applies layout algorithms to all of the groups individually. Group roots are
    also set.

    Parameters:
      
      property    - what position property of the node to set in the laying out
      incremental - the number of incremental iterations to perform
  */
  computeLayouts: function(property, incremental) {
    var groups, that = this;
    
    // find and build all groups if they don't exist
    if (!this.graph.groups) {
      this.buildGroups();
    }

    groups = this.graph.groups;

    // set the roots
    jQuery.each(groups, function(index, group) {
      var root;
      
      jQuery.each(group.nodes, function(index, n) {
        if (n.data.root) root = n;
      });

      group.root = root;
    });

    // dispatch the groups
    jQuery.each(groups, function(index, group) {
      var layout = group.owner && group.owner.data.layout || that.config.layout;
      that.computeDimensions(group);
      that.layouts[layout].compute(group, property, incremental);
    });
  },

  /*
    Method: showGroups

    Show or hide the children of group nodes in an animated way based on levels.
  */
  showGroups: function() {
    var that = this,
        groups = this.graph.groups,
        sx = this.canvas.scaleOffsetX,
        size = this.canvas.getSize(),
        changed = false;
    
    this.graph.eachNode(function(n) {
      var par = n.data.parentID;
      
      if (!n.data.hideNeighbours) return;

      // for each adj within the common group
      n.eachAdjacency(function(adj) {
        var otherNode;
        if (adj.nodeFrom.data.parentID == par && adj.nodeTo.data.parentID == par) {
          otherNode = (adj.nodeFrom != n) ? adj.nodeFrom : adj.nodeTo;
          if ((otherNode.getData('height') * sx) / size.height < 0.01) {
            // check if this node should be animated out
            if (otherNode.drawn) {
              otherNode.setPos(n.getPos(), 'end');
              changed = true;
            }
            
            otherNode.drawn = false;
          } else {
            // check if this node should be animated in
            if (!otherNode.drawn) {
              otherNode.setPos(otherNode.getPos('start'), 'end');
              otherNode.setPos(n.getPos());
              changed = true;
            }
            
            otherNode.drawn = true;
          }
        }
      });

    });

    return changed;
  }
});

/*
  Class: NetworkMap

  Network Map (NetMapJs)

  Implements:
  
  All <Loader> methods
  
   Constructor Options:
   
   Inherits options from
   
   - <Options.Canvas>
   - <Options.Controller>
   - <Options.Node>
   - <Options.Edge>
   - <Options.Label>
   - <Options.Events>
   - <Options.Tips>
   - <Options.NodeStyles>
   - <Options.Navigation>
     
   Instance Properties:

   canvas - Access a <Canvas> instance.
   graph - Access a <Graph> instance.
   op - Access a <ForceDirected.Op> instance.
   fx - Access a <ForceDirected.Plot> instance.
   labels - Access a <ForceDirected.Label> interface implementation.

*/
$jit.NetworkMap = new Class( {

  Implements: [ Loader, Extras, Groups, CanvasHelper ],

  initialize: function(controller) {
    var $NetworkMap = $jit.NetworkMap;
    var that = this;

    var config = {
      layout: 'Static',
      groupLvls: [ 0, 6.5, 130 ],
      detailLvls: [ 0, 1.8 ],
      bgAlpha: 1
    };

    this.controller = this.config = $.merge(Options("Canvas", "Node", "Edge",
        "Fx", "Tips", "NodeStyles", "Events", "Navigation", "Controller", "Label"), config, controller);

    var canvasConfig = this.config;
    if(canvasConfig.useCanvas) {
      this.canvas = canvasConfig.useCanvas;
      this.config.labelContainer = this.canvas.id + '-label';
    } else {
      if(canvasConfig.background) {
        canvasConfig.background = $.merge({
          type: 'Circles'
        }, canvasConfig.background);
      }
      this.canvas = new Canvas(this, canvasConfig);
      this.config.labelContainer = (typeof canvasConfig.injectInto == 'string'? canvasConfig.injectInto : canvasConfig.injectInto.id) + '-label';
    }

    this.graphOptions = {
      complex: true,
      Node: {
        selected: false,
        exist: true,
        drawn: true,
        group: false,
        subgroups: {},
        
        // Custom setPos method that updates child groups
        setPos: function(value, type) { 
          type = type || "current";
          var pos, posDelta;

          if(type == "current") {
            pos = this.pos;
          } else if(type == "end") {
            pos = this.endPos;
          } else if(type == "start") {
            pos = this.startPos;
          }
          
          posDelta = new Complex(value.x - pos.x, value.y - pos.y);
          
          // Need to recalculate all child node positions.
          // By calling setPos on all group nodes, this will recursively cover
          // all of the sub groups.
          this.group && jQuery.each(this.group.nodes, function(index, node) {
            var p = node.getPos(type).clone();
            p.x += posDelta.x;
            p.y += posDelta.y;
            node.setPos(p, type);
          });

          pos.set(value);
        }
      }
    };
    this.graph = new Graph(this.graphOptions, this.config.Node,
        this.config.Edge);
    this.labels = new $NetworkMap.Label[canvasConfig.Label.type](this);
    this.fx = new $NetworkMap.Plot(this, $NetworkMap);
    this.op = new $NetworkMap.Op(this);
    this.json = null;
    this.busy = false;
    // initialize extras
    this.initializeExtras();

    // the layouts object contains all of the layout types as properties
    this.layouts = {
      'Static': new Layouts.NetworkMap.Static(this),
      'ForceDirected': new Layouts.NetworkMap.ForceDirected(this),
      'Arbor': new Layouts.NetworkMap.Arbor(this),
      'Star': new Layouts.NetworkMap.Star(this)
    };
  },

  /*
    Method: loadLayers

    Loads layer functionality. This supports nodes being assigned to layers such
    that they only become visible when a specified depth is reached.

    Parameters:

      json - the network map json structure
  */
  loadLayers: function(json) {
    var useLayers = false,
        layers = {}, layersArr = [],
        graph;

    // set up the base graph
    this.loadJSON(json);
    graph = this.graph;

    // check for layers
    jQuery.each(json, function(index, n) {
      n.adjacencies && jQuery.each(n.adjacencies, function(index, adj) {
        if (adj.data && adj.data.layers) {
          useLayers = true;
          return false;
        }
      });
      if (useLayers = true) return false;
    });
    
    // build layers
    if (useLayers) {
      
      // init the layers
      graph.eachNode(function(n) {
        n.eachAdjacency(function(adj) {
          adj.data.layers && jQuery.each(adj.data.layers, function(i, id) {
            if (layers[id] == undefined) {
              layers[id] = { id: id, json: jQuery.extend(true, {}, json) };
            }
          });
        });
      });
      
      // perform alterations on the layers
      jQuery.each(layers, function(id, layer) {
        jQuery.each(layer.json, function(index, node) {
          jQuery.each(node.adjacencies, function(index, adj) {
            if (adj.data && adj.data.layers.indexOf(id) != -1) {
              adj.nodeTo = adj.data.layers[id].nodeTo;
            }
          });
        });
      });

      // save the layer graphs
      this.layers = layersArr;
    }
  },

  /* 
    Method: refresh 
    
    Computes positions and plots the map.
  */
  refresh: function() {
    this.computeLayouts();
    this.plot();
  },

  /*
    Method: reposition

    Computes positions and sets them to their end property
  */
  reposition: function() {
    this.computeLayouts('end');
    jQuery(this.canvas.getElement()).trigger('computePositions', [this, this.graph]);
  },

  /*
    Method: end

    Draws the map in its end position state
  */
  end: function() {
    this.graph.eachNode(function(n) {
      var pos = n.getPos('end');
      jQuery.each(['current', 'start', 'end'], function(index, prop) {
        n.setPos(pos, prop);
      });
    });
    this.plot();
  },

/*
  Method: computeIncremental
  
  Performs the Force Directed algorithm incrementally.
  
  Description:
  
  ForceDirected algorithms can perform many computations and lead to JavaScript taking too much time to complete. 
  This method splits the algorithm into smaller parts allowing the user to track the evolution of the algorithm and 
  avoiding browser messages such as "This script is taking too long to complete".
  
  Parameters:
  
  opt - (object) The object properties are described below
  
  iter - (number) Default's *20*. Split the algorithm into pieces of _iter_ iterations. For example, if the _iterations_ configuration property 
  of your <ForceDirected> class is 100, then you could set _iter_ to 20 to split the main algorithm into 5 smaller pieces.
  
  property - (string) Default's *end*. Whether to update starting, current or ending node positions. Possible values are 'end', 'start', 'current'. 
  You can also set an array of these properties. If you'd like to keep the current node positions but to perform these 
  computations for final animation positions then you can just choose 'end'.
  
  onStep - (function) A callback function called when each "small part" of the algorithm completed. This function gets as first formal 
  parameter a percentage value.
  
  onComplete - A callback function called when the algorithm completed.
  
  Example:
  
  In this example I calculate the end positions and then animate the graph to those positions
  
  (start code js)
  var fd = new $jit.ForceDirected(...);
  fd.computeIncremental({
    iter: 20,
    property: 'end',
    onStep: function(perc) {
      Log.write("loading " + perc + "%");
    },
    onComplete: function() {
      Log.write("done");
      fd.animate();
    }
  });
  (end code)
  
  In this example I calculate all positions and (re)plot the graph
  
  (start code js)
  var fd = new ForceDirected(...);
  fd.computeIncremental({
    iter: 20,
    property: ['end', 'start', 'current'],
    onStep: function(perc) {
      Log.write("loading " + perc + "%");
    },
    onComplete: function() {
      Log.write("done");
      fd.plot();
    }
  });
  (end code)
  
  */
  computeIncremental: function(opt) {
    opt = $.merge( {
      iter: 20,
      property: 'end',
      onStep: $.empty,
      onComplete: $.empty
    }, opt || {});

    this.config.onBeforeCompute(this.graph.getNode(this.root));
    this.computeLayouts(opt.property, opt);
    jQuery(this.canvas.getElement()).trigger('computePositions', [this, this.graph]);
  },

  /*
    Method: plot
   
    Plots the ForceDirected graph. This is a shortcut to *fx.plot*.
   */
  plot: function() {
    this.fx.plot();
    jQuery(this.canvas.getElement()).trigger('computePositions', [this, this.graph]);
  },

  /*
     Method: animate
    
     Animates the graph from the current positions to the 'end' node positions.
  */
  animate: function(opt) {
    this.fx.animate($.merge( {
      modes: [ 'linear' ]
    }, opt || {}));
  },

  /*
    Method: zoomNode

    Moves the canvas view port such that a given node is centered on the screen
    and zoomed in on.

    Parameters:

      node  - the node to center the canvas around
      t     - the time to take for the centering
      fps   - the fps rate to attempt to achieve
  */
  zoomNode: function(node, t, fps) {
    var that = this,
        dim = node.getData('dim'),
        pos = node.getPos(),
        size = this.canvas.getSize(),
        oz = this.canvas.scaleOffsetX,
        cp = this.c2p(new Complex(size.width / 2, size.height / 2)),
        ms, steps, 
        zf = size.width / (oz * dim * 4), zd,
        tdx = cp.x - pos.x, tdy = cp.y - pos.y,
        interval, zoom;

    if (t) {
      fps = fps ? fps : 40;
      ms = 1000 / fps;
      steps = Math.round(fps * 0.2);
      tdx = tdx / steps;
      tdy = tdy / steps;
     
      interval = setInterval(function() {
        steps = steps - 1;
        if (steps < 1) {
          clearInterval(interval);
          zoom();
        }
        that.canvas.translate(tdx, tdy);

      }, ms);

      zoom = function() {
        interval = setInterval(function() {
          if (that.canvas.scaleOffsetX < zf * oz) {
            that.canvas.scale(1.1, 1.1);
          } else {
            that.canvas.scaleOffsetX >= zf * oz && clearInterval(interval);
          }
        }, ms);
      }

    } else {
      this.canvas.scale(zf, zf);
      this.canvas.translate(tdx, tdy);
    }
  },

  /*
    Method: followEdge

    Follows an edge from a given node to another.

    Parameters:
      
      fromNode  - the from node
      toNode    - the to node
      t         - the time to take for the movement
      fps       - the attempted frame rate
      center    - true if the destination node should be centered on the screen
  */
  followEdge: function(fromNode, toNode, t, fps, center) {
    var that = this,
        interval,
        canvas = this.canvas,
        radius = canvas.getSize(),
        ms = fps ? (1000 / fps) : 40,
        from = fromNode.getPos(),
        to = toNode.getPos(),
        center = (center == undefined) ? true : center,
        pt, m, c, axis, dir, center, delta, centerPt;

    // should we apply centering?
    if (center) {
      centerPt = this.c2p(new Complex(radius.width / 2, radius.height / 2));
      to = new Complex(to.x + (from.x - centerPt.x), to.y + (from.y - centerPt.y));
    }

    pt = new Complex(from.x, from.y);
    m = (to.y - from.y) / (to.x - from .x);
    c = from.y - m * from.x;
    axis = (Math.abs(from.x - to.x) > Math.abs(from.y - to.y)) ? 'x' : 'y';
    dir = pt[axis] < to[axis];
    delta = ( Math.abs(from[axis] - to[axis]) ) / ( t * (500 / ms) );

    // animation interval
    interval = setInterval(function() {
      var move = {},
          interp;
      
      // stop moving when the direction changes
      if (dir != pt[axis] < to[axis]) {
        clearInterval(interval);

        // force centering at the end
        centerPt = that.c2p(new Complex(radius.width / 2, radius.height / 2));
        to = toNode.getPos();
        canvas.translate(centerPt.x - to.x, centerPt.y - to.y);
        return;
      }

      if (pt[axis] < to[axis]) {
        pt[axis] += delta;
        move[axis] = -delta;
      } else {
        pt[axis] -= delta;
        move[axis] = delta;
      }
        
      if (axis == 'x') {
        interp = m * pt[axis] + c;
        move['y'] = pt.y - interp;
        pt['y'] = interp;
      } else {
        interp = (pt[axis] - c) / m;
        move['x'] = pt.x - interp; 
        pt['x'] = interp;
      }
      
      canvas.translate(move.x, move.y);
    }, ms);
  },

  /*
    Method: renderFactory

    Decides what map entities should be shown and with what alpha.

    Parameters:

      entity    - the entity that wants to be drawn
      canvas    - the canvas that the entity is to be drawn onto
      animating - whether or not the entity is to be animated in

    Returns:

      True if the entity should be drawn (ie it is visible) or false otherwise.
  */
  renderFactory: function(entity, canvas, animating) {
    var ctx = canvas.getCtx(),
        zo = canvas.scaleOffsetX;

    if (entity.data.depth >= this.detailLevel(zo, this.config.groupLvls)) {

    // reduce the alpha level if the entity is in the background
    } else {
      ctx.globalAlpha = this.config.bgAlpha;
    }
    
    if (entity.data.layers && 
          entity.data.layers.indexOf(this.detailLevel(zo, this.config.detailLvls)) == -1) {
      return false;
    }

    return true;
  },

  /*
    Method: getPositions

    Gets all of the node's x,y positions

    Returns:

      An object populated with node ids pointing to their positions.
  */
  getPositions: function() {
    var pos = {};
    $.each(this.graph.nodes, function(n) {
      pos[n.id] = n.getPos();
    });

    return pos;
  },

  /*
    Method: loadPositions

    Loads in node positions.

    Parameters:
      
      positions - an object with key = ids and value = position
  */
  loadPositions: function(positions) {
    $.each(this.graph.nodes, function(n) {
      if (positions[n.id]) {
        $.each(['start', 'current', 'end'], function(p) {
          n.setPos(positions[n.id], p);
        });
      }
    });
  }
});

$jit.NetworkMap.$extend = true;

(function(NetworkMap) {

  /*
     Class: NetworkMap.Op
     
     Custom extension of <Graph.Op>.

     Extends:

     All <Graph.Op> methods
     
     See also:
     
     <Graph.Op>

  */
  NetworkMap.Op = new Class( {

    Implements: Graph.Op

  });

  /*
    Class: NetworkMap.Plot
    
    Custom extension of <Graph.Plot>.
  
    Extends:
  
    All <Graph.Plot> methods
    
    See also:
    
    <Graph.Plot>
  
  */
  NetworkMap.Plot = new Class( {

    Implements: Graph.Plot,

    plot: function(opt, animating) {
      var viz = this.viz, 
          aGraph = viz.graph, 
          canvas = viz.canvas, 
          id = viz.root, 
          that = this, 
          ctx = canvas.getCtx(), 
          min = Math.min,
          opt = opt || this.viz.controller;
      
      opt.clearCanvas && canvas.clear();
      
      // fire plot begin event
      jQuery(canvas.getElement()).trigger('plotbegin', [viz, canvas, ctx]);
        
      var root = aGraph.getNode(id);
      if(!root) return;
      
      var T = !!root.visited;
      aGraph.eachNode(function(node) {
        var nodeAlpha = node.getData('alpha');
        node.eachAdjacency(function(adj) {
          var nodeTo = adj.nodeTo;
          if(!!nodeTo.visited === T && node.drawn && nodeTo.drawn 
              && that.viz.showAtLevel(canvas.scaleOffsetX, adj.data.depth, that.config.groupLvls)) {
            !animating && opt.onBeforePlotLine(adj);
            that.plotLine(adj, canvas, animating);
            !animating && opt.onAfterPlotLine(adj);
          }
        });
        if(node.drawn) {
          !animating && opt.onBeforePlotNode(node);
          that.plotNode(node, canvas, animating);
          !animating && opt.onAfterPlotNode(node);
        }
        if(!that.labelsHidden && opt.withLabels) {
          if(node.drawn && nodeAlpha >= 0.95) {
            that.labels.plotLabel(canvas, node, opt);
          } else {
            that.labels.hideLabel(node, false);
          }
        }
        node.visited = !T;
      });
      
      // fire redraw event
      jQuery(canvas.getElement()).trigger('redraw');
    },
  
    /*
       Method: plotNode
    
       Plots a <Graph.Node>.

       Parameters:
       
       node - (object) A <Graph.Node>.
       canvas - (object) A <Canvas> element.

    */
    plotNode: function(node, canvas, animating) {
        var f = node.getData('type'), 
            ctxObj = this.node.CanvasStyles;
        if(f != 'none') {
          var width = node.getData('lineWidth'),
              color = node.getData('color'),
              alpha = node.getData('alpha'),
              ctx = canvas.getCtx();
          ctx.save();
          ctx.lineWidth = width;
          ctx.fillStyle = ctx.strokeStyle = color;
          ctx.globalAlpha = alpha;
          
          for(var s in ctxObj) {
            ctx[s] = node.getCanvasStyle(s);
          }

          this.viz.renderFactory(node, canvas, animating) &&
            this.nodeTypes[f].render.call(this, node, canvas, animating);
          ctx.restore();
        }
    },

    /*
       Method: plotLine
    
       Custom extension of <Graph.Plot>.

       Parameters:

       adj - (object) A <Graph.Adjacence>.
       canvas - (object) A <Canvas> instance.

    */
    plotLine: function(adj, canvas, animating) {
      var f = adj.getData('type'),
          ctxObj = this.edge.CanvasStyles;
      if(f != 'none') {
        var width = adj.getData('lineWidth'),
            color = adj.getData('color'),
            ctx = canvas.getCtx(),
            nodeFrom = adj.nodeFrom,
            nodeTo = adj.nodeTo;
        
        ctx.save();
        ctx.lineWidth = width;
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.globalAlpha = Math.min(nodeFrom.getData('alpha'), 
            nodeTo.getData('alpha'), 
            adj.getData('alpha'));
        
        for(var s in ctxObj) {
          ctx[s] = adj.getCanvasStyle(s);
        }

        this.viz.renderFactory(adj, canvas, animating) &&
          this.edgeTypes[f].render.call(this, adj, canvas, animating);
        ctx.restore();
      }
    }    
   });

  /*
    Class: ForceDirected.Label
    
    Custom extension of <Graph.Label>. 
    Contains custom <Graph.Label.SVG>, <Graph.Label.HTML> and <Graph.Label.Native> extensions.
  
    Extends:
  
    All <Graph.Label> methods and subclasses.
  
    See also:
  
    <Graph.Label>, <Graph.Label.Native>, <Graph.Label.HTML>, <Graph.Label.SVG>.
  
  */
  NetworkMap.Label = {};

  /*
     NetworkMap.Label.Native
     
     Custom extension of <Graph.Label.Native>.

     Extends:

     All <Graph.Label.Native> methods

     See also:

     <Graph.Label.Native>

  */
  NetworkMap.Label.Native = new Class( {
    Implements: Graph.Label.Native,

    initialize: function(viz) {
      this.viz = viz;
    },

    renderLabel: function(canvas, node, controller) {
      var ctx = canvas.getCtx();
      var pos = node.pos.getc(true),
          sx = canvas.scaleOffsetX,
          sy = canvas.scaleOffsetY;

      if (sx > 4 && node.data.parentID || !node.data.parentID) {
        ctx.fillText(node.name, pos.x, pos.y + node.getData("height"));
      }
    }
  });

  /*
    NetworkMap.Label.SVG
    
    Custom extension of <Graph.Label.SVG>.
  
    Extends:
  
    All <Graph.Label.SVG> methods
  
    See also:
  
    <Graph.Label.SVG>
  
  */
  NetworkMap.Label.SVG = new Class( {
    Implements: Graph.Label.SVG,

    initialize: function(viz) {
      this.viz = viz;
    },

    /* 
       Method: placeLabel

       Overrides abstract method placeLabel in <Graph.Label>.

       Parameters:

       tag        - A DOM label element.
       node       - A <Graph.Node>.
       controller - A configuration/controller object passed to the visualization.
      
     */
    placeLabel: function(tag, node, controller) {
      var pos = node.pos.getc(true), 
          canvas = this.viz.canvas,
          ox = canvas.translateOffsetX,
          oy = canvas.translateOffsetY,
          sx = canvas.scaleOffsetX,
          sy = canvas.scaleOffsetY,
          radius = canvas.getSize();
      var labelPos = {
        x: Math.round(pos.x * sx + ox + radius.width / 2),
        y: Math.round(pos.y * sy + oy + radius.height / 2)
      };
      tag.setAttribute('x', labelPos.x);
      tag.setAttribute('y', labelPos.y);

      controller.onPlaceLabel(tag, node);
    }
  });

  /*
     NetworkMap.Label.HTML
     
     Custom extension of <Graph.Label.HTML>.

     Extends:

     All <Graph.Label.HTML> methods.

     See also:

     <Graph.Label.HTML>

  */
  NetworkMap.Label.HTML = new Class( {
    Implements: Graph.Label.HTML,

    initialize: function(viz) {
      this.viz = viz;
    },

    plotLabel: function(canvas, node, controller) {
      var id = this.viz.canvas.id + "." + node.id, tag = this.getLabel(id);
      
      if(!tag && !(tag = document.getElementById(id))) {
        tag = document.createElement('div');
        var container = this.getLabelContainer();
        tag.id = id;
        tag.className = 'node';
        tag.style.position = 'absolute';
        controller.onCreateLabel(tag, node);
        container.appendChild(tag);
        this.labels[node.id] = tag;
      }

      this.placeLabel(tag, node, controller);
    },

    /* 
       Method: placeLabel

       Overrides abstract method placeLabel in <Graph.Plot>.

       Parameters:

       tag        - A DOM label element.
       node       - A <Graph.Node>.
       controller - A configuration/controller object passed to the visualization.
      
     */
    placeLabel: function(tag, node, controller) {
      var pos = node.pos.getc(true), 
          height = node.getData('height'),
          canvas = this.viz.canvas,
          ctx = canvas.getCtx(),
          ox = canvas.translateOffsetX,
          oy = canvas.translateOffsetY,
          sx = canvas.scaleOffsetX,
          sy = canvas.scaleOffsetY,
          radius = canvas.getSize();
      var labelPos = {
        x: Math.round(pos.x * sx + ox + radius.width / 2),
        y: Math.round((pos.y + height / 2) * sy + oy + radius.height / 2)
      };
      var style = tag.style;

      if (this.fitsInCanvas(labelPos, canvas)) {
        style.display = '';
        
        // use % of screen real estate to decide when to show labels
        if (!this.viz.showAtLevel(sx, node.data.depth, this.viz.config.groupLvls)) {
          style.display = 'none';
        }
        
        if (node.data.layers && node.data.layers.indexOf(this.viz.detailLevel(sx, this.viz.config.detailLvls)) == -1) {
          style.display = 'none';
        }

      } else {
        style.display = 'none';
      }
      
      style.left = labelPos.x + 'px';
      style.top = labelPos.y + 'px';

      controller.onPlaceLabel(tag, node);
    }
  });

  /*
    Class: NetworkMap.Plot.NodeTypes

    This class contains a list of <Graph.Node> built-in types. 
    Node types implemented are 'none', 'circle', 'triangle', 'rectangle', 'star', 'ellipse' and 'square'.

    You can add your custom node types, customizing your visualization to the extreme.

    Example:

    (start code js)
      NetworkMap.Plot.NodeTypes.implement({
        'mySpecialType': {
          'render': function(node, canvas) {
            //print your custom node to canvas
          },
          //optional
          'contains': function(node, pos) {
            //return true if pos is inside the node or false otherwise
          }
        }
      });
    (end code)

  */
  NetworkMap.Plot.NodeTypes = new Class({
    'none': {
      'render': $.empty,
      'contains': $.lambda(false)
    },
    'group': {
      'render': function(node, canvas){
        var pos = node.pos.getc(true), 
            dim = node.getData('dim'),
            ctx = canvas.getCtx();
     
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = node.getData('lineWidth') / (node.data.depth * 20); // TODO: get rid of magic number (20)
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.arc(pos.x, pos.y, dim, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      },
      'contains': function(node, pos){
        var npos = node.pos.getc(true), 
            dim = node.getData('dim');
        return this.nodeHelper.circle.contains(npos, pos, dim);
      }
    },
    'circle': {
      'render': function(node, canvas){
        var pos = node.pos.getc(true), 
            dim = node.getData('dim');
        this.nodeHelper.circle.render('fill', pos, dim, canvas);
      },
      'contains': function(node, pos){
        var npos = node.pos.getc(true), 
            dim = node.getData('dim');
        return this.nodeHelper.circle.contains(npos, pos, dim);
      }
    },
    'ellipse': {
      'render': function(node, canvas){
        var pos = node.pos.getc(true), 
            width = node.getData('width'), 
            height = node.getData('height');
        this.nodeHelper.ellipse.render('fill', pos, width, height, canvas);
        },
      'contains': function(node, pos){
        var npos = node.pos.getc(true), 
            width = node.getData('width'), 
            height = node.getData('height');
        return this.nodeHelper.ellipse.contains(npos, pos, width, height);
      }
    },
    'square': {
      'render': function(node, canvas){
        var pos = node.pos.getc(true), 
            dim = node.getData('dim');
        this.nodeHelper.square.render('fill', pos, dim, canvas);
      },
      'contains': function(node, pos){
        var npos = node.pos.getc(true), 
            dim = node.getData('dim');
        return this.nodeHelper.square.contains(npos, pos, dim);
      }
    },
    'rectangle': {
      'render': function(node, canvas){
        var pos = node.pos.getc(true), 
            width = node.getData('width'), 
            height = node.getData('height');
        this.nodeHelper.rectangle.render('fill', pos, width, height, canvas);
      },
      'contains': function(node, pos){
        var npos = node.pos.getc(true), 
            width = node.getData('width'), 
            height = node.getData('height');
        return this.nodeHelper.rectangle.contains(npos, pos, width, height);
      }
    },
    'triangle': {
      'render': function(node, canvas){
        var pos = node.pos.getc(true), 
            dim = node.getData('dim');
        this.nodeHelper.triangle.render('fill', pos, dim, canvas);
      },
      'contains': function(node, pos) {
        var npos = node.pos.getc(true), 
            dim = node.getData('dim');
        return this.nodeHelper.triangle.contains(npos, pos, dim);
      }
    },
    'star': {
      'render': function(node, canvas){
        var pos = node.pos.getc(true),
            dim = node.getData('dim');
        this.nodeHelper.star.render('fill', pos, dim, canvas);
      },
      'contains': function(node, pos) {
        var npos = node.pos.getc(true),
            dim = node.getData('dim');
        return this.nodeHelper.star.contains(npos, pos, dim);
      }
    }
  });

  /*
    Class: NetworkMap.Plot.EdgeTypes
  
    This class contains a list of <Graph.Adjacence> built-in types. 
    Edge types implemented are 'none', 'line' and 'arrow'.
  
    You can add your custom edge types, customizing your visualization to the extreme.
  
    Example:
  
    (start code js)
      NetworkMap.Plot.EdgeTypes.implement({
        'mySpecialType': {
          'render': function(adj, canvas) {
            //print your custom edge to canvas
          },
          //optional
          'contains': function(adj, pos) {
            //return true if pos is inside the arc or false otherwise
          }
        }
      });
    (end code)
  
  */
  NetworkMap.Plot.EdgeTypes = new Class({
    'none': $.empty,
    'line': {
      'render': function(adj, canvas) {
        var from = adj.nodeFrom.pos.getc(true),
            to = adj.nodeTo.pos.getc(true),
            ctx = canvas.getCtx();
        
        ctx.lineWidth = 1 / canvas.scaleOffsetX;
        this.edgeHelper.line.render(from, to, canvas);
      },
      'contains': function(adj, pos) {
        var from = adj.nodeFrom.pos.getc(true),
            to = adj.nodeTo.pos.getc(true);
        return this.edgeHelper.line.contains(from, to, pos, this.edge.epsilon);
      }
    },
    'arrow': {
      'render': function(adj, canvas) {
        var from = adj.nodeFrom.pos.getc(true),
            to = adj.nodeTo.pos.getc(true),
            dim = adj.getData('dim'),
            direction = adj.data.$direction,
            inv = (direction && direction.length>1 && direction[0] != adj.nodeFrom.id);
        this.edgeHelper.arrow.render(from, to, dim, inv, canvas);
      },
      'contains': function(adj, pos) {
        var from = adj.nodeFrom.pos.getc(true),
            to = adj.nodeTo.pos.getc(true);
        return this.edgeHelper.arrow.contains(from, to, pos, this.edge.epsilon);
      }
    },
    'dblarrow': {
      'render': function(adj, canvas) {
        var from = adj.nodeFrom.pos.getc(true),
            to = adj.nodeTo.pos.getc(true),
            dim = adj.getData('lineWidth') * 10,
            direction = adj.data.$direction,
            inv = (direction && direction.length>1 && direction[0] != adj.nodeFrom.id),
            graph = this.viz.graph,
            otherAdj = graph.getAdjacence(adj.nodeTo.id, adj.nodeFrom.id),
            midpt;
        
        // check if there is another adj in the ther direction
        if (otherAdj) {
          // find the midpoint of the line
          midpt = new Complex((to.x + from.x) / 2, (to.y + from.y) / 2);

          this.edgeHelper.arrow.render(from, midpt, dim, inv, canvas);
          this.edgeHelper.arrow.render(to, midpt, dim, inv, canvas);
        } else {
          this.edgeHelper.arrow.render(from, to, dim, inv, canvas);
        }
      },
      'contains': function(adj, pos) {
        var from = adj.nodeFrom.pos.getc(true),
            to = adj.nodeTo.pos.getc(true);
        return this.edgeHelper.arrow.contains(from, to, pos, this.edge.epsilon);
      }
    },
    'arrowpipe': {
      'render': function(adj, canvas) {
        var from = adj.nodeFrom.pos.getc(true),
            to = adj.nodeTo.pos.getc(true),
            direction = adj.data.$direction,
            inv = (direction && direction.length>1 && direction[0] != adj.nodeFrom.id),
            graph = this.viz.graph,
            otherAdj = graph.getAdjacence(adj.nodeTo.id, adj.nodeFrom.id),
            midpt,
            ctx = canvas.getCtx(),
            metrics = {},
            dimFrom = 0, dimTo = 0,
            h1, h2, as, w1, w2;

        // find the edge in the other direction
        adj.data.links && jQuery.each(adj.data.links, function(index, link) {
          if (link.nodeFrom == adj.nodeFrom.id) metrics.from = link.data.metrics;
          else metrics.to = link.data.metrics;
        });

        var getColour = function(p, a) {
          var c;
          
          if      (p <= 20)   c = 'rgba(0,255,0,' + a + ')';
          else if (p <= 70)   c = 'rgba(255,255,0,' + a + ')';
          else                c = 'rgba(255,0,0,' + a + ')';
          
          // karens colour scheme
          /*if      (p <= 1)  c = 'rgb(0,111,141)';
          else if (p <= 10) c = 'rgb(69,164,69)';
          else if (p <= 20) c = 'rgb(194,196,9)';
          else if (p <= 30) c = 'rgb(255,144,0)';
          else              c = 'rgb(196,15,45)';*/

          return c;
        };
        
        // perform a rotated drawing by a given number of radians
        var drawRotated = function(rad, pos, size, callback) {
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.rotate(rad);
          ctx.translate(-size.width / 2, -size.height / 2);

          callback();

          ctx.restore();
        };

        var drawArrow = function(x, width, height, dir) {
            if (dir != 'right') height *= -1;

            ctx.beginPath();
            ctx.moveTo(x - height, 0);
            ctx.lineTo(x, width / 2);
            ctx.lineTo(x - height, width);
            ctx.lineTo(x - height, 0);
            ctx.closePath();
        };

        // decide on dim's
        if (adj.nodeFrom.data.parentID == adj.nodeTo.data.parentID) {
          dimFrom = adj.nodeFrom.getData('dim');
          dimTo = adj.nodeTo.getData('dim');

        } else if (adj.nodeFrom.data.parentID && adj.nodeTo.data.parentID) {
          from = graph.getNode(adj.nodeFrom.data.parentID).pos.getc(true);
          to = graph.getNode(adj.nodeTo.data.parentID).pos.getc(true);
          dimFrom = graph.getNode(adj.nodeFrom.data.parentID).getData('dim');
          dimTo = graph.getNode(adj.nodeTo.data.parentID).getData('dim');

          // watch out for connections between levels
          if (adj.nodeFrom.data.depth > adj.nodeTo.data.depth) {
            dimTo = adj.nodeTo.getData('dim');
          } else if (adj.nodeTo.data.depth > adj.nodeFrom.data.depth) {
            dimFrom = adj.nodeFrom.getData('dim');
          }
        }

        // check if there is another adj in the other direction
        if (otherAdj) {
          midpt = new Complex((to.x + from.x) / 2, (to.y + from.y) / 2);
          var cp = $C((from.x + to.x) / 2, (from.y + to.y) / 2);
          var width = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
          var rot = Math.atan((to.y - cp.y) / (to.x - cp.x));
          var rp = $C(cp.x - width / 2, (from.y + to.y) / 2);
          var offset = 0;
         
          if (adj.data.depth >= this.viz.detailLevel(canvas.scaleOffsetX, this.config.groupLvls)) {
            // shorten edges
            // determine where to join edges to
            if (!adj.nodeFrom.data.hideNeighbours) {
              width = width - dimFrom;
              offset = dimTo - dimFrom;
            }
            if (!adj.nodeTo.data.hideNeighbours) {
              width = width - dimTo;
              offset = dimTo - dimFrom;
            }
            if (adj.nodeTo.data.hideNeighbours && adj.nodeFrom.data.hideNeighbours) {
              width = width - dimTo - dimFrom;
              offset = 0;
            } else if (adj.nodeTo.data.hideNeighbours || adj.nodeFrom.data.hideNeighbours) {
              
              if (adj.nodeFrom.data.hideNeighbours) {
                offset = +dimTo;
              } else {
                offset = -dimFrom;
              }
            }
          }
          
          // flip the pipe offset around so it is always from left to right
          if (from.x > to.x) {
            offset *= -1
          }

          // make sure we have metrics
          if (metrics.from == undefined) {
            metrics.from =  new $NetworkMap.Utils.Metrics.data(0, 1000, 0, 0);
          }
          if (metrics.to == undefined) {
            metrics.to = new $NetworkMap.Utils.Metrics.data(0, 1000, 0, 0);
          }

          // TODO: this fixes both directions capacity to be the same
          metrics.from.capacity = metrics.to.capacity;

          // make sure the bandwidth is not over the capacity
          if (metrics.from.bandwidth > metrics.from.capacity) {
            metrics.from.bandwidth = metrics.from.capacity;
          }
          if (metrics.to.bandwidth > metrics.to.capacity) {
            metrics.to.bandwidth = metrics.to.capacity;
          }

          h1 = (metrics.from.capacity / 1500) * 10 / canvas.scaleOffsetY;
          h2 = (metrics.to.capacity / 1500) * 10 / canvas.scaleOffsetY;
          w1 = (metrics.from.bandwidth / metrics.from.capacity) * width / 2;
          w2 = (metrics.to.bandwidth / metrics.to.capacity) * width / 2;

          adj.data.size = { width: Math.max(w1, w2), height: Math.max(h1, h2) };
          as = 3 / canvas.scaleOffsetY;

          drawRotated(rot, cp, { width: width + offset, height: h1 }, function() {
            ctx.strokeStyle = 'rgb(255,255,255)';
            ctx.lineWidth = 1 / canvas.scaleOffsetY;
            ctx.strokeRect(0, 0, width / 2, h1);
            
            ctx.fillStyle = getColour(metrics.from.bandwidth / metrics.from.capacity * 100, 1);
            ctx.fillRect(0, 0, w1 - as + 0.5 / canvas.scaleOffsetY, h1);
            
            // draw arrow head
            drawArrow(w1, h1, as, 'right');
            ctx.fill();
          });

          drawRotated(rot, cp, { width: width + offset, height: h2 }, function() {
            ctx.strokeStyle = 'rgb(255,255,255)';
            ctx.lineWidth = 1 / canvas.scaleOffsetY;
            ctx.strokeRect(0 + width / 2, 0, width / 2, h2);
            
            ctx.fillStyle = getColour(metrics.to.bandwidth / metrics.to.capacity * 100, 1);
            ctx.fillRect(width - w2 + as - 0.5 / canvas.scaleOffsetY, 0, w2, h2);
            
            // draw arrow head
            drawArrow(width - w2, h2, as, 'left');
            ctx.fill();
          });

        } else {
          // draw one sided pipe
        }
      },
      'contains': function(adj, pos) {
        var posFrom = adj.nodeFrom.pos.getc(true),
            posTo = adj.nodeTo.pos.getc(true),
            min = Math.min, 
            max = Math.max,
            minPosX = min(posFrom.x, posTo.x),
            maxPosX = max(posFrom.x, posTo.x),
            minPosY = min(posFrom.y, posTo.y),
            maxPosY = max(posFrom.y, posTo.y),
            epsilon = this.edge.epsilon / this.viz.canvas.scaleOffsetX;

        // TODO: a bit hacky
        if (posTo.y - posFrom.y == 0) posTo.y += 0.0000001;
        if (posTo.x - posFrom.x == 0) posTo.x += 0.0000001;

        var a = (posTo.y - posFrom.y) / (posTo.x - posFrom.x),
            c = posFrom.y - a * posFrom.x,
            d = Math.abs(a * pos.x + -1 * pos.y + c) / Math.sqrt(Math.pow(a, 2) + 1);

        if(pos.x >= minPosX - epsilon && pos.x <= maxPosX + epsilon
            && pos.y >= minPosY - epsilon && pos.y <= maxPosY + epsilon) {
          return adj.data.size && d <= adj.data.size.height;
        }
        return false;
      }
    }
  });

})($jit.NetworkMap);
