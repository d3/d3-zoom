import {dispatch} from "d3-dispatch";
import {interpolateZoom} from "d3-interpolate";
import {event, customEvent, select, mouse} from "d3-selection";
import {interrupt, transition} from "d3-transition";
import constant from "./constant";
import ZoomEvent from "./event";
import View from "./view";

var identity = new View(1, 0, 0);

view.prototype = View.prototype;

export function view(node) {
  return node == null ? identity : node.__zoom;
}

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
  zoom.view = function(selection, view) {
    if (selection instanceof transition) {
      schedule(selection, view, centerPoint);
    } else {
      selection
          .interrupt()
          .each(emitStart)
          .property("__zoom", view)
          .each(emitZoom)
          .each(emitEnd);
    }
  };

  // TODO Can k be a function?
  // TODO Enforce scaleExtent.
  zoom.scaleBy = function(selection, k) {
    zoom.view(selection, function() {
      var center = centerPoint;
      if (!center) {
        var s = size.apply(this, arguments);
        center = [s[0] / 2, s[1] / 2];
      }
      return this.__zoom.scaleBy(k, center);
    });
  };

  // TODO Enforce scaleExtent.
  function schedule(transition, view, center) {
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
              b = typeof view === "function" ? view.apply(that, args) : view,
              i = interpolateZoom(a.invert(p).concat(w / a._k), b.invert(p).concat(w / b._k));
          return function(t) {
            if (t === 1) that.__zoom = b; // Avoid rounding error on end.
            else { var l = i(t), k = w / l[2]; that.__zoom = new View(k, p[0] - l[0] * k, p[1] - l[1] * k); }
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
  // TODO Enforce scaleExtent.
  function wheeled() {
    if (!filter.apply(this, arguments)) return;

    var that = this,
        args = arguments,
        view = that.__zoom,
        delta = Math.pow(2, -event.deltaY * (event.deltaMode ? 120 : 1) / 500);

    if (wheelTimer) clearTimeout(wheelTimer);

    // If this is the first wheel event since the wheel was idle, then capture
    // the mouse location and the center location to avoid loss of precision
    // over the duration of the gesture: if you zoom in a lot and then zoom out,
    // we want you to return to the original location exactly.
    else {
      if (centerPoint) centerLocation = view.invert(centerPoint);
      mouseLocation = view.invert(mousePoint = mouse(that));
      interrupt(that), emitStart.apply(that, args);
    }

    view = view.scaleBy(delta);

    // There may be a concurrent mousedown-mouseup gesture! Scaling around an
    // explicit center changes the mouse location, so must update the mouse
    // location that was captured on mousedown.
    if (centerPoint) {
      view = view.translateTo(centerPoint, centerLocation);
      mouseLocation = view.invert(mousePoint);
    } else {
      view = view.translateTo(mousePoint, mouseLocation);
    }

    that.__zoom = view;
    event.preventDefault();
    wheelTimer = setTimeout(wheelidled, wheelDelay);
    emitZoom.apply(that, args);

    function wheelidled() {
      wheelTimer = null;
      emitEnd.apply(that, args);
    }
  }

  // TODO Clean this up.
  // TODO Enforce scaleExtent.
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
      that.__zoom = that.__zoom.translateTo(mousePoint = mouse(that), mouseLocation);
      if (centerPoint) centerLocation = that.__zoom.invert(centerPoint);
      emitZoom.apply(that, args);
    }

    function mouseupped() {
      select(event.view).on("mousemove.zoom mouseup.zoom", null);
      emitEnd.apply(that, args);
    }
  }

  // TODO Clean this up.
  // TODO Enforce scaleExtent.
  function dblclicked() {
    if (!filter.apply(this, arguments)) return;

    var view = this.__zoom;
    mouseLocation = view.invert(mousePoint = centerPoint || mouse(this));
    view = view.scaleBy(event.shiftKey ? 0.5 : 2).translateTo(mousePoint, mouseLocation);
    if (duration > 0) select(this).transition().duration(duration).call(schedule, view, mousePoint);
    else this.__zoom = view;
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
