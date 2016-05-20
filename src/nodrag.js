import {event} from "d3-selection";
import noevent from "./noevent";

function noselectstart(selection) {
  selection.on("selectstart.zoom", noevent, true);
}

function yesselectstart(selection) {
  selection.on("selectstart.zoom", null);
}

function nouserselect() {
  var root = event.view.document.documentElement, style = root.style;
  root.__noselect = style.MozUserSelect;
  style.MozUserSelect = "none";
}

function yesuserselect() {
  var root = event.view.document.documentElement;
  root.style.MozUserSelect = root.__noselect;
  delete root.__noselect;
}

export function nodrag(selection) {
  return ("onselectstart" in event.target ? noselectstart : nouserselect)(selection.on("dragstart.zoom", noevent, true));
}

export function yesdrag(selection) {
  return ("onselectstart" in event.target ? yesselectstart : yesuserselect)(selection.on("dragstart.zoom", null));
}
