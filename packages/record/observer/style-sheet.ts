import { mirror, TNode } from '@mood/snapshot';

export type StyleSheetDeleteRule = {
  index: number;
};

export type StyleSheetAddRule = {
  rule: string;
  index?: number;
};

export type StyleSheetCbParam = {
  id: number;
  removes?: StyleSheetDeleteRule[];
  adds?: StyleSheetAddRule[];
};

export type StyleSheetCb = (param: StyleSheetCbParam) => void;

function styleSheetObserve(cb: StyleSheetCb) {
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

export default styleSheetObserve;
