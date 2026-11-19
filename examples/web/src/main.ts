import { attach, type Component } from "lucia";
import ThemeToggle from "./components/ThemeToggle.lucia";
import Attach from "./demos/Attach.lucia";
import Attributes from "./demos/Attributes.lucia";
import Batch from "./demos/Batch.lucia";
import Events from "./demos/Events.lucia";
import GlobalStyles from "./demos/GlobalStyles.lucia";
import Scss from "./demos/Scss.lucia";
import Signals from "./demos/Signals.lucia";
import SharedReader from "./demos/SharedReader.lucia";
import SharedWriter from "./demos/SharedWriter.lucia";
import StyleParent from "./demos/StyleParent.lucia";
import Text from "./demos/Text.lucia";
import { showSource } from "./source.ts";

const demos: Record<string, Component> = {
  "demo-text": Text,
  "demo-attributes": Attributes,
  "demo-signals": Signals,
  "demo-batch": Batch,
  "demo-shared-writer": SharedWriter,
  "demo-shared-reader": SharedReader,
  "demo-events": Events,
  "demo-attach": Attach,
  "demo-style-parent": StyleParent,
  "demo-global-styles": GlobalStyles,
  "demo-scss": Scss,
};

for (const [mountId, demo] of Object.entries(demos)) attach(demo, document.getElementById(mountId)!);
attach(ThemeToggle, document.getElementById("theme-slot")!);

for (const el of document.querySelectorAll<HTMLElement>("[data-source]")) {
  showSource(el, el.dataset.source ?? "");
}
