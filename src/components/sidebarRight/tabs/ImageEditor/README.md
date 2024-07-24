# Image Editor

## Description


## Done
1. Added custom font for new icons (script "generate-icons" doesn't work for me).
2. Moved RangeSettingSelector to common components:
   1. Added color for selected value;
   2. Added start to center.
3. Added menu for image/video on newMedia popout:
   1. Image editor (for photo);
   2. Spoiler;
   3. Deleting file.
4. Added right sidebar for image editor.
5. Added preview of image for image editor.
6. Added cropper of image.
7. Added 3 filters for image (brightness, contrast, saturation).
8. Added text layers:
   1. Text can have several lines (pres 'Shift' + 'Enter');
   2. Each text layer can be selected;
   3. Added animated cursor;
   4. Selected layer can be changed (edit, text size, align, frame, color, font);
   5. Selected layer can be moved;
   6. Selected layer can be removed (press 'del', 'backspace').
9. Added drawing by brushes (except eraser):
   1. Each brush layer can be selected;
   2. Selected layer can be changed (size, color, brush type);
   3. Selected layer can be moved;
   4. Selected layer can be removed (press 'del', 'backspace').
10. Added selector of stickers:
    1. Each sticker layer can be selected;
    2. Selected layer can be moved;
    3. Selected layer can be removed (press 'del', 'backspace').

## TODO
1. Add all image filters.
2. Add rotation and flip of image on cropper tab.
3. Add history of changes on cropper tab.
4. Add rotation for layers. 
5. Add all brushes. 
6. Add selector of custom color for text and brush. 
7. Add custom color for RangeSettingSelector. 
8. Refactoring of color frame for text layer. 
9. Resizing window 
10. Refactoring of StickersTab class (remove emoticonsDropdown)
