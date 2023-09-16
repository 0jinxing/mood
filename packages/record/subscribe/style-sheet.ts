import { mirror } from '@mood/snapshot';
import { hookMethod } from '@mood/utils';
import { SourceTypes } from '../types';

export type StyleSheetDeleteRule = {
  index: number;
};

export type StyleSheetAddRule = {
  rule: string;
  index?: number;
};

export type SubscribeToStyleSheetArg = {
  id: number;
  source: SourceTypes.STYLE_SHEETRULE;
  removes?: StyleSheetDeleteRule[];
  adds?: StyleSheetAddRule[];
};

export type SubscribeToStyleSheetEmit = (arg: SubscribeToStyleSheetArg) => void;

export function subscribeToStyleSheet(cb: SubscribeToStyleSheetEmit) {
  const proto = CSSStyleSheet.prototype;

  const insertHoc = hookMethod(proto, 'insertRule', (rule: string, index?: number) => {
    const id = mirror.getId(this.ownerNode);
    if (!id) return;
    cb({ id, source: SourceTypes.STYLE_SHEETRULE, adds: [{ rule, index }] });
  });

  const deleteHoc = hookMethod(proto, 'deleteRule', (index: number) => {
    const id = mirror.getId(this.ownerNode);
    if (!id) return;

    cb({ source: SourceTypes.STYLE_SHEETRULE, id, removes: [{ index }] });
  });

  return () => {
    insertHoc();
    deleteHoc();
  };
}
