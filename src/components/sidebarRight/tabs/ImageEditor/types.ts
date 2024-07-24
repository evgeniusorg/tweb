import {
  BrushStyles,
  Colors,
  CropperFormatTypes,
  FilterTypes,
  FONTS,
  LayerTypes,
  TabTypes,
  TextAlign,
  TextFrame
} from './constants';
import Icons from '../../../../iconsCustom';
import {LangPackKey} from '../../../../lib/langPack';

export type Tab = {
  type: TabTypes,
  icon: string
}

export type CropperFormat = {
  type: CropperFormatTypes;
  langKey: LangPackKey;
  aspectRatio: number;
  icon: keyof typeof Icons;
  needIconRotate: boolean;
}

export type Cropper = {
  width: number;
  height: number;
  left: number;
  top: number;
  degree: number;
  type: CropperFormatTypes;
  isMirror: boolean;
};

export type State = {
  filters: Partial<Record<FilterTypes, number>>;
  cropImage: File;
  cropper: Cropper;
  layers: Layer[];
  selectedLayerId: number;
  editedLayerId: number;
  textSettings: {
    color: Colors;
    font: string;
    size: number;
    align: TextAlign;
    frame: TextFrame
  },
  brushSettings: {
    style: BrushStyles;
    color: Colors;
    size: number
  },
};

export type Filter = {
  type: FilterTypes;
  title: string;
  minValue?: number;
  maxValue?: number;
  initValue?: number;
  step?: number;
  disabled?: boolean;
}

export type TextLayer = {
  type: LayerTypes.text;
  text: string;
  color: Colors;
  font: string;
  size: number;
  align: TextAlign;
  frame: TextFrame;
  left: number;
  top: number;
  cursorPosition: number;
  needShowCursor: boolean;
  width?: number;
  height?: number;
  isMoved?: boolean;
}

export type Point = [number, number];

export type BrushLayer = {
  type: LayerTypes.brush;
  points: Point[];
  color: Colors;
  size: number;
  style: BrushStyles;
  left: number;
  top: number;
  width: number;
  height: number;
  isMoved?: boolean;
}

export type StickerLayer = {
  type: LayerTypes.sticker;
  data: string;
  top: number;
  left: number;
  width: number;
  height: number;
  isMoved?: boolean;
  size: 0;
}

export type Layer = TextLayer | BrushLayer | StickerLayer;

export type CropperEventState = {
  mouseX: number,
  mouseY: number,
  containerWidth: number,
  containerHeight: number,
  containerLeft: number,
  containerTop: number,
  target: HTMLElement
}

export type LayerMovementEventState = {
  mouseX: number,
  mouseY: number,
  layerLeft: number,
  layerTop: number,
  selectedLayerId: number,
  layer: Layer,
  state: State,
  endMovingCallback: () => void
}

export type BrushDrawingEventState = {
  layer: BrushLayer,
  endDrawingCallback?: () => void,
  mouseX: number,
  mouseY: number,
}

export type StickersList = Record<string, any>;
