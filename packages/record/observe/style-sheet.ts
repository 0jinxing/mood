import { hookMethod } from '@mood/utils';
import { ObserveHandler, SourceTypes } from '../types';

export type StyleSheetDeleteRule = {
  index: number;
};

export type StyleSheetAddRule = {
  rule: string;
  index?: number;
};

export type StyleSheetEmitArg = {
  id: number;
  source: SourceTypes.STYLE_SHEETRULE;
  removes?: StyleSheetDeleteRule[];
  adds?: StyleSheetAddRule[];
};

export const observeStyleSheet: ObserveHandler<StyleSheetEmitArg> = (cb, { mirror }) => {
  const proto = CSSStyleSheet.prototype;

  const insertHoc = hookMethod(proto, 'insertRule', function (_, rule: string, index?: number) {
    const id = mirror.getId(this.ownerNode);
    if (!id) return;
    cb({ id, source: SourceTypes.STYLE_SHEETRULE, adds: [{ rule, index }] });
  });

  const deleteHoc = hookMethod(proto, 'deleteRule', function (_, index: number) {
    const id = mirror.getId(this.ownerNode);
    if (!id) return;

    cb({ source: SourceTypes.STYLE_SHEETRULE, id, removes: [{ index }] });
  });

  return () => {
    insertHoc();
    deleteHoc();
  };
};
