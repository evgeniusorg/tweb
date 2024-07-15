import {TGICO_CLASS, TGICO_CUSTOM_CLASS} from '../helpers/tgico';
import Icons from '../icons';
import IconsCustom from '../iconsCustom';
import IconsReverse from '../iconsReverse';
import I18n from '../lib/langPack';

export function getIconContent(icon: Icon) {
  return String.fromCharCode(parseInt(Icons[icon], 16));
}

type IconCustom = keyof typeof IconsCustom;

export default function Icon(icon: Icon, ...classes: string[]) {
  const span = document.createElement('span');

  if(IconsCustom[icon as IconCustom]) {
    span.classList.add(TGICO_CUSTOM_CLASS/* ...tgico(icon) */, ...classes);
    span.textContent = String.fromCharCode(parseInt(IconsCustom[icon as IconCustom], 16));
    return span;
  }

  if(I18n.isRTL && IconsReverse.has(icon)) {
    classes.push('icon-reflect');
  }

  span.classList.add(TGICO_CLASS/* ...tgico(icon) */, ...classes);
  span.textContent = getIconContent(icon);
  return span;
}
