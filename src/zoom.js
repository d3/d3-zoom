import {dispatch} from "d3-dispatch";
import {interpolateZoom} from "d3-interpolate";
import {event, customEvent, select, mouse} from "d3-selection";
import {interrupt, transition} from "d3-transition";
import ZoomEvent from "./event";
import View from "./view";

// TODO scaleExtent
export default function(started) {
  var target = new View(1, 0, 0),
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
    if (selection instanceof transition) {
      selection.call(schedule, target);
    } else {
      selection
          .on("wheel.zoom", wheeled)
          .on("mousedown.zoom", mousedowned)
          .on("dblclick.zoom", dblclicked)
          .on("touchstart.zoom", touchstarted)
          .on("touchmove.zoom", touchmoved)
          .on("touchend.zoom touchcancel.zoom", touchended)
          .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)")
          .property("__zoom", target);
    }
  }

  function schedule(transition, target) {
    transition
        .on("start.zoom", function() {
          emit("start", this, arguments);
        })
        .tween("zoom:zoom", function() {
          var that = this,
              args = arguments,
              v = that.__zoom,
              x = mousePoint ? mousePoint[0] : dx / 2,
              y = mousePoint ? mousePoint[1] : dy / 2,
              i = interpolateZoom([(x - v.x) / v.k, (y - v.y) / v.k, dx / v.k], [(x - target.x) / target.k, (y - target.y) / target.k, dx / target.k]);
          return function(t) {
            var l = i(t), k = dx / l[2];
            that.__zoom = new View(k, x - l[0] * k, y - l[1] * k);
            emit("zoom", that, args);
          };
        })
        .on("end.zoom", function() {
          this.__zoom = target;
          emit("end", this, arguments);
        });
  }

  function emit(type, that, args) {
    customEvent(new ZoomEvent(type, that.__zoom), listeners.apply, listeners, [type, that, args]);
  }

  function wheeled() {
    if (!event.deltaY) return;

    var that = this,
        args = arguments,
        view = that.__zoom,
        start = wheelTimer ? (clearTimeout(wheelTimer), false) : (centerPoint && (centerLocation = view.location(centerPoint)), mouseLocation = view.location(mousePoint = mouse(that)), true);

    event.preventDefault();
    wheelTimer = setTimeout(wheelidled, wheelDelay);
    if (start && ++zooming === 1) interrupt(that), emit("start", that, args);

    view = view.scale(view.k * Math.pow(2, -event.deltaY * (event.deltaMode ? 120 : 1) / 500));
    if (centerPoint) view = view.translate(centerPoint, centerLocation), mouseLocation = view.location(mousePoint);
    else view = view.translate(mousePoint, mouseLocation);
    that.__zoom = view;
    emit("zoom", that, args);

    function wheelidled() {
      wheelTimer = null;
      if (--zooming === 0) emit("end", that, args);
    }
  }

  function mousedowned() {
    var that = this,
        args = arguments,
        view = that.__zoom;

    mouseLocation = view.location(mousePoint = mouse(that));
    select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true);
    if (++zooming === 1) interrupt(that), emit("start", that, args);

    function mousemoved() {
      that.__zoom = view = view.translate(mousePoint = mouse(that), mouseLocation);
      emit("zoom", that, args);
    }

    function mouseupped() {
      select(event.view).on("mousemove.zoom mouseup.zoom", null);
      if (--zooming === 0) emit("end", that, args);
    }
  }

  function dblclicked() {
    var view = this.__zoom, k = Math.log(view.k) / Math.LN2;
    mouseLocation = view.location(mousePoint = mouse(this));
    view = view.scale(Math.pow(2, event.shiftKey ? Math.ceil(k) - 1 : Math.floor(k) + 1)).translate(mousePoint, mouseLocation);
    if (duration > 0) select(this).transition().duration(duration).call(schedule, view);
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

  zoom.scale = function(_) {
    return arguments.length ? (target = target.scale(+_), zoom) : target.k;
  };

  zoom.scaleExtent = function(_) {
    return arguments.length ? (scaleMin = +_[0], scaleMax = +_[1], zoom) : [scaleMin, scaleMax];
  };

  zoom.translate = function(_) {
    return arguments.length ? (target = new View(target.k, +_[0], +_[1]), zoom) : [target.x, target.y];
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
