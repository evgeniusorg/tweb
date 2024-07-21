import {Colors, FONTS, LayerTypes, TextAlign, TextFrame} from '../constants';
import {attachClickEvent} from '../../../../../helpers/dom/clickEvent';
import findUpClassName from '../../../../../helpers/dom/findUpClassName';
import ButtonIcon from '../../../../buttonIcon';
import {resizeTextBoundary} from '../actions/render';
import {State, TextLayer} from '../types';
import {getColorsList, getSizingRange} from './common';

function getFontStyles(state: State, reRenderCanvas: () => void) {
  const fontStyles = document.createElement('div');
  fontStyles.classList.add('image-editor-font-styles');

  const fontAligns = document.createElement('div');
  fontAligns.classList.add('image-editor-font-styles-aligns');

  const fontFrames = document.createElement('div');
  fontFrames.classList.add('image-editor-font-styles-frames');

  Object.keys(TextAlign).forEach((align) => {
    const btn = ButtonIcon(`icon_align_${align}`);
    btn.classList.add('image-editor-font-styles-btn');
    btn.dataset.type = 'align';
    btn.dataset.value = align;

    if(state.textSettings.align === align) {
      btn.classList.add('active');
    }

    fontAligns.append(btn);
  })

  Object.keys(TextFrame).forEach((frame) => {
    const btn = ButtonIcon(`icon_frame_${frame}`);
    btn.classList.add('image-editor-font-styles-btn');
    btn.dataset.type = 'frame';
    btn.dataset.value = frame;

    if(state.textSettings.frame === frame) {
      btn.classList.add('active');
    }

    fontFrames.append(btn);
  })

  fontStyles.append(fontAligns);
  fontStyles.append(fontFrames);

  attachClickEvent(fontStyles, (e) => {
    const btn = findUpClassName(e.target, 'image-editor-font-styles-btn');

    if(!btn) {
      return;
    }

    const btnsList = btn.dataset.type === 'align' ? fontAligns : fontFrames;
    const activeBtn = btnsList.getElementsByClassName('active')[0];
    activeBtn && activeBtn.classList.remove('active');
    btn.classList.add('active');

    state.textSettings[btn.dataset.type] = btn.dataset.value;

    if(state.selectedLayerId !== null && state.layers[state.selectedLayerId].type === LayerTypes.text) {
      state.layers[state.selectedLayerId][btn.dataset.type] = btn.dataset.value;
      reRenderCanvas();
    }
  });

  return fontStyles;
}

function getFontsList(state: State, canvas: HTMLCanvasElement, reRenderCanvas: () => void) {
  const fontsList = document.createElement('div');
  fontsList.classList.add('image-editor-fonts-list');

  FONTS.forEach(({font, title}) => {
    const btn = document.createElement('div');
    btn.classList.add('btn-menu-item', 'rp-overflow', 'image-editor-fonts-list-btn');
    btn.style.setProperty('font-family', font);
    btn.append(title);
    btn.dataset.font = font;

    if(state.textSettings.font === font) {
      btn.classList.add('active');
    }

    fontsList.append(btn);
  });

  attachClickEvent(fontsList, (e) => {
    const fontBtn = findUpClassName(e.target, 'image-editor-fonts-list-btn');

    if(!fontBtn) {
      return;
    }

    const activeFontBtn = fontsList.getElementsByClassName('active')[0];
    activeFontBtn && activeFontBtn.classList.remove('active');
    fontBtn.classList.add('active');

    state.textSettings.font = fontBtn.dataset.font;

    if(state.selectedLayerId !== null && state.layers[state.selectedLayerId].type === LayerTypes.text) {
      const context = canvas.getContext('2d');
      const layer = state.layers[state.selectedLayerId] as TextLayer;
      layer.font = fontBtn.dataset.font;

      const {width, height} = resizeTextBoundary(layer, context);
      layer.width = width;
      layer.height = height;
      reRenderCanvas();
    }
  });

  return fontsList;
}

export function showImageText(element: HTMLElement, state: State, canvas: HTMLCanvasElement, reRenderCanvas: () => void) {
  const textSettings = document.createElement('div');

  const selectColor = (color: Colors) => {
    state.textSettings.color = color;

    if(state.selectedLayerId !== null && state.layers[state.selectedLayerId].type === LayerTypes.text) {
      state.layers[state.selectedLayerId].color = color;
      reRenderCanvas();
    }
  };

  const selectFontSize = (size: number) => {
    state.textSettings.size = size;

    if(state.selectedLayerId !== null && state.layers[state.selectedLayerId].type === LayerTypes.text) {
      const context = canvas.getContext('2d');
      const layer = state.layers[state.selectedLayerId] as TextLayer;
      layer.size = size;

      const {width, height} = resizeTextBoundary(layer, context);
      layer.width = width;
      layer.height = height;
      reRenderCanvas();
    }
  }

  textSettings.append(getColorsList(state.textSettings.color, selectColor));
  textSettings.append(getFontStyles(state, reRenderCanvas));
  textSettings.append(getSizingRange(state.textSettings.size, selectFontSize).container);
  textSettings.append(getFontsList(state, canvas, reRenderCanvas));

  element.replaceChildren(textSettings);
}
