import { hookMethod } from '@mood/utils';
import { ObserveFunc, ST } from '../types';

export type StyleSheetDeleteRule = {
  index: number;
};

export type StyleSheetAddRule = {
  rule: string;
  index?: number;
};

export type StyleSheetEmitArg = {
  id: number;
  source: ST.STYLE_SHEETRULE;
  removes?: StyleSheetDeleteRule[];
  adds?: StyleSheetAddRule[];
};

export const observeStyleSheet: ObserveFunc<StyleSheetEmitArg> = (cb, { mirror }) => {
  const proto = CSSStyleSheet.prototype;

  const insertHoc = hookMethod(proto, 'insertRule', function (_, rule: string, index?: number) {
    const id = mirror.getId(this.ownerNode);
    if (!id) return;
    cb({ id, source: ST.STYLE_SHEETRULE, adds: [{ rule, index }] });
  });

  const deleteHoc = hookMethod(proto, 'deleteRule', function (_, index: number) {
    const id = mirror.getId(this.ownerNode);
    if (!id) return;

    cb({ source: ST.STYLE_SHEETRULE, id, removes: [{ index }] });
  });

  return () => {
    insertHoc();
    deleteHoc();
  };
};
