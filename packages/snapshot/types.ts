export enum NT {
  ELE_NODE,
  TEXT_NODE,
  CDATA_NODE,
  COMMENT_NODE,
  DOC_NODE,
  DOC_TYPE_NODE,
  DOC_FRAGMENT_NODE
}

export type Attrs = { [key: string]: boolean | string };

export type DocNode = {
  type: NT.DOC_NODE;
};

export type DocTypeNode = {
  type: NT.DOC_TYPE_NODE;
  name: string;
  publicId: string;
  systemId: string;
};

export type EleNode = {
  type: NT.ELE_NODE;
  tagName: string;
  attributes: Attrs;
  isSVG?: boolean;
};

export type TextNode = {
  type: NT.TEXT_NODE;
  textContent: string;
  isStyle?: boolean;
};

export type CDataNode = {
  type: NT.CDATA_NODE;
  textContent: '';
};

export type CommentNode = {
  type: NT.COMMENT_NODE;
  textContent: string;
};

export type SN =
  | DocNode
  | DocTypeNode
  | EleNode
  | TextNode
  | CDataNode
  | CommentNode;

export type SNWithId = SN & { id: number; pId?: number; nId?: number };
