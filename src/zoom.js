import {dispatch} from "d3-dispatch";
import {interpolateZoom} from "d3-interpolate";
import {event, customEvent, select, mouse} from "d3-selection";
import {interrupt, transition} from "d3-transition";
import constant from "./constant";
import ZoomEvent from "./event";
import {Transform, identity} from "./transform";

// Ignore horizontal scrolling.
// Ignore right-click, since that should open the context menu.
function defaultFilter() {
  return event.type === "wheel" ? event.deltaY : !event.button;
}

function defaultSize() {
  var node = this.ownerSVGElement || this;
  return [node.clientWidth, node.clientHeight];
}

export default function(started) {
  var filter = defaultFilter,
      size = defaultSize,
      scaleMin = 0,
      scaleMax = Infinity,
      duration = 250,
      zooming = 0,
      wheelTimer,
      wheelDelay = 150,
      centerPoint = null,
      centerLocation,
      mousePoint,
      mouseLocation;

  // TODO Prevent default.
  // TODO Stop propagation.
  var listeners = dispatch("start", "zoom", "end")
      .on("start", started);

  function zoom(selection) {
    selection
        .on("wheel.zoom", wheeled)
        .on("mousedown.zoom", mousedowned)
        .on("dblclick.zoom", dblclicked)
        .on("touchstart.zoom", touchstarted)
        .on("touchmove.zoom", touchmoved)
        .on("touchend.zoom touchcancel.zoom", touchended)
        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)")
        .property("__zoom", identity);
  }

  // TODO Enforce scaleExtent.
  zoom.transform = function(selection, transform) {
    if (selection instanceof transition) {
      schedule(selection, transform, centerPoint);
    } else {
      selection
          .interrupt()
          .each(emitStart)
          .property("__zoom", transform)
          .each(emitZoom)
          .each(emitEnd);
    }
  };

  zoom.scaleBy = function(selection, k) {
    zoom.scaleTo(selection, function() {
      var k0 = this.__zoom.k,
          k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return k0 * k1;
    });
  };

  zoom.scaleTo = function(selection, k) {
    zoom.transform(selection, function() {
      var p0 = centerPoint || (p0 = size.apply(this, arguments), [p0[0] / 2, p0[1] / 2]),
          p1 = this.__zoom.invert(p0),
          k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return translate(scale(this.__zoom, k1), p0, p1);
    });
  };

  function scale(transform, k) {
    return new Transform(Math.max(scaleMin, Math.min(scaleMax, k)), transform.x, transform.y);
  }

  function translate(transform, p0, p1) {
    return p1 = transform.apply(p1), new Transform(transform.k, transform.x + p0[0] - p1[0], transform.y + p0[1] - p1[1]);
  }

  // TODO Enforce scaleExtent.
  function schedule(transition, transform, center) {
    transition
        .on("start.zoom", emitStart)
        .on("interrupt.zoom end.zoom", emitEnd)
        .tween("zoom:zoom", function() {
          var that = this,
              args = arguments,
              s = size.apply(that, args),
              p = center || [s[0] / 2, s[1] / 2],
              w = Math.max(s[0], s[1]),
              a = that.__zoom,
              b = typeof transform === "function" ? transform.apply(that, args) : transform,
              i = interpolateZoom(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
          return function(t) {
            if (t === 1) that.__zoom = b; // Avoid rounding error on end.
            else { var l = i(t), k = w / l[2]; that.__zoom = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k); }
            emitZoom.apply(that, args);
          };
        });
  }

  function emitStart() {
    if (++zooming === 1) emit("start", this, arguments);
  }

  function emitZoom() {
    emit("zoom", this, arguments);
  }

  function emitEnd() {
    if (--zooming === 0) emit("end", this, arguments);
  }

  function emit(type, that, args) {
    customEvent(new ZoomEvent(type, that.__zoom), listeners.apply, listeners, [type, that, args]);
  }

  // TODO Clean this up.
  function wheeled() {
    if (!filter.apply(this, arguments)) return;

    var that = this,
        args = arguments,
        transform = that.__zoom;

    if (wheelTimer) clearTimeout(wheelTimer);

    // If this is the first wheel event since the wheel was idle, then capture
    // the mouse location and the center location to avoid loss of precision
    // over the duration of the gesture: if you zoom in a lot and then zoom out,
    // we want you to return to the original location exactly.
    else {
      if (centerPoint) centerLocation = transform.invert(centerPoint);
      mouseLocation = transform.invert(mousePoint = mouse(that));
      interrupt(that), emitStart.apply(that, args);
    }

    transform = scale(transform, transform.k * Math.pow(2, -event.deltaY * (event.deltaMode ? 120 : 1) / 500));

    // There may be a concurrent mousedown-mouseup gesture! Scaling around an
    // explicit center changes the mouse location, so must update the mouse
    // location that was captured on mousedown.
    if (centerPoint) {
      transform = translate(transform, centerPoint, centerLocation);
      mouseLocation = transform.invert(mousePoint);
    } else {
      transform = translate(transform, mousePoint, mouseLocation);
    }

    that.__zoom = transform;
    event.preventDefault();
    wheelTimer = setTimeout(wheelidled, wheelDelay);
    emitZoom.apply(that, args);

    function wheelidled() {
      wheelTimer = null;
      emitEnd.apply(that, args);
    }
  }

  // TODO Clean this up.
  function mousedowned() {
    if (!filter.apply(this, arguments)) return;

    var that = this,
        args = arguments;

    // We shouldn’t capture that.__zoom on mousedown because you can wheel after
    // mousedown and before mouseup. If that happens AND an explicit center is
    // defined, the center location also needs to be updated.

    mouseLocation = that.__zoom.invert(mousePoint = mouse(that));
    select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true);
    interrupt(that), emitStart.apply(that, args);

    function mousemoved() {
      that.__zoom = translate(that.__zoom, mousePoint = mouse(that), mouseLocation);
      if (centerPoint) centerLocation = that.__zoom.invert(centerPoint);
      emitZoom.apply(that, args);
    }

    function mouseupped() {
      select(event.view).on("mousemove.zoom mouseup.zoom", null);
      emitEnd.apply(that, args);
    }
  }

  function dblclicked() {
    if (!filter.apply(this, arguments)) return;
    var t0 = this.__zoom,
        p0 = centerPoint || mouse(this),
        p1 = t0.invert(p0),
        k1 = t0.k * (event.shiftKey ? 0.5 : 2),
        t1 = translate(scale(t0, k1), p0, p1);
    if (duration > 0) select(this).transition().duration(duration).call(schedule, t1, p0);
    else this.__zoom = t1;
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

  zoom.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant(!!_), zoom) : filter;
  };

  zoom.size = function(_) {
    return arguments.length ? (size = typeof _ === "function" ? _ : constant([+_[0], +_[1]]), zoom) : size;
  };

  zoom.scaleExtent = function(_) {
    return arguments.length ? (scaleMin = +_[0], scaleMax = +_[1], zoom) : [scaleMin, scaleMax];
  };

  zoom.center = function(_) {
    return arguments.length ? (centerPoint = _ == null ? null : [+_[0], +_[1]], zoom) : centerPoint;
  };

  zoom.duration = function(_) {
    return arguments.length ? (duration = +_, zoom) : duration;
  };

  zoom.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? zoom : value;
  };

  return zoom;
}
