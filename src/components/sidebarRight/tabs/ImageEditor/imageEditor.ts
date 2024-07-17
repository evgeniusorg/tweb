import {SliderSuperTab} from '../../../slider';
import readBlobAsDataURL from '../../../../helpers/blob/readBlobAsDataURL';
import {State} from './types';
import {CropperFormatTypes} from './constants';

export default class AppImageEditorTab extends SliderSuperTab {
  private image: HTMLImageElement;
  private preview: HTMLElement;
  private settings: HTMLElement;
  private cropPreview: HTMLElement;
  private canvas: HTMLCanvasElement;

  private initFile: File;
  private allFiles: File[];

  private fileIndex: number;

  private prevSteps: State[];
  private nextSteps: State[];
  private state: State;

  public init(
    fileIndex: number,
    allFiles: File[]
  ) {
    this.container.id = 'image-editor-sidebar';
    this.container.classList.add('image-editor-sidebar');

    this.fileIndex = fileIndex;
    this.allFiles = [...allFiles];

    this.state = {
      filters: {},
      layers: [],
      cropper: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        degree: 0,
        type: CropperFormatTypes.original,
        isMirror: false,
      },
      cropImage: null
    }
    this.prevSteps = [structuredClone(this.state)];
    this.nextSteps = [];

    // settings
    this.settings = document.createElement('div');
    this.settings.classList.add('image-editor-settings');
    this.scrollable.append(this.settings);

    // clone of selected file
    this.initFile = this.allFiles[fileIndex];

    // preview
    this.preview = document.createElement('div');
    this.preview.classList.add('image-editor-preview');
    setTimeout(() => this.preview.classList.add('image-editor-preview-showed'), 100);

    const sidebar =  document.getElementById('column-right');
    document.getElementById('main-columns').insertBefore(this.preview, sidebar);

    // canvas
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('image-editor-canvas');
    this.preview.append(this.canvas);

    const header = document.createElement('div');
    this.header.append(header);

    const headerBtns = document.createElement('div');
    headerBtns.classList.add('image-editor-header-btns');
    header.append(headerBtns);

    this.cropPreview = document.createElement('div');
    this.cropPreview.classList.add('image-editor-crop-preview');

    // create image from file
    readBlobAsDataURL(this.initFile).then((contents) => {
      this.image = new Image();
      this.image.src = contents;
      this.image.classList.add('image-editor-crop-preview-init-image');

      this.cropPreview.append(this.image);

      this.image.onload = () => {
        const context = this.canvas.getContext('2d');

        this.canvas.width = this.image.width;
        this.canvas.height = this.image.height;

        context.drawImage(this.image,
          0, 0, this.image.width, this.image.height,
          0, 0, this.canvas.width, this.canvas.height
        );

        this.state.cropper = {
          width: this.canvas.width,
          height: this.canvas.height,
          left: 0,
          top: 0,
          degree: 0,
          type: CropperFormatTypes.original,
          isMirror: false,
        }
      };
    });
  }
}
