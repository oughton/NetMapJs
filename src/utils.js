/*
 * NetMapJs utility functions.
 *
 * All functions are added to the global object and anonymous functions are used
 * to keep the global scope clean.
 *
 * author Joel Oughton
 */

$NetworkMap.Utils = {};
$NetworkMap.Views = {};
$NetworkMap.Debug = {};
$NetworkMap.Json = {};
$NetworkMap.Overlays = {};

/*
 * Object: Json
 *
 * JSON helper methods
 *
 * Extra functionality not provided by thejit such as saving/loading JSON.
 */
$NetworkMap.Json = (function() {

  return {

    /*
      Method: Save

      Saves JSON, by sending it to a server side script.
     
      Parameters:

        path      - the path to the server side script that does the saving
        json      - the json data to save
        filename  - the filename to store on the server side
    */
    save: function(path, json, filename) {
      jQuery.post(path + '?filename=' + filename, { json: json });
    },

    /*
      Method: Load

      Loads JSON and passes it to a callback function.

      Parameters:

        path      - server side path of JSON data
        callback  - function to receive data
    */
    load: function(path, callback) {
      jQuery.getJSON(path, function(data) {
        callback(data);
      });
    },

    /*
      Method: setStartPositions

      Takes an array of positions and sets internal node positions to match.
      Used for static node positioning.

      Parameters:
  
        json      - the map json structure
        positions - positions is an array of position objects like { x: x1, y: y1}

    */
    setStartPositions: function(json, positions) {
      jQuery.each(positions, function(index, val1) {
        jQuery.each(json, function(index, val2) {
          if (val2.id == val1.id) {
            val2.data.pos = { x: Number(val1.x), y: Number(val1.y) };
          }
        });
      });
    }
  };
})();

/*
  Object: Debug

  Adds debugging functionality.
*/
$NetworkMap.Debug = (function() {

  return {
    
    /*
      Object: Debug.GraphicalOutput

      Draws debugging information to the screen as a div overlay.
      Useful for outputting information such as current depth level, frame rate etc.
      
      Parameters:

        viz - visualisation instance to debug

      Return:
        
        An object used to enable/disable the overlay and to write to the log.
    */
    GraphicalOutput: function(viz) {
      var _enabled = false;
      var _redraw = true;
      var _container = jQuery(viz.canvas.getElement());
      var _debugBox = jQuery('<div></div>');
      var _c = viz.canvas;
      var _frames = 0.0;
      var _fps = 0;
      var _lastTime = new Date();
      var _log = '';
        
      // redraw debugging information
      _container.bind('redraw', function() {
        _redraw = true;
        output();
      });

      var output = function() {
        var html = '<h4>** Debugging Information **</h4>';
        var table = jQuery('<table></table>');
        var str = '';
        var _preventDefault = function(evt) { evt.preventDefault(); };

        if (!_enabled) return;

        // setup styles
        jQuery("<style type='text/css'> .debugSub{ color:#f00; font-weight:bold; text-decoration:underline;} </style>")
          .appendTo('head');

        // disable selection on div
        _debugBox.bind("dragstart", _preventDefault).bind("selectstart", _preventDefault);

        // output performance info
        table.append('<tr><td class="debugSub">Performance</td></tr>');
        table.append('<tr><td>Frame Rate:</td><td>' + _fps + '</td></tr>');
        
        table.append('<tr><td></td></tr>');
        
        // output viz info
        table.append('<tr><td class="debugSub">State</td>');
        table.append('<tr><td>Busy: </td><td>' + viz.busy + '</td></tr>');
        table.append('<tr><td>Div id: </td><td>' + viz.config.injectInto + '</td></tr>');

        table.append('<tr><td></td></tr>');
        
        // output navigational info
        table.append('<tr><td class="debugSub">Navigation</td>');
        table.append('<tr><td>Scale Offset X:</td><td>' + _c.scaleOffsetX + '</td></tr>');
        table.append('<tr><td>Scale Offset Y:</td><td>' + _c.scaleOffsetY + '</td></tr>');
        table.append('<tr><td>Translate Offset X:</td><td>' + _c.translateOffsetX + '</td></tr>');
        table.append('<tr><td>Translate Offset Y:</td><td>' + _c.translateOffsetY + '</td></tr>');

        table.append('<tr><td></td></tr>');

        // output depth info
        table.append('<tr><td class="debugSub">Groups</td></tr>');
        table.append('<tr><td>Current Depth:</td><td>' + viz.detailLevel(_c.scaleOffsetX, viz.config.groupLvls) + '</tr>');
        
        _debugBox.html(html).append('<div>' + _log + '</div><p>');
        _debugBox.append(table);

        // draw things onto the canvas
        if (_redraw) {
          // draw node boxes
          viz.graph.eachNode(function(n) {
            var dim = n.getData('dim');
            var pos = n.getPos();
            var canvas = viz.canvas, ctx = canvas.getCtx();
            
            ctx.save();
            ctx.strokeStyle = 'rgb(255,0,0)';
            ctx.lineWidth = 1 / canvas.scaleOffsetX;
            ctx.strokeRect(pos.x - dim, pos.y - dim, dim * 2, dim * 2);
            ctx.restore();
          });

          _redraw = false;
        }
      };

      var init = function() {
        var o = _container.offset();
        var ms = 10;

        _debugBox.css({
          position: 'relative',
          top: o.top,
          left: o.left,
          color: 'rgb(255,0,0)'
        });

        _container.append(_debugBox);

        _container.bind('redraw', function() {
          var nowTime = new Date();
          var diffTime = Math.ceil((nowTime.getTime() - _lastTime.getTime()));
          
          if (diffTime >= 1000) {
            _fps = _frames;
            _frames = 0.0;
            _lastTime = nowTime;
            output();
          }

          _frames++;
        });
      };

      init();

      return {
        enable: function() { _enabled = true; output(); },
        disable: function() { _enabled = false; },
        isEnabled: function() { return _enabled; },
        logWrite: function(text) { _log = 'Log: ' + text; output(); }
      };
    }
  };
})();

/*
  Object: Views

  Defines additional network map views to go along with the main map
*/
$NetworkMap.Views = (function() {

  return {
    
    /*
      Object: Views.Overview

      An overview plot that provides a smaller overview of the main map. It is
      an instance of a network map, just with different options.

      Parameters:

        viz     - the network map to be an overview for
        mapOpts - options to pass to the overview network map
        level   - the level (depth into the map) that this map is showing
        tx      - x translation offset of the overview
        ty      - y translation offset of the overview

      Returns:
        
        An object that can be used to hide/show and refresh the overview.
    */
    Overview: function(viz, mapOpts, level, tx, ty) {
      var _opts = jQuery.extend(true, {
        bgAlpha: 0.25,
        groupLvls: [ 0, 1, 2],
        Node: {
          overridable: true,
          dim: 20,
          lineWidth: 5
        },
        Edge: {
          overridable: true,
          color: '#23A4FF',
          lineWidth: 1,
          type: 'line'
        },
        Label: {
          type: 'SVG'
        }
      }, mapOpts);

      var _over = new $jit.NetworkMap(_opts),
          _container = jQuery('#' + _opts.injectInto).css({ position: 'relative' }),
          _svg, _rect, _cross,
          _mouse = null,
          _level = level || 0;

      // redraw the rectangle
      var redraw = function() {
        var size = viz.canvas.getSize(), 
            p1 = _over.p2c(viz.c2p({ x: 0, y: 0 })),
            p2 = _over.p2c(viz.c2p({ x: size.width, y: size.height })),
            w = Math.abs(p2.x - p1.x), h = Math.abs(p2.y - p1.y),
            x = p1.x + w / 2, y = p1.y + h / 2,
            attr = { stroke: 'rgb(255,255,0)' };

        if (!_rect) {
          _rect = _svg.rect(0, 0, 0, 0).attr(attr);
        }
          
        _rect.attr({ x: p1.x, y: p1.y, width: w, height: h });
        _cross && _cross.remove();
        _cross = _svg.path(
          'M' + x + ' 0L' + x + ' ' + _svg.height +
          'M0 ' + y + 'L' + _svg.width + ' ' + y
        ).attr(attr);
      };      
      
      // translate a main canvas in sync with overview box
      var _moveBox = function(e) {
        var o = _container.offset(),
            x = e.pageX - o.left, y = e.pageY - o.top,
            canvas = viz.canvas,
            size = canvas.getSize(),
            pt1 = _over.c2p({ x: x, y: y }),
            pt2 = viz.c2p({ x: size.width / 2, y: size.height / 2 });

        canvas.translate(pt2.x - pt1.x, pt2.y - pt1.y);
      };

      var hideOver = function() {
        _container.hide();
      };

      var showOver = function() {
        _container.show();
      };
      
      // setup overview visualisation
      var init = function() {
        var o = _container.offset(),
            vizSize = viz.canvas.getSize(),
            overSize = _over.canvas.getSize(),
            json = jQuery.extend(true, [], viz.json),
            levelScale = viz.config.groupLvls[_level],
            svgcont = jQuery('<div></div>')
              .css({ top: 0, left: 0, position: 'absolute' })
              .appendTo(_container);
        
        _svg = Raphael(svgcont.get(0), overSize.width, overSize.height);

        // remove position data from nodes
        viz.config.layout != 'Static' && jQuery.each(json, function(index, n) {
            n.data && n.data.pos && delete n.data.pos;
        });
        
        _over.loadJSON(json);
        _over.canvas.resize(overSize.width, overSize.height);
        _over.canvas.scale(overSize.width / vizSize.width, overSize.width / vizSize.width);

        // adjust zoom offset to match the level
        if (_level != 0) {
          _over.canvas.scale(levelScale, levelScale);
        } else {
          if (tx && ty) _over.canvas.translate(tx, ty);
        }
       
        jQuery(viz.canvas.getElement()).bind('redraw', function() {
          var vizSize = viz.canvas.getSize(), overSize = _over.canvas.getSize(),
              vizCp = viz.c2p({ x: vizSize.width / 2, y: vizSize.height / 2 }),
              overCp = _over.c2p({ x: overSize.width / 2, y: overSize.height / 2});

          if (_level != 0 && _mouse == null) {
            _over.canvas.translate(overCp.x - vizCp.x, overCp.y - vizCp.y);
          }
          
          redraw();
        });

        // reload positions when they change in the main plot
        jQuery(viz.canvas.getElement()).bind('computePositions', function() {
          _over.loadPositions(viz.getPositions());
          _over.end();
        });

        // setup mouse events
        svgcont.mousedown(function(e) {
          _mouse = e;
          _moveBox(e);
        });
        svgcont.mouseup(function() {
          _mouse = null;
        });
        svgcont.mousemove(function(e) {
          if (_mouse != null) _moveBox(e);
        });
        
        redraw();
        _over.refresh();
      };

      init();

      return {
        level: function() { return _level; },
        hide: function() { hideOver(); },
        show: function() { showOver(); },
        refresh: function() { _over.refresh(); }
      };
    },

    /*
      Object: Views.OverviewManager

      Manages the adding and removing of overlays to a multi-overlay system.

      Parameters:

        viz       - the network map to base overlays on
        container - the container to put overlays into
        width     - the width of the overlays
        height    - the height of the overlays
        overOpts  - overlay network map options object
        tx        - x translation canvas offset
        ty        - y translation canvas offset

      Returns:

        An object that allows the OverviewManager to refresh all of its overlays
    */
    OverviewManager: function(viz, container, width, height, overOpts, tx, ty) {
      var _overviews = {};
      container = jQuery('<div class="NetworkMap-Views-OverviewManager"></div>').appendTo(container);
      if (!overOpts) overOpts = {};
      
      var createOverview = function(level) {
        var id = viz.config.injectInto + '-overviewManager-over' + Math.round(level);
        
        overOpts.injectInto = id;
        container.append('<hr />');
        jQuery('<div class="NetworkMap-Views-Overview" id="' + id + '"></div>')
          .css({ width: width, height: height }).appendTo(container)
          .each(function() {
            // disable text selection on overviews
            this.onselectstart = function() { return false; };
          });
          
        return new $NetworkMap.Views.Overview(viz, overOpts, level, tx, ty);
      }

      var updateLevel = function() {
        jQuery.each(_overviews, function(l, over) {
          if (viz.showAtLevel(viz.canvas.scaleOffsetX, over.level(), viz.config.groupLvls)) {
            over.show();
          } else {
            over.hide();
          }
        }); 
      };
      
      var init = function() {
        // initialy create and hide overviews
        for (var l = viz.config.groupLvls.length - 1; l >= 0; l--) {
          _overviews[l] = createOverview(l);
          _overviews[l].hide();
        };
        
        jQuery(viz.canvas.getElement()).bind('redraw', function() {
          updateLevel();
        });

        updateLevel();
      };

      init();

      return {
        refresh: function() { 
          jQuery.each(_overviews, function(l, over) {
            over.refresh();
          });
        }
      };
    }
  };
})({});

/*
  Object: Utils.Links

  A link is used for the edge pipe graphics to store metrics.
*/
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

/*
  Object: Utils.Metrics

  An object to manage network metrics for a link
*/
$NetworkMap.Utils.Metrics = (function() {
  return {
    
    data: function(bandwidth, capacity, loss, latency) {
      this.bandwidth = bandwidth;
      this.capacity = capacity;
      this.loss = loss;
      this.latency = latency;
    },

    /*
      Method: initJSON

      Initialise the network map JSON structure to support metrics

      Parameters:

        json - the JSON structure to initialise
    */
    initJSON: function(json) {
      // create links in both ways
      jQuery.each(json, function(index, n) {
        if (!n.adjacencies) return;
        jQuery.each(n.adjacencies, function(index, adj) {
          if (!adj.data) adj.data = {};
          adj.data.links = [
            new $NetworkMap.Utils.Links.link(n.id, adj.nodeTo, '1'),
            new $NetworkMap.Utils.Links.link(adj.nodeTo, n.id, '1')
          ];
        });
      });
    },

    /*
      Method: updateMetrics

      Updates metric values. Should be used as part of poller to automatically
      update values.
      It loops through all of the edges that have metrics data and calls the
      callback function, which should get updated data for that link.

      Parameters:
        
        viz       - the network map to update metrics for
        callback  - function to call for each edge, to get new data
    */
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

/*
  Object: Overlays

  An object containing the overlay functionality. Overlays allow graphics to be
  drawn over the network map after it has been drawn. They are given access to
  the network maps node-edge object and Canvas.
*/
$NetworkMap.Overlays = (function() {
 
  return {

    /*
      Object: Overlays.Overlay

      An overlay has a unique id and an update method that is run every time
      that the main network map is redrawn.

      Parameters:
        
        id      - a unique id for the overlay
        update  - a function to be run each time the network map is redraw

      Returns:

        An object that controls starting/stopping the overlay and updating it.
    */
    Overlay: function(id, update) {
      if (arguments.length < 2 || typeof(arguments[0]) != 'string' || typeof(arguments[1]) != 'function') {
        throw 'Require string id and an update function';
      }

      var _id = id;
      var _enabled = true;
      var _update = update;

      return {
        start: function() { _enabled = true; },
        stop: function() { _enabled = false; },
        getID: function() { return _id; },
        update: function(viz, graph, canvas) { _enabled && _update(viz, graph, canvas); }
      };
    },

    /*
      Object: Overlays.OverlayManager

      Handles adding new overlays and refreshing them when the main network map
      is redraw.

      Parameters:
        
        viz - the network map to listen for redrawn events from

      Returns:

        An object that allows adding new overlays, getting an overlay based on
        the id and manually refreshing all of the overlays.
    */
    OverlayManager: function(viz) {
      if (arguments.length < 1) {
        throw 'Require a visualisation to overlay onto';
      }
      
      var _overlays = {};
      var _viz = viz;

      var _refresh = function() {
        jQuery.each(_overlays, function(key, o) {
          o.update(_viz, _viz.graph, _viz.canvas);
        });
      };

      _viz.canvas && jQuery(_viz.canvas.getElement()).bind('redraw', function() {
        _refresh();
      });

      return {
        add: function(o) {
          var id = o.getID();
          if (_overlays[id]) _overlays[id].stop();
          _overlays[id] = o;
        },

        get: function(id) {
          return _overlays[id];
        },

        refresh: function() {
          _refresh();
        }
      };
    }
  };
})();
