export const RELOAD_PATH = "/__lucia/reload";

// Reloads the page on a new build, shows build errors as an overlay, and reconnects after a server restart.
const CLIENT_CODE = `
(function () {
  var protocol = location.protocol === "https:" ? "wss://" : "ws://";
  var url = protocol + location.host + "${RELOAD_PATH}";
  var overlay = null;
  var reconnecting = false;

  function showError(message) {
    if (!overlay) {
      overlay = document.createElement("pre");
      overlay.setAttribute("style", "position:fixed;inset:0;z-index:2147483647;margin:0;padding:24px;overflow:auto;background:#1a0606;color:#ffb4b4;font:14px/1.5 ui-monospace,monospace;white-space:pre-wrap");
      document.body.appendChild(overlay);
    }
    overlay.textContent = "Build failed\\n\\n" + message;
  }

  function connect() {
    var socket = new WebSocket(url);
    socket.onopen = function () {
      if (reconnecting) location.reload();
    };
    socket.onmessage = function (event) {
      var message = JSON.parse(event.data);
      if (message.type === "reload") location.reload();
      else showError(message.message);
    };
    socket.onclose = function () {
      reconnecting = true;
      setTimeout(connect, 1000);
    };
  }

  connect();
})();
`;

const CLIENT_TAG = `<script>${CLIENT_CODE}</script>`;

export function withReloadClient(html: string): string {
  if (html.includes("</body>")) return html.replace("</body>", () => `${CLIENT_TAG}</body>`);
  return html + CLIENT_TAG;
}
