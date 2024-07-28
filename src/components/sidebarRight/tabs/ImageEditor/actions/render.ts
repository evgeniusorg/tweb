/*
 * https://github.com/evgeniusorg/tweb/tree/image_editor
 * Copyright (C) 2024 Eugene Chugunov
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import {
  BrushStyles,
  CANVAS_BORDER_CORNER_RADIUS,
  CANVAS_BORDER_PADDING,
  CANVAS_FONT_FRAME_WHITE_PADDING,
  CANVAS_FONT_LINE_HEIGHT_COEFFICIENT,
  Colors,
  TextAlign,
  TextFrame
} from '../constants';
import {BrushLayer, State, StickerLayer, StickersList, TextLayer} from '../types';

export function getTextBoundary(layer: TextLayer, context: CanvasRenderingContext2D) {
  const lines = layer.text.split('/n')
  let maxWidth = 0
  const maxHeight = layer.size * lines.length * CANVAS_FONT_LINE_HEIGHT_COEFFICIENT;

  context.save();
  context.font = `${layer.size}px ${layer.font}`;

  lines.forEach(line => {
    const width = context.measureText(line).width;
    if(width > maxWidth) maxWidth = width
  })
  context.restore();

  return {
    width: maxWidth,
    height: maxHeight
  }
}

export function getBrushPathBoundary(layer: BrushLayer) {
  const strokeWidth = layer.size;
  let maxX = 0;
  let maxY = 0;
  let minX = Infinity;
  let minY = Infinity;

  layer.points.forEach((point) => {
    const left = layer.left + point[0];
    const top = layer.top + point[1];

    if(left > maxX) maxX = left;
    if(left < minX) minX = left;
    if(top > maxY) maxY = top;
    if(top < minY) minY = top;
  });

  return {
    width: maxX - minX + layer.size,
    height: maxY - minY + layer.size,
    left: minX - layer.size / 2,
    top: minY - layer.size /2
  };
}

export function renderFilters(canvas: HTMLCanvasElement, state: State) {
  if(Object.keys(state.filters).length === 0) {
    return;
  }

  const context = canvas.getContext('2d');
  const cssFilters: string[] = [];

  if(state.filters.brightness) {
    cssFilters.push(`brightness(${(state.filters.brightness + 100) / 100})`);
  }

  if(state.filters.contrast) {
    cssFilters.push(`contrast(${state.filters.contrast + 100}%)`);
  }

  if(state.filters.saturation) {
    cssFilters.push(`saturate(${state.filters.saturation + 100}%)`);
  }

  if(cssFilters.length) {
    context.filter = cssFilters.join(' ');
  }
}

export function renderCroppedImage(canvas: HTMLCanvasElement, image: HTMLImageElement, state: State) {
  const context = canvas.getContext('2d');
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(state.cropper.angle * Math.PI / 180);
  context.translate(- canvas.width / 2, -canvas.height / 2);

  context.drawImage(image,
    state.cropper.left, state.cropper.top, state.cropper.width, state.cropper.height,
    0, 0, state.cropper.width, state.cropper.height);

  context.restore();
  context.filter = 'none';
}

export function renderSelectedBorder(
  canvas: HTMLCanvasElement,
  left: number,
  top: number,
  width: number,
  height: number,
  angle: number
) {
  const context = canvas.getContext('2d');
  const scaledRatio = canvas.width / canvas.offsetWidth;
  context.save();
  context.beginPath();

  context.translate((left + width / 2) * scaledRatio, (top + height / 2) * scaledRatio);
  context.rotate(angle);

  context.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  context.lineWidth = scaledRatio;
  context.setLineDash([3 * scaledRatio, 6 * scaledRatio])
  context.strokeRect(
    -width / 2 * scaledRatio,
    -height / 2 * scaledRatio,
    width * scaledRatio,
    height * scaledRatio
  );
  context.closePath();

  context.fillStyle = '#fff';

  // left_top corner
  context.beginPath();
  context.arc(
    -width / 2 * scaledRatio,
    -height / 2 * scaledRatio,
    CANVAS_BORDER_CORNER_RADIUS * scaledRatio,
    0,
    2 * Math.PI,
    false
  );
  context.fill();
  context.closePath();

  // left_bottom corner
  context.beginPath();
  context.arc(
    -width / 2 * scaledRatio,
    height / 2 * scaledRatio,
    CANVAS_BORDER_CORNER_RADIUS * scaledRatio,
    0,
    2 * Math.PI,
    false
  );
  context.fill();
  context.closePath();

  // right_top corner
  context.beginPath();
  context.arc(
    width / 2 * scaledRatio,
    -height / 2 * scaledRatio,
    CANVAS_BORDER_CORNER_RADIUS * scaledRatio,
    0,
    2 * Math.PI,
    false
  );
  context.fill();
  context.closePath();

  // bottom_right corner
  context.beginPath();
  context.arc(
    width / 2 * scaledRatio,
    height / 2 * scaledRatio,
    CANVAS_BORDER_CORNER_RADIUS * scaledRatio,
    0,
    2 * Math.PI,
    false
  );
  context.fill();
  context.closePath();
  context.restore();
}

export function renderCursor(canvas: HTMLCanvasElement, left: number, top: number, fontSize: number, color: string) {
  const scaledRatio = canvas.width / canvas.offsetWidth;

  const context = canvas.getContext('2d');
  context.save();

  context.beginPath();
  context.moveTo(left * scaledRatio, (top - fontSize * CANVAS_FONT_LINE_HEIGHT_COEFFICIENT) * scaledRatio);
  context.lineTo(left * scaledRatio, (top + fontSize * (CANVAS_FONT_LINE_HEIGHT_COEFFICIENT - 1)) * scaledRatio);

  context.strokeStyle = color;
  context.lineWidth = 2 * scaledRatio;
  context.stroke();

  context.restore();
}

export function renderText(canvas: HTMLCanvasElement, layer: TextLayer, isSelected: boolean, isEdited: boolean) {
  const scaledRatio = canvas.width / canvas.offsetWidth;

  const context = canvas.getContext('2d');
  context.save();
  context.beginPath();
  context.textBaseline = 'bottom';
  context.font = `${scaledRatio * layer.size}px ${layer.font}`;

  const lines = layer.text.split('/n');

  function getLeft(width: number) {
    switch(layer.align) {
      case TextAlign.center:
        return (layer.width - width) / 2;
      case  TextAlign.right:
        return layer.width - width;
      default:
        return 0;
    }
  }

  function getCursorLeft(line: string) {
    const cursorPosition = line.length - (linesLength - layer.cursorPosition);
    const {width} = getTextBoundary({...layer, text: line.slice(0, cursorPosition)}, context);
    linesLength = -Infinity;
    return width;
  }

  let linesLength = 0;

  let initLeft = layer.left;
  let initTop = layer.top;

  if(layer.width && layer.angle) {
    context.translate((layer.left + layer.width / 2)  * scaledRatio, (layer.top - layer.size * CANVAS_FONT_LINE_HEIGHT_COEFFICIENT + layer.height / 2)  * scaledRatio);
    context.rotate(layer.angle);
    initLeft = -layer.width / 2;
    initTop = layer.size * CANVAS_FONT_LINE_HEIGHT_COEFFICIENT - layer.height / 2;
  }

  switch(layer.frame) {
    case TextFrame.white: {
      context.fillStyle = layer.color;
      lines.forEach((line, index) => {
        const {width, height} = getTextBoundary({...layer, text: line}, context);

        context.roundRect(
          (initLeft - CANVAS_FONT_FRAME_WHITE_PADDING + getLeft(width)) * scaledRatio,
          (initTop + (index - 1) * layer.size * CANVAS_FONT_LINE_HEIGHT_COEFFICIENT - CANVAS_FONT_FRAME_WHITE_PADDING) * scaledRatio,
          (width + 2 * CANVAS_FONT_FRAME_WHITE_PADDING) * scaledRatio,
          (height + 2 * CANVAS_FONT_FRAME_WHITE_PADDING) * scaledRatio,
          layer.size / 2 * scaledRatio
        );
        context.fill();
      });

      lines.forEach((line, index) => {
        const color = layer.color === Colors.white ? '#000' : Colors.white;
        const {width} = getTextBoundary({...layer, text: line}, context);
        const left = initLeft + getLeft(width);
        const top = initTop + index * layer.size * CANVAS_FONT_LINE_HEIGHT_COEFFICIENT -
          layer.size * (CANVAS_FONT_LINE_HEIGHT_COEFFICIENT - 1) / 2;

        context.fillStyle = color;
        context.fillText(line, left * scaledRatio, top * scaledRatio);

        linesLength += line.length + Number(!!index) * 2;
        if(isEdited && layer.needShowCursor && linesLength >= layer.cursorPosition) {
          renderCursor(canvas, left + getCursorLeft(line), top, layer.size, color);
        }
      });
      break;
    }

    case TextFrame.black: {
      lines.forEach((line, index) => {
        const {width} = getTextBoundary({...layer, text: line}, context);
        const left = initLeft + getLeft(width);
        const top = initTop + index * layer.size * CANVAS_FONT_LINE_HEIGHT_COEFFICIENT -
          layer.size * (CANVAS_FONT_LINE_HEIGHT_COEFFICIENT - 1) / 2;

        context.strokeStyle = '#000';
        context.lineWidth = 2 * scaledRatio;
        context.strokeText(line, left * scaledRatio, top * scaledRatio);
        context.fillStyle = layer.color;
        context.fillText(line, left * scaledRatio, top * scaledRatio);

        linesLength += line.length + Number(!!index) * 2;
        if(isEdited && layer.needShowCursor && linesLength >= layer.cursorPosition) {
          renderCursor(canvas, left + getCursorLeft(line), top, layer.size, layer.color);
        }
      });
      break;
    }

    default: {
      lines.forEach((line, index) => {
        const {width} = getTextBoundary({...layer, text: line}, context);
        const left = initLeft + getLeft(width);
        const top = initTop + index * layer.size * CANVAS_FONT_LINE_HEIGHT_COEFFICIENT -
          layer.size * (CANVAS_FONT_LINE_HEIGHT_COEFFICIENT - 1) / 2;

        context.fillStyle = layer.color;
        context.fillText(line, left * scaledRatio, top * scaledRatio);

        linesLength += line.length + Number(!!index) * 2;
        if(isEdited && layer.needShowCursor && linesLength >= layer.cursorPosition) {
          renderCursor(canvas, left + getCursorLeft(line), top, layer.size, layer.color);
        }
      });
      break;
    }
  }
  context.closePath();
  context.restore();

  if(isSelected) {
    renderSelectedBorder(
      canvas,
      layer.left - CANVAS_BORDER_PADDING,
      layer.top - layer.size * CANVAS_FONT_LINE_HEIGHT_COEFFICIENT - CANVAS_BORDER_PADDING,
      layer.width + 2 * CANVAS_BORDER_PADDING,
      layer.height + 2 * CANVAS_BORDER_PADDING,
      layer.angle
    );
  }
}

export function renderBrushPath(canvas: HTMLCanvasElement, layer: BrushLayer, isSelected: boolean) {
  if(!layer.points.length) return;

  const scaledRatio = canvas.width / canvas.offsetWidth;

  const context = canvas.getContext('2d');
  context.save();
  context.beginPath();

  let initLeft = layer.left;
  let initTop = layer.top;

  if(layer.width && layer.angle) {
    context.translate((layer.left + layer.width / 2)  * scaledRatio, (layer.top + layer.height / 2)  * scaledRatio);
    context.rotate(layer.angle);
    initLeft = -layer.width / 2;
    initTop = -layer.height / 2
  }

  context.moveTo(
    (initLeft + layer.points[0][0]) * scaledRatio,
    (initTop + layer.points[0][1]) * scaledRatio
  );

  for(let i = 0; i < layer.points.length - 1; i++) {
    const x = (initLeft + (layer.points[i][0] + layer.points[i + 1][0]) / 2) * scaledRatio;
    const y = (initTop + (layer.points[i][1] + layer.points[i + 1][1]) / 2) * scaledRatio;
    context.quadraticCurveTo(
      (initLeft + layer.points[i][0]) * scaledRatio,
      (initTop + layer.points[i][1]) * scaledRatio,
      x,
      y
    );
  }

  const lastPoint = layer.points[layer.points.length - 1];
  context.quadraticCurveTo(
    (initLeft + lastPoint[0]) * scaledRatio,
    (initTop + lastPoint[1]) * scaledRatio,
    (initLeft + lastPoint[0]) * scaledRatio,
    (initTop + lastPoint[1]) * scaledRatio
  );


  context.lineCap = 'round';
  context.lineWidth = layer.size * scaledRatio;

  switch(layer.style) {
    case BrushStyles.neon: {
      context.shadowColor = layer.color;
      context.shadowBlur = layer.size * scaledRatio;
      context.strokeStyle = '#fff';
      break;
    }
    case BrushStyles.arrow: {
      context.strokeStyle = layer.color;

      if(layer.isDrawing || layer.points.length < 10) break;

      const lastPoint = layer.points[layer.points.length - 1];
      const prevPoint = layer.points[layer.points.length - 10];

      const lineLength = 3 * layer.size;
      const dx = lastPoint[0] - prevPoint[0];
      const dy = lastPoint[1] - prevPoint[1];
      const angle = Math.atan2(dy, dx);

      context.moveTo(
        (initLeft + lastPoint[0] - lineLength * Math.cos(angle - Math.PI / 6)) * scaledRatio,
        (initTop + lastPoint[1] - lineLength * Math.sin(angle - Math.PI / 6)) * scaledRatio
      );
      context.lineTo(
        (initLeft + lastPoint[0]) * scaledRatio,
        (initTop + lastPoint[1]) * scaledRatio
      );
      context.lineTo(
        (initLeft + lastPoint[0] - lineLength * Math.cos(angle + Math.PI / 6)) * scaledRatio,
        (initTop + lastPoint[1] - lineLength * Math.sin(angle + Math.PI / 6)) * scaledRatio
      );

      break;
    }
    case BrushStyles.pen: {
      context.strokeStyle = layer.color;
      break;
    }
    case BrushStyles.brush: {
      context.filter = 'opacity(0.7)';
      context.strokeStyle = layer.color;
      break;
    }
  }

  context.stroke();
  context.closePath();
  context.restore();

  if(isSelected) {
    const {width, height, left, top} = getBrushPathBoundary(layer);

    renderSelectedBorder(
      canvas,
      left - CANVAS_BORDER_PADDING,
      top - CANVAS_BORDER_PADDING,
      width + 2 * CANVAS_BORDER_PADDING,
      height + 2 * CANVAS_BORDER_PADDING,
      layer.angle
    );
  }
}

export function renderSticker(canvas: HTMLCanvasElement, layer: StickerLayer, stickers: StickersList, isSelected: boolean) {
  const scaledRatio = canvas.width / canvas.offsetWidth;

  const context = canvas.getContext('2d');
  context.save();
  const sticker = stickers[layer.data];

  context.translate((layer.left + layer.width / 2)  * scaledRatio, (layer.top + layer.height / 2)  * scaledRatio);
  context.rotate(layer.angle);

  context.drawImage(sticker,
    0, 0, sticker.width, sticker.height,
    -layer.width / 2 * scaledRatio, -layer.height / 2 * scaledRatio,
    layer.width * scaledRatio, layer.width * scaledRatio
  );

  context.restore();

  if(isSelected) {
    renderSelectedBorder(
      canvas,
      layer.left - CANVAS_BORDER_PADDING,
      layer.top - CANVAS_BORDER_PADDING,
      layer.width + 2 * CANVAS_BORDER_PADDING,
      layer.height + 2 * CANVAS_BORDER_PADDING,
      layer.angle
    );
  }
}
