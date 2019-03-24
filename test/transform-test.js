var tape = require("tape"),
    d3 = require("../"),
    identity = d3.zoomIdentity;

tape("d3.zoomIdentity transform contains a = 1, d = 1, b=c=tx=ty=0", function(test) {
  test.deepEqual(toObject(identity), {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0});
  test.end();
});

tape("transform.scale(kx, ky) returns a new transform scaled with independent scales", function(test) {
  var transform = identity.scale(2.5, 2.5);
  test.deepEqual(toObject(transform.scale(2, 2)), {a: 5, b: 0, c: 0, d: 5, tx: 0, ty: 0});
  test.end();
});

tape("transform.translate(x, y) returns a new transform translated with x and y", function(test) {
  var transform = identity.translate(2, 3);
  test.deepEqual(toObject(transform.translate(-4, 4)), {a: 1, b: 0, c: 0, d: 1, tx: -2, ty: 7});
  test.deepEqual(toObject(transform.scale(2, 2).translate(-4, 4)), {a: 2, b: 0, c: 0, d: 2, tx: -6, ty: 11});
  test.end();
});

tape("transform.apply([x, y]) returns the transformation of the specified point", function(test) {
  test.deepEqual(identity.translate(2, 3).scale(2, 2).apply([4, 5]), [10, 13]);
  test.end();
});

tape("transform.applyX(x) returns the transformation of the specified x-coordinate", function(test) {
  test.deepEqual(identity.translate(2, 0).scale(2, 2).applyX(4), 10);
  test.end();
});

tape("transform.applyY(y) returns the transformation of the specified y-coordinate", function(test) {
  test.deepEqual(identity.translate(0, 3).scale(2, 2).applyY(5), 13);
  test.end();
});

tape("transform.invert([x, y]) returns the inverse transformation of the specified point", function(test) {
  test.deepEqual(identity.translate(2, 3).scale(2, 2).invert([4, 5]), [1, 1]);
  test.end();
});

tape("transform.invertX(x) returns the inverse transformation of the specified x-coordinate", function(test) {
  test.deepEqual(identity.translate(2, 0).scale(2, 1).invertX(4), 1);
  test.end();
});

tape("transform.invertY(y) returns the inverse transformation of the specified y-coordinate", function(test) {
  test.deepEqual(identity.translate(0, 3).scale(1, 2).invertY(5), 1);
  test.end();
});

// transform.rescaleX(x)

// transform.rescaleY(y)

tape("transform.toString() returns a string representing the SVG transform", function(test) {
  test.equal(d3.zoomIdentity.toString(), "matrix(1,0,0,1,0,0)");
  test.end();
});

function toObject(transform) {
  return {a: transform.a, b: transform.b, c: transform.c,
    d: transform.d, tx: transform.tx, ty: transform.ty};
}
