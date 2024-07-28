/*
 * https://github.com/evgeniusorg/tweb/tree/image_editor
 * Copyright (C) 2024 Eugene Chugunov
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import {State, TextLayer} from '../types';
import {getTextBoundary} from './render';

export function keydown(
  event: KeyboardEvent,
  canvas: HTMLCanvasElement,
  state: State,
  reRenderCanvas: () => void,
  updateHistory: () => void
) {
  const context = canvas.getContext('2d');
  const editedLayer = state.layers[state.editedLayerId] as TextLayer;

  if(editedLayer) {
    if(event.key.toLowerCase() === 'backspace') {
      if(editedLayer.cursorPosition === 0) return;

      let deletedCharNumber = 1
      if(editedLayer.cursorPosition > 1 && editedLayer.text.slice(editedLayer.cursorPosition - 2, editedLayer.cursorPosition) === '/n')
        deletedCharNumber = 2

      editedLayer.text = editedLayer.text.slice(0, editedLayer.cursorPosition - deletedCharNumber) + editedLayer.text.slice(editedLayer.cursorPosition)
      editedLayer.cursorPosition -= deletedCharNumber
    }

    if(event.key.toLowerCase() === 'arrowleft') {
      const steps = editedLayer.cursorPosition > 1 && editedLayer.text.slice(editedLayer.cursorPosition - 2, editedLayer.cursorPosition) === '/n' ? 2 : 1
      editedLayer.cursorPosition -= steps;
    }

    if(event.key.toLowerCase() === 'arrowright') {
      const steps = editedLayer.text.slice(editedLayer.cursorPosition, editedLayer.cursorPosition + 2) === '/n' ? 2 : 1
      if(editedLayer.text.length <= editedLayer.cursorPosition) return;
      editedLayer.cursorPosition += steps;
    }

    const {width, height} = getTextBoundary(editedLayer, context);
    editedLayer.width = width;
    editedLayer.height = height;

    reRenderCanvas();
    return;
  }

  const selectedLayer = state.layers[state.selectedLayerId];

  if(selectedLayer) {
    if(event.key.toLowerCase() === 'backspace' || event.key.toLowerCase() === 'delete') {
      state.layers.splice(state.selectedLayerId, 1);
      state.selectedLayerId = null;
      updateHistory();
    }

    reRenderCanvas();
    return;
  }
}

export function keypress(event: KeyboardEvent, canvas: HTMLCanvasElement, state: State, reRenderCanvas: () => void) {
  const context = canvas.getContext('2d');
  const layer = state.layers[state.editedLayerId] as TextLayer;

  if(event.key.toLowerCase() === 'enter') {
    layer.text = layer.text.slice(0, layer.cursorPosition) + '/n' + layer.text.slice(layer.cursorPosition)
    layer.cursorPosition += 2;
  } else {
    let char = String.fromCharCode(event.keyCode)

    if(!char && char !== ' ') return
    if(!event.shiftKey) char = char.toLowerCase()

    layer.text =
      layer.text.slice(0, layer.cursorPosition) + char + layer.text.slice(layer.cursorPosition)
    layer.cursorPosition += 1
  }

  const {width, height} = getTextBoundary(layer, context);
  layer.width = width;
  layer.height = height;

  reRenderCanvas();
}
