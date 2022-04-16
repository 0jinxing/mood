import { mirror } from '@mood/snapshot';
import { SourceType } from '../types';
import { hookMethod } from '../utils';

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
  const proto = CSSStyleSheet.prototype;

  const insertHoc = hookMethod(
    proto,
    'insertRule',
    (rule: string, index?: number) => {
      const id = mirror.getId(this.ownerNode);
      if (!id) return;
      cb({ id, source: SourceType.STYLE_SHEETRULE, adds: [{ rule, index }] });
    }
  );

  const deleteHoc = hookMethod(proto, 'deleteRule', (index: number) => {
    const id = mirror.getId(this.ownerNode);
    if (!id) return;
    cb({ source: SourceType.STYLE_SHEETRULE, id, removes: [{ index }] });
  });

  return () => {
    insertHoc();
    deleteHoc();
  };
}
