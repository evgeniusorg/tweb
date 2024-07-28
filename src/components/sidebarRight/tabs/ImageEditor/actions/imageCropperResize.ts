/*
 * https://github.com/evgeniusorg/tweb/tree/image_editor
 * Copyright (C) 2024 Eugene Chugunov
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import {CropperFormatTypes} from '../constants';
import {CropperEventState} from '../types';

const MINWIDTH = 50;
const MINHEIGHT = 50;

export function resizeTopLeftCorner(
  dx: number,
  dy: number,
  state: CropperEventState,
  cropType: CropperFormatTypes,
  aspectRatio: number
) {
  let width, height, left, top;

  if(state.containerWidth - dx < MINWIDTH) {
    width = MINWIDTH;
  } else {
    width = state.containerWidth - dx;
  }

  const lastX = state.containerLeft + state.containerWidth;
  const lastY = state.containerTop + state.containerHeight;

  left = lastX - width;

  if(left < 0) {
    width = lastX;
    left = 0;
  }

  if(cropType === CropperFormatTypes.free) {
    if(state.containerHeight - dy < MINHEIGHT) {
      height = MINHEIGHT;
    } else {
      height = state.containerHeight - dy;
    }

    top = lastY - height;

    if(top < 0) {
      height = lastY;
      top = 0;
    }
  } else {
    const currentAspectRatio = aspectRatio || state.containerWidth / state.containerHeight;
    height = width / currentAspectRatio;

    if(height < MINHEIGHT) {
      height = MINHEIGHT;
      width = height * currentAspectRatio;
      left = lastX - width;
    }

    top = lastY - height;

    if(top < 0) {
      height = lastY;
      top = 0;
      width = height * currentAspectRatio;
      left = lastX - width;
    }
  }

  return [width, height, left, top];
}

export function resizeTopRigthCorner(
  dx: number,
  dy: number,
  state: CropperEventState,
  cropType: CropperFormatTypes,
  aspectRatio: number,
  cropImage: HTMLImageElement) {
  let width, height, top;

  if(state.containerWidth + dx < MINWIDTH) {
    width = MINWIDTH;
  } else {
    width = state.containerWidth + dx;
  }

  if(state.containerLeft + width > cropImage.offsetWidth) {
    width = cropImage.offsetWidth - state.containerLeft;
  }

  const lastY = state.containerTop + state.containerHeight;

  if(cropType === CropperFormatTypes.free) {
    if(state.containerHeight - dy < MINHEIGHT) {
      height = MINHEIGHT;
    } else {
      height = state.containerHeight - dy;
    }

    top = lastY - height;

    if(top < 0) {
      height = lastY;
      top = 0;
    }
  } else {
    const currentAspectRatio = aspectRatio || state.containerWidth / state.containerHeight;
    height = width / currentAspectRatio;

    if(height < MINHEIGHT) {
      height = MINHEIGHT;
      width = height * currentAspectRatio;
    }

    top = lastY - height;

    if(top < 0) {
      height = lastY;
      top = 0;
      width = height * currentAspectRatio;
    }
  }

  return [width, height, state.containerLeft, top];
}

export function resizeBottomLeftCorner(
  dx: number,
  dy: number,
  state: CropperEventState,
  cropType: CropperFormatTypes,
  aspectRatio: number,
  cropImage: HTMLImageElement
) {
  let width, height, left;

  if(state.containerWidth - dx < MINWIDTH) {
    width = MINWIDTH;
  } else {
    width = state.containerWidth - dx;
  }

  const lastX = state.containerLeft + state.containerWidth;

  left = lastX - width;

  if(left < 0) {
    width = lastX;
    left = 0;
  }

  if(cropType === CropperFormatTypes.free) {
    if(state.containerHeight + dy < MINHEIGHT) {
      height = MINHEIGHT;
    } else {
      height = state.containerHeight + dy;
    }

    if(state.containerTop + height > cropImage.offsetHeight) {
      height = cropImage.offsetHeight - state.containerTop;
    }
  } else {
    const currentAspectRatio = aspectRatio || state.containerWidth / state.containerHeight;
    height = width / currentAspectRatio;

    if(state.containerTop + height > cropImage.offsetHeight) {
      height = cropImage.offsetHeight - state.containerTop;
      width = height * currentAspectRatio;
      left = lastX - width;
    }

    if(height < MINHEIGHT) {
      height = MINHEIGHT;
      width = height * currentAspectRatio;
      left = lastX - width;
    }
  }

  return [width, height, left, state.containerTop];
}

export function resizeBottomRightCorner(
  dx: number,
  dy: number,
  state: CropperEventState,
  cropType: CropperFormatTypes,
  aspectRatio: number,
  cropImage: HTMLImageElement
) {
  let width, height;

  if(state.containerWidth + dx < MINWIDTH) {
    width = MINWIDTH;
  } else {
    width = state.containerWidth + dx;
  }

  if(state.containerLeft + width > cropImage.offsetWidth) {
    width = cropImage.offsetWidth - state.containerLeft;
  }

  if(cropType === CropperFormatTypes.free) {
    if(state.containerHeight + dy < MINHEIGHT) {
      height = MINHEIGHT;
    } else {
      height = state.containerHeight + dy;
    }

    if(state.containerTop + height > cropImage.offsetHeight) {
      height = cropImage.offsetHeight - state.containerTop;
    }
  } else {
    const currentAspectRatio = aspectRatio || state.containerWidth / state.containerHeight;
    height = width / currentAspectRatio;

    if(state.containerTop + height > cropImage.offsetHeight) {
      height = cropImage.offsetHeight - state.containerTop;
      width = height * currentAspectRatio;
    }

    if(height < MINHEIGHT) {
      height = MINHEIGHT;
      width = height * currentAspectRatio;
    }
  }

  return [width, height, state.containerLeft, state.containerTop];
}
