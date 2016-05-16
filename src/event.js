export default function ZoomEvent(type, view) {
  this.type = type;
  this.scale = view.k;
  this.translate = [view.x, view.y];
}
