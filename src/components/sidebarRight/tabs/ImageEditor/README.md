# Image Editor

## Author
This part of project was created by <b>Eugene Chugunov</b> (a leader of the frontend developers 
team in the Russian social network [vk.com](https://vk.com)). 

More information: [euchu.ru](https://euchu.ru).

Contacts: [@echugunov](https://t.me/echugunov).

## Description
<b>Image Editor</b> is part of the telegram web application. In this 
section user can modify the attached image. He can crop the image, 
set various filters and add texts, lines and stickers.

## Done
1. Added custom font for new icons.
2. Moved RangeSettingSelector to common components:
   1. Added color for selected value;
   2. Added start to center;
   3. Added custom color.
3. Added menu for image/video on newMedia popout:
   1. Image editor (for photo);
   2. Spoiler;
   3. File deletion.
4. Added right sidebar for image editor.
5. Added preview of image for image editor.
6. Added cropper of image:
   1. All cropper formats;
   2. History of changes.
7. Added filters for image:
   1. Added "Brightness", "Contrast", "Saturation" filters;
   2. History of changes.
8. Added text layers:
   1. Text can have several lines (pres 'Shift' + 'Enter');
   2. Each text layer can be selected;
   3. Added animated cursor;
   4. Selected layer can be changed (edit, text size, align, frame, color, font);
   5. Selected layer can be moved and rotated;
   6. Selected layer can be removed (press 'del', 'backspace'),
   7. History of changes.
9. Added drawing by brushes (except eraser):
   1. Each brush layer can be selected;
   2. Selected layer can be changed (size, color, brush type);
   3. Selected layer can be moved and rotated;
   4. Selected layer can be removed (press 'del', 'backspace');
   5. Each brush image changes color after selection of new color,
   6. History of changes.
10. Added selector of stickers:
    1. Each sticker layer can be selected;
    2. Selected layer can be moved and rotated;
    3. Selected layer can be removed (press 'del', 'backspace'),
    4. History of changes.
11. Resizing window:
    1. Resizing cropper area;
    2. Moving image preview to right sidebar for small windows.

## TODO
1. Add all image filters.
2. Add rotation and flip of image on cropper tab. 
3. Add "Blur" and "Eraser" brushes. 
4. Add selector of custom color for text and brush. 
5. Add resizing of stickers. 
6. Refactoring of color frame for text layer. 
7. Refactoring of StickersTab class (remove emoticonsDropdown).
8. Refactoring render of "Brush".
