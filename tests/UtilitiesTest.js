jQuery(document).ready(function() {
  var _debug = jQuery('#output');

  module("Overview");

  test("Created canvas", function() {
    _debug.append('<div id="utilitiestest0" style="width:640px;height:100px;background-color:#000"></div>');

    var opts = {
      injectInto: 'utilitiestest0',
      layout: 'ForceDirected',
      Navigation: {
        enable: true,
        panning: true,
        zooming: 40
      },
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
    };

    var main = new $jit.NetworkMap(opts);

    main.loadJSON([
      {
        id: 'id1',
        adjacencies: [
          { nodeTo: 'id2' }, { nodeTo: 'id3' }
        ]
      }
    ]);
    main.refresh();

    var container = jQuery('<div id="utilitiestest1" style="width:640px;height:100px;background-color:#000"></div>').appendTo(_debug);
    var over = new $NetworkMap.Views.Overview(main, { injectInto: 'utilitiestest1' }, 0);

    ok(true, 'created overview');
  });
  
  test("Overview Manager Test", function() {
    _debug.append('<div id="utilitiestest2" style="width:640px;height:100px;background-color:#000"></div>');

    var opts = {
      injectInto: 'utilitiestest2',
      layout: 'ForceDirected',
      Navigation: {
        enable: true,
        panning: true,
        zooming: 40
      },
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
    };

    var main = new $jit.NetworkMap(opts);

    main.loadJSON([
      {
        id: 'id1',
        adjacencies: [
          { nodeTo: 'id2' }, { nodeTo: 'id3' }
        ]
      }
    ]);
    main.refresh();

    var container = jQuery('<div id="utilitiestest3" style="width:640px;background-color:#000"></div>').appendTo(_debug);
    var manager = new $NetworkMap.Views.OverviewManager(main, container, 640, 150);

    ok(true, 'created overview');
  });

});
