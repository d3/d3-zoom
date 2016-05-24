# d3-zoom

…

## Installing

If you use NPM, `npm install d3-zoom`. Otherwise, download the [latest release](https://github.com/d3/d3-zoom/releases/latest). You can also load directly from [d3js.org](https://d3js.org), either as a [standalone library](https://d3js.org/d3-zoom.v0.0.min.js) or as part of [D3 4.0](https://github.com/d3/d3). AMD, CommonJS, and vanilla environments are supported. In vanilla, a `d3_zoom` global is exported:

```html
<script src="https://d3js.org/d3-color.v0.4.min.js"></script>
<script src="https://d3js.org/d3-dispatch.v0.4.min.js"></script>
<script src="https://d3js.org/d3-ease.v0.7.min.js"></script>
<script src="https://d3js.org/d3-interpolate.v0.8.min.js"></script>
<script src="https://d3js.org/d3-selection.v0.7.min.js"></script>
<script src="https://d3js.org/d3-timer.v0.4.min.js"></script>
<script src="https://d3js.org/d3-transition.v0.2.min.js"></script>
<script src="https://d3js.org/d3-drag.v0.1.min.js"></script>
<script src="https://d3js.org/d3-zoom.v0.0.min.js"></script>
<script>

var zoom = d3_zoom.zoom();

</script>
```

[Try d3-zoom in your browser.](https://tonicdev.com/npm/d3-zoom)

## API Reference

This table describes how the zoom behavior interprets native events:

| Event        | Listening Element | Zoom Event  | Default Prevented? |
| ------------ | ----------------- | ----------- | ------------------ |
| mousedown⁵   | selection         | start       | no¹                |
| mousemove²   | window¹           | zoom        | yes                |
| mouseup²     | window¹           | end         | yes                |
| dragstart²   | window            | -           | yes                |
| selectstart² | window            | -           | yes                |
| click³       | window            | -           | yes                |
| dblclick     | selection         | *multiple*⁶ | yes                |
| wheel        | selection         | zoom⁷       | yes                |
| touchstart   | selection         | *multiple*⁶ | no⁴                |
| touchmove    | selection         | zoom        | yes                |
| touchend     | selection         | end         | no⁴                |
| touchcancel  | selection         | end         | no⁴                |

The propagation of all consumed events is [immediately stopped](https://dom.spec.whatwg.org/#dom-event-stopimmediatepropagation).

¹ Necessary to capture events outside an iframe; see [d3-drag#9](https://github.com/d3/d3-drag/issues/9).
<br>² Only applies during an active, mouse-based gesture; see [d3-drag#9](https://github.com/d3/d3-drag/issues/9).
<br>³ Only applies immediately after a non-empty, mouse-based gesture.
<br>⁴ Necessary to allow [click emulation](https://developer.apple.com/library/ios/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html#//apple_ref/doc/uid/TP40006511-SW7) on touch input; see [d3-drag#9](https://github.com/d3/d3-drag/issues/9).
<br>⁵ Ignored if within 500ms of a touch gesture ending; assumes [click emulation](https://developer.apple.com/library/ios/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html#//apple_ref/doc/uid/TP40006511-SW7).
<br>⁶ Double-click and double-tap initiate a transition that emits start, zoom and end events.
<br>⁷ The first wheel event emits a start event; an end event is emitted when no wheel events are received for 150ms.

<a href="#zoom" name="zoom">#</a> d3.<b>zoom</b>()

…

<a href="#_zoom" name="_zoom">#</a> <i>zoom</i>(<i>selection</i>)

…

<a href="#zoom_transform" name="zoom_transform">#</a> <i>zoom</i>.<b>transform</b>(<i>selection</i>, <i>transform</i>)

…

<a href="#zoom_translateBy" name="zoom_translateBy">#</a> <i>zoom</i>.<b>translateBy</b>(<i>selection</i>, <i>k</i>)

…

<a href="#zoom_scaleBy" name="zoom_scaleBy">#</a> <i>zoom</i>.<b>scaleBy</b>(<i>selection</i>, <i>k</i>)

…

<a href="#zoom_scaleTo" name="zoom_scaleTo">#</a> <i>zoom</i>.<b>scaleTo</b>(<i>selection</i>, <i>k</i>)

…

<a href="#zoom_filter" name="zoom_filter">#</a> <i>zoom</i>.<b>filter</b>([<i>filter</i>])

…

<a href="#zoom_size" name="zoom_size">#</a> <i>zoom</i>.<b>size</b>([<i>size</i>])

…

<a href="#zoom_scaleExtent" name="zoom_scaleExtent">#</a> <i>zoom</i>.<b>scaleExtent</b>([<i>scaleExtent</i>])

…

<a href="#zoom_center" name="zoom_center">#</a> <i>zoom</i>.<b>center</b>([<i>center</i>])

…

<a href="#zoom_duration" name="zoom_duration">#</a> <i>zoom</i>.<b>duration</b>([<i>duration</i>])

…

<a href="#zoom_on" name="zoom_on">#</a> <i>zoom</i>.<b>on</b>(<i>typenames</i>[, <i>listener</i>])

If *listener* is specified, sets the event *listener* for the specified *typenames* and returns the zoom behavior. If an event listener was already registered for the same type and name, the existing listener is removed before the new listener is added. If *listener* is null, removes the current event listeners for the specified *typenames*, if any. If *listener* is not specified, returns the first currently-assigned listener matching the specified *typenames*, if any. When a specified event is dispatched, each *listener* will be invoked with the same context and arguments as [*selection*.on](https://github.com/d3/d3-selection#selection_on) listeners: the current datum `d` and index `i`, with the `this` context as the current DOM element.

The *typenames* is a string containing one or more *typename* separated by whitespace. Each *typename* is a *type*, optionally followed by a period (`.`) and a *name*, such as `zoom.foo` and `zoom.bar`; the name allows multiple listeners to be registered for the same *type*. The *type* must be one of the following:

* `start` - after zooming begins (such as on mousedown).
* `zoom` - after a change to the zoom transform (such as on mousemove).
* `end` - after zooming ends (such as on mouseup ).

See [*dispatch*.on](https://github.com/d3/d3-dispatch#dispatch_on) for more.

### Zoom Events

When a [zoom event listener](#zoom_on) is invoked, [d3.event](https://github.com/d3/d3-selection#event) is set to the current zoom event. The *event* object exposes several fields:

* `type` - the string “start”, “zoom” or “end”; see [*zoom*.on](#zoom_on).
* `transform` -
* `sourceEvent` - the underlying input event, such as mousemove or touchmove.

### Zoom Transforms

<a href="#zoomTransform" name="zoomTransform">#</a> d3.<b>zoomTransform</b>([<i>node</i>])

…

* `x` - the *x*-coordinate translation amount
* `y` - the *y*-coordinate translation amount
* `k` - the scale factor

<a href="#transform_scale" name="transform_scale">#</a> <i>transform</i>.<b>scale</b>(<i>k</i>)

…

<a href="#transform_translate" name="transform_translate">#</a> <i>transform</i>.<b>translate</b>(<i>x</i>, <i>y</i>)

…

<a href="#transform_apply" name="transform_apply">#</a> <i>transform</i>.<b>apply</b>(<i>point</i>)

…

<a href="#transform_applyX" name="transform_applyX">#</a> <i>transform</i>.<b>applyX</b>(<i>x</i>)

…

<a href="#transform_applyy" name="transform_applyy">#</a> <i>transform</i>.<b>applyY</b>(<i>y</i>)

…

<a href="#transform_invert" name="transform_invert">#</a> <i>transform</i>.<b>invert</b>(<i>point</i>)

…

<a href="#transform_invertX" name="transform_invertX">#</a> <i>transform</i>.<b>invertX</b>(<i>x</i>)

…

<a href="#transform_inverty" name="transform_inverty">#</a> <i>transform</i>.<b>invertY</b>(<i>y</i>)

…

<a href="#transform_rescaleX" name="transform_rescaleX">#</a> <i>transform</i>.<b>rescaleX</b>(<i>x</i>)

…

<a href="#transform_rescaley" name="transform_rescaley">#</a> <i>transform</i>.<b>rescaleY</b>(<i>y</i>)

…

<a href="#transform_toString" name="transform_toString">#</a> <i>transform</i>.<b>toString</b>()

Returns a string representing the [SVG transform](https://www.w3.org/TR/SVG/coords.html#TransformAttribute) corresponding to this transform. Implemented as:

```js
function toString() {
  return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
}
```
