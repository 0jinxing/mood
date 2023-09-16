export enum NodeTypes {
  ELE_NODE,
  TEXT_NODE,
  CDATA_NODE,
  DOC_NODE,
  DOC_TYPE_NODE,
  DOC_FRAGMENT_NODE
}

export type Attrs = { [key: string]: boolean | string };

export type DocNode = {
  type: NodeTypes.DOC_NODE;
};

export type DocTypeNode = {
  type: NodeTypes.DOC_TYPE_NODE;
  name: string;
  publicId: string;
  systemId: string;
};

export type EleNode = {
  type: NodeTypes.ELE_NODE;
  tagName: string;
  attrs: Attrs;
  svg?: boolean;
};

export type TextNode = {
  type: NodeTypes.TEXT_NODE;
  textContent: string;
  style?: boolean;
};

export type CDataNode = {
  type: NodeTypes.CDATA_NODE;
  textContent: '';
};

export type SN = DocNode | DocTypeNode | EleNode | TextNode | CDataNode;

export type SNWithId = SN & { id: number; pId?: number; nId?: number };
