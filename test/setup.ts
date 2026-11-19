import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { plugin } from "bun";
import { lucia } from "lucia/bun-plugin";

GlobalRegistrator.register();
plugin(lucia());
