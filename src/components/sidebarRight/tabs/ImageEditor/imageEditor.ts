/*
 * https://github.com/evgeniusorg/tweb/tree/image_editor
 * Copyright (C) 2024 Eugene Chugunov
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

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
import {
  BrushDrawing,
  BrushIconsList,
  BrushLayer,
  ImageCropper,
  LayerMovement,
  LayerRotation,
  State,
  StickerLayer,
  StickersList,
  TextLayer
} from './types';
import {
  BRUSHES,
  BrushStyles,
  CANVAS_BRUSH_SIZE_DEFAULT,
  CANVAS_FONT_SIZE_DEFAULT,
  Colors,
  CropperFormatTypes,
  CURSOR_ANIMATION_DELAY,
  DEFAULT_STICKER_SIZE,
  FONTS,
  LayerTypes,
  OPEN_IMAGE_EDITOR_PREVIEW_DELAY,
  OPEN_NEW_MEDIA_POPOUT_DELAY,
  PreviewTypes,
  RESIZE_WINDOW_SMALL_SIZE_WIDTH,
  TABS,
  TabTypes,
  TextAlign,
  TextFrame
} from './constants';
import layerMovement from './actions/layerMovement';
import {
  getBrushPathBoundary,
  getTextBoundary,
  renderBrushPath,
  renderCroppedImage,
  renderFilters,
  renderSticker,
  renderText
} from './actions/render';
import {showImageFilters} from './settings/filters';
import {showImageCrop} from './settings/crop';
import {showImageText} from './settings/text';
import {replaceBrushColorOnText, showImageBrushes} from './settings/brush';
import imageCropper from './actions/imageCropper';
import {keydown, keypress} from './actions/textEditor';
import brushDrawing from './actions/brushDrawing';
import {showImageStickers} from './settings/stickers';
import {getEventPosition} from './actions/eventActions';
import textToSvgURL from '../../../../helpers/textToSvgURL';
import layerRotation from './actions/layerRotation';
import {checkIsCorner, getSelectedLayerId} from './actions/layerSelection';

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

  private cropper: ImageCropper;
  private movement: LayerMovement;
  private rotation: LayerRotation;
  private brushDrawing: BrushDrawing;

  private fileIndex: number;
  private selectedTab: ReturnType<typeof horizontalMenu>;
  private prevTabId: number;

  private cursorAnimationTimer: number;
  private cursorAnimationFrame: number;

  private state: State;
  private prevSteps: State[];
  private nextSteps: State[];

  private stickers: StickersList;
  private brushIcons: BrushIconsList;

  public init(
    fileIndex: number,
    allFiles: File[]
  ) {
    this.container.id = 'image-editor-sidebar';
    this.container.classList.add('image-editor-sidebar');
    this.scrollable.container.classList.add('image-editor-sidebar-scrollable');

    this.fileIndex = fileIndex;
    this.allFiles = [...allFiles];

    // init state
    this.state = {
      filters: {},
      layers: [],
      cropper: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        angle: 0,
        type: CropperFormatTypes.original,
        isMirror: false
      },
      selectedLayerId: null,
      editedLayerId: null,
      textSettings: {
        color: Colors.white,
        font: FONTS[0].font,
        size: CANVAS_FONT_SIZE_DEFAULT,
        align: TextAlign.left,
        frame: TextFrame.regular
      },
      brushSettings: {
        style: BrushStyles.pen,
        color: Colors.white,
        size: CANVAS_BRUSH_SIZE_DEFAULT
      },
      cropImage: null
    }

    this.stickers = {};
    this.brushIcons = {};
    this.prevSteps = [];
    this.nextSteps = [];

    // settings
    this.settings = document.createElement('div');
    this.settings.classList.add('image-editor-sidebar-settings');
    this.scrollable.append(this.settings);

    // clone of selected file
    this.initFile = this.allFiles[fileIndex];

    this.keypress = this.keypress.bind(this);
    this.keydown = this.keydown.bind(this);
    this.selectCanvasLayer = this.selectCanvasLayer.bind(this);
    this.reRenderCanvas = this.reRenderCanvas.bind(this);
    this.onSelectTab = this.onSelectTab.bind(this);
    this.updateHistory = this.updateHistory.bind(this);
    this.cursorAnimation = this.cursorAnimation.bind(this);
    this.addSticker = this.addSticker.bind(this);
    this.resizeWindow = this.resizeWindow.bind(this);

    this.createTabs();
    this.createDoneBtn();
    this.getBrushIcons();

    // preview
    this.preview = document.createElement('div');
    this.preview.classList.add('image-editor-preview');
    setTimeout(() => this.preview.classList.add('image-editor-preview-showed'), OPEN_IMAGE_EDITOR_PREVIEW_DELAY);

    const sidebar =  document.getElementById('column-right');
    document.getElementById('main-columns').insertBefore(this.preview, sidebar);
    window.addEventListener('resize', this.resizeWindow);
    this.resizeWindow();

    // canvas
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('image-editor-canvas');
    this.preview.append(this.canvas);
    this.canvas.addEventListener('mousedown', this.selectCanvasLayer);
    this.canvas.addEventListener('touchstart', this.selectCanvasLayer);
    this.movement = layerMovement(this.canvas, this.reRenderCanvas);
    this.brushDrawing = brushDrawing(this.canvas, this.reRenderCanvas);
    this.rotation = layerRotation(this.canvas, this.reRenderCanvas);

    const header = document.createElement('div');
    this.header.append(header);

    const headerBtns = document.createElement('div');
    headerBtns.classList.add('image-editor-sidebar-header-btns');
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

      this.image.onload = () => {
        const context = this.canvas.getContext('2d');

        this.canvas.width = this.image.width;
        this.canvas.height = this.image.height;

        context.drawImage(this.image,
          0, 0, this.image.width, this.image.height,
          0, 0, this.canvas.width, this.canvas.height
        );

        this.state.cropper = {
          width: this.image.width,
          height: this.image.height,
          left: 0,
          top: 0,
          angle: 0,
          type: CropperFormatTypes.original,
          isMirror: false
        }

        this.prevSteps.push(structuredClone(this.state));
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

    renderFilters(this.canvas, this.state);
    renderCroppedImage(this.canvas, this.image, this.state);
    context.restore();

    this.state.layers.forEach((layer, index) => {
      switch(layer.type) {
        case LayerTypes.text:
          return renderText(
            this.canvas,
            layer as TextLayer,
            this.state.selectedLayerId === index,
            this.state.editedLayerId === index
          );
        case LayerTypes.brush:
          return renderBrushPath(this.canvas, layer as BrushLayer, this.state.selectedLayerId === index);
        case LayerTypes.sticker:
          return renderSticker(this.canvas, layer as StickerLayer, this.stickers, this.state.selectedLayerId === index);
      }
    });
  }

  private selectCanvasLayer(event: MouseEvent | TouchEvent) {
    const {left, top} = getEventPosition(event, this.canvas);

    switch(this.prevTabId) {
      case TabTypes.filters:
        return;
      case TabTypes.text: {
        // start rotation
        if(this.state.selectedLayerId !== null && checkIsCorner(left, top, this.state.layers[this.state.selectedLayerId])) {
          this.rotation.startRotate(event, this.state, this.state.selectedLayerId, this.updateHistory);
          return;
        }

        const selectedLayerId = getSelectedLayerId(left, top, LayerTypes.text, this.state);
        if(this.state.editedLayerId !== null) {
          // continue to edit
          if(this.state.editedLayerId === selectedLayerId) {
            return;
          }

          // remove empty layer
          const layer = this.state.layers[this.state.editedLayerId] as TextLayer;
          if(layer.text.trim() === '') {
            this.state.selectedLayerId = null;
            this.state.layers.splice(this.state.editedLayerId, 1);
          }

          // close editor
          this.state.editedLayerId = null;
          this.endEditText();
          this.reRenderCanvas();
          this.updateHistory();
          return;
        }

        // hide selection
        if(this.state.selectedLayerId !== null && selectedLayerId === null) {
          this.state.selectedLayerId = null;
          this.reRenderCanvas();
          return;
        }

        // add new text
        if(selectedLayerId === null) {
          this.addNewText(event);
          return;
        }

        // select other text
        if(this.state.selectedLayerId !== selectedLayerId) {
          const layer = this.state.layers[selectedLayerId] as TextLayer;
          this.state.textSettings = {
            color: layer.color,
            align: layer.align,
            frame: layer.frame,
            size: layer.size,
            font: layer.font
          };
          showImageText(this.settings, this.state, this.canvas, this.reRenderCanvas, this.updateHistory);

          this.state.selectedLayerId = selectedLayerId;
          this.reRenderCanvas();
          return;
        }

        // start moving
        const layer = this.state.layers[selectedLayerId] as TextLayer;
        this.movement.startMoving(event, this.state, selectedLayerId, () => {
          if(!layer.isMoved) {
            // start editor without moving
            this.state.editedLayerId = selectedLayerId;
            this.startEditText();
            this.reRenderCanvas();
          }
          this.updateHistory();
        });
        return;
      }
      case TabTypes.brush: {
        // start rotation
        if(this.state.selectedLayerId !== null && checkIsCorner(left, top, this.state.layers[this.state.selectedLayerId])) {
          this.rotation.startRotate(event, this.state, this.state.selectedLayerId, this.updateHistory);
          return;
        }

        const selectedLayerId = getSelectedLayerId(left, top, LayerTypes.brush, this.state);
        // start moving
        if(this.state.selectedLayerId !== null && this.state.selectedLayerId === selectedLayerId) {
          this.movement.startMoving(event, this.state, selectedLayerId, this.updateHistory);
          return;
        }

        // hide selection
        if(this.state.selectedLayerId !== null && selectedLayerId === null) {
          this.state.selectedLayerId = null;
          this.reRenderCanvas();
          return;
        }

        // select other selection
        if(selectedLayerId !== null) {
          this.state.selectedLayerId = selectedLayerId;
          const layer = this.state.layers[selectedLayerId] as BrushLayer;
          this.state.brushSettings = {
            style: layer.style,
            color: layer.color,
            size: layer.size
          };
          showImageBrushes(this.settings, this.state, this.brushIcons, this.reRenderCanvas, this.updateHistory);
          this.reRenderCanvas();
          return;
        }

        // add new layer
        if(selectedLayerId === null) {
          this.addNewPath(event);
        }

        return;
      }

      case TabTypes.stickers: {
        // start rotation
        if(this.state.selectedLayerId !== null && checkIsCorner(left, top, this.state.layers[this.state.selectedLayerId])) {
          this.rotation.startRotate(event, this.state, this.state.selectedLayerId, this.updateHistory);
          return;
        }

        const selectedLayerId = getSelectedLayerId(left, top, LayerTypes.sticker, this.state);

        // start moving
        if(this.state.selectedLayerId !== null && this.state.selectedLayerId === selectedLayerId) {
          this.movement.startMoving(event, this.state, selectedLayerId, this.updateHistory);
          return;
        }

        // hide selection
        if(this.state.selectedLayerId !== null && selectedLayerId === null) {
          this.state.selectedLayerId = null;
          this.reRenderCanvas();
          return;
        }

        // select other selection
        if(selectedLayerId !== null) {
          this.state.selectedLayerId = selectedLayerId;
          this.reRenderCanvas();
          return;
        }
      }
    }
  }

  private keydown(event: KeyboardEvent) {
    keydown(event, this.canvas, this.state, this.reRenderCanvas, this.updateHistory);
  }

  private keypress(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    keypress(event, this.canvas, this.state, this.reRenderCanvas)
  }

  private cursorAnimation(timeStamp: number) {
    if(!this.cursorAnimationTimer) {
      this.cursorAnimationTimer = timeStamp;
    }

    const diff = timeStamp - this.cursorAnimationTimer;
    if(diff >= CURSOR_ANIMATION_DELAY) {
      this.cursorAnimationTimer = null;
      const layer = this.state.layers[this.state.editedLayerId] as TextLayer;
      if(layer) {
        layer.needShowCursor = !layer.needShowCursor;
        this.reRenderCanvas();
      }
    }

    this.cursorAnimationFrame = window.requestAnimationFrame(this.cursorAnimation);
  }

  private startEditText() {
    window.addEventListener('keypress', this.keypress);
    this.cursorAnimationFrame = window.requestAnimationFrame(this.cursorAnimation);
  }

  private endEditText() {
    window.removeEventListener('keypress', this.keypress);
    window.cancelAnimationFrame(this.cursorAnimationFrame);
  }

  private addNewText(event: MouseEvent | TouchEvent) {
    const context = this.canvas.getContext('2d');
    const {left, top} = getEventPosition(event, this.canvas);
    const defaultText = '';

    const newText: TextLayer = {
      type: LayerTypes.text,
      text: defaultText,
      font: this.state.textSettings.font,
      size: this.state.textSettings.size,
      color: this.state.textSettings.color,
      align: this.state.textSettings.align,
      frame: this.state.textSettings.frame,
      cursorPosition: defaultText.length,
      needShowCursor: true,
      angle: 0,
      left,
      top
    };

    const {width, height} = getTextBoundary(newText, context);
    newText.width = width;
    newText.height = height;

    this.state.layers.push(newText);
    this.state.selectedLayerId = this.state.layers.length - 1;
    this.state.editedLayerId = this.state.layers.length - 1;

    this.startEditText();
    this.reRenderCanvas();
  }

  private addNewPath(event: MouseEvent | TouchEvent) {
    const {left, top} = getEventPosition(event, this.canvas);

    const newPath: BrushLayer = {
      type: LayerTypes.brush,
      points: [],
      color: this.state.brushSettings.color,
      size: this.state.brushSettings.size,
      style: this.state.brushSettings.style,
      left: left,
      top: top,
      angle: 0,
      width: 0,
      height: 0
    };

    this.state.layers.push(newPath);
    this.brushDrawing.startDrawing(event, newPath, () => {
      const {width, height, left, top} = getBrushPathBoundary(newPath);
      const dleft = newPath.left - left;
      const dtop = newPath.top - top;

      newPath.width = width;
      newPath.height = height;
      newPath.left = left;
      newPath.top = top;
      newPath.isMoved = false;

      newPath.points.forEach((point) => {
        point[0] += dleft;
        point[1] += dtop;
      });

      this.updateHistory();
      this.reRenderCanvas();
    });
  }

  private addSticker(event: {target: Element | EventTarget}) {
    const createSticker = (image: HTMLImageElement, docId: string)=> {
      const aspectRatio = image.width / image.height;
      const width = DEFAULT_STICKER_SIZE;
      const height = width / aspectRatio;

      this.stickers[docId] = image;

      const newSticker: StickerLayer = {
        type: LayerTypes.sticker,
        data: docId,
        top: (this.canvas.offsetHeight -  height) / 2,
        left: (this.canvas.offsetWidth - width) / 2,
        width,
        height,
        angle: 0,
        size: 0
      };

      this.state.layers.push(newSticker);
      this.updateHistory();
      this.reRenderCanvas();
    }

    if(event.target instanceof HTMLImageElement) {
      const image = new Image();
      image.src = event.target.currentSrc;
      image.onload = () => createSticker(image, image.src.split('/').pop());
    } else if(event.target instanceof HTMLCanvasElement) {
      const stickerCanvas = event.target;
      stickerCanvas.toBlob((blob) => {
        const image = new Image();
        image.src = URL.createObjectURL(blob);
        image.onload = () => createSticker(image, image.src.split('/').pop());
      })
    }
  }

  private updateHistory() {
    this.prevSteps.push(structuredClone(this.state));
    this.undoBtn.removeAttribute('disabled');

    this.nextSteps = [];
    this.redoBtn.setAttribute('disabled', 'true');
  }

  private undo() {
    if(this.prevSteps.length < 2) {
      return;
    }

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
    if(this.nextSteps.length === 0) {
      return;
    }

    this.state = structuredClone(this.nextSteps.pop());
    this.prevSteps.push(structuredClone(this.state));

    this.onSelectTab(this.prevTabId, true);
    this.reRenderCanvas();

    this.undoBtn.removeAttribute('disabled');

    if(this.nextSteps.length === 0) {
      this.redoBtn.setAttribute('disabled', 'true');
    }
  }

  private changePreview(type: PreviewTypes) {
    this.preview.replaceChildren(type === PreviewTypes.crop ? this.cropPreview : this.canvas);
  }

  private createTabs() {
    const tabsContainer = document.createElement('div');
    tabsContainer.classList.add('search-super-tabs-container', 'tabs-container', 'image-editor-sidebar-settings-tabs');

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

    this.selectedTab = horizontalMenu(tabs, tabsContainer, (id) => this.onSelectTab(id));
    this.selectedTab(TabTypes.filters);
  }

  private onSelectTab(id: number, force = false) {
    const tabType = TABS[id].type;

    if(id === this.prevTabId && !force) {
      return;
    }

    // go from text tab
    if(this.prevTabId === TabTypes.text) {
      this.state.editedLayerId = null;
      this.state.selectedLayerId = null;
      this.reRenderCanvas();
      this.endEditText();
      window.removeEventListener('keydown', this.keydown);
    }

    // go from crop tab
    if(this.prevTabId === TabTypes.crop) {
      this.changePreview(PreviewTypes.canvas);
      this.state.cropper = {
        ...this.state.cropper,
        ...this.cropper.getParams()
      };
      this.updateHistory();
      this.cropper.removeHandlers();
      this.reRenderCanvas();
    }

    // go from brush tab
    if(this.prevTabId === TabTypes.brush) {
      this.state.selectedLayerId = null;
      this.reRenderCanvas();
      window.removeEventListener('keydown', this.keydown);
    }

    // go from stickers tab
    if(this.prevTabId === TabTypes.stickers) {
      this.state.selectedLayerId = null;
      this.reRenderCanvas();
      window.removeEventListener('keydown', this.keydown);
    }

    switch(tabType) {
      case TabTypes.filters:
        showImageFilters(this.settings, this.state, this.reRenderCanvas, this.updateHistory);
        break;
      case TabTypes.crop:
        this.changePreview(PreviewTypes.crop);

        if(this.cropper) {
          this.cropper.removeHandlers();
        }

        this.cropPreview.append(this.image);
        this.cropper = imageCropper(this.image, this.state.cropper);
        showImageCrop(this.settings, this.cropper, this.state);
        break;
      case TabTypes.text:
        window.addEventListener('keydown', this.keydown);
        showImageText(this.settings, this.state, this.canvas, this.reRenderCanvas, this.updateHistory);
        break;
      case TabTypes.brush:
        window.addEventListener('keydown', this.keydown);
        showImageBrushes(this.settings, this.state, this.brushIcons, this.reRenderCanvas, this.updateHistory);
        break;
      case TabTypes.stickers:
        window.addEventListener('keydown', this.keydown);
        !force && showImageStickers(this.settings, this.managers, this.addSticker);
        break;
    }

    this.prevTabId = id;
  }

  private closeEditor(files: File[]) {
    this.preview.classList.remove('image-editor-preview-showed');

    this.cropper?.removeHandlers();
    this.movement?.removeHandlers();

    this.canvas.removeEventListener('mousedown', this.selectCanvasLayer);
    this.canvas.removeEventListener('touchstart', this.selectCanvasLayer);
    window.removeEventListener('resize', this.resizeWindow);

    this.endEditText();

    // open NewMedia popout
    setTimeout(() => {
      this.preview.remove();
      PopupElement.createPopup(PopupNewMedia, appImManager.chat, files, 'media');
    }, OPEN_NEW_MEDIA_POPOUT_DELAY);
  }

  private createDoneBtn() {
    const btnDone = ButtonCorner({icon: 'check', className: 'is-visible'});
    this.content.append(btnDone);

    attachClickEvent(btnDone, (e) => {
      if(this.prevTabId === TabTypes.crop) {
        this.state.cropper = {
          ...this.state.cropper,
          ...this.cropper.getParams()
        };
      }

      this.state.selectedLayerId = null;
      this.state.editedLayerId = null;
      this.reRenderCanvas();

      this.canvas.toBlob((blob) => {
        const newFilesList = [...this.allFiles];
        const newFile = new File([blob], this.initFile.name, {type: this.initFile.type});
        newFilesList[this.fileIndex] = newFile;
        this.closeEditor(newFilesList);
        this.close();
      }, this.initFile.type, 1);
    });
  }

  private getBrushIcons() {
    // load brush images from .svg files
    for(const {style, iconUrl, defaultColor} of BRUSHES) {
      fetch(iconUrl)
      .then((res) => res.text())
      .then((text) => {
        if(defaultColor) {
          text = replaceBrushColorOnText(text, defaultColor);
        }

        this.brushIcons[style] = {text, color: defaultColor};
        return textToSvgURL(text);
      })
      .then((url) => {
        this.brushIcons[style].url = url;
      });
    }
  }

  private resizeWindow() {
    const width = window.innerWidth;
    const tabsContainer = this.content.getElementsByClassName('image-editor-sidebar-settings-tabs')[0];

    // small size
    if(width < RESIZE_WINDOW_SMALL_SIZE_WIDTH &&
      this.preview.parentElement === document.getElementById('main-columns')
    ) {
      this.preview.remove();
      tabsContainer.prepend(this.preview);
      this.container.classList.add('image-editor-sidebar--small');
      return;
    }

    // full screen
    if(width >= RESIZE_WINDOW_SMALL_SIZE_WIDTH && this.preview.parentElement === tabsContainer) {
      this.preview.remove();
      const sidebar =  document.getElementById('column-right');
      document.getElementById('main-columns').insertBefore(this.preview, sidebar);
      this.container.classList.remove('image-editor-sidebar--small');
      return;
    }
  }
}