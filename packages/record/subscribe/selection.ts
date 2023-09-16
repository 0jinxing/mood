import { mirror } from '@mood/snapshot';
import { on } from '@mood/utils';
import { SourceTypes } from '../types';

export type SubscribeToSelectionArg = {
  source: SourceTypes.SELECTION;
  ranges: number[];
};

export type SubscribeToSelectionEmit = (arg: SubscribeToSelectionArg) => void;

export function subscribeToSelection(cb: SubscribeToSelectionEmit) {
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

  return on('selectionchange', updateSelection);
}
