import { StyleSheetEmitArg } from '@mood/record';
import { mirror } from '@mood/snapshot';
import { each } from '@mood/utils';
import { ReceiveHandler } from '../types';

export const receiveToStyleSheet: ReceiveHandler<StyleSheetEmitArg> = event => {
  const $target = mirror.getNode<HTMLStyleElement>(event.id);
  if (!$target) return;

  const sheet = $target.sheet;

  if (!sheet) return;

  const { adds, removes } = event;

  removes && each(removes, ({ index }) => sheet.deleteRule(index));

  if (!adds) return;

  each(adds, ({ rule, index }) => {
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
