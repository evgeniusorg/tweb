import appSidebarLeft from '../../../../sidebarLeft';
import StickersTab from '../../../../emoticonsDropdown/tabs/stickers';
import appImManager from '../../../../../lib/appManagers/appImManager';
import LazyLoadQueue from '../../../../lazyLoadQueue';
import {AppManagers} from '../../../../../lib/appManagers/managers';

export function showImageStickers(
  element: HTMLElement,
  managers: AppManagers,
  addSticker: (event: {target: Element | EventTarget}) => void
) {
  const stickersSettings = document.createElement('div');
  stickersSettings.classList.add('image-editor-settings-stickers')

  const pseudoEmoticonsDropdown = stickersSettings;
  // @ts-ignore
  stickersSettings.lazyLoadQueue = new LazyLoadQueue(1);
  // @ts-ignore
  stickersSettings.element = stickersSettings;
  // @ts-ignore
  stickersSettings.intersectionOptions = () => ({root : stickersSettings});
  // @ts-ignore
  stickersSettings.chatInput = appImManager.chat.input;
  // @ts-ignore
  stickersSettings.isActive = () => true;
  // @ts-ignore
  stickersSettings.addLazyLoadQueueRepeat = () => {};
  // @ts-ignore
  stickersSettings.onMediaClick = addSticker;

  const stickersTab = new StickersTab(managers);
  // @ts-ignore
  stickersTab.emoticonsDropdown = pseudoEmoticonsDropdown;
  stickersTab.getContainerSize = () => ({
    width: appSidebarLeft.rect.width,
    height: 400
  });

  stickersTab.init();
  stickersTab.onOpened();
  stickersTab.container.classList.add('active');

  stickersSettings.append(stickersTab.container);
  element.replaceChildren(stickersSettings);
}
