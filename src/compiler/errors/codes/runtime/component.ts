import type { ErrorCode } from "../../codes.ts";

export const RUNTIME_COMPONENT_CODES = {
  L2040: {
    message: "props() can only be called in a component's <script>",
    hint: "Call props() at the top level of a .lusia <script>.",
  },
  L2058: {
    message: "$prop is read-only in this component",
    hint: "The parent can let it write back: pass it with bind-$prop={variable}.",
  },
  L2070: {
    message: "onAttach() and onDetach() can only be called in a component's <script>",
    hint: "Call them at the top level of a .lusia <script>.",
  },
} as const satisfies Record<string, ErrorCode>;
