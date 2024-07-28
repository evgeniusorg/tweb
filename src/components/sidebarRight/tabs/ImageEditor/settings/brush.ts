/*
 * https://github.com/evgeniusorg/tweb/tree/image_editor
 * Copyright (C) 2024 Eugene Chugunov
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import {
  BRUSHES, BrushStyles,
  Colors,
  LayerTypes,
  SIZE_RANGE_BRUSH_MAX,
  SIZE_RANGE_BRUSH_MIN,
  SIZE_RANGE_UPDATE_HISTORY_DELAY
} from '../constants';
import {BrushIconsList, BrushLayer, State} from '../types';
import {getColorsList, getSizingRange, selectColor, updateRangeSelectorColor} from './common';
import {attachClickEvent} from '../../../../../helpers/dom/clickEvent';
import findUpClassName from '../../../../../helpers/dom/findUpClassName';
import {_i18n, LangPackKey} from '../../../../../lib/langPack';
import renderImageFromUrl from '../../../../../helpers/dom/renderImageFromUrl';
import textToSvgURL from '../../../../../helpers/textToSvgURL';

export function replaceBrushColorOnText(text: string, color: string) {
  return text.replace(/needReColor="true" (fill|stop-color)=".+?"/g, `needReColor="true" $1="${color}"`);
}
export function updateActiveBrushBtnColor(brushBtn: HTMLElement, color: string, brushIcons: BrushIconsList) {
  const brushStyle = brushBtn.dataset.style;
  const btnIcon = brushBtn.getElementsByClassName('image-editor-sidebar-settings-list-btn-icon--brush')[0];
  const btnIconImg = document.createElement('img');
  const iconText = replaceBrushColorOnText(brushIcons[brushStyle  as BrushStyles].text, color);

  brushIcons[brushStyle as BrushStyles].color = color;

  textToSvgURL(iconText).then((icon) => {
    renderImageFromUrl(btnIconImg, icon);
    btnIcon.replaceChildren(btnIconImg);
  })
}

function getBrushesList(
  element: HTMLElement,
  state: State,
  brushIcons: BrushIconsList,
  reRenderCanvas: () => void,
  updateHistory: () => void
) {
  const brushesList = document.createElement('div');
  brushesList.classList.add('image-editor-sidebar-settings-list');

  BRUSHES.forEach(({style, langKey, iconUrl, disabled}) => {
    const btn = document.createElement('div');
    btn.classList.add('btn-menu-item', 'rp-overflow', 'image-editor-sidebar-settings-list-btn');

    if(disabled) {
      btn.classList.add('image-editor-sidebar-settings-list-btn--disabled');
    }

    const btnIcon = document.createElement('div');
    btnIcon.classList.add('image-editor-sidebar-settings-list-btn-icon--brush');
    const btnIconImg = document.createElement('img');

    const icon = brushIcons[style].url;
    renderImageFromUrl(btnIconImg, icon);
    btnIcon.append(btnIconImg);

    if(state.brushSettings.style === style) {
      btn.classList.add('active');
      const iconText = replaceBrushColorOnText(brushIcons[style].text, state.brushSettings.color);
      textToSvgURL(iconText).then((iconUrl) => {
        brushIcons[style].url = iconUrl;
        brushIcons[style].color = state.brushSettings.color;
        renderImageFromUrl(btnIconImg, iconUrl);
      });
    }

    const btnText = document.createElement('div');
    _i18n(btnText, langKey as LangPackKey);

    btn.append(btnIcon);
    btn.append(btnText);

    btn.dataset.style = style;

    brushesList.append(btn);
  });

  attachClickEvent(brushesList, (e) => {
    const brushBtn = findUpClassName(e.target, 'image-editor-sidebar-settings-list-btn');

    if(!brushBtn) {
      return;
    }

    const activeBrushBtn = brushesList.getElementsByClassName('active')[0];
    activeBrushBtn && activeBrushBtn.classList.remove('active');
    brushBtn.classList.add('active');

    const brushStyle = brushBtn.dataset.style as BrushStyles;
    const brushColor = brushIcons[brushStyle].color;

    state.brushSettings.style = brushBtn.dataset.style as BrushStyles;
    state.brushSettings.color = brushColor;
    selectColor(element, brushColor);
    updateRangeSelectorColor(element, brushColor);

    if(state.selectedLayerId !== null && state.layers[state.selectedLayerId].type === LayerTypes.brush) {
      const layer = state.layers[state.selectedLayerId] as BrushLayer;
      layer.style = brushStyle;
      layer.color = brushColor;
      updateHistory();
      reRenderCanvas();
    }
  });

  return brushesList;
}

export function showImageBrushes(
  element: HTMLElement,
  state: State,
  brushIcons: BrushIconsList,
  reRenderCanvas: () => void,
  updateHistory: () => void
) {
  const brushSettings = document.createElement('div');
  const selectColor = (color: string) => {
    state.brushSettings.color = color;

    if(state.selectedLayerId !== null && state.layers[state.selectedLayerId].type === LayerTypes.brush) {
      const layer = state.layers[state.selectedLayerId] as BrushLayer;
      layer.color = color;
      updateHistory();
      reRenderCanvas();
    }

    updateRangeSelectorColor(element, color);

    const activeBrushBtn = element
    .getElementsByClassName('image-editor-sidebar-settings-list-btn active')[0] as HTMLElement;
    updateActiveBrushBtnColor(activeBrushBtn, color, brushIcons);
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
  updateRangeSelectorColor(brushSettings, state.brushSettings.color);

  const title = document.createElement('div');
  title.classList.add('image-editor-sidebar-settings-block-title');
  _i18n(title, 'ImageEditor.Brush.Title');
  brushSettings.append(title);

  brushSettings.append(getBrushesList(element, state, brushIcons, reRenderCanvas, updateHistory));

  element.replaceChildren(brushSettings);
}
