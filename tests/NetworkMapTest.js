jQuery(document).ready(function() {
  var _debug = jQuery('#output');

  module("Init");

  test("Created canvas", function() {
    _debug.append('<div id="test0" style="width:640px;height:100px;background-color:#000"></div>');

    var opts = {
      injectInto: 'test0',
      layout: 'ForceDirected',
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

    var over = new $jit.NetworkMap(opts);

    expect(4);
    ok(over, 'Viz is defined');
   
    // add data
    over.loadJSON([
      {
        id: 'id1',
        adjacencies: [
          { nodeTo: 'id2' }, { nodeTo: 'id3' }
        ]
      }
    ]);

    over.refresh();

    //, false, "failing test" );
    ok( true, 'Loaded dummy json data and refreshed' );
    equals(over.canvas.getSize().width, jQuery('#test0').width(), 'Check canvas is the right width');
    equals(over.canvas.getSize().height, jQuery('#test0').height(), 'Check canvas is the right height');
  });
});

