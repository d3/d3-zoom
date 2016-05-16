import {dispatch} from "d3-dispatch";
import {event, select, mouse} from "d3-selection";

export default function(started) {
  var scale = 1,
      scaleMin = 0,
      scaleMax = Infinity,
      translateX = 0,
      translateY = 0,
      zooming = 0,
      wheelTimer,
      wheelDelay = 150,
      mousePoint,
      mouseLocation;

  // TODO prevent default
  // TODO stop propagation
  var listeners = dispatch("start", "zoom", "end")
      .on("start", started);

  // TODO dblclick starts zoom transition
  function zoom(selection) {
    selection
        .on("wheel.zoom", wheeled)
        .on("mousedown.zoom", mousedowned)
        .on("touchstart.zoom", touchstarted)
        .on("touchmove.zoom", touchmoved)
        .on("touchend.zoom touchcancel.zoom", touchended)
        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }

  function point(l) {
    return [l[0] * scale + translateX, l[1] * scale + translateY];
  }

  function location(p) {
    return [(p[0] - translateX) / scale, (p[1] - translateY) / scale];
  }

  function scaleTo(k) {
    scale = Math.max(scaleMin, Math.min(scaleMax, k));
  }

  function translateTo(p, l) {
    l = point(l);
    translateX += p[0] - l[0];
    translateY += p[1] - l[1];
  }

  // TODO interrupt transition on this element, if any
  // TODO dispatch customEvent
  // TODO allow zoom center to be specified, and default to mouse position
  // TODO observe scale extent
  // TODO observe translate extent?
  function wheeled() {
    if (!event.deltaY) return;

    var that = this,
        args = arguments,
        start = wheelTimer ? (clearTimeout(wheelTimer), false) : (mouseLocation = location(mousePoint = mouse(that)), true);

    event.preventDefault();
    wheelTimer = setTimeout(wheelidled, wheelDelay);
    if (start && ++zooming === 1) listeners.apply("start", that, args);

    scaleTo(scale * Math.pow(2, -event.deltaY * (event.deltaMode ? 120 : 1) / 500));
    translateTo(mousePoint, mouseLocation);
    listeners.apply("zoom", that, args);

    function wheelidled() {
      wheelTimer = null;
      if (--zooming === 0) listeners.apply("end", that, args);
    }
  }

  // TODO interrupt transition on this element, if any
  // TODO dispatch customEvent
  // TODO observe translate extent?
  function mousedowned() {
    var that = this,
        args = arguments;

    mouseLocation = location(mousePoint = mouse(that));
    select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true);
    if (++zooming === 1) listeners.apply("start", that, args);

    function mousemoved() {
      translateTo(mousePoint = mouse(that), mouseLocation);
      listeners.apply("zoom", that, args);
    }

    function mouseupped() {
      select(event.view).on("mousemove.zoom mouseup.zoom", null);
      if (--zooming === 0) listeners.apply("end", that, args);
    }
  }

  function touchstarted() {
    // TODO
  }

  function touchmoved() {
    // TODO
  }

  function touchended() {
    // TODO
  }

  // TODO expose on custom event
  // TODO allow setting
  zoom.scale = function() {
    return scale;
  };

  zoom.scaleExtent = function(_) {
    return arguments.length ? (scaleMin = +_[0], scaleMax = +_[1], zoom) : [scaleMin, scaleMax];
  };

  // TODO expose on custom event
  // TODO allow setting
  zoom.translate = function() {
    return [translateX, translateY];
  };

  zoom.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? zoom : value;
  };

  return zoom;
}
