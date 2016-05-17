export default function ZoomEvent(type, view) {
  this.type = type;
  this.scale = view._k;
  this.translate = [view._x, view._y];
}
