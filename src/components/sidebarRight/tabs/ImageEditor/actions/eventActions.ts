/*
 * https://github.com/evgeniusorg/tweb/tree/image_editor
 * Copyright (C) 2024 Eugene Chugunov
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

export function getEventPosition(event: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) {
  const {left, top} = canvas.getBoundingClientRect();
  const eventLeft = (event instanceof MouseEvent ? event.clientX : event.touches?.[0].clientX) - left;
  const eventTop = (event instanceof MouseEvent ? event.clientY : event.touches?.[0].clientY) - top;

  return {left: eventLeft, top: eventTop};
}
