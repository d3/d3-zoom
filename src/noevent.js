export function nopropagation(event) {
  event.stopImmediatePropagation();
}

export default function(event) {
  if (event.cancelable) event.preventDefault();
  event.stopImmediatePropagation();
}
