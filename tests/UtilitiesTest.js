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

  module("Overlays");

  test("Create overlay manager", function() {
    var m = new $NetworkMap.Overlays.OverlayManager({});
    ok(true, 'created overview manager');
  });
  
  test("Create overlay", function() {
    var o;
    expect(3);

    try {
      o = new $NetworkMap.Overlays.Overlay();
    } catch(e) {
      ok(true, 'require parameters');
    }
    
    o = new $NetworkMap.Overlays.Overlay('test', function() {});
    ok(true, 'created overlay');

    equals('test', o.getID(), 'overlay should have its id set');
  });
  
  test("Add overlay to manager", function() {
    var m = new $NetworkMap.Overlays.OverlayManager({});
    var o = new $NetworkMap.Overlays.Overlay('oid', function() {});

    m.add(o);
    ok(true, 'added into manager');

    equals('oid', m.get(o.getID()).getID(), 'assert that the overview is in the manager');
  });
  
  test("Test refresh method", function() {
    var m = new $NetworkMap.Overlays.OverlayManager({});
    var o1 = new $NetworkMap.Overlays.Overlay('o1', function() {});
    var o2 = new $NetworkMap.Overlays.Overlay('o2', function() {});
    var o3 = new $NetworkMap.Overlays.Overlay('o3', function() {});

    m.add(o1);
    m.add(o2);
    m.add(o3);

    m.refresh();
    ok(true, 'refresh method returned');
  });
});
