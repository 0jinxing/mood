import { SubscribeToSelectionArg } from '@mood/record';
import { mirror } from '@mood/snapshot';
import { ReceiveHandler } from '../types';
import { chunk } from '../utils/chunk';

export const receiveToSelection: ReceiveHandler<SubscribeToSelectionArg> = (event, context) => {
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

  ranges.forEach(r => r && selection?.addRange(r));
};
