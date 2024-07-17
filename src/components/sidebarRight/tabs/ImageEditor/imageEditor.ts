import {SliderSuperTab} from '../../../slider';
import {attachClickEvent} from '../../../../helpers/dom/clickEvent';
import PopupElement from '../../../popups';
import PopupNewMedia from '../../../popups/newMedia';
import appImManager from '../../../../lib/appManagers/appImManager';
import ButtonCorner from '../../../buttonCorner';
import readBlobAsDataURL from '../../../../helpers/blob/readBlobAsDataURL';
import ripple from '../../../ripple';
import ButtonIcon from '../../../buttonIcon';
import {horizontalMenu} from '../../../horizontalMenu';
import Icon from '../../../icon';
import {CropperFormat, State} from './types';
import {
  CROPPER_CUSTOM_FORMATS,
  CROPPER_DEFAULT_FORMATS,
  CropperFormatTypes,
  PreviewTypes,
  TABS,
  TabTypes
} from './constants';
import {_i18n} from '../../../../lib/langPack';
import imageCropper from "./cropper";
import findUpClassName from "../../../../helpers/dom/findUpClassName";

export default class AppImageEditorTab extends SliderSuperTab {
  private image: HTMLImageElement;
  private preview: HTMLElement;
  private settings: HTMLElement;
  private cropPreview: HTMLElement;
  private canvas: HTMLCanvasElement;
  private redoBtn: HTMLElement;
  private undoBtn: HTMLElement;

  private initFile: File;
  private allFiles: File[];

  private cropper: any;
  private fileIndex: number;
  private selectedTab: ReturnType<typeof horizontalMenu>;
  private prevTabId: number;

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

    this.createTabs();
    this.createDoneBtn();

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

    this.undoBtn = ButtonIcon('icon_undo');
    attachClickEvent(this.undoBtn, this.undo.bind(this));
    this.undoBtn.setAttribute('disabled', 'true');
    headerBtns.append(this.undoBtn);

    this.redoBtn = ButtonIcon('icon_redo');
    attachClickEvent(this.redoBtn, this.redo.bind(this));
    this.redoBtn.setAttribute('disabled', 'true');
    headerBtns.append(this.redoBtn);

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

    this.closeBtn.replaceChildren(Icon('close'));
    attachClickEvent(this.closeBtn, () => this.closeEditor(this.allFiles));
  }

  private reRenderCanvas() {
    this.canvas.width = this.state.cropper.width;
    this.canvas.height = this.state.cropper.height;

    const context = this.canvas.getContext('2d');
    context.save();
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    context.translate(this.canvas.width / 2,this.canvas.height / 2);
    context.rotate(this.state.cropper.degree * Math.PI / 180);
    context.translate(- this.canvas.width / 2,- this.canvas.height / 2);

    context.drawImage(this.image,
      this.state.cropper.left, this.state.cropper.top, this.state.cropper.width, this.state.cropper.height,
      0, 0, this.state.cropper.width, this.state.cropper.height);

    context.restore();
    context.filter = 'none';
  }

  private updateHistory() {
    this.prevSteps.push(structuredClone(this.state));
    this.undoBtn.removeAttribute('disabled');

    this.nextSteps = [];
    this.redoBtn.setAttribute('disabled', 'true');
  }

  private undo() {
    if(this.prevSteps.length < 2) return;

    this.nextSteps.push(structuredClone(this.prevSteps.pop()));
    this.redoBtn.removeAttribute('disabled');

    this.state = structuredClone(this.prevSteps[this.prevSteps.length - 1]);

    if(this.prevSteps.length < 2) {
      this.undoBtn.setAttribute('disabled', 'true');
    }

    this.onSelectTab(this.prevTabId, true);
    this.reRenderCanvas();
  }

  private redo() {
    if(this.nextSteps.length === 0) return;

    this.state = structuredClone(this.nextSteps.pop());
    this.prevSteps.push(structuredClone(this.state));

    this.onSelectTab(this.prevTabId, true);
    this.reRenderCanvas();

    this.undoBtn.removeAttribute('disabled');

    if(this.nextSteps.length === 0) {
      this.redoBtn.setAttribute('disabled', 'true');
    }
  }

  private closeEditor(files: File[]) {
    this.preview.classList.remove('image-editor-preview-showed');

    this.cropper.removeHandlers();
    setTimeout(() => {
      this.preview.remove();
      PopupElement.createPopup(PopupNewMedia, appImManager.chat, files, 'media');
    }, 400);
  }

  private changePreview(type: PreviewTypes) {
    this.preview.replaceChildren(type === PreviewTypes.crop ? this.cropPreview : this.canvas);
  }

  private showImageFilters() {}

  private getGropperFormatCell(cropperFormat: CropperFormat) {
    const btn = document.createElement('div');
    btn.classList.add('btn-menu-item', 'rp-overflow', 'image-editor-cropper-format-cell');

    if(cropperFormat.type === this.state.cropper.type) {
      btn.classList.add('active');
    }

    const icon = Icon(cropperFormat.icon as Icon, 'btn-menu-item-icon')
    if (cropperFormat.needIconRotate) {
      icon.classList.add('image-editor-cropper-format-cell--rotate');
    }
    btn.append(icon);

    const textElement = document.createElement('span');
    textElement.classList.add('btn-menu-item-text');
    _i18n(textElement, cropperFormat.langKey);
    btn.append(textElement);

    btn.dataset.type = cropperFormat.type;

    return btn;
  }

  private showImageCrop() {
    this.cropper = imageCropper(this.image, this.state.cropper);

    const cropTitle = document.createElement('div');
    cropTitle.classList.add('image-editor-cropper-format-title');
    _i18n(cropTitle, 'ImageEditor.Cropper.Title');
    this.settings.replaceChildren(cropTitle);

    const cropSettings = document.createElement('div');
    cropSettings.classList.add('image-editor-cropper-format-list');

    CROPPER_DEFAULT_FORMATS.forEach((cropperFormat) => {
      cropSettings.append(this.getGropperFormatCell(cropperFormat));
    })

    const cropCustomSettings = document.createElement('div');
    cropCustomSettings.classList.add('image-editor-cropper-format-compact-list');
    cropSettings.append(cropCustomSettings);

    CROPPER_CUSTOM_FORMATS.forEach((cropperFormat) => {
      cropCustomSettings.append(this.getGropperFormatCell(cropperFormat));
    })

    this.settings.append(cropSettings);

    attachClickEvent(cropSettings, (e) => {
      const cropperFormatCell = findUpClassName(e.target, 'image-editor-cropper-format-cell');

      if(!cropperFormatCell) {
        return;
      }

      if (this.state.cropper.type === cropperFormatCell.dataset.type) {
        return;
      }

      this.state.cropper.type = cropperFormatCell.dataset.type;

      const activeBtn = cropSettings.getElementsByClassName('active')[0];
      activeBtn && activeBtn.classList.remove('active');
      e.target.classList.add('active');

      this.cropper.updateCropFormat(this.state.cropper);
    });
  }

  private showImageText() {
    const textSettings = document.createElement('div');
    this.settings.replaceChildren(textSettings);
  }

  private showImageBrushes() {
    const brushSettings = document.createElement('div');
    this.settings.replaceChildren(brushSettings);
  }

  private showImageEmojis() {
    const emojiSettings = document.createElement('div');
    this.settings.replaceChildren(emojiSettings);
  }

  private onSelectTab(id: number, force = false) {
    const tabType = TABS[id].type;

    if(id === this.prevTabId && !force) {
      return;
    }

    if(this.prevTabId === TabTypes.crop) {
      this.changePreview(PreviewTypes.canvas);
      this.state.cropper = {
        ...this.state.cropper,
        ...this.cropper.getParams(),
      };
      this.reRenderCanvas();
    }

    switch(tabType) {
      case TabTypes.filters:
        this.showImageFilters();
        break;
      case TabTypes.crop:
        this.changePreview(PreviewTypes.crop);
        this.showImageCrop();
        break;
      case TabTypes.text:
        this.showImageText();
        break;
      case TabTypes.brush:
        this.showImageBrushes();
        break;
      case TabTypes.emoji:
        this.showImageEmojis();
        break;
    }

    this.prevTabId = id;
  }

  private createTabs() {
    const tabsContainer = document.createElement('div');
    tabsContainer.classList.add('search-super-tabs-container', 'tabs-container');

    const tabs = document.createElement('nav');
    tabs.classList.add('menu-horizontal-div');

    tabsContainer.append(tabs);
    this.content.append(tabsContainer);

    TABS.forEach((tab) => {
      const menuTab = document.createElement('div');
      menuTab.classList.add('menu-horizontal-div-item');

      const span = document.createElement('span');
      span.classList.add('menu-horizontal-div-item-span');
      const i = document.createElement('i');
      span.append(ButtonIcon(`${tab.icon}`, {noRipple: true}));
      span.append(i);
      menuTab.append(span);
      ripple(menuTab);

      tabs.append(menuTab);
    })

    this.selectedTab = horizontalMenu(tabs, tabsContainer, this.onSelectTab.bind(this));
    this.selectedTab(0);
  }

  private createDoneBtn() {
    const btnDone = ButtonCorner({icon: 'check', className: 'is-visible'});
    this.content.append(btnDone);

    attachClickEvent(btnDone, (e) => {
      if (this.prevTabId === TabTypes.crop) {
        this.state.cropper = {
          ...this.state.cropper,
          ...this.cropper.getParams(),
        };
        this.reRenderCanvas();
      }

      this.canvas.toBlob((blob) => {
        const newFilesList = [...this.allFiles];
        const newFile = new File([blob], this.initFile.name, {type: this.initFile.type});
        newFilesList[this.fileIndex] = newFile;
        this.closeEditor(newFilesList);
        this.close();
      }, this.initFile.type, 1);
    });
  }
}
