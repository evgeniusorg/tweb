import {Cropper, CropperEventState, ImageCropper, ImageCropperGetParamsResponse} from '../types';
import {CROPPER_CUSTOM_FORMATS, CROPPER_DEFAULT_FORMATS, CropperFormatTypes} from '../constants';
import {
  resizeBottomLeftCorner,
  resizeBottomRightCorner,
  resizeTopLeftCorner,
  resizeTopRigthCorner
} from './cropperResize';

function imageCropper(originalImage: HTMLImageElement, initParams: Cropper): ImageCropper {
  let cropComponent: HTMLDivElement,
    container: HTMLDivElement,
    cropImage: HTMLImageElement,

    cornerTopLeft: HTMLElement,
    cornerTopRight: HTMLElement,
    cornerBottomLeft: HTMLElement,
    cornerBottomRight: HTMLElement,

    cropLeft = 0,
    cropTop = 0,
    cropWidth = 0,
    cropHeight = 0,
    scaledRatio = 0,
    cropType: CropperFormatTypes,
    aspectRatio: number;

  const eventState: CropperEventState = {
    mouseX: null,
    mouseY: null,
    containerWidth: null,
    containerHeight: null,
    containerLeft: null,
    containerTop: null,
    target: null
  };

  if(originalImage.complete) init();
  else originalImage.onload = init;

  function removeHandlers() {
    cropComponent.removeEventListener('mousedown', startMoving);
    cropComponent.removeEventListener('touchstart', startMoving);

    document.removeEventListener('mouseup', endMoving);
    document.removeEventListener('touchend', endMoving);
    document.removeEventListener('mousemove', moving);
    document.removeEventListener('touchmove', moving);
    window.removeEventListener('resize', resizeWindow);

    cropComponent.remove();
  }

  function addHandlers() {
    cropComponent.addEventListener('mousedown', startMoving, false);
    cropComponent.addEventListener('touchstart', startMoving, false);
    window.addEventListener('resize', resizeWindow);
  }

  function init() {
    originalImage.classList.add('image-editor-crop-preview-blur');
    originalImage.draggable = false;

    cropImage = new Image();
    cropImage.src = originalImage.src;
    cropImage.draggable = false;
    cropImage.classList.add('image-editor-crop-preview-overlay-image');

    cropComponent = document.createElement('div');
    cropComponent.classList.add('image-editor-crop-preview-component');

    container = document.createElement('div');
    container.classList.add('image-editor-crop-preview-overlay');

    const overlayColor = document.createElement('div');
    overlayColor.classList.add('image-editor-crop-preview-overlay-color');

    cropComponent.appendChild(container);
    const wrapper = originalImage.parentNode as HTMLElement;
    wrapper.appendChild(cropComponent);
    cropComponent.appendChild(cropImage);
    cropComponent.appendChild(originalImage);
    cropComponent.appendChild(overlayColor);
    container.appendChild(cropImage);

    cornerTopLeft = document.createElement('div');
    cornerTopLeft.classList.add('image-editor-crop-preview-overlay-color-corner', 'revert');
    cropComponent.appendChild(cornerTopLeft);

    cornerTopRight = document.createElement('div');
    cornerTopRight.classList.add('image-editor-crop-preview-overlay-color-corner');
    cropComponent.appendChild(cornerTopRight);

    cornerBottomLeft = document.createElement('div');
    cornerBottomLeft.classList.add('image-editor-crop-preview-overlay-color-corner');
    cropComponent.appendChild(cornerBottomLeft);

    cornerBottomRight = document.createElement('div');
    cornerBottomRight.classList.add('image-editor-crop-preview-overlay-color-corner', 'revert');
    cropComponent.appendChild(cornerBottomRight);

    cropImage.style.maxWidth = originalImage.width + 'px';

    scaledRatio = originalImage.naturalWidth / originalImage.offsetWidth;

    const width = initParams.width / scaledRatio;
    const height= initParams.height / scaledRatio;
    const left = initParams.left /scaledRatio;
    const top = initParams.top / scaledRatio;

    updateCropSize(width, height);
    updateCropImage(left, top);
    updateContainer(left, top);
    updateCorners(width, height, left, top);
    addHandlers();
  }

  function updateCorners(width: number, height: number, left: number, top: number) {
    cornerTopLeft.style.top = top - 4 + 'px';
    cornerTopLeft.style.left = left - 4 + 'px';

    cornerTopRight.style.top = top - 4 + 'px';
    cornerTopRight.style.left = left + width - 4 + 'px';

    cornerBottomLeft.style.top = top + height - 4 + 'px';
    cornerBottomLeft.style.left = left - 4 + 'px';

    cornerBottomRight.style.top = top + height - 4 + 'px';
    cornerBottomRight.style.left = left + width - 4 + 'px';
  }

  function updateCropSize(width: number, height: number) {
    cropWidth = width * scaledRatio;
    cropHeight = height * scaledRatio;

    container.style.width = width + 'px';
    container.style.height = height + 'px';
  }

  function updateCropImage(left: number, top: number) {
    cropTop = top * scaledRatio;
    cropLeft = left * scaledRatio;

    cropImage.style.top = -top + 'px';
    cropImage.style.left = -left + 'px';
  }

  function updateContainer(left: number, top: number) {
    container.style.top = top + 'px';
    container.style.left = left + 'px';
  }

  // Save the initial event details and container state
  function saveEventState(event: MouseEvent | TouchEvent) {
    eventState.containerWidth = container.offsetWidth;
    eventState.containerHeight = container.offsetHeight;

    eventState.containerLeft = container.offsetLeft;
    eventState.containerTop = container.offsetTop;

    eventState.mouseX = (event instanceof MouseEvent ?
      (event.clientX || event.pageX) :
      (event.touches && event.touches[0].clientX)
    ) + window.scrollX;
    eventState.mouseY = (event instanceof MouseEvent ?
      (event.clientY || event.pageY) :
      (event.touches && event.touches[0].clientY)
    ) + window.scrollY;
    eventState.target = event.target as HTMLElement;
  }

  function startMoving(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    event.stopPropagation();

    saveEventState(event);

    document.addEventListener('mousemove', moving);
    document.addEventListener('touchmove', moving);
    document.addEventListener('mouseup', endMoving);
    document.addEventListener('touchend', endMoving);
  }

  function endMoving(event: MouseEvent | TouchEvent) {
    event.preventDefault();

    eventState.target = null;

    document.removeEventListener('mouseup', endMoving);
    document.removeEventListener('touchend', endMoving);
    document.removeEventListener('mousemove', moving);
    document.removeEventListener('touchmove', moving);
  }

  function resizing(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    event.stopPropagation();

    const currentTouchX = event instanceof MouseEvent ? event.pageX : (event.touches && event.touches[0].pageX);
    const currentTouchY = event instanceof MouseEvent ? event.pageY : (event.touches && event.touches[0].pageY);

    const dx = currentTouchX - eventState.mouseX;
    const dy = currentTouchY - eventState.mouseY;

    let width, height, left, top;

    if(eventState.target === cornerTopLeft) {
      [width, height, left, top] = resizeTopLeftCorner(dx, dy, eventState, cropType, aspectRatio);
    } else if(eventState.target === cornerTopRight) {
      [width, height, left, top] = resizeTopRigthCorner(dx, dy, eventState, cropType, aspectRatio, cropImage);
    } else if(eventState.target === cornerBottomLeft) {
      [width, height, left, top] = resizeBottomLeftCorner(dx, dy, eventState, cropType, aspectRatio, cropImage);
    } else {
      [width, height, left, top] = resizeBottomRightCorner(dx, dy, eventState, cropType, aspectRatio, cropImage);
    }

    updateCropSize(width, height);
    updateCropImage(left, top);
    updateContainer(left, top);
    updateCorners(width, height, left, top);
  }

  function moving(event: MouseEvent | TouchEvent) {
    if([cornerTopLeft, cornerBottomLeft, cornerTopRight, cornerBottomRight].includes(eventState.target)) {
      resizing(event);
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const currentTouchX = event instanceof MouseEvent ? event.pageX : (event.touches && event.touches[0].pageX);
    const currentTouchY = event instanceof MouseEvent ? event.pageY : (event.touches && event.touches[0].pageY);

    let left = currentTouchX - (eventState.mouseX - eventState.containerLeft);
    let top = currentTouchY - (eventState.mouseY - eventState.containerTop);
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    if(left < 0) left = 0;
    else if(left > cropImage.offsetWidth - width) left = cropImage.offsetWidth - width;

    if(top < 0) top = 0;
    else if(top > cropImage.offsetHeight - height) top = cropImage.offsetHeight - height;

    updateCropImage(left, top);
    updateContainer(left, top);
    updateCorners(width, height, left, top);
  }

  function resizeWindow() {
    const initImageWidth = originalImage.naturalWidth / scaledRatio;
    const widthScaledRatio = originalImage.width / initImageWidth;
    const width = cropWidth * widthScaledRatio / scaledRatio;
    const left = cropLeft * widthScaledRatio / scaledRatio;

    const initImageHeight = originalImage.naturalHeight / scaledRatio;
    const heightScaledRatio = originalImage.height / initImageHeight;
    const height = cropHeight * heightScaledRatio / scaledRatio;
    const top = cropTop  * heightScaledRatio / scaledRatio;

    scaledRatio = originalImage.naturalWidth / originalImage.width;
    cropImage.style.maxWidth = originalImage.width + 'px';

    updateCropSize(width, height);
    updateCropImage(left, top);
    updateContainer(left, top);
    updateCorners(width, height, left, top);
  }

  function getParams(): ImageCropperGetParamsResponse {
    return {
      top: cropTop,
      left: cropLeft,
      width: cropWidth,
      height: cropHeight
    };
  };

  function updateCropFormat(params: Cropper) {
    const currentFormat =
      CROPPER_DEFAULT_FORMATS.find((format) => format.type === params.type) ||
      CROPPER_CUSTOM_FORMATS.find((format) => format.type === params.type);

    let width, height, left, top;

    switch(params.type) {
      case CropperFormatTypes.free: {
        width = cropComponent.offsetWidth - 60;
        height = cropComponent.offsetHeight - 60;
        top = 30;
        left = 30;
        break;
      }
      case CropperFormatTypes.original: {
        width = cropComponent.offsetWidth;
        height = cropComponent.offsetHeight;
        top = 0;
        left = 0;
        break;
      }
      default: {
        width = cropComponent.offsetWidth;
        height = width / currentFormat.aspectRatio;

        if(height > cropComponent.offsetHeight) {
          height = cropComponent.offsetHeight;
          width = height * currentFormat.aspectRatio;
        }

        top = (cropComponent.offsetHeight - height) / 2;
        left = (cropComponent.offsetWidth - width) / 2;
      }
    }

    cropType = params.type;
    aspectRatio = currentFormat.aspectRatio;

    updateCropSize(width, height);
    updateCropImage(left, top);
    updateContainer(left, top);
    updateCorners(width, height, left, top);
  }

  return {getParams, removeHandlers, updateCropFormat};
}

export default imageCropper;
