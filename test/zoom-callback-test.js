import assert from "assert";
import * as d3 from "../src/index.js";
import jsdom from "./jsdom.js";

//    d3 = Object.assign(require("../"), require("d3-selection"), require("d3-transition")); ....??

// temporary fix (while d3-transition still requests d3-selection@1)
/*d3.selection.prototype.interrupt = function(name) {
  return this.each(function() {
    d3.interrupt(this, name);
  });
};


// d3-zoom expects global navigator and SVGElement to exist
global.navigator = {};
global.SVGElement = function(){};

const document = jsdom("<body>"),
  div = d3.select(document.body).append("div").datum("hello"),
  zoom = d3.zoom(),
  identity = d3.zoomIdentity;

div.call(zoom);
*/

it("zoom.on('zoom') callback", () => {
  let a;
  zoom.on("zoom", function(event, d) { a = {event, d, that: this}; });
  div.call(zoom.transform, identity);
  const event = { type: "zoom", sourceEvent: null, target: zoom, transform: {k: 1, x: 0, y: 0}};
  assert.deepStrictEqual(a.event, event);
  assert.strictEqual(a.d, "hello");
  assert.strictEqual(a.that, div.node());

  a = {};
  zoom.on("zoom", null);
  div.call(zoom.transform, identity);
  assert.deepStrictEqual(a.event, undefined);
  assert.strictEqual(a.d, undefined);
  assert.strictEqual(a.that, undefined);
});

it("zoom.on('start') callback", () => {
  let a;
  zoom.on("start", function(event, d) { a = {event, d, that: this}; });
  div.call(zoom.transform, identity);
  const event = { type: "start", sourceEvent: null, target: zoom, transform: {k: 1, x: 0, y: 0}};
  assert.deepStrictEqual(a.event, event);
  assert.strictEqual(a.d, "hello");
  assert.strictEqual(a.that, div.node());

  a = {};
  zoom.on("start", null);
  assert.deepStrictEqual(a.event, undefined);
  assert.strictEqual(a.d, undefined);
  assert.strictEqual(a.that, undefined);
});

it("zoom.on('end') callback", () => {
  let a;
  zoom.on("end", function(event, d) { a = {event, d, that: this}; });
  div.call(zoom.transform, identity);
  const event = { type: "end", sourceEvent: null, target: zoom, transform: {k: 1, x: 0, y: 0}};
  assert.deepStrictEqual(a.event, event);
  assert.strictEqual(a.d, "hello");
  assert.strictEqual(a.that, div.node());

  a = {};
  zoom.on("end", null);
  assert.deepStrictEqual(a.event, undefined);
  assert.strictEqual(a.d, undefined);
  assert.strictEqual(a.that, undefined);
});

it("zoom.on('start zoom end') callback order", () => {
  let a = [];
  zoom.on("start zoom end", function(event) { a.push(event.type); });
  div.call(zoom.transform, identity);
  assert.deepStrictEqual(a, ["start", "zoom", "end"]);
  zoom.on("start zoom end", null);
});
