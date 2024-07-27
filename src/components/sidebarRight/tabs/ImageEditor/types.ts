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
  angle: number;
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
    color: string;
    font: string;
    size: number;
    align: TextAlign;
    frame: TextFrame
  },
  brushSettings: {
    style: BrushStyles;
    color: string;
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
  color: string;
  font: string;
  size: number;
  align: TextAlign;
  frame: TextFrame;
  left: number;
  top: number;
  cursorPosition: number;
  needShowCursor: boolean;
  angle: number;
  width?: number;
  height?: number;
  isMoved?: boolean;
}

export type Point = [number, number];

export type BrushLayer = {
  type: LayerTypes.brush;
  points: Point[];
  color: string;
  size: number;
  style: BrushStyles;
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  isMoved?: boolean;
  isDrawing?: boolean;
}

export type StickerLayer = {
  type: LayerTypes.sticker;
  data: string;
  top: number;
  left: number;
  width: number;
  height: number;
  isMoved?: boolean;
  angle: number;
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

export type LayerRotationEventState = {
  mouseX: number,
  mouseY: number,
  layerCenterLeft: number,
  layerCenterTop: number,
  layerAngle: number,
  layer: Layer,
  endRotationCallback: () => void
}

export type BrushDrawingEventState = {
  layer: BrushLayer,
  endDrawingCallback?: () => void,
  mouseX: number,
  mouseY: number,
}

export type StickersList = Record<string, HTMLImageElement>;

export type Font = {
  font: string;
  title: string;
};

export type Brush = {
  style: BrushStyles,
  langKey: string,
  iconUrl: string,
  defaultColor?: string,
  disabled?: boolean
};

export type BrushIcon = {
  color: string;
  text: string;
  url?: string;
};

export type BrushIconsList = Partial<Record<BrushStyles, BrushIcon>>;

export type LayerRotation = {
  startRotate: (event: MouseEvent | TouchEvent, state: State, selectedLayerId: number, endRotationCallback: () => void) => void;
  removeHandlers: () => void;
};

export type LayerMovement = {
  startMoving: (event: MouseEvent | TouchEvent, state: State, selectedLayerId: number, endRotationCallback: () => void) => void;
  removeHandlers: () => void;
};

export type BrushDrawing = {
  startDrawing: (event: MouseEvent | TouchEvent, layer: BrushLayer, endDrawingCallback: () => void) => void;
  removeHandlers: () => void;
};

export type ImageCropperGetParamsResponse = {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type ImageCropper = {
  getParams: () => ImageCropperGetParamsResponse;
  removeHandlers: () => void;
  updateCropFormat: (params: Cropper) => void;
};
