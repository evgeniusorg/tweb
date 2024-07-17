import {CropperFormatTypes} from './constants';
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
