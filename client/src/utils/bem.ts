import classnames from "classnames";

const namespace = "mood";
const blockSeparator = "_";
const elementSeparator = "__";
const modifierSeparator = "--";
const statePrefix = "is-";

let block: string;
export const b = (b: string) => {
  block = namespace + blockSeparator + b;
  return block;
};

let element: string;
export const e = (e: string) => {
  if (!block) throw Error();
  element = block + elementSeparator + e;
  return element;
};

export const m = (m: string) => {
  if (element) {
    return element + modifierSeparator + m;
  } else if (block) {
    return block + modifierSeparator + m;
  }
  throw Error();
};

export const when = (state: string | string[]) => {
  const stateList = typeof state === "string" ? [state] : state;
  stateList.map((s) => statePrefix + s);
  return classnames(stateList);
};
