import {Colors, SIZE_RANGE_STEP} from '../constants';
import {attachClickEvent} from '../../../../../helpers/dom/clickEvent';
import findUpClassName from '../../../../../helpers/dom/findUpClassName';
import {RangeSettingSelector} from '../../../../rangeSettingSelector';

export function selectColor(element: HTMLElement, color: string) {
  const colorBtns = element.getElementsByClassName('image-editor-colors-list-item');
  for(let i = 0; i < colorBtns.length; i++) {
    const colorBtn = colorBtns[i] as HTMLDivElement;
    if(colorBtn.dataset.value === color) {
      colorBtn.classList.add('active');
    } else {
      colorBtn.classList.remove('active');
    }
  }
}

export function getColorsList(initColor: string, callback: (value: string) => void) {
  const colorsList = document.createElement('div');
  colorsList.classList.add('image-editor-colors-list');

  Object.entries(Colors).forEach(([type, value]) => {
    const colorBtn = document.createElement('div');
    colorBtn.classList.add('image-editor-colors-list-item');
    colorBtn.style.setProperty('--image-editor-colors-list-item-background', value);
    colorBtn.dataset.value = value;

    if(initColor === value) {
      colorBtn.classList.add('active');
    }

    colorsList.append(colorBtn);
  });

  attachClickEvent(colorsList, (e) => {
    const colorBtn = findUpClassName(e.target, 'image-editor-colors-list-item');

    if(!colorBtn) {
      return;
    }

    const activeColorBtn = colorsList.getElementsByClassName('active')[0];
    activeColorBtn && activeColorBtn.classList.remove('active');
    colorBtn.classList.add('active');

    callback(colorBtn.dataset.value as Colors);
  });

  return colorsList;
}

export function getSizingRange(initValue: number, minValue: number, maxValue: number, callback: (value: number) => void) {
  const range = new RangeSettingSelector(
    'ImageEditor.Text.Size',
    SIZE_RANGE_STEP,
    initValue,
    minValue,
    maxValue
  );

  range.onChange = (value) => {
    callback(value);
  };

  return range;
}

export function updateRangeSelectorColor(element: HTMLElement, color: string) {
  const rangeSelector = element.getElementsByClassName('progress-line__filled')[0] as HTMLDivElement;
  rangeSelector?.style.setProperty('--color', color);
}
