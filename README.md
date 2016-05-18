# d3-zoom

…

## Installing

If you use NPM, `npm install d3-zoom`. Otherwise, download the [latest release](https://github.com/d3/d3-zoom/releases/latest). You can also load directly from [d3js.org](https://d3js.org), either as a [standalone library](https://d3js.org/d3-zoom.v0.0.min.js) or as part of [D3 4.0](https://github.com/d3/d3). AMD, CommonJS, and vanilla environments are supported. In vanilla, a `d3_zoom` global is exported:

```html
<script src="https://d3js.org/d3-color.v0.4.min.js"></script>
<script src="https://d3js.org/d3-dispatch.v0.4.min.js"></script>
<script src="https://d3js.org/d3-ease.v0.7.min.js"></script>
<script src="https://d3js.org/d3-interpolate.v0.7.min.js"></script>
<script src="https://d3js.org/d3-selection.v0.7.min.js"></script>
<script src="https://d3js.org/d3-timer.v0.4.min.js"></script>
<script src="https://d3js.org/d3-transition.v0.2.min.js"></script>
<script src="https://d3js.org/d3-zoom.v0.0.min.js"></script>
<script>

var zoom = d3_zoom.zoom();

</script>
```

[Try d3-zoom in your browser.](https://tonicdev.com/npm/d3-zoom)

## API Reference

This table describes how the zoom behavior interprets native events:

| Event        | Listening Element | Zoom Event | Default Prevented? |
| ------------ | ----------------- | ---------- | ------------------ |
| mousedown    | selection         | start      | no¹                |
| mousemove²   | window³           | zoom       | TODO               |
| mouseup²     | window³           | end        | no¹                |
| dblclick     | selection         | zoom⁴      | TODO               |
| wheel        | selection         | zoom⁵      | yes                |
| touchstart   | TODO              | TODO       | TODO               |
| touchmove    | TODO              | TODO       | TODO               |
| touchend     | TODO              | TODO       | TODO               |
| touchcancel  | TODO              | TODO       | TODO               |
| selectstart  | TODO              | TODO       | TODO               |
| dragstart    | TODO              | TODO       | TODO               |
| click        | TODO              | TODO       | TODO               |

TODO Touch events. The propagation of all consumed events is [immediately stopped](https://dom.spec.whatwg.org/#dom-event-stopimmediatepropagation).

¹ Default cannot be prevented due to browser bugs; see [d3-drag#9](https://github.com/d3/d3-drag/issues/9).
<br>² Only applies during an active zoom gesture.
<br>³ Necessary to capture events outside an iframe; see [d3-drag#9](https://github.com/d3/d3-drag/issues/9).
<br>⁴ A dblclick event emits start, zoom and end events.
<br>⁵ The first wheel event emits a start event; an end event is emitted when no wheel events are received for 150ms.

<a href="#zoom" name="zoom">#</a> d3.<b>zoom</b>()

…
