import {Brush, CropperFormat, Filter, Font, Tab} from './types';

export enum PreviewTypes {
  crop = 'crop',
  canvas = 'canvas'
};

export enum TabTypes {
  filters,
  crop,
  text,
  brush,
  stickers
};

export const TABS: Tab[] = [{
  type: TabTypes.filters,
  icon: 'icon_settings'
}, {
  type: TabTypes.crop,
  icon: 'icon_crop'
}, {
  type: TabTypes.text,
  icon: 'icon_text'
}, {
  type: TabTypes.brush,
  icon: 'icon_brush'
}, {
  type: TabTypes.stickers,
  icon: 'icon_smile'
}];

export enum FilterTypes {
  enhance = 'enhance',
  brightness = 'brightness',
  contrast = 'contrast',
  saturation = 'saturation',
  warmth = 'warmth',
  fade = 'fade',
  highlights = 'highlights',
  shadows = 'shadows',
  vignette = 'vignette',
  grain = 'grain',
  sharpen = 'sharpen'
};

export const FILTERS: Filter[] = [{
  type: FilterTypes.enhance,
  title: 'ImageEditor.Filter.Enhance',
  disabled: true
}, {
  type: FilterTypes.brightness,
  title: 'ImageEditor.Filter.Brightness',
  minValue: -100,
  maxValue: 100,
  initValue: 0
}, {
  type: FilterTypes.contrast,
  title: 'ImageEditor.Filter.Contrast',
  minValue: -100,
  maxValue: 100,
  initValue: 0
}, {
  type: FilterTypes.saturation,
  title: 'ImageEditor.Filter.Saturation',
  minValue: -100,
  maxValue: 100,
  initValue: 0
}, {
  type: FilterTypes.warmth,
  title: 'ImageEditor.Filter.Warmth',
  minValue: -100,
  maxValue: 100,
  initValue: 0,
  disabled: true
}, {
  type: FilterTypes.fade,
  title: 'ImageEditor.Filter.Fade',
  disabled: true
}, {
  type: FilterTypes.highlights,
  title: 'ImageEditor.Filter.Highlights',
  minValue: -100,
  maxValue: 100,
  initValue: 0,
  disabled: true
}, {
  type: FilterTypes.shadows,
  title: 'ImageEditor.Filter.Shadows',
  minValue: -100,
  maxValue: 100,
  initValue: 0,
  disabled: true
}, {
  type: FilterTypes.vignette,
  title: 'ImageEditor.Filter.Vignette',
  disabled: true
}, {
  type: FilterTypes.grain,
  title: 'ImageEditor.Filter.Grain',
  disabled: true
}, {
  type: FilterTypes.sharpen,
  title: 'ImageEditor.Filter.Sharpen',
  disabled: true
}];

export enum CropperFormatTypes {
  free = 'free',
  original = 'original',
  square = 'square',
  '3:2' = '3:2',
  '2:3' = '2:3',
  '4:3' = '4:3',
  '3:4' = '3:4',
  '5:4' = '5:4',
  '4:5' = '4:5',
  '7:5' = '7:5',
  '5:7' = '5:7',
  '16:9' = '16:9',
  '9:16' = '9:16'
};

export const CROPPER_DEFAULT_FORMATS: CropperFormat[] = [{
  type: CropperFormatTypes.free,
  langKey: 'ImageEditor.Cropper.Free',
  aspectRatio: null,
  icon: 'icon_free',
  needIconRotate: false
}, {
  type: CropperFormatTypes.original,
  langKey: 'ImageEditor.Cropper.Original',
  aspectRatio: null,
  icon: 'icon_original',
  needIconRotate: false
}, {
  type: CropperFormatTypes.square,
  langKey: 'ImageEditor.Cropper.Square',
  aspectRatio: 1/1,
  icon: 'icon_square',
  needIconRotate: false
}];

export const CROPPER_CUSTOM_FORMATS: CropperFormat[] = [{
  type: CropperFormatTypes['3:2'],
  langKey: 'ImageEditor.Cropper.3:2',
  aspectRatio: 3/2,
  icon: 'icon_3_2',
  needIconRotate: false
}, {
  type: CropperFormatTypes['2:3'],
  langKey: 'ImageEditor.Cropper.2:3',
  aspectRatio: 2/3,
  icon: 'icon_3_2',
  needIconRotate: true
}, {
  type: CropperFormatTypes['4:3'],
  langKey: 'ImageEditor.Cropper.4:3',
  aspectRatio: 4/3,
  icon: 'icon_4_3',
  needIconRotate: false
}, {
  type: CropperFormatTypes['3:4'],
  langKey: 'ImageEditor.Cropper.3:4',
  aspectRatio: 3/4,
  icon: 'icon_4_3',
  needIconRotate: true
}, {
  type: CropperFormatTypes['5:4'],
  langKey: 'ImageEditor.Cropper.5:4',
  aspectRatio: 5/4,
  icon: 'icon_5_4',
  needIconRotate: false
}, {
  type: CropperFormatTypes['4:5'],
  langKey: 'ImageEditor.Cropper.4:5',
  aspectRatio: 4/5,
  icon: 'icon_5_4',
  needIconRotate: true
}, {
  type: CropperFormatTypes['7:5'],
  langKey: 'ImageEditor.Cropper.7:5',
  aspectRatio: 7/5,
  icon: 'icon_7_5',
  needIconRotate: false
}, {
  type: CropperFormatTypes['5:7'],
  langKey: 'ImageEditor.Cropper.5:7',
  aspectRatio: 5/7,
  icon: 'icon_7_5',
  needIconRotate: true
}, {
  type: CropperFormatTypes['16:9'],
  langKey: 'ImageEditor.Cropper.16:9',
  aspectRatio: 16/9,
  icon: 'icon_16_9',
  needIconRotate: false
}, {
  type: CropperFormatTypes['9:16'],
  langKey: 'ImageEditor.Cropper.9:16',
  aspectRatio: 9/16,
  icon: 'icon_16_9',
  needIconRotate: true
}];

export enum Colors {
  white = '#FFFFFF',
  red = '#FE4438',
  orange = '#FF8901',
  yellow = '#FFD60A',
  green = '#33C759',
  lightBlue = '#62E5E0',
  blue = '#0A84FF',
  violet = '#BD5CF3'
};

export const FONTS: Font[] = [{
  font: 'Roboto',
  title: 'Roboto'
}, {
  font: 'American Typewriter',
  title: 'Typewriter'
}, {
  font: 'Avenir Next',
  title: 'Avenir Next'
}, {
  font: 'Courier New',
  title: 'Courier New'
}, {
  font: 'Noteworthy',
  title: 'Noteworthy'
}, {
  font: 'Georgia',
  title: 'Georgia'
}, {
  font: 'Papyrus',
  title: 'Papyrus'
}, {
  font: 'Snell Roundhand',
  title: 'Snell Roundhand'
}];

export enum TextAlign {
  left = 'left',
  center = 'center',
  right = 'right'
};

export enum TextFrame {
  regular = 'regular',
  black = 'black',
  white = 'white',
};

export enum BrushStyles {
  pen = 'pen',
  arrow = 'arrow',
  brush = 'brush',
  neon = 'neon',
  blur = 'blur',
  eraser = 'eraser'
};

export const BRUSHES: Brush[] = [{
  style: BrushStyles.pen,
  langKey: 'ImageEditor.Brushes.Pen',
  iconUrl: 'assets/img/brushes/Pen.svg',
  defaultColor: Colors.white
}, {
  style: BrushStyles.arrow,
  langKey: 'ImageEditor.Brushes.Arrow',
  iconUrl: 'assets/img/brushes/Arrow.svg',
  defaultColor: Colors.yellow
}, {
  style: BrushStyles.brush,
  langKey: 'ImageEditor.Brushes.Brush',
  iconUrl: 'assets/img/brushes/Brush.svg',
  defaultColor: Colors.orange
}, {
  style: BrushStyles.neon,
  langKey: 'ImageEditor.Brushes.Neon',
  iconUrl: 'assets/img/brushes/Neon.svg',
  defaultColor: Colors.lightBlue
}, {
  style: BrushStyles.blur,
  langKey: 'ImageEditor.Brushes.Blur',
  iconUrl: 'assets/img/brushes/Blur.svg',
  disabled: true
}, {
  style: BrushStyles.eraser,
  langKey: 'ImageEditor.Brushes.Eraser',
  iconUrl: 'assets/img/brushes/Eraser.svg',
  disabled: true
}];

export enum LayerTypes {
  text = 'text',
  brush = 'brush',
  sticker = 'sticker'
};

export const CANVAS_BORDER_PADDING = 16;
export const CANVAS_BORDER_CORNER_RADIUS = 8;
export const CANVAS_FONT_FRAME_WHITE_PADDING = 8;
export const CANVAS_FONT_SIZE_DEFAULT = 24;
export const CANVAS_FONT_LINE_HEIGHT_COEFFICIENT = 1.2;
export const CANVAS_BRUSH_SIZE_DEFAULT = 8;
export const CANVAS_LAYER_SIZE_COEFFICIENT = 0.9;

export const SIZE_RANGE_FONT_MIN = 16;
export const SIZE_RANGE_FONT_MAX = 96;
export const SIZE_RANGE_STEP = 1;
export const SIZE_RANGE_BRUSH_MIN = 1;
export const SIZE_RANGE_BRUSH_MAX = 60;
export const SIZE_RANGE_UPDATE_HISTORY_DELAY = 500;

export const CURSOR_ANIMATION_DELAY = 400;
export const OPEN_NEW_MEDIA_POPOUT_DELAY = 300;
export const OPEN_IMAGE_EDITOR_PREVIEW_DELAY = 100;

export const RESIZE_WINDOW_SMALL_SIZE_WIDTH = 925;
export const DEFAULT_STICKER_SIZE = 100;
