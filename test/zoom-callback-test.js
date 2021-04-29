import assert from "assert";
import * as d3 from "../src/index.js";
import {select} from "d3-selection";
import jsdom from "./jsdom.js";

// d3-zoom expects global navigator and SVGElement to exist
global.navigator = {};
global.SVGElement = function(){};

const document = jsdom("<body>"),
  div = select(document.body).append("div").datum("hello"),
  zoom = d3.zoom(),
  identity = d3.zoomIdentity;

div.call(zoom);


it("zoom.on('zoom') callback", () => {
  let a;
  zoom.on("zoom", function(event, d) { a = {event, d, that: this}; });
  div.call(zoom.transform, identity);
  const event = { type: "zoom", sourceEvent: null, target: zoom, transform: {k: 1, x: 0, y: 0}};
  assert.deepEqual(a.event, event);
  assert.strictEqual(a.d, "hello");
  assert.strictEqual(a.that, div.node());

  a = {};
  zoom.on("zoom", null);
  div.call(zoom.transform, identity);
  assert.deepEqual(a.event, undefined);
  assert.strictEqual(a.d, undefined);
  assert.strictEqual(a.that, undefined);
});

it("zoom.on('start') callback", () => {
  let a;
  zoom.on("start", function(event, d) { a = {event, d, that: this}; });
  div.call(zoom.transform, identity);
  const event = { type: "start", sourceEvent: null, target: zoom, transform: {k: 1, x: 0, y: 0}};
  assert.deepEqual(a.event, event);
  assert.strictEqual(a.d, "hello");
  assert.strictEqual(a.that, div.node());

  a = {};
  zoom.on("start", null);
  assert.deepEqual(a.event, undefined);
  assert.strictEqual(a.d, undefined);
  assert.strictEqual(a.that, undefined);
});

it("zoom.on('end') callback", () => {
  let a;
  zoom.on("end", function(event, d) { a = {event, d, that: this}; });
  div.call(zoom.transform, identity);
  const event = { type: "end", sourceEvent: null, target: zoom, transform: {k: 1, x: 0, y: 0}};
  assert.deepEqual(a.event, event);
  assert.strictEqual(a.d, "hello");
  assert.strictEqual(a.that, div.node());

  a = {};
  zoom.on("end", null);
  assert.deepEqual(a.event, undefined);
  assert.strictEqual(a.d, undefined);
  assert.strictEqual(a.that, undefined);
});

it("zoom.on('start zoom end') callback order", () => {
  let a = [];
  zoom.on("start zoom end", function(event) { a.push(event.type); });
  div.call(zoom.transform, identity);
  assert.deepEqual(a, ["start", "zoom", "end"]);
  zoom.on("start zoom end", null);
});
