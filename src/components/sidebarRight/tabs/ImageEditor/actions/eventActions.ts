export function getEventPosition(event: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) {
  const {left, top} = canvas.getBoundingClientRect();
  const eventLeft = (event instanceof MouseEvent ? event.clientX : event.touches?.[0].clientX) - left;
  const eventTop = (event instanceof MouseEvent ? event.clientY : event.touches?.[0].clientY) - top;

  return {left: eventLeft, top: eventTop};
}
