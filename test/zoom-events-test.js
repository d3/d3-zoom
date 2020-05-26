const tape = require("tape"),
    jsdom = require("./jsdom"),
    d3 = Object.assign(require("../"), require("d3-selection"), require("d3-transition"));

// temporary fix (while d3-transition still requests d3-selection@1)
d3.selection.prototype.interrupt = function(name) {
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

tape("zoom.filter receives (event, d) and filters", function(test) {
  div.call(zoom.transform, identity);
  const filter = zoom.filter(),
    event = { bubbles: true, cancelable: true, detail: { type: "fake" } };
  let a, b;
  zoom
    .on("zoom", function() { b = arguments; })
    .filter(function() { a = arguments; });
  div.dispatch("dblclick", event);
  test.equal(a[0].detail.type, "fake");
  test.equal(a[1], "hello");
  test.equal(b, undefined); // our fake dblclick was rejected

  // temporary: avoid a crash due to starting a transition
  zoom.duration(0);
  zoom.filter(function() { return true; });
  div.dispatch("dblclick", event);
  test.notEqual(b, undefined); // our fake dblclick was accepted

  zoom.filter(filter);
  zoom.on("zoom", null);
  test.end();
});

tape("zoom.extent receives (d)", function(test) {
  div.call(zoom.transform, identity);
  const extent = zoom.extent(),
    event = { bubbles: true, cancelable: true, detail: { type: "fake" } };
  let a, b;
  zoom.extent(function() {
      a = arguments; a[-1]= this; return extent.apply(this, arguments); }
    });
  div.dispatch("dblclick", event);
  test.equal(a[0], "hello")
  test.equal(a[-1], div.node());
  zoom.extent(extent);
  test.end();
});

