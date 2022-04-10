import { StyleSheetParam } from '@mood/record';
import { mirror } from '@mood/snapshot';

export function receiveStyleSheet(event: StyleSheetParam) {
  const $target = mirror.getNode<HTMLStyleElement>(event.id);
  if (!$target) return;

  const sheet = $target.sheet;

  if (!sheet) return;

  if (event.adds) {
    event.adds.forEach(({ rule, index }) => {
      const insertIndex =
        index === undefined
          ? undefined
          : Math.min(index, sheet.cssRules.length);
      try {
        sheet.insertRule(rule, insertIndex);
      } catch (e) {
        /**
         * sometimes we may capture rules with browser prefix
         * insert rule with prefixs in other browsers may cause Error
         */
      }
    });
  }

  if (event.removes) {
    event.removes.forEach(({ index }) => sheet.deleteRule(index));
  }
}
