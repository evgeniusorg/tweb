import {_i18n} from '../../../../../lib/langPack';
import {CROPPER_CUSTOM_FORMATS, CROPPER_DEFAULT_FORMATS, CropperFormatTypes} from '../constants';
import {attachClickEvent} from '../../../../../helpers/dom/clickEvent';
import findUpClassName from '../../../../../helpers/dom/findUpClassName';
import {CropperFormat, ImageCropper, State} from '../types';
import Icon from '../../../../icon';

export function showImageCrop(element: HTMLElement, cropper: ImageCropper, state: State) {
  const cropTitle = document.createElement('div');
  cropTitle.classList.add('image-editor-settings-block-title');
  _i18n(cropTitle, 'ImageEditor.Cropper.Title');
  element.replaceChildren(cropTitle);

  const cropSettings = document.createElement('div');
  cropSettings.classList.add('image-editor-cropper-format-list');

  CROPPER_DEFAULT_FORMATS.forEach((cropperFormat) => {
    cropSettings.append(getCropperFormatCell(cropperFormat, state));
  })

  const cropCustomSettings = document.createElement('div');
  cropCustomSettings.classList.add('image-editor-cropper-format-compact-list');
  cropSettings.append(cropCustomSettings);

  CROPPER_CUSTOM_FORMATS.forEach((cropperFormat) => {
    cropCustomSettings.append(getCropperFormatCell(cropperFormat, state));
  })

  element.append(cropSettings);

  attachClickEvent(cropSettings, (e) => {
    const cropperFormatCell = findUpClassName(e.target, 'image-editor-cropper-format-cell');

    if(!cropperFormatCell) {
      return;
    }

    if(state.cropper.type === cropperFormatCell.dataset.type) {
      return;
    }

    state.cropper.type = cropperFormatCell.dataset.type as CropperFormatTypes;

    const activeBtn = cropSettings.getElementsByClassName('active')[0];
    activeBtn && activeBtn.classList.remove('active');
    cropperFormatCell.classList.add('active');

    cropper.updateCropFormat(state.cropper);
  });
}

function getCropperFormatCell(cropperFormat: CropperFormat, state: State) {
  const btn = document.createElement('div');
  btn.classList.add('btn-menu-item', 'rp-overflow', 'image-editor-cropper-format-cell');

  if(cropperFormat.type === state.cropper.type) {
    btn.classList.add('active');
  }

  const icon = Icon(cropperFormat.icon as Icon, 'btn-menu-item-icon')
  if(cropperFormat.needIconRotate) {
    icon.classList.add('image-editor-cropper-format-cell--rotate');
  }
  btn.append(icon);

  const textElement = document.createElement('span');
  textElement.classList.add('btn-menu-item-text');
  _i18n(textElement, cropperFormat.langKey);
  btn.append(textElement);

  btn.dataset.type = cropperFormat.type;

  return btn;
}
