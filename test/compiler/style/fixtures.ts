export const ID = "p";
export const FILE = `${import.meta.dir}/Card.lucia`;
export const ROOT = `[data-l="p"]`;
export const TREE = `:where(${ROOT}, ${ROOT} *)`;
export const CHILD = `${ROOT} [data-l]:not(${ROOT})`;
export const SCOPED = `${TREE}:not(:where(${CHILD}, ${CHILD} *))`;
