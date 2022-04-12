import { mirror } from '@mood/snapshot';
import { SourceType } from '../constant';

export type StyleSheetDeleteRule = {
  index: number;
};

export type StyleSheetAddRule = {
  rule: string;
  index?: number;
};

export type SubscribeToStyleSheetArg = {
  id: number;
  source: SourceType.STYLE_SHEETRULE;
  removes?: StyleSheetDeleteRule[];
  adds?: StyleSheetAddRule[];
};

export type SubscribeToStyleSheetEmit = (arg: SubscribeToStyleSheetArg) => void;

export function subscribeToStyleSheet(cb: SubscribeToStyleSheetEmit) {
  const insertRule = CSSStyleSheet.prototype.insertRule;
  CSSStyleSheet.prototype.insertRule = function (rule: string, index?: number) {
    const id = mirror.getId(this.ownerNode);
    id &&
      cb({
        id,
        source: SourceType.STYLE_SHEETRULE,
        adds: [{ rule, index }]
      });
    return insertRule.apply(this, [rule, index]);
  };

  const deleteRule = CSSStyleSheet.prototype.deleteRule;
  CSSStyleSheet.prototype.deleteRule = function (index: number) {
    const id = mirror.getId(this.ownerNode);
    id &&
      cb({
        source: SourceType.STYLE_SHEETRULE,
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
