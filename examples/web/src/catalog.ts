import { lazy, type Component } from "lucia";
import type { ApiGroup } from "../../../reference/api.ts";
const Attributes = lazy(() => import("./demos/basics/Attributes.lucia"));
const BindElement = lazy(() => import("./demos/basics/BindElement.lucia"));
const BindFields = lazy(() => import("./demos/basics/BindFields.lucia"));
const Events = lazy(() => import("./demos/basics/Events.lucia"));
const Setup = lazy(() => import("./demos/basics/Setup.lucia"));
const Text = lazy(() => import("./demos/basics/Text.lucia"));
const EachDemo = lazy(() => import("./demos/flow/EachDemo.lucia"));
const ForDemo = lazy(() => import("./demos/flow/ForDemo.lucia"));
const IfDemo = lazy(() => import("./demos/flow/IfDemo.lucia"));
const KeyframeDefault = lazy(() => import("./demos/motion/KeyframeDefault.lucia"));
const Presets = lazy(() => import("./demos/motion/Presets.lucia"));
import bindElementSource from "./demos/basics/BindElement.lucia?raw";
import bindFieldsSource from "./demos/basics/BindFields.lucia?raw";
import setupSource from "./demos/basics/Setup.lucia?raw";
import eachSource from "./demos/flow/EachDemo.lucia?raw";
import forSource from "./demos/flow/ForDemo.lucia?raw";
import ifSource from "./demos/flow/IfDemo.lucia?raw";
import keyframeDefaultSource from "./demos/motion/KeyframeDefault.lucia?raw";
import presetsSource from "./demos/motion/Presets.lucia?raw";
const Attach = lazy(() => import("./demos/components/Attach.lucia"));
const LazyDemo = lazy(() => import("./demos/components/LazyDemo.lucia"));
const Components = lazy(() => import("./demos/components/Components.lucia"));
const FileTree = lazy(() => import("./demos/components/FileTree.lucia"));
const CommentThread = lazy(() => import("./demos/components/CommentThread.lucia"));
import fileTreeSource from "./demos/components/FileTree.lucia?raw";
import folderSource from "./demos/components/Folder.lucia?raw";
import commentThreadSource from "./demos/components/CommentThread.lucia?raw";
import commentSource from "./demos/components/Comment.lucia?raw";
const Props = lazy(() => import("./demos/components/Props.lucia"));
const Children = lazy(() => import("./demos/components/Children.lucia"));
const Batch = lazy(() => import("./demos/reactivity/Batch.lucia"));
const Variable = lazy(() => import("./demos/reactivity/Variable.lucia"));
const AutoRun = lazy(() => import("./demos/reactivity/AutoRun.lucia"));
const UpdateBefore = lazy(() => import("./demos/reactivity/UpdateBefore.lucia"));
const Watch = lazy(() => import("./demos/reactivity/Watch.lucia"));
const SharedReader = lazy(() => import("./demos/reactivity/SharedReader.lucia"));
const SharedWriter = lazy(() => import("./demos/reactivity/SharedWriter.lucia"));
const GlobalStyles = lazy(() => import("./demos/styling/GlobalStyles.lucia"));
const Scss = lazy(() => import("./demos/styling/Scss.lucia"));
const StyleParent = lazy(() => import("./demos/styling/StyleParent.lucia"));
import attachSource from "./demos/components/Attach.lucia?raw";
import attachChipSource from "./demos/components/Chip.lucia?raw";
import lazyDemoSource from "./demos/components/LazyDemo.lucia?raw";
import lazyChartSource from "./demos/components/LazyChart.lucia?raw";
import lazySpinnerSource from "./demos/components/LazySpinner.lucia?raw";
import badgeSource from "./demos/components/badge.lucia?raw";
import componentsSource from "./demos/components/Components.lucia?raw";
import propsSource from "./demos/components/Props.lucia?raw";
import childrenSource from "./demos/components/Children.lucia?raw";
import cardSource from "./demos/components/Card.lucia?raw";
import attributesSource from "./demos/basics/Attributes.lucia?raw";
import eventsSource from "./demos/basics/Events.lucia?raw";
import textSource from "./demos/basics/Text.lucia?raw";
import batchSource from "./demos/reactivity/Batch.lucia?raw";
import variableDemoSource from "./demos/reactivity/Variable.lucia?raw";
import autoRunSource from "./demos/reactivity/AutoRun.lucia?raw";
import updateBeforeSource from "./demos/reactivity/UpdateBefore.lucia?raw";
import watchSource from "./demos/reactivity/Watch.lucia?raw";
import sharedReaderSource from "./demos/reactivity/SharedReader.lucia?raw";
import sharedWriterSource from "./demos/reactivity/SharedWriter.lucia?raw";
import variableSource from "./variable.ts?raw";
import globalStylesSource from "./demos/styling/GlobalStyles.lucia?raw";
import scssSource from "./demos/styling/Scss.lucia?raw";
import styleChildSource from "./demos/styling/StyleChild.lucia?raw";
import styleParentSource from "./demos/styling/StyleParent.lucia?raw";
import themeSource from "./styles/_theme.scss?raw";
const Enter = lazy(() => import("./demos/motion/Enter.lucia"));
const Easing = lazy(() => import("./demos/motion/Easing.lucia"));
const Keys = lazy(() => import("./demos/motion/Keys.lucia"));
const Reveal = lazy(() => import("./demos/motion/Reveal.lucia"));
const Loops = lazy(() => import("./demos/motion/Loops.lucia"));
import enterSource from "./demos/motion/Enter.lucia?raw";
import boxSource from "./demos/motion/Box.lucia?raw";
import easingSource from "./demos/motion/Easing.lucia?raw";
const LayoutCard = lazy(() => import("./demos/motion/LayoutCard.lucia"));
const LayoutCorners = lazy(() => import("./demos/motion/LayoutCorners.lucia"));
const LayoutList = lazy(() => import("./demos/motion/LayoutList.lucia"));
import layoutCardSource from "./demos/motion/LayoutCard.lucia?raw";
import layoutCornersSource from "./demos/motion/LayoutCorners.lucia?raw";
import layoutListSource from "./demos/motion/LayoutList.lucia?raw";
import keysSource from "./demos/motion/Keys.lucia?raw";
import revealSource from "./demos/motion/Reveal.lucia?raw";
import loopsSource from "./demos/motion/Loops.lucia?raw";
const Leave = lazy(() => import("./demos/motion/Leave.lucia"));
const LeaveList = lazy(() => import("./demos/motion/LeaveList.lucia"));
const Both = lazy(() => import("./demos/motion/Both.lucia"));
const VariableTrigger = lazy(() => import("./demos/motion/VariableTrigger.lucia"));
const Control = lazy(() => import("./demos/motion/Control.lucia"));
import leaveSource from "./demos/motion/Leave.lucia?raw";
import leaveListSource from "./demos/motion/LeaveList.lucia?raw";
import shrinkSource from "./demos/motion/Shrink.lucia?raw";
import bothSource from "./demos/motion/Both.lucia?raw";
import popSource from "./demos/motion/Pop.lucia?raw";
import variableTriggerSource from "./demos/motion/VariableTrigger.lucia?raw";
import controlSource from "./demos/motion/Control.lucia?raw";
const HoverDelay = lazy(() => import("./demos/motion/HoverDelay.lucia"));
const FollowScroll = lazy(() => import("./demos/motion/FollowScroll.lucia"));
import hoverDelaySource from "./demos/motion/HoverDelay.lucia?raw";
import followScrollSource from "./demos/motion/FollowScroll.lucia?raw";
const PinnedScroll = lazy(() => import("./demos/motion/PinnedScroll.lucia"));
const HoverInOut = lazy(() => import("./demos/motion/HoverInOut.lucia"));
import pinnedScrollSource from "./demos/motion/PinnedScroll.lucia?raw";
import hoverInOutSource from "./demos/motion/HoverInOut.lucia?raw";
const MidwayMode = lazy(() => import("./demos/motion/MidwayMode.lucia"));
import midwayModeSource from "./demos/motion/MidwayMode.lucia?raw";
const ScrollDefault = lazy(() => import("./demos/motion/ScrollDefault.lucia"));
const ScrollEnterCenter = lazy(() => import("./demos/motion/ScrollEnterCenter.lucia"));
const ScrollCenterLeave = lazy(() => import("./demos/motion/ScrollCenterLeave.lucia"));
const ScrollPresets = lazy(() => import("./demos/motion/ScrollPresets.lucia"));
const ScrollTouchPoints = lazy(() => import("./demos/motion/ScrollTouchPoints.lucia"));
const ScrollLines = lazy(() => import("./demos/motion/ScrollLines.lucia"));
const ScrollTwo = lazy(() => import("./demos/motion/ScrollTwo.lucia"));
const ScrollPartFollow = lazy(() => import("./demos/motion/ScrollPartFollow.lucia"));
const ScrollEffects = lazy(() => import("./demos/motion/ScrollEffects.lucia"));
import scrollDefaultSource from "./demos/motion/ScrollDefault.lucia?raw";
import scrollEnterCenterSource from "./demos/motion/ScrollEnterCenter.lucia?raw";
import scrollCenterLeaveSource from "./demos/motion/ScrollCenterLeave.lucia?raw";
import scrollPresetsSource from "./demos/motion/ScrollPresets.lucia?raw";
import scrollTouchPointsSource from "./demos/motion/ScrollTouchPoints.lucia?raw";
import scrollLinesSource from "./demos/motion/ScrollLines.lucia?raw";
import scrollTwoSource from "./demos/motion/ScrollTwo.lucia?raw";
import scrollPartFollowSource from "./demos/motion/ScrollPartFollow.lucia?raw";
import scrollEffectsSource from "./demos/motion/ScrollEffects.lucia?raw";
import scrollReadoutSource from "./demos/motion/scroll-readout.ts?raw";

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

// A small table shown under the entry's bullets. Cells are plain text.
export interface CatalogTable {
  head: string[];
  rows: string[][];
}

export interface CatalogEntry {
  icon: string;
  demos?: Demo[];
  table?: CatalogTable;
}

// Each group has its own pastel colour. The sidebar tints the group header with it.
export const groupTitles: Record<ApiGroup, { label: string; icon: string; color: string }> = {
  basics: { label: "Basics", icon: "school", color: "var(--pink)" },
  reactivity: { label: "Reactivity", icon: "bolt", color: "var(--lavender)" },
  flow: { label: "Flow", icon: "alt_route", color: "var(--lemon)" },
  components: { label: "Components", icon: "widgets", color: "var(--mint)" },
  styling: { label: "Styling", icon: "palette", color: "var(--sky)" },
  motion: { label: "Motion", icon: "animation", color: "var(--peach)" },
};

// Keyed by the api entry id. Entries without a demo show no live card.
export const catalog: Record<string, CatalogEntry> = {
  expr: {
    icon: "text_fields",
    demos: [
      {
        id: "expr-text",
        title: "Text",
        caption: "Curly braces put a variable or an expression into the text.",
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
  variable: {
    icon: "data_object",
    demos: [
      {
        id: "variable-derived",
        title: "Derived variable",
        caption: "A derived variable updates when the variables it reads update.",
        components: [Variable],
        sources: [{ path: "src/demos/reactivity/Variable.lucia", text: variableDemoSource }],
      },
      {
        id: "variable-batch",
        title: "Batch",
        caption: "Several writes in one handler update the page once per click.",
        components: [Batch],
        sources: [{ path: "src/demos/reactivity/Batch.lucia", text: batchSource }],
      },
      {
        id: "variable-shared",
        title: "Shared variable",
        caption: "One component writes a variable in variable.ts, and another reads it.",
        components: [SharedWriter, SharedReader],
        sources: [
          { path: "src/variable.ts", text: variableSource },
          { path: "src/demos/reactivity/SharedWriter.lucia", text: sharedWriterSource },
          { path: "src/demos/reactivity/SharedReader.lucia", text: sharedReaderSource },
        ],
      },
    ],
  },
  "variable-compute": { icon: "calculate" },
  "variable-auto-run": {
    icon: "sync",
    table: {
      head: ["Form", "Finds what it reads", "Gets the values", "Use it when"],
      rows: [
        [
          "variable.autoRun(fn)",
          "Yes, on every run",
          "You read them inside fn",
          "The list of reads may change",
        ],
        [
          "variable.watch([a, b], fn)",
          "No, you list them",
          "You read them inside fn",
          "You know the exact list",
        ],
        [
          "count.onUpdate((now, before) => ...)",
          "One variable only",
          "now and before are passed in",
          "You need the old value of one variable",
        ],
      ],
    },
    demos: [
      {
        id: "variable-auto-run-peek",
        title: "Peek",
        caption: "peek() reads a variable without subscribing to it.",
        components: [AutoRun],
        sources: [{ path: "src/demos/reactivity/AutoRun.lucia", text: autoRunSource }],
      },
    ],
  },
  "variable-watch": {
    icon: "visibility",
    demos: [
      {
        id: "variable-watch-listed",
        title: "Watch",
        caption: "variable.watch runs only when a listed variable updates.",
        components: [Watch],
        sources: [{ path: "src/demos/reactivity/Watch.lucia", text: watchSource }],
      },
    ],
  },
  "variable-instance-on-update": {
    icon: "sync_alt",
    demos: [
      {
        id: "variable-instance-on-update-before",
        title: "Before and now",
        caption:
          "count.onUpdate gets the new and the old value. get() and set() read and write it.",
        components: [UpdateBefore],
        sources: [{ path: "src/demos/reactivity/UpdateBefore.lucia", text: updateBeforeSource }],
      },
    ],
  },
  props: {
    icon: "input",
    demos: [
      {
        id: "props-tone",
        title: "Props",
        caption: "Pass values to a child as attributes. Each prop is a variable.",
        components: [Props],
        sources: [
          { path: "src/demos/components/Props.lucia", text: propsSource },
          { path: "src/demos/components/badge.lucia", text: badgeSource },
        ],
      },
    ],
  },
  lazy: {
    icon: "hourglass_top",
    demos: [
      {
        id: "lazy-chart",
        title: "Lazy component",
        caption: "The chart loads the first time it is shown. The fallback shows until it arrives.",
        components: [LazyDemo],
        sources: [
          { path: "src/demos/components/LazyDemo.lucia", text: lazyDemoSource },
          { path: "src/demos/components/LazyChart.lucia", text: lazyChartSource },
          { path: "src/demos/components/LazySpinner.lucia", text: lazySpinnerSource },
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
  "variable-type": { icon: "data_object" },
  "computed-variable-type": { icon: "data_object" },
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
  "recursive-components": {
    icon: "folder",
    demos: [
      {
        id: "recursive-files",
        title: "File tree",
        caption: "Folder.lucia places itself for each child folder. Click a folder to fold it.",
        components: [FileTree],
        sources: [
          { path: "src/demos/components/FileTree.lucia", text: fileTreeSource },
          { path: "src/demos/components/Folder.lucia", text: folderSource },
        ],
      },
      {
        id: "recursive-comments",
        title: "Nested comments",
        caption: "Each reply is a Comment inside a Comment. The depth prop stops it at 3.",
        components: [CommentThread],
        sources: [
          { path: "src/demos/components/CommentThread.lucia", text: commentThreadSource },
          { path: "src/demos/components/Comment.lucia", text: commentSource },
        ],
      },
    ],
  },
  content: {
    icon: "view_agenda",
    demos: [
      {
        id: "content-children",
        title: "Children and CONTENT",
        caption: "Markup between a component's tags shows where its CONTENT is.",
        components: [Children],
        sources: [
          { path: "src/demos/components/Children.lucia", text: childrenSource },
          { path: "src/demos/components/Card.lucia", text: cardSource },
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
        caption: "A field and a variable stay in sync, in both directions.",
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
        caption: "bind-element variables the real DOM element. It is cleared on unmount.",
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
        id: "animate-leave-space",
        title: "Leave closes the space",
        caption:
          "A removed row shrinks while it leaves, so the rows below slide up. Turn keepSpace on to keep the gap until the row is gone.",
        components: [LeaveList],
        sources: [{ path: "src/demos/motion/LeaveList.lucia", text: leaveListSource }],
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
        id: "animate-variable",
        title: "Variable as trigger",
        caption: "A variable plays the animation forward when true, and back when false.",
        components: [VariableTrigger],
        sources: [{ path: "src/demos/motion/VariableTrigger.lucia", text: variableTriggerSource }],
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
        id: "animate-layout-corners",
        title: "Layout: move",
        caption: "No keyframes. The box glides when its place changes, from any cause.",
        components: [LayoutCorners],
        sources: [{ path: "src/demos/motion/LayoutCorners.lucia", text: layoutCornersSource }],
      },
      {
        id: "animate-layout-list",
        title: "Layout: reorder",
        caption: "Rows glide to their new place when the list reorders.",
        components: [LayoutList],
        sources: [{ path: "src/demos/motion/LayoutList.lucia", text: layoutListSource }],
      },
      {
        id: "animate-layout-card",
        title: "Layout: resize",
        caption: "A card grows and shrinks smoothly when its content opens.",
        components: [LayoutCard],
        sources: [{ path: "src/demos/motion/LayoutCard.lucia", text: layoutCardSource }],
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
  "scroll-at": {
    icon: "vertical_align_center",
    demos: [
      {
        id: "scroll-default",
        title: "Default: ENTER to LEAVE",
        caption: "With no start or end, the card fades in for the whole time it is on screen.",
        components: [ScrollDefault],
        sources: [
          { path: "src/demos/motion/ScrollDefault.lucia", text: scrollDefaultSource },
          { path: "src/demos/motion/scroll-readout.ts", text: scrollReadoutSource },
        ],
      },
      {
        id: "scroll-enter-center",
        title: "ENTER to CENTER",
        caption: "The card finishes when it reaches the middle of the screen.",
        components: [ScrollEnterCenter],
        sources: [
          { path: "src/demos/motion/ScrollEnterCenter.lucia", text: scrollEnterCenterSource },
        ],
      },
      {
        id: "scroll-center-leave",
        title: "CENTER to LEAVE",
        caption: "The card fades out as it leaves the top of the screen.",
        components: [ScrollCenterLeave],
        sources: [
          { path: "src/demos/motion/ScrollCenterLeave.lucia", text: scrollCenterLeaveSource },
        ],
      },
      {
        id: "scroll-presets",
        title: "Presets side by side",
        caption: "Four presets play side by side in one lane. The readout shows its progress.",
        components: [ScrollPresets],
        sources: [{ path: "src/demos/motion/ScrollPresets.lucia", text: scrollPresetsSource }],
      },
      {
        id: "scroll-lines",
        title: "Start and end lines",
        caption: "The lines light up when the card's lines meet the screen's lines.",
        components: [ScrollLines],
        sources: [{ path: "src/demos/motion/ScrollLines.lucia", text: scrollLinesSource }],
      },
      {
        id: "scroll-two-items",
        title: "Two items on one card",
        caption: "One item fades in, another blurs out. They set different properties.",
        components: [ScrollTwo],
        sources: [{ path: "src/demos/motion/ScrollTwo.lucia", text: scrollTwoSource }],
      },
    ],
  },
  edge: {
    icon: "grid_on",
    demos: [
      {
        id: "scroll-touch-points",
        title: "Object with EDGE or numbers",
        caption: "{ element, window } takes EDGE members or numbers from 0 to 1.",
        components: [ScrollTouchPoints],
        sources: [
          { path: "src/demos/motion/ScrollTouchPoints.lucia", text: scrollTouchPointsSource },
        ],
      },
    ],
  },
  when: {
    icon: "schedule",
    demos: [
      {
        id: "scroll-part-follow",
        title: "Steps with part and follow",
        caption: "A pinned scene plays three steps, one slice of the section each.",
        components: [ScrollPartFollow],
        sources: [
          { path: "src/demos/motion/ScrollPartFollow.lucia", text: scrollPartFollowSource },
        ],
      },
      {
        id: "scroll-effects",
        title: "Progress bar, parallax and colour",
        caption:
          "A page bar, two speeds of layer, and a card that turns, grows and changes colour.",
        components: [ScrollEffects],
        sources: [{ path: "src/demos/motion/ScrollEffects.lucia", text: scrollEffectsSource }],
      },
    ],
  },
  scoped: { icon: "segment" },
  global: { icon: "language" },
  "inline-global": { icon: "filter_center_focus" },
  elseif: { icon: "call_split" },
  else: { icon: "fork_right" },
  "bind-prop": { icon: "swap_horiz" },
  ease: { icon: "show_chart" },
  "set-animate-default": { icon: "tune" },
  controller: { icon: "play_circle" },
  midway: { icon: "alt_route" },
  turn: { icon: "u_turn_left" },
  "animate-more": { icon: "more_horiz" },
  "animate-type": { icon: "movie" },
  "keyframes-type": { icon: "timeline" },
  interpolate: { icon: "linear_scale" },
};

// Every api entry needs an icon. A missing one throws, so the catalog test catches it at once.
export function entryIcon(id: string): string {
  const entry = catalog[id];
  if (!entry) throw new Error(`No catalog icon for api entry "${id}"`);
  return entry.icon;
}
