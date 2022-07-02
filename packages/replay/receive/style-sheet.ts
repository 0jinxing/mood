import { SubscribeToStyleSheetArg } from '@mood/record';
import { mirror } from '@mood/snapshot';
import { ReceiveHandler } from '../types';

export const receiveToStyleSheet: ReceiveHandler<SubscribeToStyleSheetArg> = event => {
  const $target = mirror.getNode<HTMLStyleElement>(event.id);
  if (!$target) return;

  const sheet = $target.sheet;

  if (!sheet) return;

  const { adds, removes } = event;

  removes && removes.forEach(({ index }) => sheet.deleteRule(index));

  if (!adds) return;

  adds.forEach(({ rule, index }) => {
    const insertIndex = index === undefined ? undefined : Math.min(index, sheet.cssRules.length);
    try {
      sheet.insertRule(rule, insertIndex);
    } catch (e) {
      /**
       * sometimes we may capture rules with browser prefix
       * insert rule with prefixs in other browsers may cause Error
       */
    }
  });
};
