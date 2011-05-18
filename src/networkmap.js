
Layouts.NetworkMap = {};

/*
 * Class: Layouts.NetworkMap.ForceDirected
 */
Layouts.NetworkMap.ForceDirected = new Class({

  initialize: function(vis) {
    this.vis = vis;
  },
  
  getOptions: function(group, width, height, random) {
    var w = width, h = height;
    //count nodes
    var count = 0;
    $.each(group.nodes, function(n) { 
      count++;
    });
    var k2 = w * h / count, k = Math.sqrt(k2);
    var l = 500;//this.vis.config.levelDistance;
    
    return {
      width: w,
      height: h,
      tstart: w * 0.1,
      nodef: function(x) { return k2 / (x || 1); },
      edgef: function(x) { return /* x * x / k; */ k * (x - l); },
      root: group.root.id
    };
  },
  
  compute: function(group, property, incremental) {
    var prop = $.splat(property || ['current', 'start', 'end']);
    var opt = this.getOptions(group, 300, 300);
    NodeDim.compute(this.vis.graph, prop, this.vis.config);
    this.vis.graph.computeLevels(opt.root, 0, "ignore");
    $.each(group.nodes, function(n) {
      if (group.owner)  {
        //pos = that.mapInto(group.owner, pos);
        n.setData('dim', 0.1 * n.getData('dim') / group.owner.getData('dim') * (1 + group.owner.getData('dim') / 2));
      }

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
  },
  
  computePositions: function(group, property, opt, incremental) {
    var times = this.vis.config.iterations, i = 0, that = this;
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
    var graph = this.vis.graph;
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
        if (group.nodes.indexOf(adj) === -1) {
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
        //p.$add($C(disp.x * min(Math.abs(disp.x), t) / norm, 
        //    disp.y * min(Math.abs(disp.y), t) / norm));
        //console.log(p.x, p.y);
        //p.x = min(w2, max(-w2, p.x));
        //p.y = min(h2, max(-h2, p.y));
      });
    });
  }
});

/*
 * Class: Layouts.NetworkMap.Star
 */
Layouts.NetworkMap.Star = new Class({

  initialize: function(vis) {
    this.vis = vis;
  },

  compute: function(group, property, incremental) {
    var prop = property || ['current', 'start', 'end'];
    var that = this, i = 0, n, circlePoints;

    n = group.root ? group.nodes.length - 1 : group.nodes.length;

    circlePoints = this.getPointsOnCircle(group.owner.pos, group.owner.getData('dim') / 2, n);

    //NodeDim.compute(that.vis.graph, prop, that.vis.config);
    $.each(group.nodes, function(n) {
      var pt;

      // draw the root in the center if there is one
      if (n === group.root) {
        n.setPos(group.owner.pos);
        return;
      }

      pt = circlePoints[i++];

      // fill in the nodes position for each property
      $.each(prop, function(p) {
        n.setPos($C(pt.x, pt.y));
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
 * Class: Layouts.NetworkMap.Static
 */
Layouts.NetworkMap.Static = new Class({

  initialize: function(vis) {
    this.vis = vis;
  },

  compute: function(group, property, incremental) {
    var prop = property || ['current', 'start', 'end'];
    var that = this;

    //NodeDim.compute(that.vis.graph, prop, that.vis.config);
    $.each(group.nodes, function(n) {
      // fill in the nodes position for each property
      $.each(prop, function(p) {
        if (n.data.pos) n.setPos($C(n.data.pos.x, n.data.pos.y));
      });
    });
  }
});

/*
 * Node groups interface
 *
 * Mixes in group handling functionality.
 */
var Groups = {
  computeDimensions: function(group) {
    // group is not the top group
    if (group.owner) {

      // set the node size and edge width to reflect depth
      $.each(group.nodes, function(n) { 
        // nodes
        var dim = n.getData('dim'), ownerDim = group.owner.getData('dim');
        //var newDim = 0.1 * dim / ownerDim * (1 + ownerDim / 2);
        var newDim = ownerDim / 20;
        n.setData('dim', newDim);
        n.setData('height', newDim * 2);
        n.setData('width', newDim * 2);
        //n.setLabelData('size', 1);

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
      });
    }
  },

  buildGroups: function() {
    var raw = {}, groups = {}, nodes = [], flat = [], flatten, that = this;

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

    this.graph.eachNode(function(n) {
      var group = n.data.parentID || '_TOP';
      nodes.push(n);
      if (!groups[group]) groups[group] = {};
    });

    raw = computeLevels(groups, nodes, '_TOP', 0);

    // create flat array of groups
    flatten = function(obj, arr) {
      if (obj.subgroups.length < 1) return;
      arr.push({ depth: obj.depth, id: obj.id, nodes: obj.nodes, owner: that.graph.getNode(obj.id) });
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

    this.graph.groups = flat;
  },

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
  }
}

/*
  Network Map

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

  Implements: [ Loader, Extras, Groups ],

  initialize: function(controller) {
    var $NetworkMap = $jit.NetworkMap;

    var config = {
      debug: false,
      iterations: 50,
      levelDistance: 50,
      layout: 'Static'
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
      'complex': true,
      'Node': {
        'selected': false,
        'exist': true,
        'drawn': true
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

    this.layouts = {
      'Static': new Layouts.NetworkMap.Static(this),
      'ForceDirected': new Layouts.NetworkMap.ForceDirected(this),
      'Star': new Layouts.NetworkMap.Star(this)
    };
  },

  /* 
    Method: refresh 
    
    Computes positions and plots the tree.
  */
  refresh: function() {
    this.computeLayouts();
    this.plot();
  },

  reposition: function() {
    this.computeLayouts('end');
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
  },

  /*
    Method: plot
   
    Plots the ForceDirected graph. This is a shortcut to *fx.plot*.
   */
  plot: function() {
    this.fx.plot();
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

  fitsInCanvas: function(pos) {
    var size = this.canvas.getSize();
    if(pos.x >= size.width || pos.x < 0
       || pos.y >= size.height || pos.y < 0) return false;
     return true;
  },

  followEdge: function(fromNode, toNode, speed) {
  // TODO: center node in the middle on the canvas
    var that = this,
        interval,
        canvas = this.canvas;
        from = fromNode.getPos(),
        to = toNode.getPos(),
        pt = new Complex(from.x, from.y);
        m = (to.y - from.y) / (to.x - from .x);
        c = from.y - m * from.x,
        axis = (Math.abs(from.x - to.x) > Math.abs(from.y - to.y)) ? 'x' : 'y',
        dir = pt[axis] < to[axis];

    interval = setInterval(function() {
      var delta = {},
          interp;
      
      // stop moving when the direction changes
      if (dir != pt[axis] < to[axis]) {
        clearInterval(interval);
        return;
      }

      if (pt[axis] < to[axis]) {
        pt[axis] += 1 * speed;
        delta[axis] = -1 * speed;
      } else {
        pt[axis] -= 1 * speed;
        delta[axis] = 1 * speed;
      }
        
      if (axis == 'x') {
        interp = m * pt[axis] + c;
        delta['y'] = pt.y - interp;
        pt['y'] = interp;
      } else {
        interp = (pt[axis] - c) / m;
        delta['x'] = pt.x - interp; 
        pt['x'] = interp;
      }
      
      canvas.translate(delta.x, delta.y);
    }, 60);
  }
});

$jit.NetworkMap.$extend = true;

(function(NetworkMap) {

  /*
     Class: ForceDirected.Op
     
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
    Class: ForceDirected.Plot
    
    Custom extension of <Graph.Plot>.
  
    Extends:
  
    All <Graph.Plot> methods
    
    See also:
    
    <Graph.Plot>
  
  */
  NetworkMap.Plot = new Class( {

    Implements: Graph.Plot

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
     ForceDirected.Label.Native
     
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
    ForceDirected.Label.SVG
    
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
       placeLabel

       Overrides abstract method placeLabel in <Graph.Label>.

       Parameters:

       tag - A DOM label element.
       node - A <Graph.Node>.
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
     ForceDirected.Label.HTML
     
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
    /* 
       placeLabel

       Overrides abstract method placeLabel in <Graph.Plot>.

       Parameters:

       tag - A DOM label element.
       node - A <Graph.Node>.
       controller - A configuration/controller object passed to the visualization.
      
     */
    placeLabel: function(tag, node, controller) {
      var pos = node.pos.getc(true), 
          height = node.getData('height');
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
      style.left = labelPos.x + 'px';
      style.top = labelPos.y + 'px';
      style.display = this.fitsInCanvas(labelPos, canvas) ? '' : 'none';

      // TODO: this won't work for deep levels because exponential scaling?
      if (Math.sqrt(canvas.scaleOffsetX) < 4 * node.data.depth && node.data.parentID) {
        style.display = 'none';
      }

      controller.onPlaceLabel(tag, node);
    }
  });

  /*
    Class: ForceDirected.Plot.NodeTypes

    This class contains a list of <Graph.Node> built-in types. 
    Node types implemented are 'none', 'circle', 'triangle', 'rectangle', 'star', 'ellipse' and 'square'.

    You can add your custom node types, customizing your visualization to the extreme.

    Example:

    (start code js)
      ForceDirected.Plot.NodeTypes.implement({
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

      ctx.beginPath();
      ctx.lineWidth = node.getData('lineWidth') / (node.data.depth * 20); // TODO: get rid of magic number (20)
      ctx.fillStyle = "rgba(255,0,0,0.5)";
      ctx.arc(pos.x, pos.y, dim, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.stroke();
        //this.nodeHelper.circle.render('stroke', pos, dim, canvas);
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
      // TODO(nico): be more precise...
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
    Class: ForceDirected.Plot.EdgeTypes
  
    This class contains a list of <Graph.Adjacence> built-in types. 
    Edge types implemented are 'none', 'line' and 'arrow'.
  
    You can add your custom edge types, customizing your visualization to the extreme.
  
    Example:
  
    (start code js)
      ForceDirected.Plot.EdgeTypes.implement({
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
            to = adj.nodeTo.pos.getc(true);
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
    }
  });

})($jit.NetworkMap);
