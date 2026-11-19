export const RELOAD_PATH = "/__lucia/reload";
const ERROR_DOCS_URL = "https://github.com/AzPepoze/luciajs/blob/main/docs/errors.md";

// Reloads the page on a new build, shows build errors as an overlay, and reconnects after a server restart.
const CLIENT_CODE = `
(function () {
  var protocol = location.protocol === "https:" ? "wss://" : "ws://";
  var url = protocol + location.host + "${RELOAD_PATH}";
  var overlay = null;
  var reconnecting = false;

  function appendLinked(node, text) {
    var parts = text.split(/(L[12]\\d{3})/);
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        node.appendChild(document.createTextNode(parts[i]));
        continue;
      }
      var link = document.createElement("a");
      link.href = "${ERROR_DOCS_URL}#" + parts[i].toLowerCase();
      link.textContent = parts[i];
      link.style.color = "inherit";
      node.appendChild(link);
    }
  }

  function showError(message) {
    if (!overlay) {
      overlay = document.createElement("pre");
      overlay.setAttribute("style", "position:fixed;inset:0;z-index:2147483647;margin:0;padding:24px;overflow:auto;background:#1a0606;color:#ffb4b4;font:14px/1.5 ui-monospace,monospace;white-space:pre-wrap");
      document.body.appendChild(overlay);
    }
    overlay.textContent = "";
    appendLinked(overlay, "Build failed\\n\\n" + message);
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
