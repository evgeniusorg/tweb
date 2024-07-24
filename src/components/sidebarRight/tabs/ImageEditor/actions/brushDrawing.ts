import {BrushDrawingEventState, BrushLayer} from '../types';
import {getEventPosition} from './eventActions';

function brushDrawing(canvas: HTMLCanvasElement, reRender: () => void) {
  const eventState: BrushDrawingEventState = {
    layer: null,
    endDrawingCallback: null,
    mouseX: 0,
    mouseY: 0
  }

  function removeHandlers() {
    canvas.removeEventListener('mouseup', endDrawing);
    canvas.removeEventListener('touchend', endDrawing);
    canvas.removeEventListener('mousemove', moving);
    canvas.removeEventListener('touchmove', moving);
  }

  function startDrawing(event: MouseEvent | TouchEvent, layer: BrushLayer, endDrawingCallback: () => void) {
    event.preventDefault();
    event.stopPropagation();

    const {left, top} = getEventPosition(event, canvas);

    eventState.layer = layer;
    eventState.endDrawingCallback = endDrawingCallback;
    eventState.mouseX = left;
    eventState.mouseY = top;

    canvas.addEventListener('mousemove', moving);
    canvas.addEventListener('touchmove', moving);
    canvas.addEventListener('mouseup', endDrawing);
    canvas.addEventListener('touchend', endDrawing);
  }

  function endDrawing(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    canvas.removeEventListener('mouseup', endDrawing);
    canvas.removeEventListener('touchend', endDrawing);
    canvas.removeEventListener('mousemove', moving);
    canvas.removeEventListener('touchmove', moving);

    eventState.layer.isDrawing = false;
    eventState.endDrawingCallback?.();
  }

  function moving(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    event.stopPropagation();

    const {left, top} = getEventPosition(event, canvas);
    eventState.layer.isDrawing = true;
    eventState.layer.points.push([left - eventState.mouseX, top - eventState.mouseY]);
    reRender();
  }

  return {startDrawing, removeHandlers};
}

export default brushDrawing;
