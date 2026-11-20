const FRAME_URL = "/playground/frame.html";
const START_LIMIT_MS = 8000;

export interface RunPayload {
  entry: string;
  modules: Record<string, string>;
  /** The runtime module's source, which the frame loads under the name "lucia". */
  runtime: string;
}

interface FrameMessage {
  type: string;
  message?: string;
}

interface Pending {
  frame: HTMLIFrameElement;
  run: RunPayload;
  resolve: () => void;
  reject: (error: Error) => void;
  timer: number;
}

/**
 * Each run starts in a new sandboxed frame. The frame stays hidden until it mounts,
 * so a run that fails leaves the last good preview on screen.
 */
export class Preview {
  private shown: HTMLIFrameElement | undefined;
  private pending: Pending | undefined;
  private readonly stage: HTMLElement;
  private readonly onRuntimeError: (message: string) => void;

  constructor(stage: HTMLElement, onRuntimeError: (message: string) => void) {
    this.stage = stage;
    this.onRuntimeError = onRuntimeError;
    window.addEventListener("message", this.receive);
  }

  /** Resolves when the new frame has mounted. Rejects when it fails or a newer run replaces it. */
  show(run: RunPayload): Promise<void> {
    this.dropPending(new Error("A newer run replaced this one."));
    const frame = createFrame();
    this.stage.append(frame);
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(
        () => this.fail(frame, "The preview did not start."),
        START_LIMIT_MS,
      );
      this.pending = { frame, run, resolve, reject, timer };
    });
  }

  destroy(): void {
    window.removeEventListener("message", this.receive);
    this.dropPending(new Error("The preview closed."));
    this.shown?.remove();
    this.shown = undefined;
  }

  private readonly receive = (event: MessageEvent<unknown>): void => {
    if (!isFrameMessage(event.data)) return;
    const pending = this.pending;
    if (pending && event.source === pending.frame.contentWindow) {
      this.onPending(pending, event.data);
    } else if (this.shown && event.source === this.shown.contentWindow) {
      if (event.data.type === "error") this.onRuntimeError(event.data.message ?? "Unknown error");
    }
  };

  private onPending(pending: Pending, message: FrameMessage): void {
    if (message.type === "ready") {
      pending.frame.contentWindow?.postMessage({ type: "run", ...pending.run }, "*");
    } else if (message.type === "mounted") {
      this.promote(pending);
    } else if (message.type === "error") {
      this.fail(pending.frame, message.message ?? "Unknown error");
    }
  }

  private promote(pending: Pending): void {
    window.clearTimeout(pending.timer);
    this.pending = undefined;
    this.shown?.remove();
    pending.frame.classList.remove("is-pending");
    this.shown = pending.frame;
    pending.resolve();
  }

  private fail(frame: HTMLIFrameElement, message: string): void {
    const pending = this.pending;
    if (!pending || pending.frame !== frame) return;
    this.dropPending(new Error(message));
  }

  private dropPending(error: Error): void {
    const pending = this.pending;
    if (!pending) return;
    window.clearTimeout(pending.timer);
    this.pending = undefined;
    pending.frame.remove();
    pending.reject(error);
  }
}

function createFrame(): HTMLIFrameElement {
  const frame = document.createElement("iframe");
  frame.className = "preview-frame is-pending";
  frame.title = "Preview";
  frame.setAttribute("sandbox", "allow-scripts");
  frame.src = FRAME_URL;
  return frame;
}

function isFrameMessage(value: unknown): value is FrameMessage {
  return (
    typeof value === "object" && value !== null && typeof (value as FrameMessage).type === "string"
  );
}
