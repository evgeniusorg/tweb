import {
  Colors,
  FONTS,
  LayerTypes,
  SIZE_RANGE_FONT_MAX,
  SIZE_RANGE_FONT_MIN,
  SIZE_RANGE_UPDATE_HISTORY_DELAY,
  TextAlign,
  TextFrame
} from '../constants';
import {attachClickEvent} from '../../../../../helpers/dom/clickEvent';
import findUpClassName from '../../../../../helpers/dom/findUpClassName';
import ButtonIcon from '../../../../buttonIcon';
import {getTextBoundary} from '../actions/render';
import {State, TextLayer} from '../types';
import {getColorsList, getSizingRange} from './common';
import {_i18n} from '../../../../../lib/langPack';

function getFontStyles(state: State, reRenderCanvas: () => void, updateHistory: () => void) {
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

    if(btn.dataset.type === 'align') {
      state.textSettings.align = btn.dataset.value as TextAlign;
    } else {
      state.textSettings.frame = btn.dataset.value as TextFrame;
    }

    if(state.selectedLayerId !== null && state.layers[state.selectedLayerId].type === LayerTypes.text) {
      const layer = state.layers[state.selectedLayerId] as TextLayer;
      if(btn.dataset.type === 'align') {
        layer.align = btn.dataset.value as TextAlign;
      } else {
        layer.frame = btn.dataset.value as TextFrame;
      }

      updateHistory();
      reRenderCanvas();
    }
  });

  return fontStyles;
}

function getFontsList(
  state: State,
  canvas: HTMLCanvasElement,
  reRenderCanvas: () => void,
  updateHistory: () => void
) {
  const fontsList = document.createElement('div');
  fontsList.classList.add('image-editor-settings-list');

  FONTS.forEach(({font, title}) => {
    const btn = document.createElement('div');
    btn.classList.add('btn-menu-item', 'rp-overflow', 'image-editor-settings-list-btn');
    btn.style.setProperty('font-family', font);
    btn.append(title);
    btn.dataset.font = font;

    if(state.textSettings.font === font) {
      btn.classList.add('active');
    }

    fontsList.append(btn);
  });

  attachClickEvent(fontsList, (e) => {
    const fontBtn = findUpClassName(e.target, 'image-editor-settings-list-btn');

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

      const {width, height} = getTextBoundary(layer, context);
      layer.width = width;
      layer.height = height;
      updateHistory();
      reRenderCanvas();
    }
  });

  return fontsList;
}

export function showImageText(
  element: HTMLElement,
  state: State,
  canvas: HTMLCanvasElement,
  reRenderCanvas: () => void,
  updateHistory: () => void
) {
  const textSettings = document.createElement('div');

  const selectColor = (color: Colors) => {
    state.textSettings.color = color;

    if(state.selectedLayerId !== null && state.layers[state.selectedLayerId].type === LayerTypes.text) {
      const layer = state.layers[state.selectedLayerId] as TextLayer;
      layer.color = color;
      updateHistory();
      reRenderCanvas();
    }
  };

  let timer: ReturnType<typeof setTimeout> = null;

  const selectFontSize = (size: number) => {
    state.textSettings.size = size;

    if(state.selectedLayerId !== null && state.layers[state.selectedLayerId].type === LayerTypes.text) {
      const context = canvas.getContext('2d');
      const layer = state.layers[state.selectedLayerId] as TextLayer;
      layer.size = size;

      const {width, height} = getTextBoundary(layer, context);
      layer.width = width;
      layer.height = height;
      reRenderCanvas();

      if(timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(updateHistory, SIZE_RANGE_UPDATE_HISTORY_DELAY);
    }
  }

  textSettings.append(getColorsList(state.textSettings.color, selectColor));
  textSettings.append(getFontStyles(state, reRenderCanvas, updateHistory));
  textSettings.append(getSizingRange(
    state.textSettings.size,
    SIZE_RANGE_FONT_MIN,
    SIZE_RANGE_FONT_MAX,
    selectFontSize
  ).container);

  const title = document.createElement('div');
  title.classList.add('image-editor-settings-block-title');
  _i18n(title, 'ImageEditor.Font.Title');
  textSettings.append(title);

  textSettings.append(getFontsList(state, canvas, reRenderCanvas, updateHistory));

  element.replaceChildren(textSettings);
}
