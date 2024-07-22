import {
  Colors,
  LayerTypes,
  SIZE_RANGE_BRUSH_MAX,
  SIZE_RANGE_BRUSH_MIN,
  SIZE_RANGE_UPDATE_HISTORY_DELAY
} from '../constants';
import {State} from '../types';
import {getColorsList, getSizingRange} from './common';

export function showImageBrushes(
  element: HTMLElement,
  state: State,
  reRenderCanvas: () => void,
  updateHistory: () => void
) {
  const brushSettings = document.createElement('div');

  const selectColor = (color: Colors) => {
    state.brushSettings.color = color;

    if(state.selectedLayerId !== null && state.layers[state.selectedLayerId].type === LayerTypes.brush) {
      state.layers[state.selectedLayerId].color = color;
      updateHistory();
      reRenderCanvas();
    }
  };

  const selectBrushSize = (size: number) => {
    state.brushSettings.size = size;
    let timer: ReturnType<typeof setTimeout> = null;

    if(state.selectedLayerId !== null && state.layers[state.selectedLayerId].type === LayerTypes.brush) {
      state.layers[state.selectedLayerId].size = size;
      reRenderCanvas();

      if(timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(updateHistory, SIZE_RANGE_UPDATE_HISTORY_DELAY);
    }
  }

  brushSettings.append(getColorsList(state.brushSettings.color, selectColor));
  brushSettings.append(getSizingRange(
    state.brushSettings.size,
    SIZE_RANGE_BRUSH_MIN,
    SIZE_RANGE_BRUSH_MAX,
    selectBrushSize
  ).container);

  element.replaceChildren(brushSettings);
}
