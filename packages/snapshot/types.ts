export enum NodeType {
  ELE_NODE,
  TEXT_NODE,
  DOC_NODE,
  DOC_TYPE_NODE,
  DOC_FRAGMENT_NODE
}

export type Attrs = { [key: string]: boolean | string };

export type DocNode = {
  type: NodeType.DOC_NODE;
  title: string;
};

export type DocTypeNode = {
  type: NodeType.DOC_TYPE_NODE;
  name: string;
  publicId: string;
  systemId: string;
};

export type EleNode = {
  type: NodeType.ELE_NODE;
  tagName: string;
  attrs: Attrs;
};

export type TextNode = {
  type: NodeType.TEXT_NODE;
  textContent: string;
  style?: boolean;
};

export type SN = DocNode | DocTypeNode | EleNode | TextNode;

export type SNWithId = SN & { id: number; pId?: number; nId?: number };
