import {dispatch} from "d3-dispatch";
import {event, customEvent, select, mouse} from "d3-selection";
import ZoomEvent from "./event";

// TODO scale and translate must be stored on each selected element, not the behavior
export default function(started) {
  var scale = 1,
      scaleMin = 0,
      scaleMax = Infinity,
      translateX = 0,
      translateY = 0,
      zooming = 0,
      wheelTimer,
      wheelDelay = 150,
      centerPoint = null,
      centerLocation,
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

  function emit(type, that, args) {
    customEvent(new ZoomEvent(type, scale, translateX, translateY), listeners.apply, listeners, [type, that, args]);
  }

  // TODO interrupt transition on this element, if any
  // TODO observe translate extent?
  function wheeled() {
    if (!event.deltaY) return;

    var that = this,
        args = arguments,
        start = wheelTimer ? (clearTimeout(wheelTimer), false) : (centerPoint && (centerLocation = location(centerPoint)), mouseLocation = location(mousePoint = mouse(that)), true);

    event.preventDefault();
    wheelTimer = setTimeout(wheelidled, wheelDelay);
    if (start && ++zooming === 1) emit("start", that, args);

    scaleTo(scale * Math.pow(2, -event.deltaY * (event.deltaMode ? 120 : 1) / 500));
    if (centerPoint) translateTo(centerPoint, centerLocation), mouseLocation = location(mousePoint);
    else translateTo(mousePoint, mouseLocation);
    emit("zoom", that, args);

    function wheelidled() {
      wheelTimer = null;
      if (--zooming === 0) emit("end", that, args);
    }
  }

  // TODO interrupt transition on this element, if any
  // TODO observe translate extent?
  function mousedowned() {
    var that = this,
        args = arguments;

    mouseLocation = location(mousePoint = mouse(that));
    select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true);
    if (++zooming === 1) emit("start", that, args);

    function mousemoved() {
      translateTo(mousePoint = mouse(that), mouseLocation);
      emit("zoom", that, args);
    }

    function mouseupped() {
      select(event.view).on("mousemove.zoom mouseup.zoom", null);
      if (--zooming === 0) emit("end", that, args);
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

  // TODO allow setting
  zoom.scale = function() {
    return scale;
  };

  zoom.scaleExtent = function(_) {
    return arguments.length ? (scaleMin = +_[0], scaleMax = +_[1], zoom) : [scaleMin, scaleMax];
  };

  // TODO allow setting
  zoom.translate = function() {
    return [translateX, translateY];
  };

  zoom.center = function(_) {
    return arguments.length ? (centerPoint = _ == null ? null : [+_[0], +_[1]], zoom) : centerPoint;
  };

  zoom.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? zoom : value;
  };

  return zoom;
}
