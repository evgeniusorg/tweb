import {LayerMovementEventState, State} from '../types';

function layerMovement(canvas: HTMLCanvasElement, reRender: () => void) {
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

  function startMoving(e: MouseEvent | TouchEvent, state: State, selectedLayerId: number, endMovingCallback: () => void) {
    e.preventDefault();
    e.stopPropagation();
    eventState.mouseX = e.offsetX;
    eventState.mouseY = e.offsetY;
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

  function endMoving(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    canvas.removeEventListener('mouseup', endMoving);
    canvas.removeEventListener('touchend', endMoving);
    canvas.removeEventListener('mousemove', moving);
    canvas.removeEventListener('touchmove', moving);

    eventState.endMovingCallback?.();
  }

  function moving(e: any) {
    e.preventDefault();
    e.stopPropagation();

    eventState.layer.isMoved = true;
    eventState.layer.left = e.offsetX - (eventState.mouseX - eventState.layerLeft);
    eventState.layer.top = e.offsetY - (eventState.mouseY - eventState.layerTop);
    reRender();
  }

  return {startMoving, removeHandlers};
}

export default layerMovement;
