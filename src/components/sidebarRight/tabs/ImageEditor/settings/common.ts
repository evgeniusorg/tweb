import {Colors, SIZE_RANGE_MAX, SIZE_RANGE_MIN, SIZE_RANGE_STEP} from '../constants';
import {attachClickEvent} from '../../../../../helpers/dom/clickEvent';
import findUpClassName from '../../../../../helpers/dom/findUpClassName';
import {RangeSettingSelector} from '../../../../rangeSettingSelector';

export function getColorsList(initColor: Colors, callback: (value: Colors) => void) {
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

export function getSizingRange(initValue: number, callback: (value: number) => void) {
  const range = new RangeSettingSelector(
    'ImageEditor.Text.Size',
    SIZE_RANGE_STEP,
    initValue,
    SIZE_RANGE_MIN,
    SIZE_RANGE_MAX
  );

  range.onChange = (value) => {
    callback(value);
  };

  return range;
}
