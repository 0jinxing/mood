import { mirror } from '@mood/snapshot';
import { IncSource } from '../constant';

export type StyleSheetDeleteRule = {
  index: number;
};

export type StyleSheetAddRule = {
  rule: string;
  index?: number;
};

export type StyleSheetParam = {
  source: IncSource.STYLE_SHEETRULE;
  id: number;
  removes?: StyleSheetDeleteRule[];
  adds?: StyleSheetAddRule[];
};

export type StyleSheetCallback = (param: StyleSheetParam) => void;

export function subStyleSheet(cb: StyleSheetCallback) {
  const insertRule = CSSStyleSheet.prototype.insertRule;
  CSSStyleSheet.prototype.insertRule = function (rule: string, index?: number) {
    const id = mirror.getId(this.ownerNode);
    id &&
      cb({
        source: IncSource.STYLE_SHEETRULE,
        id,
        adds: [{ rule, index }]
      });
    return insertRule.apply(this, [rule, index]);
  };

  const deleteRule = CSSStyleSheet.prototype.deleteRule;
  CSSStyleSheet.prototype.deleteRule = function (index: number) {
    const id = mirror.getId(this.ownerNode);
    id &&
      cb({
        source: IncSource.STYLE_SHEETRULE,
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
