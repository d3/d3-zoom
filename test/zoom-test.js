import assert from "assert";
import * as d3 from "../src/index.js";
import jsdom from "./jsdom.js";

/*
// d3-zoom expects global navigator and SVGElement to exist
global.navigator = {};
global.SVGElement = function(){};

const document = jsdom("<body>"),
  div = d3.select(document.body).append("div").datum("hello"),
  zoom = d3.zoom(),
  identity = d3.zoomIdentity;

div.call(zoom);
*/

it("d3.zoom initiates a zooming behavior", () => {
  div.call(zoom.transform, identity);
  assert.deepStrictEqual(div.node().__zoom, { k: 1, x: 0, y: 0 });
  div.call(zoom.transform, d3.zoomIdentity.scale(2).translate(1,-3));
  assert.deepStrictEqual(div.node().__zoom, { k: 2, x: 2, y: -6 });
});

it("zoomTransform returns the node’s current transform", () => {
  div.call(zoom.transform, identity);
  assert.deepStrictEqual(d3.zoomTransform(div.node()), { k: 1, x: 0, y: 0 });
  div.call(zoom.translateBy, 10, 10);
  assert.deepStrictEqual(d3.zoomTransform(div.node()), { k: 1, x: 10, y: 10 });

  // or an ancestor's…
  assert.deepStrictEqual(d3.zoomTransform(div.append("span").node()), { k: 1, x: 10, y: 10 });

  // or zoomIdentity
  assert.deepStrictEqual(d3.zoomTransform(document.body), d3.zoomIdentity);

  div.html("");
});

it("zoom.scaleBy zooms", () => {
  div.call(zoom.transform, identity);
  div.call(zoom.scaleBy, 2, [0, 0]);
  assert.deepStrictEqual(div.node().__zoom, { k: 2, x: 0, y: 0 });
  div.call(zoom.scaleBy, 2, [2, -2]);
  assert.deepStrictEqual(div.node().__zoom, { k: 4, x: -2, y: 2 });
  div.call(zoom.scaleBy, 1/4, [2, -2]);
  assert.deepStrictEqual(div.node().__zoom, { k: 1, x: 1, y: -1 });
});

it("zoom.scaleTo zooms", () => {
  div.call(zoom.transform, identity);
  div.call(zoom.scaleTo, 2);
  assert.deepStrictEqual(div.node().__zoom, { k: 2, x: 0, y: 0 });
  div.call(zoom.scaleTo, 2);
  assert.deepStrictEqual(div.node().__zoom, { k: 2, x: 0, y: 0 });
  div.call(zoom.scaleTo, 1);
  assert.deepStrictEqual(div.node().__zoom, { k: 1, x: 0, y: 0 });
});

it("zoom.translateBy translates", () => {
  div.call(zoom.transform, identity);
  div.call(zoom.translateBy, 10, 10);
  assert.deepStrictEqual(div.node().__zoom, { k: 1, x: 10, y: 10 });
  div.call(zoom.scaleBy, 2);
  div.call(zoom.translateBy, -10, -10);
  assert.deepStrictEqual(div.node().__zoom, { k: 2, x: 0, y: 0 });
});

it("zoom.scaleBy arguments can be functions passed (datum, index)", () => {
  div.call(zoom.transform, identity);
  let a, b, c, d;
  div.call(zoom.scaleBy,
    function() { a = arguments; b = this; return 2; },
    function() { c = arguments; d = this; return [0, 0]; }
  );
  assert.deepStrictEqual(div.node().__zoom, { k: 2, x: 0, y: 0 });
  assert.deepStrictEqual(a[0], "hello");
  assert.deepStrictEqual(a[1], 0);
  assert.deepStrictEqual(b, div.node());
  assert.deepStrictEqual(c[0], "hello");
  assert.deepStrictEqual(c[1], 0);
  assert.deepStrictEqual(d, div.node());
});

it("zoom.scaleTo arguments can be functions passed (datum, index)", () => {
  div.call(zoom.transform, identity);
  let a, b, c, d;
  div.call(zoom.scaleTo,
    function() { a = arguments; b = this; return 2; },
    function() { c = arguments; d = this; return [0, 0]; }
  );
  assert.deepStrictEqual(div.node().__zoom, { k: 2, x: 0, y: 0 });
  assert.deepStrictEqual(a[0], "hello");
  assert.deepStrictEqual(a[1], 0);
  assert.deepStrictEqual(b, div.node());
  assert.deepStrictEqual(c[0], "hello");
  assert.deepStrictEqual(c[1], 0);
  assert.deepStrictEqual(d, div.node());
});

it("zoom.translateBy arguments can be functions passed (datum, index)", () => {
  div.call(zoom.transform, identity);
  let a, b, c, d;
  div.call(zoom.translateBy,
    function() { a = arguments; b = this; return 2; },
    function() { c = arguments; d = this; return 3; }
  );
  assert.deepStrictEqual(div.node().__zoom, { k: 1, x: 2, y: 3 });
  assert.deepStrictEqual(a[0], "hello");
  assert.deepStrictEqual(a[1], 0);
  assert.deepStrictEqual(b, div.node());
  assert.deepStrictEqual(c[0], "hello");
  assert.deepStrictEqual(c[1], 0);
  assert.deepStrictEqual(d, div.node());
});


it("zoom.constrain receives (transform, extent, translateExtent)", () => {
  div.call(zoom.transform, identity);
  const constrain = zoom.constrain();
  let a, b;
  zoom.constrain(function() {
    a = arguments;
    return b = constrain.apply(this, arguments);
  });
  div.call(zoom.translateBy, 10, 10);
  assert.deepStrictEqual(a[0], b);
  assert.deepStrictEqual(a[0], { k: 1, x: 10, y: 10 });
  assert.deepStrictEqual(a[1], [ [ 0, 0 ], [ 0, 0 ] ]);
  assert.strictEqual(a[2][0][0], -Infinity);
  zoom.constrain(constrain);
});
