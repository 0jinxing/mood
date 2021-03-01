export enum NT {
  ELEMENT_NODE,
  TEXT_NODE,
  CDATA_SECTION_NODE,
  PROCESSING_INSTRUCTION_NODE,
  COMMENT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_TYPE_NODE,
  DOCUMENT_FRAGMENT_NODE
}

export type Attributes = { [key: string]: boolean | string };

export type DocumentNode = {
  type: NT.DOCUMENT_NODE;
};

export type DocumentTypeNode = {
  type: NT.DOCUMENT_TYPE_NODE;
  name: string;
  publicId: string;
  systemId: string;
};

export type ElementNode = {
  type: NT.ELEMENT_NODE;
  tagName: string;
  attributes: Attributes;
  isSVG?: boolean;
};

export type TextNode = {
  type: NT.TEXT_NODE;
  textContent: string;
  isStyle?: boolean;
};

export type CDataNode = {
  type: NT.CDATA_SECTION_NODE;
  textContent: '';
};

export type CommentNode = {
  type: NT.COMMENT_NODE;
  textContent: string;
};

export type SN =
  | DocumentNode
  | DocumentTypeNode
  | ElementNode
  | TextNode
  | CDataNode
  | CommentNode;

export type SNWithId = SN & { id: number; parentId?: number; nextId?: number };
