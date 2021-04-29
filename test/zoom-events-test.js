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

it("zoom.filter receives (event, d) and filters", () => {
  div.call(zoom.transform, identity);
  const filter = zoom.filter(),
    event = { bubbles: true, cancelable: true, detail: { type: "fake" } };
  let a, b;
  zoom
    .on("zoom", function() { b = arguments; })
    .filter(function() { a = arguments; });
  div.dispatch("dblclick", event);
  assert.strictEqual(a[0].detail.type, "fake");
  assert.strictEqual(a[1], "hello");
  assert.strictEqual(b, undefined); // our fake dblclick was rejected

  // temporary: avoid a crash due to starting a transition
  zoom.duration(0);
  zoom.filter(function() { return true; });
  div.dispatch("dblclick", event);
  assert.notEqual(b, undefined); // our fake dblclick was accepted

  zoom.filter(filter);
  zoom.on("zoom", null);
});

it("zoom.extent receives (d)", () => {
  div.call(zoom.transform, identity);
  const extent = zoom.extent(),
    event = { bubbles: true, cancelable: true, detail: { type: "fake" } };
  let a;
  zoom.extent(function() {
    a = arguments;
    a[-1] = this;
    return extent.apply(this, arguments);
  });
  div.dispatch("dblclick", event);
  assert.strictEqual(a[0], "hello")
  assert.strictEqual(a[-1], div.node());
  zoom.extent(extent);
});

