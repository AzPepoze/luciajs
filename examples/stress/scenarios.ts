import * as attach from "./attach/main.ts";
import * as expressions from "./expressions/main.ts";
import * as styles from "./styles/main.ts";
import * as updates from "./updates/main.ts";

// Each scenario folder exports run(); add a new one here.
export const scenarios = [attach.run, updates.run, expressions.run, styles.run];
