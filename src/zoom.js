import {dispatch} from "d3-dispatch";
import {interpolateZoom} from "d3-interpolate";
import {event, customEvent, select, mouse} from "d3-selection";
import {transition} from "d3-transition";
import ZoomEvent from "./event";

export default function(started) {
  var view = {x: 0, y: 0, k: 1},
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
      selection
          .on("start.zoom", function() {
            emit("start", this, arguments);
          })
          .tween("zoom:zoom", function() {
            var that = this,
                args = arguments,
                v = that.__zoom,
                x = mousePoint ? mousePoint[0] : dx / 2,
                y = mousePoint ? mousePoint[1] : dy / 2,
                i = interpolateZoom([(x - v.x) / v.k, (y - v.y) / v.k, dx / v.k], [(x - view.x) / view.k, (y - view.y) / view.k, dx / view.k]);
            return function(t) {
              var l = i(t), k = dx / l[2];
              that.__zoom = {x: x - l[0] * k, y: y - l[1] * k, k: k};
              emit("zoom", that, args);
            };
          })
          .on("end.zoom", function() {
            emit("end", this, arguments);
          });
    } else {
      selection
          .property("__zoom", view)
          .on("wheel.zoom", wheeled)
          .on("mousedown.zoom", mousedowned)
          .on("dblclick.zoom", dblclicked)
          .on("touchstart.zoom", touchstarted)
          .on("touchmove.zoom", touchmoved)
          .on("touchend.zoom touchcancel.zoom", touchended)
          .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
    }
  }

  function point(l) {
    return [l[0] * view.k + view.x, l[1] * view.k + view.y];
  }

  function location(p) {
    return [(p[0] - view.x) / view.k, (p[1] - view.y) / view.k];
  }

  function scale(k) {
    view = {k: Math.max(scaleMin, Math.min(scaleMax, k)), x: view.x, y: view.y};
  }

  function translate(p, l) {
    l = point(l), view = {k: view.k, x: view.x + p[0] - l[0], y: view.y + p[1] - l[1]};
  }

  function emit(type, that, args) {
    var view = that.__zoom; // May differ from behavior’s during a transition!
    customEvent(new ZoomEvent(type, view.k, view.x, view.y), listeners.apply, listeners, [type, that, args]);
  }

  // TODO interrupt transition on this element, if any
  function wheeled() {
    if (!event.deltaY) return;

    var that = this,
        args = arguments,
        start = wheelTimer ? (clearTimeout(wheelTimer), false) : (centerPoint && (centerLocation = location(centerPoint)), mouseLocation = location(mousePoint = mouse(that)), true);

    event.preventDefault();
    wheelTimer = setTimeout(wheelidled, wheelDelay);
    if (start && ++zooming === 1) emit("start", that, args);

    scale(view.k * Math.pow(2, -event.deltaY * (event.deltaMode ? 120 : 1) / 500));
    if (centerPoint) translate(centerPoint, centerLocation), mouseLocation = location(mousePoint);
    else translate(mousePoint, mouseLocation);
    this.__zoom = view;
    emit("zoom", that, args);

    function wheelidled() {
      wheelTimer = null;
      if (--zooming === 0) emit("end", that, args);
    }
  }

  // TODO interrupt transition on this element, if any
  function mousedowned() {
    var that = this,
        args = arguments;

    mouseLocation = location(mousePoint = mouse(that));
    select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true);
    if (++zooming === 1) emit("start", that, args);

    function mousemoved() {
      translate(mousePoint = mouse(that), mouseLocation);
      that.__zoom = view;
      emit("zoom", that, args);
    }

    function mouseupped() {
      select(event.view).on("mousemove.zoom mouseup.zoom", null);
      if (--zooming === 0) emit("end", that, args);
    }
  }

  function dblclicked() {
    var k = Math.log(view.k) / Math.LN2;
    mouseLocation = location(mousePoint = mouse(this));
    scale(Math.pow(2, event.shiftKey ? Math.ceil(k) - 1 : Math.floor(k) + 1));
    translate(mousePoint, mouseLocation);
    if (duration > 0) select(this).transition().duration(duration).call(zoom);
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
    return arguments.length ? (scale(+_), zoom) : view.k;
  };

  zoom.scaleExtent = function(_) {
    return arguments.length ? (scaleMin = +_[0], scaleMax = +_[1], zoom) : [scaleMin, scaleMax];
  };

  zoom.translate = function(_) {
    return arguments.length ? (view = {k: view.k, x: +_[0], y: +_[1]}, zoom) : [view.x, view.y];
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
