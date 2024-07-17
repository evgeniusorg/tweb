import {CropperFormat} from './types';

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
}


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
}

export const CROPPER_DEFAULT_FORMATS: CropperFormat[] = [{
  type: CropperFormatTypes.free,
  langKey: 'ImageEditor.Cropper.Free',
  aspectRatio: 3/4,
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
