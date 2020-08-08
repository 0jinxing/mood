import { StyleSheetRuleCallback, ListenerHandler } from '../types';
import { mirror, TNode } from '@traps/snapshot';

function initStyleSheetObserver(cb: StyleSheetRuleCallback): ListenerHandler {
  const insertRule = CSSStyleSheet.prototype.insertRule;
  CSSStyleSheet.prototype.insertRule = function (rule: string, index?: number) {
    const id = mirror.getId(this.ownerNode as Node | TNode);
    id && cb({ id, adds: [{ rule, index }] });
    return insertRule.apply(this, [rule, index]);
  };

  const deleteRule = CSSStyleSheet.prototype.deleteRule;
  CSSStyleSheet.prototype.deleteRule = function (index: number) {
    const id = mirror.getId(this.ownerNode as TNode);
    id && cb({ id, removes: [{ index }] });
    return deleteRule.apply(this, [index]);
  };

  return () => {
    CSSStyleSheet.prototype.insertRule = insertRule;
    CSSStyleSheet.prototype.deleteRule = deleteRule;
  };
}

export default initStyleSheetObserver;
