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
import {BrushLayer, State, TextLayer} from './types';
import {
  BrushTypes,
  CANVAS_BORDER_PADDING,
  CANVAS_BRUSH_SIZE_DEFAULT,
  CANVAS_FONT_SIZE_DEFAULT,
  Colors,
  CropperFormatTypes,
  FONTS,
  LayerTypes,
  PreviewTypes,
  TABS,
  TabTypes,
  TextAlign,
  TextFrame
} from './constants';
import layerMovement from './actions/layerMovement';
import {renderBrush, renderCroppedImage, renderFilters, renderText, resizeTextBoundary} from './actions/render';
import {showImageFilters} from './settings/filters';
import {showImageCrop} from './settings/crop';
import {showImageText} from './settings/text';
import {showImageEmojis} from './settings/emoji';
import {showImageBrushes} from './settings/brush';
import imageCropper from './actions/cropper';

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
  private movement: any;
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
        type: BrushTypes.pen,
        color: Colors.white,
        size: CANVAS_BRUSH_SIZE_DEFAULT
      },
      cropImage: null
    }
    this.prevSteps = [];
    this.nextSteps = [];

    // settings
    this.settings = document.createElement('div');
    this.settings.classList.add('image-editor-settings');
    this.scrollable.append(this.settings);

    // clone of selected file
    this.initFile = this.allFiles[fileIndex];

    this.keypress = this.keypress.bind(this);
    this.keydown = this.keydown.bind(this);
    this.selectCanvasLayer = this.selectCanvasLayer.bind(this);
    this.reRenderCanvas = this.reRenderCanvas.bind(this);
    this.onSelectTab = this.onSelectTab.bind(this);
    this.updateHistory = this.updateHistory.bind(this);
    this.updateCropperHistory = this.updateCropperHistory.bind(this);

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
    this.canvas.addEventListener('mousedown', this.selectCanvasLayer, false);
    this.canvas.addEventListener('touchstart', this.selectCanvasLayer, false);
    this.movement = layerMovement(this.canvas, this.reRenderCanvas);

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
          degree: 0,
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
          return renderText(this.canvas, layer as TextLayer, this.state.selectedLayerId === index, this.state.editedLayerId === index);
        case LayerTypes.brush:
          return renderBrush(this.canvas, layer as BrushLayer, this.state.selectedLayerId === index);
      }
    });
  }

  private selectCanvasLayer(e: MouseEvent | TouchEvent) {
    const x = e.offsetX;
    const y = e.offsetY;

    let selectedLayerId: number = null;

    for(let i = this.state.layers.length - 1; i >= 0; i--) {
      const layer = this.state.layers[i];
      if(
        x < layer.left - CANVAS_BORDER_PADDING ||
        x > layer.left + layer.width + CANVAS_BORDER_PADDING
      ) continue;

      if(
        y < layer.top - layer.size * 0.9 - CANVAS_BORDER_PADDING ||
        y > layer.top - layer.size * 0.9 + layer.height + CANVAS_BORDER_PADDING
      ) continue;

      selectedLayerId = i;
      break;
    }

    switch(this.prevTabId) {
      case TabTypes.filters:
        return;
      case TabTypes.text: {
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
          this.addNewText(e);
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
          showImageText(this.settings, this.state, this.canvas, this.reRenderCanvas);

          this.state.selectedLayerId = selectedLayerId;
          this.reRenderCanvas();
          return;
        }

        // start moving
        this.state.layers[selectedLayerId].isMoved = false;
        this.movement.startMoving(e, this.state, selectedLayerId, () => {
          if(!this.state.layers[selectedLayerId].isMoved) {
            // start editor without moving
            this.state.editedLayerId = selectedLayerId;
            this.startEditText();
            this.reRenderCanvas();
          }
        });
      }
      case TabTypes.brush: {
        return;
      }

      case TabTypes.emoji: {
        return;
      }
    }
  }

  private keydown(event: KeyboardEvent) {
    const context = this.canvas.getContext('2d');
    const layer = this.state.layers[this.state.editedLayerId] as TextLayer;

    if(event.key.toLowerCase() === 'backspace') {
      if(layer.cursorPosition === 0) return;

      let deletedCharNumber = 1
      if(layer.cursorPosition > 1 && layer.text.slice(layer.cursorPosition - 2, layer.cursorPosition) === '/n')
        deletedCharNumber = 2

      layer.text = layer.text.slice(0, layer.cursorPosition - deletedCharNumber) + layer.text.slice(layer.cursorPosition)
      layer.cursorPosition -= deletedCharNumber
    }

    if(event.key.toLowerCase() === 'arrowleft') {
      const steps = layer.cursorPosition > 1 && layer.text.slice(layer.cursorPosition - 2, layer.cursorPosition) === '/n' ? 2 : 1
      layer.cursorPosition -= steps;
    }

    if(event.key.toLowerCase() === 'arrowright') {
      const steps = layer.text.slice(layer.cursorPosition, layer.cursorPosition + 2) === '/n' ? 2 : 1
      if(layer.text.length <= layer.cursorPosition) return;
      layer.cursorPosition += steps;
    }

    const {width, height} = resizeTextBoundary(layer, context);
    layer.width = width;
    layer.height = height;

    this.reRenderCanvas();
  }

  private keypress(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();

    const context = this.canvas.getContext('2d');
    const layer = this.state.layers[this.state.editedLayerId] as TextLayer;

    if(event.key.toLowerCase() === 'enter') {
      layer.text = layer.text.slice(0, layer.cursorPosition) + '/n' + layer.text.slice(layer.cursorPosition)
      layer.cursorPosition += 2;
    } else {
      let char = String.fromCharCode(event.keyCode)

      if(!char && char !== ' ') return
      if(!event.shiftKey) char = char.toLowerCase()

      layer.text =
        layer.text.slice(0, layer.cursorPosition) + char + layer.text.slice(layer.cursorPosition)
      layer.cursorPosition += 1
    }

    const {width, height} = resizeTextBoundary(layer, context);
    layer.width = width;
    layer.height = height;

    this.reRenderCanvas();
  }

  private startEditText() {
    window.addEventListener('keypress', this.keypress);
    window.addEventListener('keydown', this.keydown);
  }

  private endEditText() {
    window.removeEventListener('keypress', this.keypress);
    window.removeEventListener('keydown', this.keydown);
  }

  private addNewText(event: MouseEvent | TouchEvent) {
    const context = this.canvas.getContext('2d');
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
      left: event.offsetX,
      top: event.offsetY
    };

    const {width, height} = resizeTextBoundary(newText, context);
    newText.width = width;
    newText.height = height;

    this.state.layers.push(newText);
    this.state.selectedLayerId = this.state.layers.length - 1;
    this.state.editedLayerId = this.state.layers.length - 1;

    this.startEditText();
    this.reRenderCanvas();
  }

  private addNewPath() {

  }

  private updateHistory() {
    this.prevSteps.push(structuredClone(this.state));
    this.undoBtn.removeAttribute('disabled');

    this.nextSteps = [];
    this.redoBtn.setAttribute('disabled', 'true');
  }

  private updateCropperHistory() {
    this.state.cropper = {
      ...this.state.cropper,
      ...this.cropper.getParams()
    };
    this.updateHistory();
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

    this.cropper?.removeHandlers();
    this.movement?.removeHandlers();

    this.canvas.removeEventListener('mousedown', this.selectCanvasLayer, false);
    this.canvas.removeEventListener('touchstart', this.selectCanvasLayer, false);

    this.endEditText();

    setTimeout(() => {
      this.preview.remove();
      PopupElement.createPopup(PopupNewMedia, appImManager.chat, files, 'media');
    }, 300);
  }

  private changePreview(type: PreviewTypes) {
    this.preview.replaceChildren(type === PreviewTypes.crop ? this.cropPreview : this.canvas);
  }

  private onSelectTab(id: number, force = false) {
    const tabType = TABS[id].type;

    if(id === this.prevTabId && !force) {
      return;
    }

    if(this.prevTabId === TabTypes.text) {
      this.state.editedLayerId = null;
      this.state.selectedLayerId = null;
      this.reRenderCanvas();
      this.endEditText();
    }

    if(this.prevTabId === TabTypes.crop) {
      this.changePreview(PreviewTypes.canvas);
      this.state.cropper = {
        ...this.state.cropper,
        ...this.cropper.getParams()
      };
      this.cropper.removeHandlers();
      this.reRenderCanvas();
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
        this.cropper = imageCropper(this.image, this.state.cropper, this.updateCropperHistory);
        showImageCrop(this.settings, this.cropper, this.state);
        break;
      case TabTypes.text:
        showImageText(this.settings, this.state, this.canvas, this.reRenderCanvas);
        break;
      case TabTypes.brush:
        showImageBrushes(this.settings, this.state, this.reRenderCanvas);
        break;
      case TabTypes.emoji:
        showImageEmojis(this.settings);
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

    this.selectedTab = horizontalMenu(tabs, tabsContainer, this.onSelectTab);
    this.selectedTab(TabTypes.filters);
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
}
