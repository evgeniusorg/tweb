import {LayerMovementEventState, State} from '../types';

function layerMovement(canvas: HTMLCanvasElement, reRender: () => void) {
  const event_state: LayerMovementEventState = {
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

    event_state.mouseX = e.offsetX;
    event_state.mouseY = e.offsetY;
    event_state.layer = state.layers[selectedLayerId];
    event_state.layerLeft = event_state.layer.left;
    event_state.layerTop = event_state.layer.top;
    event_state.selectedLayerId = selectedLayerId;
    event_state.state = state;
    event_state.endMovingCallback = endMovingCallback;

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

    event_state.endMovingCallback?.();
  }

  function moving(e: any) {
    e.preventDefault();
    e.stopPropagation();

    event_state.layer.isMoved = true;
    event_state.layer.left = e.offsetX - (event_state.mouseX - event_state.layerLeft);
    event_state.layer.top = e.offsetY - (event_state.mouseY - event_state.layerTop);
    reRender();
  }

  return {startMoving, removeHandlers};
}

export default layerMovement;
