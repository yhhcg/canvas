/**
 * Content flows vertically from top to bottom.
 * Need display an ellipsis ('…') to represent clipped text if text does not show up.
 */
class TextVertical {
  constructor(text, options) {
    const {
      fillStyle = '#000',
      fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
      fontSize = 12,
      fontWeight = 400,
      height,
      lineHeight = 14,
      width,
    } = options;

    if (width === void 0) {
      throw new Error('The width of TextVertical is required.');
    }
    if (height === void 0) {
      throw new Error('The height of TextVertical is required.');
    }

    /**
     * Create offscreen canvas.
     */
    const offscreen = window.document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offscreenCtx = offscreen.getContext('2d');
    offscreenCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    /**
     * The text baseline is the top of the em square.
     * Draw the text from top to bottom.
     */
    offscreenCtx.textBaseline = 'top';
    offscreenCtx.textAlign = 'center';
    offscreenCtx.fillStyle = fillStyle;

    /**
     * The x-axis coordinate of the point at which to begin drawing the text, in pixels.
     * If textAlign is "center", then the text's left edge will be at x - (textWidth / 2).
     */
    const x = width / 2;
    /**
     * Each character height.
     */
    const characters = text.split('');
    const characterHeights = characters.map((character) => {
      return offscreenCtx.measureText(character).width;
    });

    const coefficient = (lineHeight / fontSize);
    /**
     * Height is the sum of character height and space between two characters.
     */
    const heightTotal = characterHeights.reduce((accumulator, characterHeight, index) => {
      if (index !== characterHeights.length - 1) {
        return accumulator + characterHeight * coefficient;
      }
      return accumulator + characterHeight;
    }, 0);

    const isNeedEllipsis = heightTotal > height;

    if (!isNeedEllipsis) {
      /**
       * Text centered vertically.
       */
      const startY = (height - heightTotal) / 2;
      let y = startY;
      characters.forEach((character, index) => {
        offscreenCtx.fillText(character, x, y);
        y += characterHeights[index] * coefficient;
      });
    } else {
      let endIndex = 0;
      let drawHeightTotal = 0;
      /**
       * Ellipsis height.
       */
      const ellipsisHeight = offscreenCtx.measureText('...').width;
      characterHeights.reduce((accumulator, characterHeight, index) => {
        /**
         * Draw the last character if the sum of the previous stop characters
         * and current character and ellipsis is large canvas height.
         */
        if (endIndex === 0 && Math.ceil(accumulator + characterHeight + ellipsisHeight) > height) {
          /**
           * Because the slice method is used below.
           */
          endIndex = index;
          /**
           * Space is the distance betweem two characters.
           * Don't draw the space between the last character and ellipsis.
           */
          const space = characterHeight * coefficient - characterHeight;
          drawHeightTotal = Math.ceil(accumulator + ellipsisHeight - space);
        }
        return accumulator + characterHeight * coefficient;
      }, 0);

      const startY = (height - drawHeightTotal) / 2;
      let y = startY;
      /**
       * Don't include the endIndex.
       */
      characters.slice(0, endIndex).forEach((character, index) => {
        offscreenCtx.fillText(character, x, y);
        if (index !== endIndex - 1) {
          y += characterHeights[index] * coefficient;
        }
      });
      offscreenCtx.fillText('...', x, y + characterHeights[endIndex - 1]);
    }

    const newImg = document.createElement('img');
    newImg.src = offscreen.toDataURL();
    return newImg;
  }
}

window.TextVertical = TextVertical;
