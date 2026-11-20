import { animate } from "@runtime/animate/bind.ts";
import { WHEN } from "@runtime/animate/trigger.ts";
import { leaveThen } from "@runtime/dom/leave.ts";

Object.assign(window, { luciaAnimate: animate, luciaWhen: WHEN, luciaLeaveThen: leaveThen });
