import { useState } from 'react';
import { CardData } from '../types/cardData';

export const useTextFormatting = (handleInput: (field: keyof CardData, value: string) => void) => {
  const [selectedText, setSelectedText] = useState<Range | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const handleTextSelect = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.formatting-popup')) {
      return;
    }

    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);

      if (selection.toString().trim().length > 0) {
        const rect = range.getBoundingClientRect();
        const popupWidth = 300;
        const windowWidth = window.innerWidth;

        let x = rect.left + window.scrollX;
        if (x + popupWidth > windowWidth + window.scrollX) {
          x = windowWidth + window.scrollX - popupWidth - 10;
        }
        if (x < window.scrollX) {
          x = window.scrollX + 10;
        }

        const y = rect.top + window.scrollY + rect.height;

        setPopupPosition({ x, y });
        setSelectedText(range);
        setShowPopup(true);
      } else {
        setShowPopup(false);
        setSelectedText(null);
        selection?.removeAllRanges();
      }
    } else {
      setShowPopup(false);
      setSelectedText(null);
      selection?.removeAllRanges();
    }
  };

  const applyFormatting = (style: Partial<CSSStyleDeclaration>) => {
    if (selectedText) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(selectedText);

      const range = selectedText;
      const commonAncestor = range.commonAncestorContainer;
      let targetElement: HTMLElement | null = null;

      if (commonAncestor.nodeType === Node.TEXT_NODE) {
        targetElement = commonAncestor.parentElement;
      } else if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
        targetElement = commonAncestor as HTMLElement;
      }

      if (targetElement && targetElement.tagName.toLowerCase() === 'span') {
        Object.assign(targetElement.style, style);
      } else {
        const span = document.createElement('span');
        range.surroundContents(span);
        Object.assign(span.style, style);
      }

      const parentP = targetElement?.closest('p');
      if (parentP) {
        const field = parentP.getAttribute('data-field') as keyof CardData;
        if (field) {
          handleInput(field, parentP.innerHTML);
        }
      }

      setShowPopup(false);
      setSelectedText(null);
      selection?.removeAllRanges();
    }
  };

  const removeFormatting = () => {
    if (!selectedText) return;

    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(selectedText);

    const range = selectedText;

    const parentP =
      range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? (range.commonAncestorContainer as HTMLElement).closest('p')
        : range.commonAncestorContainer.parentElement?.closest('p');
    if (!parentP) return;

    let currentNode: Node | null = range.startContainer;
    let targetSpan: HTMLElement | null = null;

    while (currentNode && currentNode !== parentP) {
      if (currentNode.nodeType === Node.ELEMENT_NODE && (currentNode as HTMLElement).tagName.toLowerCase() === 'span') {
        targetSpan = currentNode as HTMLElement;
        break;
      }
      currentNode = currentNode.parentNode;
    }

    if (targetSpan && range.intersectsNode(targetSpan)) {
      const rangeInSpan = document.createRange();
      rangeInSpan.selectNodeContents(targetSpan);
      const intersection = document.createRange();
      intersection.setStart(range.startContainer, range.startOffset);
      intersection.setEnd(range.endContainer, range.endOffset);

      if (
        rangeInSpan.compareBoundaryPoints(Range.START_TO_START, intersection) <= 0 &&
        rangeInSpan.compareBoundaryPoints(Range.END_TO_END, intersection) >= 0
      ) {
        const fragment = intersection.extractContents();
        const textContent = fragment.textContent || '';
        const textNode = document.createTextNode(textContent);

        intersection.insertNode(textNode);
        if (targetSpan.childNodes.length === 0) {
          targetSpan.parentNode?.removeChild(targetSpan);
        } else {
          const remainingContent = rangeInSpan.cloneContents();
          if (remainingContent.textContent && remainingContent.textContent.trim().length > 0) {
            targetSpan.parentNode?.replaceChild(remainingContent, targetSpan);
          }
        }
      }
    }

    const field = parentP.getAttribute('data-field') as keyof CardData;
    if (field) {
      handleInput(field, parentP.innerHTML);
    }

    setShowPopup(false);
    setSelectedText(null);
    selection.removeAllRanges();
  };

  const applyBold = () => {
    if (selectedText) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(selectedText);

      const range = selectedText;
      const startContainer = range.startContainer;
      let parentElement: HTMLElement | null = null;

      if (startContainer.nodeType === Node.TEXT_NODE) {
        parentElement = startContainer.parentElement;
      } else if (startContainer.nodeType === Node.ELEMENT_NODE) {
        parentElement = startContainer as HTMLElement;
      }

      const computedStyle = parentElement ? window.getComputedStyle(parentElement) : null;
      const currentFontWeight = computedStyle?.fontWeight;
      const newFontWeight = currentFontWeight === '700' || currentFontWeight === 'bold' ? 'normal' : 'bold';

      applyFormatting({ fontWeight: newFontWeight });
    }
  };

  const applyItalic = () => {
    if (selectedText) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(selectedText);

      const range = selectedText;
      const startContainer = range.startContainer;
      let parentElement: HTMLElement | null = null;

      if (startContainer.nodeType === Node.TEXT_NODE) {
        parentElement = startContainer.parentElement;
      } else if (startContainer.nodeType === Node.ELEMENT_NODE) {
        parentElement = startContainer as HTMLElement;
      }

      const computedStyle = parentElement ? window.getComputedStyle(parentElement) : null;
      const currentFontStyle = computedStyle?.fontStyle;
      const newFontStyle = currentFontStyle === 'italic' ? 'normal' : 'italic';

      applyFormatting({ fontStyle: newFontStyle });
    }
  };

  const applyUnderline = () => {
    if (selectedText) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(selectedText);

      const range = selectedText;
      const startContainer = range.startContainer;
      let parentElement: HTMLElement | null = null;

      if (startContainer.nodeType === Node.TEXT_NODE) {
        parentElement = startContainer.parentElement;
      } else if (startContainer.nodeType === Node.ELEMENT_NODE) {
        parentElement = startContainer as HTMLElement;
      }

      const computedStyle = parentElement ? window.getComputedStyle(parentElement) : null;
      const currentTextDecoration = computedStyle?.textDecorationLine || computedStyle?.textDecoration;
      const newTextDecoration = currentTextDecoration?.includes('underline') ? 'none' : 'underline';

      applyFormatting({ textDecoration: newTextDecoration });
    }
  };

  return {
    showPopup,
    popupPosition,
    handleTextSelect,
    applyBold,
    applyItalic,
    applyUnderline,
    removeFormatting,
    setFontSize: (size: string) => applyFormatting({ fontSize: `${size}px` }),
    setFontFamily: (font: string) => applyFormatting({ fontFamily: font }),
  };
};