import { animate } from "@runtime/animate/bind.ts";
import { WHEN } from "@runtime/animate/trigger.ts";

Object.assign(window, { luciaAnimate: animate, luciaWhen: WHEN });
