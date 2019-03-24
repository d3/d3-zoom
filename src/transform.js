// transform object modelled after CSS Matrix
// https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix
// matrix(a, b, c, d, e, f)
export function Transform(a, b, c, d, tx, ty) {
  this.a = a;
  this.b = b;
  this.c = c;
  this.d = d;
  this.tx = tx;
  this.ty = ty;
}

// four primary methods (scale, translate, rotate, & skew) 
// that correspond to affine matrix transformations
Transform.prototype = {
  constructor: Transform,
  scale: function(x, y) {
      // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scale
      // matrix(a, 0, 0, d, 0, 0)
      return x === 1 & y === 1 ? this : new Transform(this.a * x,
          this.b * y,
          this.c * x,
          this.d * y,
          this.tx,
          this.ty);
  },
  translate: function(tx, ty) {   
      // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/translate
      // matrix(1, 0, 0, 1, tx, ty)
      return tx === 1 & ty === 1 ? this : new Transform(this.a,
          this.b,
          this.c,
          this.d,
          this.tx + this.a * tx + this.c * ty,
          this.ty + this.b * tx + this.d * ty);
  },
  rotate: function(r) {
      // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/rotate
      // matrix(cos(r), sin(r), -sin(r), cos(r), 0, 0)
      return r === 0 ? this : new Transform(this.a * Math.cos(r) + this.c * Math.sin(r),
          this.b * Math.cos(r) + this.d * Math.sin(r),
          -this.a * Math.sin(r) + this.c * Math.cos(r),
          -this.b * Math.sin(r) + this.d * Math.cos(r),
          this.tx,
          this.ty);
  },
  skew: function(x, y) {
      // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/skew
      // matrix(1, tan(b), tan(c), 1, 0, 0)
      return x === 1 & y === 1 ? this : new Transform(this.a + this.c * Math.tan(y),
          this.b + this.d * Math.tan(y),
          this.c + this.a * Math.tan(x),
          this.d + this.b * Math.tan(x),
          this.tx + this.a * x + this.c * y,
          this.ty + this.b * x + this.d * y);
  },
  apply: function(point) {
      return [
          this.a * point[0] + this.c * point[1] + this.tx,
          this.b * point[0] + this.d * point[1] + this.ty
      ];
  },
  applyX: function(x) {
      return this.a * x + this.tx;
  },
  applyY: function(y) {
      return this.d * y + this.ty;
  },
  invert: function(location) {
    var x = this.d * location[0] / (this.a * this.d - this.b * this.c) -
            this.c * location[1] / (this.a * this.d - this.b * this.c) +
            (this.c * this.ty - this.d * this.tx) / (this.a * this.d - this.b * this.c);
    
    var y = - this.b * location[0] / (this.a * this.d - this.b * this.c) +
            this.a * location[1] / (this.a * this.d - this.b * this.c) +
            (this.b * this.tx - this.a * this.ty) / (this.a * this.d - this.b * this.c);
    
    return [x, y]
  },
  invertX: function(x) {
      return this.d * x / (this.a * this.d - this.b * this.c) +
          (this.c * this.ty - this.d * this.tx) / (this.a * this.d - this.b * this.c);
  },
  invertY: function(y) {
      return this.a * y / (this.a * this.d - this.b * this.c) +
          (this.b * this.tx - this.a * this.ty) / (this.a * this.d - this.b * this.c);
  },
  rescaleX: function(x) {
      return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  },
  rescaleY: function(y) {
      return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function() {
      return "matrix(" + this.a + "," + this.b + "," + this.c + "," + this.d + "," + this.tx + "," + this.ty + ")";
  }
};

export var identity = new Transform(1, 0, 0, 1, 0, 0);

transform.prototype = Transform.prototype;

export default function transform(node) {
  return node.__zoom || identity;
}