export function Transform(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}

Transform.prototype = {
  constructor: Transform,
  apply: function(point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  scale: function(k) {
    return new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x, y) {
    return new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
  }
};

export var identity = new Transform(1, 0, 0);

transform.prototype = Transform.prototype;

export default function transform(node) {
  return node == null ? identity : node.__zoom;
}
