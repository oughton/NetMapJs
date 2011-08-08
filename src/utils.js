$NetworkMap.Utils = {};
$NetworkMap.Views = {};
$NetworkMap.Debug = {};
$NetworkMap.Json = {};

$NetworkMap.Json = (function() {

  return {
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

$NetworkMap.Debug = (function() {

  return {
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

$NetworkMap.Views = (function() {

  return {
    Overview: function(viz, mapOpts, level) {
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
          _svg, _rect,
          _mouse = null,
          _level = level || 0;

      // redraw the rectangle
      var redraw = function() {
        var size = viz.canvas.getSize(), 
            p1 = _over.p2c(viz.c2p({ x: 0, y: 0 })),
            p2 = _over.p2c(viz.c2p({ x: size.width, y: size.height }));

        if (!_rect) {
          _rect = _svg.rect(0, 0, 0, 0).attr({ stroke: 'rgb(255,255,0)' });
        }
          
        _rect.attr({ x: p1.x, y: p1.y, width: Math.abs(p2.x - p1.x), height: Math.abs(p2.y - p1.y) });
        _over.loadPositions(viz.getPositions());
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
        show: function() { showOver(); }
      };
    },

    OverviewManager: function(viz, container, width, height) {
      var _overviews = {};
      
      var createOverview = function(level) {
        var id = viz.config.injectInto + '-overviewManager-over' + Math.round(level);
        
        jQuery('<div id="' + id + '"></div>').css({ width: width, height: height }).appendTo(container);
        return new $NetworkMap.Views.Overview(viz, { injectInto: id }, level);
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
    }
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
