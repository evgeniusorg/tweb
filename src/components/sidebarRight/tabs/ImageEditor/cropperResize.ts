import {CropperFormatTypes} from "./constants";

const MINWIDTH = 50,
  MINHEIGHT = 50;

export function resizeTopLeftCorner(dx, dy, state, cropType, aspectRatio, ) {
  let w, h, x, y;

  if(state.container_width - dx < MINWIDTH) {
    w = MINWIDTH;
  } else {
    w = state.container_width - dx;
  }

  const lastX = state.container_left + state.container_width;
  const lastY = state.container_top + state.container_height;

  x = lastX - w;

  if(x < 0) {
    w = lastX;
    x = 0;
  }

  if(cropType === CropperFormatTypes.free) {
    if(state.container_height - dy < MINHEIGHT) {
      h = MINHEIGHT;
    } else {
      h = state.container_height - dy;
    }

    y = lastY - h;

    if(y < 0) {
      h = lastY;
      y = 0;
    }
  } else {
    const currentAspectRatio = aspectRatio || state.container_width / state.container_height;
    h = w / currentAspectRatio;

    if(h < MINHEIGHT) {
      h = MINHEIGHT;
      w = h * currentAspectRatio;
      x = lastX - w;
    }

    y = lastY - h;

    if(y < 0) {
      h = lastY;
      y = 0;
      w = h * currentAspectRatio;
      x = lastX - w;
    }
  }

  return [w, h, x, y];
}

export function resizeTopRigthCorner(dx, dy, state, cropType, aspectRatio, cropImage) {
  let w, h, y;

  if(state.container_width + dx < MINWIDTH) {
    w = MINWIDTH;
  } else {
    w = state.container_width + dx;
  }

  if(state.container_left + w > cropImage.offsetWidth) {
    w = cropImage.offsetWidth - state.container_left;
  }

  const lastY = state.container_top + state.container_height;

  if(cropType === CropperFormatTypes.free) {
    if(state.container_height - dy < MINHEIGHT) {
      h = MINHEIGHT;
    } else {
      h = state.container_height - dy;
    }

    y = lastY - h;

    if(y < 0) {
      h = lastY;
      y = 0;
    }
  } else {
    const currentAspectRatio = aspectRatio || state.container_width / state.container_height;
    h = w / currentAspectRatio;

    if(h < MINHEIGHT) {
      h = MINHEIGHT;
      w = h * currentAspectRatio;
    }

    y = lastY - h;

    if(y < 0) {
      h = lastY;
      y = 0;
      w = h * currentAspectRatio;
    }
  }

  return [w, h, state.container_left, y];
}

export function resizeBottomLeftCorner(dx, dy, state, cropType, aspectRatio, cropImage) {
  let w, h, x;

  if(state.container_width - dx < MINWIDTH) {
    w = MINWIDTH;
  } else {
    w = state.container_width - dx;
  }

  const lastX = state.container_left + state.container_width;

  x = lastX - w;

  if(x < 0) {
    w = lastX;
    x = 0;
  }

  if(cropType === CropperFormatTypes.free) {
    if(state.container_height + dy < MINHEIGHT) {
      h = MINHEIGHT;
    } else {
      h = state.container_height + dy;
    }

    if(state.container_top + h > cropImage.offsetHeight) {
      h = cropImage.offsetHeight - state.container_top;
    }
  } else {
    const currentAspectRatio = aspectRatio || state.container_width / state.container_height;
    h = w / currentAspectRatio;

    if(state.container_top + h > cropImage.offsetHeight) {
      h = cropImage.offsetHeight - state.container_top;
      w = h * currentAspectRatio;
      x = lastX - w;
    }

    if (h < MINHEIGHT) {
      h = MINHEIGHT;
      w = h * currentAspectRatio;
      x = lastX - w;
    }
  }

  return [w, h, x, state.container_top];
}

export function resizeBottomRightCorner(dx, dy, state, cropType, aspectRatio, cropImage) {
  let w, h;

  if(state.container_width + dx < MINWIDTH) {
    w = MINWIDTH;
  } else {
    w = state.container_width + dx;
  }

  if(state.container_left + w > cropImage.offsetWidth) {
    w = cropImage.offsetWidth - state.container_left;
  }

  if(cropType === CropperFormatTypes.free) {
    if(state.container_height + dy < MINHEIGHT) {
      h = MINHEIGHT;
    } else {
      h = state.container_height + dy;
    }

    if(state.container_top + h > cropImage.offsetHeight) {
      h = cropImage.offsetHeight - state.container_top;
    }
  } else {
    const currentAspectRatio = aspectRatio || state.container_width / state.container_height;
    h = w / currentAspectRatio;

    if(state.container_top + h > cropImage.offsetHeight) {
      h = cropImage.offsetHeight - state.container_top;
      w = h * currentAspectRatio;
    }

    if (h < MINHEIGHT) {
      h = MINHEIGHT;
      w = h * currentAspectRatio;
    }
  }

  return [w, h, state.container_left, state.container_top];
}
