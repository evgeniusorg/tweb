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
import {State} from './types';
import {
  CropperFormatTypes,
  PreviewTypes,
  TABS,
  TabTypes
} from './constants';
import imageCropper from "./cropper";

export default class AppImageEditorTab extends SliderSuperTab {
  private image: HTMLImageElement;
  private preview: HTMLElement;
  private settings: HTMLElement;
  private cropPreview: HTMLElement;
  private canvas: HTMLCanvasElement;

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

  private showImageCrop() {
    this.cropper = imageCropper(this.image, this.state.cropper);
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
