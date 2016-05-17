export default function View(k, x, y) {
  this._k = k;
  this._x = x;
  this._y = y;
}

View.prototype = {
  constructor: View,
  apply: function(point) {
    return [point[0] * this._k + this._x, point[1] * this._k + this._y];
  },
  invert: function(location) {
    return [(location[0] - this._x) / this._k, (location[1] - this._y) / this._k];
  },
  scale: function(_) {
    return arguments.length ? new View(+_, this._x, this._y) : this._k;
  },
  scaleBy: function(_, center) {
    var view = new View(this._k * _, this._x, this._y);
    return center == null ? view : view.translateTo(center, this.invert(center));
  },
  translate: function(_) {
    return arguments.length ? new View(this._k, +_[0], +_[1]) : [this._x, this._y];
  },
  translateTo: function(point, location) {
    location = this.apply(location);
    return new View(this._k, this._x + point[0] - location[0], this._y + point[1] - location[1]);
  }
};
