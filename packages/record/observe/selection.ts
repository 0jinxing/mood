import { on } from '@mood/utils';
import { ObserveHandler, SourceTypes } from '../types';

export type SelectionEmitArg = {
  source: SourceTypes.SELECTION;
  ranges: number[];
};

export const observeSelection: ObserveHandler<SelectionEmitArg> = (cb, { mirror }) => {
  let collapsed = true;

  const updateSelection = () => {
    const selection = document.getSelection();

    if (!selection || (collapsed && selection?.isCollapsed)) return;

    collapsed = selection.isCollapsed || false;

    const ranges = [];
    const count = selection.rangeCount || 0;

    for (let i = 0; i < count; i++) {
      const range = selection.getRangeAt(i);

      const { startContainer, startOffset, endContainer, endOffset } = range;

      ranges.push(mirror.getId(startContainer), startOffset, mirror.getId(endContainer), endOffset);
    }

    cb({ source: SourceTypes.SELECTION, ranges });
  };

  return on(document, 'selectionchange', updateSelection);
};
