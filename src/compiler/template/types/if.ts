import type { Branch } from "./template.ts";

export interface IfBinding {
  kind: "if";
  branches: Branch[];
}
