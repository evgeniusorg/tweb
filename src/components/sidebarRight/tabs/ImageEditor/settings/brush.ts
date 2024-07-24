import {
  BRUSHES, BrushStyles,
  Colors,
  LayerTypes,
  SIZE_RANGE_BRUSH_MAX,
  SIZE_RANGE_BRUSH_MIN,
  SIZE_RANGE_UPDATE_HISTORY_DELAY
} from '../constants';
import {BrushLayer, State} from '../types';
import {getColorsList, getSizingRange} from './common';
import {attachClickEvent} from '../../../../../helpers/dom/clickEvent';
import findUpClassName from '../../../../../helpers/dom/findUpClassName';
import {_i18n, LangPackKey} from '../../../../../lib/langPack';
import renderImageFromUrl from '../../../../../helpers/dom/renderImageFromUrl';

function getBrushesList(
  state: State,
  reRenderCanvas: () => void,
  updateHistory: () => void
) {
  const brushesList = document.createElement('div');
  brushesList.classList.add('image-editor-settings-list');

  BRUSHES.forEach(({style, langKey, iconUrl, disabled}) => {
    const btn = document.createElement('div');
    btn.classList.add('btn-menu-item', 'rp-overflow', 'image-editor-settings-list-btn');

    if(disabled) {
      btn.classList.add('image-editor-settings-list-btn--disabled');
    }

    const btnIcon = document.createElement('div');
    btnIcon.classList.add('image-editor-settings-list-btn-icon--brush');
    const btnIconImg = document.createElement('img');
    renderImageFromUrl(btnIconImg, iconUrl);
    btnIcon.append(btnIconImg);

    const btnText = document.createElement('div');
    _i18n(btnText, langKey as LangPackKey);

    btn.append(btnIcon);
    btn.append(btnText);

    btn.dataset.style = style;

    if(state.brushSettings.style === style) {
      btn.classList.add('active');
    }

    brushesList.append(btn);
  });

  attachClickEvent(brushesList, (e) => {
    const brushBtn = findUpClassName(e.target, 'image-editor-settings-list-btn');

    if(!brushBtn) {
      return;
    }

    const activeBrushBtn = brushesList.getElementsByClassName('active')[0];
    activeBrushBtn && activeBrushBtn.classList.remove('active');
    brushBtn.classList.add('active');

    state.brushSettings.style = brushBtn.dataset.style as BrushStyles;

    if(state.selectedLayerId !== null && state.layers[state.selectedLayerId].type === LayerTypes.brush) {
      const layer = state.layers[state.selectedLayerId] as BrushLayer;
      layer.style = brushBtn.dataset.style as BrushStyles;
      updateHistory();
      reRenderCanvas();
    }
  });

  return brushesList;
}

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
      const layer = state.layers[state.selectedLayerId] as BrushLayer;
      layer.color = color;
      updateHistory();
      reRenderCanvas();
    }
  };

  const selectBrushSize = (size: number) => {
    state.brushSettings.size = size;
    let timer: ReturnType<typeof setTimeout> = null;

    if(state.selectedLayerId !== null && state.layers[state.selectedLayerId].type === LayerTypes.brush) {
      const layer = state.layers[state.selectedLayerId] as BrushLayer;
      layer.size = size;
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

  const title = document.createElement('div');
  title.classList.add('image-editor-settings-block-title');
  _i18n(title, 'ImageEditor.Brush.Title');
  brushSettings.append(title);

  brushSettings.append(getBrushesList(state, reRenderCanvas, updateHistory));

  element.replaceChildren(brushSettings);
}
