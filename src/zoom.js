import {dispatch} from "d3-dispatch";
import {interpolateZoom} from "d3-interpolate";
import {event, customEvent, select, mouse} from "d3-selection";
import {interrupt, transition} from "d3-transition";
import constant from "./constant";
import ZoomEvent from "./event";

var identity = {
  scale: 1,
  translate: [0, 0]
};

// Ignore horizontal scrolling.
// Ignore right-click, since that should open the context menu.
function defaultFilter() {
  return event.type === "wheel" ? event.deltaY : !event.button;
}

function defaultView() {
  return this.__zoom || identity;
}

export default function(started) {
  var filter = defaultFilter,
      dx = 960,
      dy = 500,
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

  // TODO prevent default
  // TODO stop propagation
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
        .property("__zoom", defaultView);
  }

  // TODO make defensive copies of the view on get?
  // TODO make defensive copies of the view on set?
  zoom.view = function(selection, view) {
    if (arguments.length < 2) return selection.property("__zoom");
    if (selection instanceof transition) schedule(selection, view, dx / 2, dy / 2);
    else selection.property("__zoom", view);
  };

  // TODO what if the view to be specified as a function?
  function schedule(transition, view, x, y) {
    transition
        .on("start.zoom", function() {
          emit("start", this, arguments);
        })
        .tween("zoom:zoom", function() {
          var that = this,
              args = arguments,
              v = that.__zoom,
              p = [x, y],
              i = interpolateZoom(location(v, p).concat(dx / v.scale), location(view, p).concat(dx / view.scale));
          return function(t) {
            var l = i(t), k = dx / l[2];
            that.__zoom = {scale: k, translate: [x - l[0] * k, y - l[1] * k]};
            emit("zoom", that, args);
          };
        })
        .on("end.zoom", function() {
          this.__zoom = view;
          emit("end", this, arguments);
        });
  }

  function point(view, l) {
    return [l[0] * view.scale + view.translate[0], l[1] * view.scale + view.translate[1]];
  }

  function location(view, p) {
    return [(p[0] - view.translate[0]) / view.scale, (p[1] - view.translate[1]) / view.scale];
  }

  function scale(view, scale) {
    return {scale: Math.max(scaleMin, Math.min(scaleMax, view.scale * scale)), translate: view.translate}; // TODO defensive copy?
  }

  function translate(view, p, l) {
    return l = point(view, l), {scale: view.scale, translate: [view.translate[0] + p[0] - l[0], view.translate[1] + p[1] - l[1]]};
  }

  function emit(type, that, args) {
    customEvent(new ZoomEvent(type, that.__zoom), listeners.apply, listeners, [type, that, args]);
  }

  function wheeled() {
    if (!filter.apply(this, arguments)) return;
    var that = this, args = arguments, view = that.__zoom, start = wheelTimer ? (clearTimeout(wheelTimer), false) : (centerPoint && (centerLocation = location(view, centerPoint)), mouseLocation = location(view, mousePoint = mouse(that)), true);

    event.preventDefault();
    wheelTimer = setTimeout(wheelidled, wheelDelay);
    if (start && ++zooming === 1) interrupt(that), emit("start", that, args);
    view = scale(view, Math.pow(2, -event.deltaY * (event.deltaMode ? 120 : 1) / 500));
    if (centerPoint) view = translate(view, centerPoint, centerLocation), mouseLocation = location(view, mousePoint);
    else view = translate(view, mousePoint, mouseLocation);
    that.__zoom = view;
    emit("zoom", that, args);

    function wheelidled() {
      wheelTimer = null;
      if (--zooming === 0) emit("end", that, args);
    }
  }

  function mousedowned() {
    if (!filter.apply(this, arguments)) return;
    var that = this, args = arguments, view = that.__zoom;

    mouseLocation = location(view, mousePoint = mouse(that));
    select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true);
    if (++zooming === 1) interrupt(that), emit("start", that, args);

    function mousemoved() {
      that.__zoom = view = translate(view, mousePoint = mouse(that), mouseLocation);
      emit("zoom", that, args);
    }

    function mouseupped() {
      select(event.view).on("mousemove.zoom mouseup.zoom", null);
      if (--zooming === 0) emit("end", that, args);
    }
  }

  function dblclicked() {
    if (!filter.apply(this, arguments)) return;
    var view = this.__zoom;

    mouseLocation = location(view, mousePoint = mouse(this));
    view = scale(view, event.shiftKey ? 0.5 : 2);
    view = translate(view, mousePoint, mouseLocation);
    if (duration > 0) select(this).transition().duration(duration).call(schedule, view, mousePoint[0], mousePoint[1]);
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

  zoom.scaleExtent = function(_) {
    return arguments.length ? (scaleMin = +_[0], scaleMax = +_[1], zoom) : [scaleMin, scaleMax];
  };

  zoom.center = function(_) {
    return arguments.length ? (centerPoint = _ == null ? null : [+_[0], +_[1]], zoom) : centerPoint;
  };

  zoom.size = function(_) {
    return arguments.length ? (dx = +_[0], dy = +_[1], zoom) : [dx, dy];
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
