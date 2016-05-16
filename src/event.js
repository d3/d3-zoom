export default function ZoomEvent(type, scale, translateX, translateY) {
  this.type = type;
  this.scale = scale;
  this.translate = [translateX, translateY];
}
