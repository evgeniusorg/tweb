import {
  CANVAS_BORDER_CORNER_RADIUS, CANVAS_BORDER_PADDING,
  CANVAS_FONT_FRAME_WHITE_PADDING, Colors,
  LayerTypes,
  TextAlign,
  TextFrame
} from '../constants';
import {BrushLayer, State, TextLayer} from '../types';

export function resizeTextBoundary(layer: TextLayer, context: CanvasRenderingContext2D) {
  const lines = layer.text.split('/n')
  let maxWidth = 0
  const maxHeight = layer.size * lines.length * 1.2;

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
  context.rotate(state.cropper.degree * Math.PI / 180);
  context.translate(- canvas.width / 2, -canvas.height / 2);

  context.drawImage(image,
    state.cropper.left, state.cropper.top, state.cropper.width, state.cropper.height,
    0, 0, state.cropper.width, state.cropper.height);

  context.restore();
  context.filter = 'none';
}

export function renderSelectedBorder(canvas: HTMLCanvasElement, left: number, top: number, width: number, height: number) {
  const context = canvas.getContext('2d');
  const scaledRatio = canvas.width / canvas.offsetWidth;
  context.save();
  context.beginPath();

  context.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  context.lineWidth = scaledRatio;
  context.setLineDash([3 * scaledRatio, 6 * scaledRatio])
  context.strokeRect(
    left * scaledRatio,
    top * scaledRatio,
    width * scaledRatio,
    height * scaledRatio
  );
  context.closePath();

  context.fillStyle = '#fff';

  // left_top corner
  context.beginPath();
  context.arc(
    left * scaledRatio,
    top * scaledRatio,
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
    left * scaledRatio,
    (top + height) * scaledRatio,
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
    (left + width) * scaledRatio,
    top * scaledRatio,
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
    (left + width) * scaledRatio,
    (top + height) * scaledRatio,
    CANVAS_BORDER_CORNER_RADIUS * scaledRatio,
    0,
    2 * Math.PI,
    false
  );
  context.fill();
  context.closePath();
  context.restore();
}

export function renderText(canvas: HTMLCanvasElement, layer: TextLayer, isSelected: boolean, isEdited: boolean) {
  const scaledRatio = canvas.width / canvas.offsetWidth;

  const context = canvas.getContext('2d');
  context.save();
  context.beginPath();
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

  switch(layer.frame) {
    case TextFrame.white: {
      context.fillStyle = layer.color;
      lines.forEach((line, index) => {
        const {width, height} = resizeTextBoundary({...layer, text: line}, context);

        context.roundRect(
          (layer.left - CANVAS_FONT_FRAME_WHITE_PADDING + getLeft(width)) * scaledRatio,
          (layer.top - layer.size * 0.9 - CANVAS_FONT_FRAME_WHITE_PADDING + index * layer.size * 1.2) * scaledRatio,
          (width + 2 * CANVAS_FONT_FRAME_WHITE_PADDING) * scaledRatio,
          (height + 2 * CANVAS_FONT_FRAME_WHITE_PADDING) * scaledRatio,
          layer.size / 2 * scaledRatio
        );
        context.fill();
      });

      lines.forEach((line, index) => {
        context.fillStyle = layer.color === Colors.white ? '#000' : Colors.white;
        const {width} = resizeTextBoundary({...layer, text: line}, context);

        context.fillText(
          line,
          (layer.left + getLeft(width)) * scaledRatio,
          (layer.top + index * layer.size * 1.2
          ) * scaledRatio
        );
      });
      break;
    }

    case TextFrame.black: {
      lines.forEach((line, index) => {
        const {width} = resizeTextBoundary({...layer, text: line}, context);

        context.strokeStyle = '#000';
        context.lineWidth = 2 * scaledRatio;
        context.strokeText(
          line,
          (layer.left + getLeft(width)) * scaledRatio,
          (layer.top + index * layer.size * 1.2) * scaledRatio
        );
        context.fillStyle = layer.color;
        context.fillText(
          line,
          (layer.left + getLeft(width)) * scaledRatio,
          (layer.top + index * layer.size * 1.2) * scaledRatio
        );
      });
      break;
    }

    default: {
      lines.forEach((line, index) => {
        const {width} = resizeTextBoundary({...layer, text: line}, context);

        context.fillStyle = layer.color;
        context.fillText(
          line,
          (layer.left + getLeft(width)) * scaledRatio,
          (layer.top + index * layer.size * 1.2) * scaledRatio
        );
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
      layer.top - layer.size * 0.9 - CANVAS_BORDER_PADDING,
      layer.width + 2 * CANVAS_BORDER_PADDING,
      layer.height + 2 * CANVAS_BORDER_PADDING);
  }
}

export function renderBrush(canvas: HTMLCanvasElement, layer: BrushLayer, isSelected: boolean) {

}
