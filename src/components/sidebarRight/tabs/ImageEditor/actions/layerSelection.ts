import {Layer, State} from '../types';
import {
  CANVAS_BORDER_PADDING,
  CANVAS_LAYER_CORNER_SIZE,
  CANVAS_LAYER_SIZE_COEFFICIENT,
  LayerTypes
} from '../constants';

export function getEventRotatedPosition(left: number, top: number, layer: Layer) {
  let angleLeft = left;
  let angleTop = top;

  if(layer.angle) {
    const layerCenterTop = layer.top - layer.size * CANVAS_LAYER_SIZE_COEFFICIENT + layer.height / 2;
    const layerCenterLeft = layer.left + layer.width / 2;
    const layerRadius = ((top - layerCenterTop) ** 2 + (left - layerCenterLeft) ** 2) ** (1/2);

    const initAngle = Math.atan2(layerCenterTop - top, layerCenterLeft - left);

    const angle = initAngle - layer.angle;
    angleLeft = layerCenterLeft + layerRadius * Math.cos(angle);
    angleTop = layerCenterTop + layerRadius * Math.sin(angle);
  }

  return {angleLeft, angleTop};
}

export function getSelectedLayerId(left: number, top: number, type: LayerTypes, state: State) {
  let selectedLayerId: number = null;

  for(let i = state.layers.length - 1; i >= 0; i--) {
    const layer = state.layers[i];
    if(layer.type !== type) continue;

    const {angleLeft, angleTop} = getEventRotatedPosition(left, top, layer);

    if(
      angleLeft < layer.left - CANVAS_BORDER_PADDING ||
      angleLeft > layer.left + layer.width + CANVAS_BORDER_PADDING
    ) continue;

    if(
      angleTop < layer.top - layer.size * CANVAS_LAYER_SIZE_COEFFICIENT - CANVAS_BORDER_PADDING ||
      angleTop > layer.top - layer.size * CANVAS_LAYER_SIZE_COEFFICIENT + layer.height + CANVAS_BORDER_PADDING
    ) continue;

    selectedLayerId = i;
    break;
  }

  return selectedLayerId;
}

export function checkIsCorner(left: number, top: number, layer: Layer) {
  const layerTop = layer.top - layer.size * CANVAS_LAYER_SIZE_COEFFICIENT;
  const {angleLeft, angleTop} = getEventRotatedPosition(left, top, layer);

  // top left corner
  if(
    angleLeft <= layer.left - CANVAS_BORDER_PADDING + CANVAS_LAYER_CORNER_SIZE && angleLeft >= layer.left - CANVAS_BORDER_PADDING - CANVAS_LAYER_CORNER_SIZE &&
    angleTop <= layerTop - CANVAS_BORDER_PADDING + CANVAS_LAYER_CORNER_SIZE && angleTop >= layerTop - CANVAS_BORDER_PADDING - CANVAS_LAYER_CORNER_SIZE
  ) return true;

  // top right corner
  if(
    angleLeft <= layer.left + layer.width + CANVAS_BORDER_PADDING + CANVAS_LAYER_CORNER_SIZE && angleLeft >= layer.left + layer.width + CANVAS_BORDER_PADDING - CANVAS_LAYER_CORNER_SIZE &&
    angleTop <= layerTop - CANVAS_BORDER_PADDING + CANVAS_LAYER_CORNER_SIZE && angleTop >= layerTop - CANVAS_BORDER_PADDING - CANVAS_LAYER_CORNER_SIZE
  ) return true;

  // bottom left corner
  if(
    angleLeft <= layer.left - CANVAS_BORDER_PADDING + CANVAS_LAYER_CORNER_SIZE && angleLeft >= layer.left - CANVAS_BORDER_PADDING - CANVAS_LAYER_CORNER_SIZE &&
    angleTop <= layerTop + layer.height + CANVAS_BORDER_PADDING + CANVAS_LAYER_CORNER_SIZE && angleTop >= layerTop + layer.height + CANVAS_BORDER_PADDING - CANVAS_LAYER_CORNER_SIZE
  ) return true;

  // bottom right corner
  if(
    angleLeft <= layer.left + layer.width + CANVAS_BORDER_PADDING + CANVAS_LAYER_CORNER_SIZE && angleLeft >= layer.left + layer.width + CANVAS_BORDER_PADDING - CANVAS_LAYER_CORNER_SIZE &&
    angleTop <= layerTop + layer.height + CANVAS_BORDER_PADDING + CANVAS_LAYER_CORNER_SIZE && angleTop >= layerTop + layer.height + CANVAS_BORDER_PADDING - CANVAS_LAYER_CORNER_SIZE
  ) return true;

  return false;
}
