/*
 * https://github.com/evgeniusorg/tweb/tree/image_editor
 * Copyright (C) 2024 Eugene Chugunov
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import {LayerMovement, LayerMovementEventState, State} from '../types';
import {getEventPosition} from './eventActions';

function layerMovement(canvas: HTMLCanvasElement, reRender: () => void): LayerMovement {
  const eventState: LayerMovementEventState = {
    mouseX: 0,
    mouseY: 0,
    layerLeft: null,
    layerTop: null,
    selectedLayerId: null,
    layer: null,
    state: null,
    endMovingCallback: null
  }

  function removeHandlers() {
    canvas.removeEventListener('mouseup', endMoving);
    canvas.removeEventListener('touchend', endMoving);
    canvas.removeEventListener('mousemove', moving);
    canvas.removeEventListener('touchmove', moving);
  }

  function startMoving(event: MouseEvent | TouchEvent, state: State, selectedLayerId: number, endMovingCallback: () => void) {
    event.preventDefault();
    event.stopPropagation();

    const {left, top} = getEventPosition(event, canvas);

    eventState.mouseX = left;
    eventState.mouseY = top;
    eventState.layer = state.layers[selectedLayerId];
    eventState.layerLeft = eventState.layer.left;
    eventState.layerTop = eventState.layer.top;
    eventState.selectedLayerId = selectedLayerId;
    eventState.state = state;
    eventState.endMovingCallback = endMovingCallback;

    canvas.addEventListener('mousemove', moving);
    canvas.addEventListener('touchmove', moving);
    canvas.addEventListener('mouseup', endMoving);
    canvas.addEventListener('touchend', endMoving);
  }

  function endMoving(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    removeHandlers();

    eventState.endMovingCallback?.();
    eventState.layer.isMoved = false;
  }

  function moving(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    event.stopPropagation();

    const {left, top} = getEventPosition(event, canvas);

    eventState.layer.isMoved = true;
    eventState.layer.left = left - (eventState.mouseX - eventState.layerLeft);
    eventState.layer.top = top - (eventState.mouseY - eventState.layerTop);
    reRender();
  }

  return {startMoving, removeHandlers};
}

export default layerMovement;