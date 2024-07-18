import {Cropper} from "./types";
import {CROPPER_CUSTOM_FORMATS, CROPPER_DEFAULT_FORMATS, CropperFormatTypes} from "./constants";
import {
  resizeBottomLeftCorner,
  resizeBottomRightCorner,
  resizeTopLeftCorner,
  resizeTopRigthCorner
} from "./cropperResize";

function imageCropper(originalImage: HTMLImageElement, initParams: Cropper, updateCropperHistory) {
  let cropComponent: HTMLDivElement,
    container: HTMLDivElement,
    cropImage: HTMLImageElement,

    cornerTopLeft: HTMLDivElement,
    cornerTopRight: HTMLDivElement,
    cornerBottomLeft: HTMLDivElement,
    cornerBottomRight: HTMLDivElement,

    cropLeft = 0,
    cropTop = 0,
    cropWidth = 0,
    cropHeight = 0,
    scaledRatio = 0,
    cropType: CropperFormatTypes,
    aspectRatio: number;

  const keyZoomValue = 4.0;
  const event_state: Partial<{
    mouse_x: number,
    mouse_y: number,
    container_width: number,
    container_height: number,
    container_left: number,
    container_top: number,
    target: HTMLElement
  }> = {};

  if(originalImage.complete) init();
  else originalImage.onload = init;

  function removeHandlers() {
    cropComponent.removeEventListener('mousedown', startMoving);
    cropComponent.removeEventListener('touchstart', startMoving);

    document.removeEventListener('mouseup', endMoving);
    document.removeEventListener('touchend', endMoving);
    document.removeEventListener('mousemove', moving);
    document.removeEventListener('touchmove', moving);

    cropComponent.remove();
  }

  function addHandlers() {
    cropComponent.addEventListener('mousedown', startMoving, false);
    cropComponent.addEventListener('touchstart', startMoving, false);
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

    let width = initParams.width / scaledRatio;
    let height= initParams.height / scaledRatio;

    let left = initParams.left /scaledRatio;
    let top = initParams.top / scaledRatio;

    if(initParams.isMirror) {
      originalImage.style.transform = 'scaleX(-1)';
      cropImage.style.transform = 'scaleX(-1)';
    }

    if(initParams.degree) {
      originalImage.style.transform = `rotate(${initParams.degree}deg)`;
      cropImage.style.transform = `rotate(${initParams.degree}deg)`;

      if(initParams.degree === 90 || initParams.degree === 270){
        [width, height] = [height, width];
        [left, top] = [top, left];
      }
    }

    updateCropSize(width, height);
    updateCropImage(left, top);
    updateContainer(left, top);
    updateCorners(width, height, left, top);
    addHandlers();
  }

  function updateCorners(width, height, left, top) {
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
  function saveEventState(e: any) {
    event_state.container_width = container.offsetWidth;
    event_state.container_height = container.offsetHeight;

    event_state.container_left = container.offsetLeft;
    event_state.container_top = container.offsetTop;

    event_state.mouse_x = (e.clientX || e.pageX || e.touches && e.touches[0].clientX) + window.scrollX;
    event_state.mouse_y = (e.clientY || e.pageY || e.touches && e.touches[0].clientY) + window.scrollY;
    event_state.target = e.target;
  }

  function startMoving(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    e.stopPropagation();

    saveEventState(e);

    document.addEventListener('mousemove', moving);
    document.addEventListener('touchmove', moving);
    document.addEventListener('mouseup', endMoving);
    document.addEventListener('touchend', endMoving);
  }

  function endMoving(e: MouseEvent | TouchEvent) {
    e.preventDefault();

    event_state.target = null;

    document.removeEventListener('mouseup', endMoving);
    document.removeEventListener('touchend', endMoving);
    document.removeEventListener('mousemove', moving);
    document.removeEventListener('touchmove', moving);

    updateCropperHistory();
  }

  function resizing(e: any) {
    const currentTouch = {x: 0, y: 0};

    e.preventDefault();
    e.stopPropagation();

    currentTouch.x = e.pageX || e.touches && e.touches[0].pageX;
    currentTouch.y = e.pageY || e.touches && e.touches[0].pageY;

    const dx = currentTouch.x - event_state.mouse_x;
    const dy = currentTouch.y - event_state.mouse_y;

    let w, h, x, y;

    if(event_state.target === cornerTopLeft) {
      [w, h, x, y] = resizeTopLeftCorner(dx, dy, event_state, cropType, aspectRatio);
    } else if(event_state.target === cornerTopRight) {
      [w, h, x, y] = resizeTopRigthCorner(dx, dy, event_state, cropType, aspectRatio, cropImage);
    } else if(event_state.target === cornerBottomLeft) {
      [w, h, x, y] = resizeBottomLeftCorner(dx, dy, event_state, cropType, aspectRatio, cropImage);
    } else {
      [w, h, x, y] = resizeBottomRightCorner(dx, dy, event_state, cropType, aspectRatio, cropImage);
    }

    updateCropSize(w, h);
    updateCropImage(x, y);
    updateContainer(x, y);
    updateCorners(w, h, x, y);
  }

  function moving(e: any) {
    if ([cornerTopLeft, cornerBottomLeft, cornerTopRight, cornerBottomRight].includes(event_state.target)) {
      resizing(e);
      return;
    }

    const currentTouch = {x: 0, y: 0};

    e.preventDefault();
    e.stopPropagation();

    currentTouch.x = e.pageX || e.touches && e.touches[0].pageX;
    currentTouch.y = e.pageY || e.touches && e.touches[0].pageY;

    let left = currentTouch.x - (event_state.mouse_x - event_state.container_left);
    let top = currentTouch.y - (event_state.mouse_y - event_state.container_top);
    const w = container.offsetWidth;
    const h = container.offsetHeight;

    if(left < 0) left = 0;
    else if(left > cropImage.offsetWidth - w) left = cropImage.offsetWidth - w;

    if(top < 0) top = 0;
    else if(top > cropImage.offsetHeight - h) top = cropImage.offsetHeight - h;

    updateCropImage(left, top);
    updateContainer(left, top);
    updateCorners(w, h, left, top);
  }

  function getParams() {
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

    let newWidth, newHeight, newLeft, newTop;

    switch(params.type) {
      case CropperFormatTypes.free:{
        newWidth = cropComponent.offsetWidth - 60;
        newHeight = cropComponent.offsetHeight - 60;
        newTop = 30;
        newLeft = 30;
        break;
      }
      case CropperFormatTypes.original:{
        newWidth = cropComponent.offsetWidth;
        newHeight = cropComponent.offsetHeight;
        newTop = 0;
        newLeft = 0;
        break;
      }
      default: {
        newWidth = cropComponent.offsetWidth;
        newHeight = newWidth / currentFormat.aspectRatio;

        if(newHeight > cropComponent.offsetHeight) {
          newHeight = cropComponent.offsetHeight;
          newWidth = newHeight * currentFormat.aspectRatio;
        }

        newTop = (cropComponent.offsetHeight - newHeight) / 2;
        newLeft = (cropComponent.offsetWidth - newWidth) / 2;
      }
    }

    cropType = params.type;
    aspectRatio = currentFormat.aspectRatio;

    updateCropSize(newWidth, newHeight);
    updateCropImage(newLeft, newTop);
    updateContainer(newLeft, newTop);
    updateCorners(newWidth, newHeight, newLeft, newTop);
  }

  return {getParams, removeHandlers, updateCropFormat};
}

export default imageCropper;
