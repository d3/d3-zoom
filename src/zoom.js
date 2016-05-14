import {dispatch} from "d3-dispatch";
import {event, select} from "d3-selection";

export default function(started) {
  var wheelTimer,
      wheelDelay = 150;

  // TODO
  // var scale = 1,
  //     translateX = 0,
  //     translateY = 0;

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

  // TODO don’t dispatch start & end if there is another active gesture (e.g., mousedown)
  // TODO interrupt transition on this element, if any
  // TODO dispatch customEvent
  // TODO update scale and translate based on event.deltaY and event.deltaMode
  // TODO allow zoom center to be specified, and default to mouse position
  function wheeled() {
    var that = this, args = arguments;
    if (wheelTimer) clearTimeout(wheelTimer);
    else listeners.apply("start", that, args);
    wheelTimer = setTimeout(function() { wheelTimer = null; listeners.apply("end", that, args); }, wheelDelay);
    listeners.apply("zoom", that, args);
    event.preventDefault();
  }

  // TODO don’t dispatch start & end if there is another active gesture (e.g., wheel)
  // TODO interrupt transition on this element, if any
  // TODO dispatch customEvent
  // TODO update scale and translate
  function mousedowned() {
    var that = this, args = arguments;
    listeners.apply("start", that, args);
    select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true);

    function mousemoved() {
      listeners.apply("zoom", that, args);
    }

    function mouseupped() {
      select(event.view).on("mousemove.zoom mouseup.zoom", null);
      listeners.apply("end", that, args);
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

  zoom.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? zoom : value;
  };

  return zoom;
}
