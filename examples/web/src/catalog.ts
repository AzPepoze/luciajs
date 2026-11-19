import type { Component } from "lucia";
import type { ApiGroup } from "../../../reference/api.ts";
import Attributes from "./demos/basics/Attributes.lucia";
import BindElement from "./demos/basics/BindElement.lucia";
import BindFields from "./demos/basics/BindFields.lucia";
import Events from "./demos/basics/Events.lucia";
import Setup from "./demos/basics/Setup.lucia";
import Text from "./demos/basics/Text.lucia";
import EachDemo from "./demos/flow/EachDemo.lucia";
import ForDemo from "./demos/flow/ForDemo.lucia";
import IfDemo from "./demos/flow/IfDemo.lucia";
import KeyframeDefault from "./demos/motion/KeyframeDefault.lucia";
import Presets from "./demos/motion/Presets.lucia";
import bindElementSource from "./demos/basics/BindElement.lucia?raw";
import bindFieldsSource from "./demos/basics/BindFields.lucia?raw";
import setupSource from "./demos/basics/Setup.lucia?raw";
import eachSource from "./demos/flow/EachDemo.lucia?raw";
import forSource from "./demos/flow/ForDemo.lucia?raw";
import ifSource from "./demos/flow/IfDemo.lucia?raw";
import keyframeDefaultSource from "./demos/motion/KeyframeDefault.lucia?raw";
import presetsSource from "./demos/motion/Presets.lucia?raw";
import Attach from "./demos/components/Attach.lucia";
import Components from "./demos/components/Components.lucia";
import Props from "./demos/components/Props.lucia";
import Batch from "./demos/reactivity/Batch.lucia";
import Store from "./demos/reactivity/Store.lucia";
import OnUpdate from "./demos/reactivity/OnUpdate.lucia";
import SharedReader from "./demos/reactivity/SharedReader.lucia";
import SharedWriter from "./demos/reactivity/SharedWriter.lucia";
import GlobalStyles from "./demos/styling/GlobalStyles.lucia";
import Scss from "./demos/styling/Scss.lucia";
import StyleParent from "./demos/styling/StyleParent.lucia";
import attachSource from "./demos/components/Attach.lucia?raw";
import attachChipSource from "./demos/components/Chip.lucia?raw";
import badgeSource from "./demos/components/badge.lucia?raw";
import componentsSource from "./demos/components/Components.lucia?raw";
import propsSource from "./demos/components/Props.lucia?raw";
import attributesSource from "./demos/basics/Attributes.lucia?raw";
import eventsSource from "./demos/basics/Events.lucia?raw";
import textSource from "./demos/basics/Text.lucia?raw";
import batchSource from "./demos/reactivity/Batch.lucia?raw";
import storeDemoSource from "./demos/reactivity/Store.lucia?raw";
import onUpdateSource from "./demos/reactivity/OnUpdate.lucia?raw";
import sharedReaderSource from "./demos/reactivity/SharedReader.lucia?raw";
import sharedWriterSource from "./demos/reactivity/SharedWriter.lucia?raw";
import storeSource from "./store.ts?raw";
import globalStylesSource from "./demos/styling/GlobalStyles.lucia?raw";
import scssSource from "./demos/styling/Scss.lucia?raw";
import styleChildSource from "./demos/styling/StyleChild.lucia?raw";
import styleParentSource from "./demos/styling/StyleParent.lucia?raw";
import themeSource from "./styles/_theme.scss?raw";
import Enter from "./demos/motion/Enter.lucia";
import Easing from "./demos/motion/Easing.lucia";
import Keys from "./demos/motion/Keys.lucia";
import Reveal from "./demos/motion/Reveal.lucia";
import Loops from "./demos/motion/Loops.lucia";
import enterSource from "./demos/motion/Enter.lucia?raw";
import boxSource from "./demos/motion/Box.lucia?raw";
import easingSource from "./demos/motion/Easing.lucia?raw";
import keysSource from "./demos/motion/Keys.lucia?raw";
import revealSource from "./demos/motion/Reveal.lucia?raw";
import loopsSource from "./demos/motion/Loops.lucia?raw";
import Leave from "./demos/motion/Leave.lucia";
import Both from "./demos/motion/Both.lucia";
import StoreTrigger from "./demos/motion/StoreTrigger.lucia";
import Control from "./demos/motion/Control.lucia";
import leaveSource from "./demos/motion/Leave.lucia?raw";
import shrinkSource from "./demos/motion/Shrink.lucia?raw";
import bothSource from "./demos/motion/Both.lucia?raw";
import popSource from "./demos/motion/Pop.lucia?raw";
import storeTriggerSource from "./demos/motion/StoreTrigger.lucia?raw";
import controlSource from "./demos/motion/Control.lucia?raw";
import HoverDelay from "./demos/motion/HoverDelay.lucia";
import FollowScroll from "./demos/motion/FollowScroll.lucia";
import hoverDelaySource from "./demos/motion/HoverDelay.lucia?raw";
import followScrollSource from "./demos/motion/FollowScroll.lucia?raw";
import PinnedScroll from "./demos/motion/PinnedScroll.lucia";
import HoverInOut from "./demos/motion/HoverInOut.lucia";
import pinnedScrollSource from "./demos/motion/PinnedScroll.lucia?raw";
import hoverInOutSource from "./demos/motion/HoverInOut.lucia?raw";
import MidwayMode from "./demos/motion/MidwayMode.lucia";
import midwayModeSource from "./demos/motion/MidwayMode.lucia?raw";

// A source file shown in a code panel. The text is imported at build time.
export interface SourceFile {
  path: string;
  text: string;
}

// One live demo: its anchor id, its heading and caption, the components mounted into it, and the source files shown beside it.
export interface Demo {
  id: string;
  title: string;
  caption: string;
  components: Component[];
  sources: SourceFile[];
}

export interface CatalogEntry {
  icon: string;
  demos?: Demo[];
}

export const groupTitles: Record<ApiGroup, { label: string; icon: string }> = {
  basics: { label: "Basics", icon: "school" },
  reactivity: { label: "Reactivity", icon: "bolt" },
  flow: { label: "Flow", icon: "alt_route" },
  components: { label: "Components", icon: "widgets" },
  styling: { label: "Styling", icon: "palette" },
  motion: { label: "Motion", icon: "animation" },
};

// Keyed by the api entry id. Entries without a demo show no live card.
export const catalog: Record<string, CatalogEntry> = {
  expr: {
    icon: "text_fields",
    demos: [
      {
        id: "expr-text",
        title: "Text",
        caption: "Curly braces put a store or an expression into the text.",
        components: [Text],
        sources: [{ path: "src/demos/basics/Text.lucia", text: textSource }],
      },
      {
        id: "expr-attributes",
        title: "Attributes",
        caption: "An attribute takes a value too. A null value removes it.",
        components: [Attributes],
        sources: [{ path: "src/demos/basics/Attributes.lucia", text: attributesSource }],
      },
    ],
  },
  store: {
    icon: "data_object",
    demos: [
      {
        id: "store-derived",
        title: "Derived store",
        caption: "A derived store updates when the stores it reads change.",
        components: [Store],
        sources: [{ path: "src/demos/reactivity/Store.lucia", text: storeDemoSource }],
      },
      {
        id: "store-batch",
        title: "Batch",
        caption: "Several writes in one handler update the page once per click.",
        components: [Batch],
        sources: [{ path: "src/demos/reactivity/Batch.lucia", text: batchSource }],
      },
      {
        id: "store-shared",
        title: "Shared store",
        caption: "One component writes a store in store.ts, and another reads it.",
        components: [SharedWriter, SharedReader],
        sources: [
          { path: "src/store.ts", text: storeSource },
          { path: "src/demos/reactivity/SharedWriter.lucia", text: sharedWriterSource },
          { path: "src/demos/reactivity/SharedReader.lucia", text: sharedReaderSource },
        ],
      },
    ],
  },
  "store-from": { icon: "calculate" },
  "store-on-update": {
    icon: "sync",
    demos: [
      {
        id: "store-on-update-peek",
        title: "Peek",
        caption: "peek() reads a store without subscribing to it.",
        components: [OnUpdate],
        sources: [{ path: "src/demos/reactivity/OnUpdate.lucia", text: onUpdateSource }],
      },
    ],
  },
  props: {
    icon: "input",
    demos: [
      {
        id: "props-tone",
        title: "Props",
        caption: "Pass values to a child as attributes. Each prop is a store.",
        components: [Props],
        sources: [
          { path: "src/demos/components/Props.lucia", text: propsSource },
          { path: "src/demos/components/badge.lucia", text: badgeSource },
        ],
      },
    ],
  },
  attach: {
    icon: "link",
    demos: [
      {
        id: "attach-chip",
        title: "Attach by hand",
        caption: "Attach a component to any element, then detach it later.",
        components: [Attach],
        sources: [
          { path: "src/demos/components/Attach.lucia", text: attachSource },
          { path: "src/demos/components/Chip.lucia", text: attachChipSource },
        ],
      },
    ],
  },
  "store-type": { icon: "category" },
  "read-store-type": { icon: "category" },
  component: { icon: "extension" },
  instance: { icon: "memory" },
  "props-type": { icon: "category" },
  script: { icon: "terminal" },
  "component-tag": {
    icon: "widgets",
    demos: [
      {
        id: "component-tag-badge",
        title: "Component tag",
        caption: "Use a child component as a tag. Its props stay reactive.",
        components: [Components],
        sources: [
          { path: "src/demos/components/Components.lucia", text: componentsSource },
          { path: "src/demos/components/badge.lucia", text: badgeSource },
        ],
      },
    ],
  },
  setup: {
    icon: "touch_app",
    demos: [
      {
        id: "setup-cleanup",
        title: "Setup and cleanup",
        caption: "setup(root) runs on mount. Its return value runs on detach.",
        components: [Setup],
        sources: [{ path: "src/demos/basics/Setup.lucia", text: setupSource }],
      },
    ],
  },
  event: {
    icon: "ads_click",
    demos: [
      {
        id: "event-handlers",
        title: "Event handlers",
        caption: "A handler gets the event, so it can read the field's value.",
        components: [Events],
        sources: [{ path: "src/demos/basics/Events.lucia", text: eventsSource }],
      },
    ],
  },
  bind: {
    icon: "sync_alt",
    demos: [
      {
        id: "bind-fields",
        title: "Two-way bind",
        caption: "A field and a store stay in sync, in both directions.",
        components: [BindFields],
        sources: [{ path: "src/demos/basics/BindFields.lucia", text: bindFieldsSource }],
      },
    ],
  },
  "bind-element": {
    icon: "adjust",
    demos: [
      {
        id: "bind-element-ref",
        title: "Element reference",
        caption: "bind-element stores the real DOM element. It is cleared on unmount.",
        components: [BindElement],
        sources: [{ path: "src/demos/basics/BindElement.lucia", text: bindElementSource }],
      },
    ],
  },
  if: {
    icon: "call_split",
    demos: [
      {
        id: "if-branches",
        title: "IF, ELSEIF and ELSE",
        caption: "Show one branch at a time. Each branch slides in and fades out.",
        components: [IfDemo],
        sources: [{ path: "src/demos/flow/IfDemo.lucia", text: ifSource }],
      },
    ],
  },
  each: {
    icon: "view_list",
    demos: [
      {
        id: "each-rows",
        title: "Each",
        caption: "Repeat markup for each item. A removed row fades out first.",
        components: [EachDemo],
        sources: [{ path: "src/demos/flow/EachDemo.lucia", text: eachSource }],
      },
    ],
  },
  for: {
    icon: "repeat",
    demos: [
      {
        id: "for-range",
        title: "Range",
        caption: "Repeat markup over a range of numbers. Bad input falls back to safe values.",
        components: [ForDemo],
        sources: [{ path: "src/demos/flow/ForDemo.lucia", text: forSource }],
      },
    ],
  },
  preset: {
    icon: "auto_awesome",
    demos: [
      {
        id: "preset-gallery",
        title: "Presets",
        caption: "Hover a tile to play its preset.",
        components: [Presets],
        sources: [{ path: "src/demos/motion/Presets.lucia", text: presetsSource }],
      },
    ],
  },
  "animate-item": {
    icon: "tune",
    demos: [
      {
        id: "animate-keyframe-default",
        title: "Keyframe default",
        caption: "default sets the style and ease for keys that do not set their own.",
        components: [KeyframeDefault],
        sources: [{ path: "src/demos/motion/KeyframeDefault.lucia", text: keyframeDefaultSource }],
      },
    ],
  },
  style: {
    icon: "code",
    demos: [
      {
        id: "style-scss",
        title: "Nested SCSS",
        caption: "Nested rules and a shared variable file, compiled for this component.",
        components: [Scss],
        sources: [
          { path: "src/demos/styling/Scss.lucia", text: scssSource },
          { path: "src/styles/_theme.scss", text: themeSource },
        ],
      },
    ],
  },
  "style-scoped": {
    icon: "account_tree",
    demos: [
      {
        id: "style-scoped-tree",
        title: "Scoped and tree rules",
        caption: "A scoped rule stays in this component. A tree rule also reaches its children.",
        components: [StyleParent],
        sources: [
          { path: "src/demos/styling/StyleParent.lucia", text: styleParentSource },
          { path: "src/demos/styling/StyleChild.lucia", text: styleChildSource },
        ],
      },
    ],
  },
  "style-global": {
    icon: "public",
    demos: [
      {
        id: "style-global-rules",
        title: "Global rules",
        caption: "A global rule reaches any element, even outside the component.",
        components: [GlobalStyles],
        sources: [{ path: "src/demos/styling/GlobalStyles.lucia", text: globalStylesSource }],
      },
    ],
  },
  animate: {
    icon: "animation",
    demos: [
      {
        id: "animate-enter",
        title: "Enter only (WHEN.ATTACH)",
        caption: "Plays once when attached. detach() removes the box at once.",
        components: [Enter],
        sources: [
          { path: "src/demos/motion/Enter.lucia", text: enterSource },
          { path: "src/demos/motion/Box.lucia", text: boxSource },
        ],
      },
      {
        id: "animate-leave",
        title: "Leave only (WHEN.DETACH)",
        caption: "Plays when detached. detach() waits for it, then removes the box.",
        components: [Leave],
        sources: [
          { path: "src/demos/motion/Leave.lucia", text: leaveSource },
          { path: "src/demos/motion/Shrink.lucia", text: shrinkSource },
        ],
      },
      {
        id: "animate-both",
        title: "Enter and leave",
        caption: "One item plays on attach and another on detach, in an array.",
        components: [Both],
        sources: [
          { path: "src/demos/motion/Both.lucia", text: bothSource },
          { path: "src/demos/motion/Pop.lucia", text: popSource },
        ],
      },
      {
        id: "animate-store",
        title: "Store as trigger",
        caption: "A store plays the animation forward when true, and back when false.",
        components: [StoreTrigger],
        sources: [{ path: "src/demos/motion/StoreTrigger.lucia", text: storeTriggerSource }],
      },
      {
        id: "animate-control",
        title: "Controller",
        caption: "Play, reverse or stop the animation from code.",
        components: [Control],
        sources: [{ path: "src/demos/motion/Control.lucia", text: controlSource }],
      },
      {
        id: "animate-reveal",
        title: "Reveal on scroll",
        caption: "Each line plays once as it scrolls into view.",
        components: [Reveal],
        sources: [{ path: "src/demos/motion/Reveal.lucia", text: revealSource }],
      },
      {
        id: "animate-easing",
        title: "Custom easing",
        caption: "Any function from 0 to 1 can be the curve.",
        components: [Easing],
        sources: [{ path: "src/demos/motion/Easing.lucia", text: easingSource }],
      },
      {
        id: "animate-keys",
        title: "Several keys",
        caption: "Three keys set the color and size. The loop goes back and forth.",
        components: [Keys],
        sources: [{ path: "src/demos/motion/Keys.lucia", text: keysSource }],
      },
      {
        id: "animate-loops",
        title: "Loops",
        caption: "Two loops on one square, each at its own speed.",
        components: [Loops],
        sources: [{ path: "src/demos/motion/Loops.lucia", text: loopsSource }],
      },
      {
        id: "animate-hover-delay",
        title: "Hover with a delay out",
        caption: "The box stays lit for 300 ms after the pointer leaves.",
        components: [HoverDelay],
        sources: [{ path: "src/demos/motion/HoverDelay.lucia", text: hoverDelaySource }],
      },
      {
        id: "animate-follow-scroll",
        title: "Follow the scroll",
        caption: "The bar fills and the card turns as you scroll.",
        components: [FollowScroll],
        sources: [{ path: "src/demos/motion/FollowScroll.lucia", text: followScrollSource }],
      },
      {
        id: "animate-pinned-scroll",
        title: "Pinned scroll",
        caption: "A tall section holds the box on screen while you scroll past it.",
        components: [PinnedScroll],
        sources: [{ path: "src/demos/motion/PinnedScroll.lucia", text: pinnedScrollSource }],
      },
      {
        id: "animate-hover-in-out",
        title: "Hover in and out",
        caption: "Plays in after a wait, and leaves with its own keys.",
        components: [HoverInOut],
        sources: [{ path: "src/demos/motion/HoverInOut.lucia", text: hoverInOutSource }],
      },
      {
        id: "animate-midway",
        title: "Midway: changing your mind",
        caption: "Hover in and out quickly. Each box turns its own way.",
        components: [MidwayMode],
        sources: [{ path: "src/demos/motion/MidwayMode.lucia", text: midwayModeSource }],
      },
    ],
  },
  scoped: { icon: "segment" },
  global: { icon: "language" },
  "inline-global": { icon: "filter_center_focus" },
};
