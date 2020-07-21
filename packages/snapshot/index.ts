import {
  SerializedNode,
  SerializedNodeWithId,
  TNode,
  NodeType,
  Attributes,
  getBaseUrl,
  mirror,
  AddedNodeMutation,
} from "@traps/common";

let id = 0;
export function genId(): number {
  return ++id;
}

export function getCSSText(styleSheet: CSSStyleSheet): string {
  try {
    const rules = styleSheet.cssRules;
    return Array.from(rules).reduce(
      (prev, cur) => prev + getCSSRuleText(cur),
      ""
    );
  } catch {
    return "";
  }
}

export function getCSSRuleText(rule: CSSRule): string {
  return rule instanceof CSSImportRule
    ? getCSSText(rule.styleSheet)
    : rule.cssText;
}

const URL_MATCH = /url\(["']?(.*?)["']?\)/;

const baseUrl = getBaseUrl();

export function absoluteToDoc(attrValue: string): string {
  const { href } = new URL(attrValue, baseUrl);
  return href;
}

export function absoluteToStylesheet(cssText: string) {
  return cssText.replace(URL_MATCH, (origin: string, filePath: string) => {
    if (!filePath) return origin;
    return `url(${absoluteToDoc(filePath)})`;
  });
}

export function absoluteToSrcsetAttr(attrValue: string) {
  const splitValueArr = attrValue.split(",");
  const resultingSrcsetString = splitValueArr
    .map((val) => {
      const _val = val.trim();
      const [url, size = ""] = _val.split(/\s+/);
      return `${absoluteToDoc(url)} ${size}`.trim();
    })
    .join(",");

  return resultingSrcsetString;
}

// relative url => absolute url
export function transformAttr(attrName: string, attrValue: string) {
  if (attrName === "src" || attrName === "href") {
    return absoluteToDoc(attrValue);
  } else if (attrName === "srcset") {
    return absoluteToSrcsetAttr(attrValue);
  } else if (attrName === "style") {
    return absoluteToStylesheet(attrValue);
  }
  return attrValue;
}

export function isSVGElement($el: Element): boolean {
  return /SVG/i.test($el.tagName) || $el instanceof SVGElement;
}

export function serialize(
  $node: Node,
  $doc: HTMLDocument
): SerializedNode | null {
  if ($node instanceof Document) {
    return { type: NodeType.DOCUMENT_NODE };
  } else if ($node instanceof DocumentType) {
    return {
      type: NodeType.DOCUMENT_TYPE_NODE,
      name: $node.name,
      publicId: $node.publicId,
      systemId: $node.systemId,
    };
  } else if ($node instanceof Element) {
    const attributes: Attributes = {};
    for (const { name, value } of Array.from($node.attributes)) {
      attributes[name] = transformAttr(name, value);
    }
    // link \ style => inline style & absolute url
    if ($node instanceof HTMLLinkElement) {
      const styleSheet = Array.from($doc.styleSheets).find(
        (sheet) => sheet.href === $node.href
      ) as CSSStyleSheet;
      const cssText = styleSheet ? getCSSText(styleSheet) : "";
      if (cssText) {
        delete attributes["rel"];
        delete attributes["href"];
        attributes["_cssText"] = absoluteToStylesheet(cssText);
      }
    } else if ($node instanceof HTMLStyleElement) {
      const cssText = getCSSText($node.sheet as CSSStyleSheet);
      if (cssText) {
        attributes["_cssText"] = absoluteToStylesheet(cssText);
      }
    }
    // handle form fields
    else if ($node instanceof HTMLInputElement) {
      const type = attributes["type"];
      const value = $node.value;
      if (type !== "radio" && type !== "checkbox") {
        attributes["value"] = value;
      } else {
        attributes["checked"] = $node.checked;
      }
    } else if (
      $node instanceof HTMLTextAreaElement ||
      $node instanceof HTMLSelectElement
    ) {
      const value = $node.value;
      attributes["value"] = value;
    } else if ($node instanceof HTMLOptionElement) {
      attributes["selected"] = $node.selected;
    }
    // handle canvas
    else if ($node instanceof HTMLCanvasElement) {
      let dataURL = "";
      try {
        dataURL = $node.toDataURL();
      } catch {
        // @WARN cross
      }
      attributes["__dataURL"] = dataURL;
    }
    // handle audio and video
    else if (
      $node instanceof HTMLAudioElement ||
      $node instanceof HTMLVideoElement
    ) {
      attributes["__mediaState"] = $node.paused;
    }
    return {
      type: NodeType.ELEMENT_NODE,
      tagName: $node.tagName.toUpperCase(),
      attributes,
      isSVG: isSVGElement($node),
    };
  } else if ($node instanceof Text) {
    const $parentNode = $node.parentNode;
    let textContent = $node.textContent;
    const isStyle = $parentNode instanceof HTMLStyleElement;
    if (isStyle && textContent) {
      textContent = absoluteToStylesheet(textContent);
    } else if ($parentNode instanceof HTMLScriptElement) {
      textContent = "SCRIPT_PLACEHOLDER";
    }
    return {
      type: NodeType.TEXT_NODE,
      textContent: textContent || "",
      isStyle,
    };
  } else if ($node instanceof CDATASection) {
    return {
      type: NodeType.CDATA_SECTION_NODE,
      textContent: "",
    };
  } else if ($node instanceof Comment) {
    return {
      type: NodeType.COMMENT_NODE,
      textContent: $node.textContent || "",
    };
  }

  return null;
}

export function serializeWithId(
  $node: Node | TNode,
  $doc: HTMLDocument
): SerializedNodeWithId | null {
  const _serializedNode = serialize($node, $doc);
  if (!_serializedNode) {
    // @WARN not serialized
    return null;
  }
  const id = "__sn" in $node ? $node.__sn.id : genId();
  const serializedNode = Object.assign(_serializedNode, { id });
  ($node as TNode).__sn = serializedNode;
  mirror.idNodeMap[id] = $node as TNode;

  return serializedNode;
}

export function snapshot($doc: HTMLDocument): AddedNodeMutation[] {
  const adds: AddedNodeMutation[] = [];
  const queue: Node[] = [$doc];

  const serializeAdds = ($node: Node | TNode) => {
    const parentId = $node.parentElement
      ? mirror.getId($node.parentElement)
      : undefined;

    const nextId = $node.nextSibling
      ? mirror.getId($node.nextSibling)
      : undefined;

    if (nextId === 0 || parentId === 0) {
      queue.unshift($node);
      return;
    }

    adds.push({
      parentId: parentId,
      nextId: nextId,
      node: serializeWithId($node, $doc)!,
    });
    $node.childNodes.forEach(serializeAdds);
  };

  while (queue.length) {
    serializeAdds(queue.pop()!);
  }

  return adds;
}

export default snapshot;
