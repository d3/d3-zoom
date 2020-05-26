const tape = require("tape"),
    jsdom = require("./jsdom"),
    d3 = Object.assign(require("../"), require("d3-selection"), require("d3-transition"));

// d3-zoom expects global navigator and SVGElement to exist
global.navigator = {};
global.SVGElement = function(){};

const document = jsdom("<body>"),
  div = d3.select(document.body).append("div").datum("hello"),
  zoom = d3.zoom(),
  identity = d3.zoomIdentity;

div.call(zoom);

tape("d3.zoom initiates a zooming behavior", function(test) {
  div.call(zoom.transform, identity);
  test.deepEqual(div.node().__zoom, { k: 1, x: 0, y: 0 });
  div.call(zoom.transform, d3.zoomIdentity.scale(2).translate(1,-3));
  test.deepEqual(div.node().__zoom, { k: 2, x: 2, y: -6 });
  test.end();
});

tape("zoomTransform returns the node’s current transform", function(test) {
  div.call(zoom.transform, identity);
  test.deepEqual(d3.zoomTransform(div.node()), { k: 1, x: 0, y: 0 });
  div.call(zoom.translateBy, 10, 10);
  test.deepEqual(d3.zoomTransform(div.node()), { k: 1, x: 10, y: 10 });

  // or an ancestor's…
  test.deepEqual(d3.zoomTransform(div.append("span").node()), { k: 1, x: 10, y: 10 });

  // or zoomIdentity
  test.deepEqual(d3.zoomTransform(document.body), d3.zoomIdentity);

  div.html("");
  test.end();
});

tape("zoom.scaleBy zooms", function(test) {
  div.call(zoom.transform, identity);
  div.call(zoom.scaleBy, 2, [0, 0]);
  test.deepEqual(div.node().__zoom, { k: 2, x: 0, y: 0 });
  div.call(zoom.scaleBy, 2, [2, -2]);
  test.deepEqual(div.node().__zoom, { k: 4, x: -2, y: 2 });
  div.call(zoom.scaleBy, 1/4, [2, -2]);
  test.deepEqual(div.node().__zoom, { k: 1, x: 1, y: -1 });
  test.end();
});

tape("zoom.scaleTo zooms", function(test) {
  div.call(zoom.transform, identity);
  div.call(zoom.scaleTo, 2);
  test.deepEqual(div.node().__zoom, { k: 2, x: 0, y: 0 });
  div.call(zoom.scaleTo, 2);
  test.deepEqual(div.node().__zoom, { k: 2, x: 0, y: 0 });
  div.call(zoom.scaleTo, 1);
  test.deepEqual(div.node().__zoom, { k: 1, x: 0, y: 0 });
  test.end();
});

tape("zoom.translateBy translates", function(test) {
  div.call(zoom.transform, identity);
  div.call(zoom.translateBy, 10, 10);
  test.deepEqual(div.node().__zoom, { k: 1, x: 10, y: 10 });
  div.call(zoom.scaleBy, 2);
  div.call(zoom.translateBy, -10, -10);
  test.deepEqual(div.node().__zoom, { k: 2, x: 0, y: 0 });
  test.end();
});

tape("zoom.scaleBy arguments can be functions passed (datum, index)", function(test) {
  div.call(zoom.transform, identity);
  let a, b, c, d;
  div.call(zoom.scaleBy,
    function() { a = arguments; b = this; return 2; },
    function() { c = arguments; d = this; return [0, 0]; }
  );
  test.deepEqual(div.node().__zoom, { k: 2, x: 0, y: 0 });
  test.deepEqual(a[0], "hello");
  test.deepEqual(a[1], 0);
  test.deepEqual(b, div.node());
  test.deepEqual(c[0], "hello");
  test.deepEqual(c[1], 0);
  test.deepEqual(d, div.node());
  test.end();
});

tape("zoom.scaleTo arguments can be functions passed (datum, index)", function(test) {
  div.call(zoom.transform, identity);
  let a, b, c, d;
  div.call(zoom.scaleTo,
    function() { a = arguments; b = this; return 2; },
    function() { c = arguments; d = this; return [0, 0]; }
  );
  test.deepEqual(div.node().__zoom, { k: 2, x: 0, y: 0 });
  test.deepEqual(a[0], "hello");
  test.deepEqual(a[1], 0);
  test.deepEqual(b, div.node());
  test.deepEqual(c[0], "hello");
  test.deepEqual(c[1], 0);
  test.deepEqual(d, div.node());
  test.end();
});

tape("zoom.translateBy arguments can be functions passed (datum, index)", function(test) {
  div.call(zoom.transform, identity);
  let a, b, c, d;
  div.call(zoom.translateBy,
    function() { a = arguments; b = this; return 2; },
    function() { c = arguments; d = this; return 3; }
  );
  test.deepEqual(div.node().__zoom, { k: 1, x: 2, y: 3 });
  test.deepEqual(a[0], "hello");
  test.deepEqual(a[1], 0);
  test.deepEqual(b, div.node());
  test.deepEqual(c[0], "hello");
  test.deepEqual(c[1], 0);
  test.deepEqual(d, div.node());
  test.end();
});


tape("zoom.constrain receives (transform, extent, translateExtent)", function(test) {
  div.call(zoom.transform, identity);
  const constrain = zoom.constrain();
  let a, b;
  zoom.constrain(function() {
    a = arguments;
    return b = constrain.apply(this, arguments);
  });
  div.call(zoom.translateBy, 10, 10);
  test.deepEqual(a[0], b);
  test.deepEqual(a[0], { k: 1, x: 10, y: 10 });
  test.deepEqual(a[1], [ [ 0, 0 ], [ 0, 0 ] ]);
  test.equal(a[2][0][0], -Infinity);
  zoom.constrain(constrain);
  test.end();
});
