export default function View(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}

View.prototype = {
  constructor: View,
  point: function(l) {
    return [l[0] * this.k + this.x, l[1] * this.k + this.y];
  },
  location: function(p) {
    return [(p[0] - this.x) / this.k, (p[1] - this.y) / this.k];
  },
  scale: function(k) {
    return new View(k, this.x, this.y);
  },
  translate: function(p, l) {
    return l = this.point(l), new View(this.k, this.x + p[0] - l[0], this.y + p[1] - l[1]);
  }
};
