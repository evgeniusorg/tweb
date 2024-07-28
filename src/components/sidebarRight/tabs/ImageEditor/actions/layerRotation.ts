/*
 * https://github.com/evgeniusorg/tweb/tree/image_editor
 * Copyright (C) 2024 Eugene Chugunov
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import {LayerRotation, LayerRotationEventState, State} from '../types';
import {getEventPosition} from './eventActions';

function layerRotation(canvas: HTMLCanvasElement, reRender: () => void): LayerRotation {
  const eventState: LayerRotationEventState = {
    mouseX: 0,
    mouseY: 0,
    layerCenterLeft: null,
    layerCenterTop: null,
    layerAngle: null,
    layer: null,
    endRotationCallback: null
  }

  function removeHandlers() {
    canvas.removeEventListener('mouseup', endRotate);
    canvas.removeEventListener('touchend', endRotate);
    canvas.removeEventListener('mousemove', rotate);
    canvas.removeEventListener('touchmove', rotate);
  }

  function startRotate(event: MouseEvent | TouchEvent, state: State, selectedLayerId: number, endRotationCallback: () => void) {
    event.preventDefault();
    event.stopPropagation();

    const {left, top} = getEventPosition(event, canvas);

    eventState.mouseX = left;
    eventState.mouseY = top;
    eventState.layer = state.layers[selectedLayerId];
    eventState.layerCenterLeft = eventState.layer.left + eventState.layer.width / 2;
    eventState.layerCenterTop = eventState.layer.top + eventState.layer.height / 2;
    eventState.layerAngle = eventState.layer.angle;

    eventState.endRotationCallback = endRotationCallback;

    canvas.addEventListener('mousemove', rotate);
    canvas.addEventListener('touchmove', rotate);
    canvas.addEventListener('mouseup', endRotate);
    canvas.addEventListener('touchend', endRotate);
  }

  function endRotate(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    removeHandlers();

    eventState.endRotationCallback?.();
  }

  function rotate(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    event.stopPropagation();

    const {left, top} = getEventPosition(event, canvas);

    const initAngle = Math.atan2(
      eventState.layerCenterTop - eventState.mouseY,
      eventState.layerCenterLeft - eventState.mouseX
    );
    const angle = Math.atan2(
      eventState.layerCenterTop - top,
      eventState.layerCenterLeft - left
    );

    eventState.layer.angle = eventState.layerAngle + angle - initAngle;

    reRender();
  }

  return {startRotate, removeHandlers};
}

export default layerRotation;
