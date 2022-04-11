import { mirror } from '@mood/snapshot';
import { SOURCE } from '../constant';
import { on } from '../utils';

export type SelectionParams = {
  source: SOURCE.SELECTION;
  ranges: number[];
};

export type SelectionCallback = (params: SelectionParams) => void;

export function subSelection(cb: SelectionCallback) {
  let collapsed = true;

  const updateSelection = () => {
    const selection = document.getSelection();

    if (!selection) return;
    if (collapsed && selection?.isCollapsed) return;

    collapsed = selection.isCollapsed || false;

    const ranges = [];
    const count = selection.rangeCount || 0;

    for (let i = 0; i < count; i++) {
      const range = selection.getRangeAt(i);

      const { startContainer, startOffset, endContainer, endOffset } = range;

      ranges.push(
        mirror.getId(startContainer),
        startOffset,
        mirror.getId(endContainer),
        endOffset
      );
    }

    cb({ source: SOURCE.SELECTION, ranges });
  };

  return on('selectionchange', updateSelection);
}
