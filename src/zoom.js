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
  return node.__zoom;
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

  // TODO Enforce scaleExtent.
  function zoom(selection, view) {
    if (arguments.length < 2) {
      selection
          .on("wheel.zoom", wheeled)
          .on("mousedown.zoom", mousedowned)
          .on("dblclick.zoom", dblclicked)
          .on("touchstart.zoom", touchstarted)
          .on("touchmove.zoom", touchmoved)
          .on("touchend.zoom touchcancel.zoom", touchended)
          .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)")
          .property("__zoom", identity);
    } else if (selection instanceof transition) {
      schedule(selection, view, centerPoint);
    } else {
      selection
          .each(emitStart)
          .property("__zoom", view)
          .each(emitZoom)
          .each(emitEnd);
    }
  }

  // TODO Enforce scaleExtent.
  function schedule(transition, view, center) {
    transition
        .on("start.zoom", emitStart)
        .on("end.zoom", emitEnd)
        .tween("zoom:zoom", function() {
          var that = this,
              args = arguments,
              s = size.apply(that, args),
              p = center || [s[0] / 2, s[1] / 2],
              w = Math.max(s[0], s[1]),
              v0 = that.__zoom,
              v1 = typeof view === "function" ? view.apply(that, args) : view,
              i = interpolateZoom(v0.invert(p).concat(w / v0._k), v1.invert(p).concat(w / v1._k));
          return function(t) {
            if (t === 1) that.__zoom = v1; // Avoid rounding error on end.
            else { var l = i(t), k = w / l[2]; that.__zoom = new View(k, p[0] - l[0] * k, p[1] - l[1] * k); }
            emitZoom.apply(that, args);
          };
        });
  }

  function emitStart() {
    emit("start", this, arguments);
  }

  function emitZoom() {
    emit("zoom", this, arguments);
  }

  function emitEnd() {
    emit("end", this, arguments);
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
        delta = Math.pow(2, -event.deltaY * (event.deltaMode ? 120 : 1) / 500),
        start = wheelTimer ? (clearTimeout(wheelTimer), false) : (centerPoint && (centerLocation = view.invert(centerPoint)), mouseLocation = view.invert(mousePoint = mouse(that)), true);

    event.preventDefault();
    wheelTimer = setTimeout(wheelidled, wheelDelay);
    if (start && ++zooming === 1) interrupt(that), emitStart.apply(that, args);
    view = view.scaleBy(delta);
    if (centerPoint) view = view.translateTo(centerPoint, centerLocation), mouseLocation = view.invert(mousePoint);
    else view = view.translateTo(mousePoint, mouseLocation);
    that.__zoom = view;
    emitZoom.apply(that, args);

    function wheelidled() {
      wheelTimer = null;
      if (--zooming === 0) emitEnd.apply(that, args);
    }
  }

  // TODO Clean this up.
  // TODO Enforce scaleExtent.
  function mousedowned() {
    if (!filter.apply(this, arguments)) return;

    var that = this,
        args = arguments,
        view = that.__zoom;

    mouseLocation = view.invert(mousePoint = mouse(that));
    select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true);
    if (++zooming === 1) interrupt(that), emitStart.apply(that, args);

    function mousemoved() {
      that.__zoom = view = view.translateTo(mousePoint = mouse(that), mouseLocation);
      emitZoom.apply(that, args);
    }

    function mouseupped() {
      select(event.view).on("mousemove.zoom mouseup.zoom", null);
      if (--zooming === 0) emitEnd.apply(that, args);
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
