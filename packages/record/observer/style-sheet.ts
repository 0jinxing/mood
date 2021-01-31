import { mirror, TNode } from '@mood/snapshot';
import { IncrementalSource } from '../constant';

export type StyleSheetDeleteRule = {
  index: number;
};

export type StyleSheetAddRule = {
  rule: string;
  index?: number;
};

export type StyleSheetData = {
  source: IncrementalSource.STYLE_SHEETRULE;
  id: number;
  removes?: StyleSheetDeleteRule[];
  adds?: StyleSheetAddRule[];
};

export type StyleSheetCb = (param: StyleSheetData) => void;

export function styleSheetObserve(cb: StyleSheetCb) {
  const insertRule = CSSStyleSheet.prototype.insertRule;
  CSSStyleSheet.prototype.insertRule = function (rule: string, index?: number) {
    const id = mirror.getId(this.ownerNode as Node | TNode);
    id &&
      cb({
        source: IncrementalSource.STYLE_SHEETRULE,
        id,
        adds: [{ rule, index }]
      });
    return insertRule.apply(this, [rule, index]);
  };

  const deleteRule = CSSStyleSheet.prototype.deleteRule;
  CSSStyleSheet.prototype.deleteRule = function (index: number) {
    const id = mirror.getId(this.ownerNode as TNode);
    id &&
      cb({
        source: IncrementalSource.STYLE_SHEETRULE,
        id,
        removes: [{ index }]
      });
    return deleteRule.apply(this, [index]);
  };

  return () => {
    CSSStyleSheet.prototype.insertRule = insertRule;
    CSSStyleSheet.prototype.deleteRule = deleteRule;
  };
}
