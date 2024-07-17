import {CropperFormatTypes, FilterTypes} from './constants';
import Icons from '../../../../iconsCustom';
import {LangPackKey} from '../../../../lib/langPack';

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
  cropper: Cropper,
  layers: any[];
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
