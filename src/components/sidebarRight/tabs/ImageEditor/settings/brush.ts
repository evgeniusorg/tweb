import {Colors, LayerTypes} from '../constants';
import {State} from '../types';
import {getColorsList, getSizingRange} from './common';

export function showImageBrushes(element: HTMLElement, state: State, reRenderCanvas: () => void) {
  const brushSettings = document.createElement('div');

  const selectColor = (color: Colors) => {
    state.brushSettings.color = color;

    if(state.selectedLayerId !== null && state.layers[state.selectedLayerId].type === LayerTypes.brush) {
      state.layers[state.selectedLayerId].color = color;
      reRenderCanvas();
    }
  };

  const selectBrushSize = (size: number) => {
    state.brushSettings.size = size;

    if(state.selectedLayerId !== null && state.layers[state.selectedLayerId].type === LayerTypes.brush) {
      state.layers[state.selectedLayerId].size = size;
      reRenderCanvas();
    }
  }

  brushSettings.append(getColorsList(state.brushSettings.color, selectColor));
  brushSettings.append(getSizingRange(state.brushSettings.size, selectBrushSize).container);

  element.replaceChildren(brushSettings);
}
