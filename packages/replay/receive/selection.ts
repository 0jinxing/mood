import { SelectionParams } from '@mood/record';
import { mirror } from '@mood/snapshot';
import { each } from '@mood/utils';
import { RecHandler } from '../types';
import { chunk } from '../utils/chunk';

export const recSelection: RecHandler<SelectionParams> = (event, context) => {
  const $doc = context.$iframe.contentDocument!;

  const ranges = chunk(event.ranges, 4).map(([sId, sOffset, eId, eOffset]) => {
    const $start = mirror.getNode(sId);
    const $end = mirror.getNode(eId);

    if (!$start || !$end) return;

    const result = new Range();

    result.setStart($start, sOffset);
    result.setEnd($end, eOffset);

    return result;
  });

  const selection = $doc.getSelection();
  selection?.removeAllRanges();

  each(ranges, r => {
    r && selection?.addRange(r);
  });
};
