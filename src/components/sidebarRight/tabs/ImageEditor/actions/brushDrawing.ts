import {BrushDrawingEventState, BrushLayer} from '../types';

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

  function startDrawing(e: MouseEvent | TouchEvent, layer: BrushLayer, endDrawingCallback: () => void) {
    e.preventDefault();
    e.stopPropagation();

    eventState.layer = layer;
    eventState.endDrawingCallback = endDrawingCallback;
    eventState.mouseX = e.offsetX;
    eventState.mouseY = e.offsetY;

    canvas.addEventListener('mousemove', moving);
    canvas.addEventListener('touchmove', moving);
    canvas.addEventListener('mouseup', endDrawing);
    canvas.addEventListener('touchend', endDrawing);
  }

  function endDrawing(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    canvas.removeEventListener('mouseup', endDrawing);
    canvas.removeEventListener('touchend', endDrawing);
    canvas.removeEventListener('mousemove', moving);
    canvas.removeEventListener('touchmove', moving);
    eventState.endDrawingCallback?.();
  }

  function moving(e: any) {
    e.preventDefault();
    e.stopPropagation();

    eventState.layer.points.push([e.offsetX - eventState.mouseX, e.offsetY - eventState.mouseY]);
    reRender();
  }

  return {startDrawing, removeHandlers};
}

export default brushDrawing;
