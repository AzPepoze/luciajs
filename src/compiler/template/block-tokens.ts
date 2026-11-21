import type { Template } from "./types/template.ts";

export type BlockName = "IF" | "EACH" | "FOR";
export type BodyReader = () => Template;

export const OPEN_TAG = /<(IF|EACH|FOR)(?=[\s/>])/y;
export const CLOSE_TAG = /<\/(IF|ELSEIF|ELSE|EACH|FOR)\s*>/y;
export const CHAIN_TAG = /<(ELSEIF|ELSE)(?=[\s/>])/y;
