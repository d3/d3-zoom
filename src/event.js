export default function ZoomEvent(type, view) {
  this.type = type;
  this.scale = view.scale;
  this.translate = view.translate; // TODO defensive copy?
}
