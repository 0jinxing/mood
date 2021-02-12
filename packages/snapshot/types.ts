export enum NodeType {
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
  type: NodeType.DOCUMENT_NODE;
};

export type DocumentTypeNode = {
  type: NodeType.DOCUMENT_TYPE_NODE;
  name: string;
  publicId: string;
  systemId: string;
};

export type ElementNode = {
  type: NodeType.ELEMENT_NODE;
  tagName: string;
  attributes: Attributes;
  isSVG?: boolean;
};

export type TextNode = {
  type: NodeType.TEXT_NODE;
  textContent: string;
  isStyle?: boolean;
};

export type CDataNode = {
  type: NodeType.CDATA_SECTION_NODE;
  textContent: '';
};

export type CommentNode = {
  type: NodeType.COMMENT_NODE;
  textContent: string;
};

export type SerializedNode =
  | DocumentNode
  | DocumentTypeNode
  | ElementNode
  | TextNode
  | CDataNode
  | CommentNode;

export type SerializedNodeWithId = SerializedNode & { id: number };

export type AddedNode = {
  parentId?: number;
  nextId?: number;
  node: SerializedNodeWithId;
};

export type IdNodeMap<T extends EventTarget = EventTarget> = {
  [key: number]: T;
};
