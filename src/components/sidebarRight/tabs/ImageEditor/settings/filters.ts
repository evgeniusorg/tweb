import {FILTERS} from '../constants';
import {RangeSettingSelector} from '../../../../rangeSettingSelector';
import {LangPackKey} from '../../../../../lib/langPack';
import {State} from '../types';

export function showImageFilters(element: HTMLElement, state: State, reRenderCanvas: () => void, updateHistory: () => void) {
  let timer: ReturnType<typeof setTimeout> = null;
  const filtersList = document.createElement('div');

  FILTERS.forEach((filter) => {
    const filterInitValue = typeof filter.initValue === 'number' ? filter.initValue : 0;

    const range = new RangeSettingSelector(
      filter.title as LangPackKey,
      filter.step || 1,
      state.filters[filter.type] || filterInitValue,
      filter.minValue || 0,
      filter.maxValue || 100,
      true,
      true,
      filterInitValue,
      filter.minValue < 0
    );

    range.onChange = (value) => {
      state.filters[filter.type] = value;
      reRenderCanvas();

      if(timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => updateHistory(), 300);
    };

    const filterContainer = document.createElement('div');
    if(filter.disabled) {
      filterContainer.classList.add('image-editor-settings-filter--disabled');
    }

    filterContainer.append(range.container);
    filtersList.append(filterContainer);
  })

  element.replaceChildren(filtersList);
}
