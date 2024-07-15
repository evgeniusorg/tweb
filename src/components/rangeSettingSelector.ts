import RangeSelector from './rangeSelector';
import {_i18n, LangPackKey} from '../lib/langPack';

export class RangeSettingSelector {
  public container: HTMLDivElement;
  public valueContainer: HTMLElement;
  private range: RangeSelector;

  public onChange: (value: number) => void;

  constructor(
    name: LangPackKey,
    step: number,
    initialValue: number,
    minValue: number,
    maxValue: number,
    writeValue = true,
    needHighlightValue = false,
    defaultValue = 0,
    fromCenter = false
  ) {
    const BASE_CLASS = 'range-setting-selector';
    this.container = document.createElement('div');
    this.container.classList.add(BASE_CLASS);

    const details = document.createElement('div');
    details.classList.add(BASE_CLASS + '-details');

    const nameDiv = document.createElement('div');
    nameDiv.classList.add(BASE_CLASS + '-name');
    _i18n(nameDiv, name);

    const valueDiv = this.valueContainer = document.createElement('div');
    valueDiv.classList.add(BASE_CLASS + '-value');

    if(writeValue) {
      valueDiv.innerHTML = '' + initialValue;
    }

    details.append(nameDiv, valueDiv);

    this.range = new RangeSelector({
      step,
      min: minValue,
      max: maxValue,
      fromCenter
    }, initialValue);
    this.range.setListeners();
    this.range.setHandlers({
      onScrub: value => {
        if(this.onChange) {
          this.onChange(value);
        }

        if(writeValue) {
          // console.log('font size scrub:', value);
          valueDiv.innerText = '' + value;

          if(needHighlightValue) {
            if(value !== defaultValue) {
              valueDiv.classList.add(BASE_CLASS + '-value--highlight');
            } else {
              valueDiv.classList.remove(BASE_CLASS + '-value--highlight');
            }
          }
        }
      }
    });

    this.container.append(details, this.range.container);
  }
}
