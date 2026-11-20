// The preview frame. It runs in a sandbox with an opaque origin, so user code cannot reach the site.
// The parent sends the runtime and the compiled modules, then this page loads them with blob URLs.
(function () {
  "use strict";

  var MODULE_PREFIX = "@playground/";

  function post(message) {
    window.parent.postMessage(message, "*");
  }

  function report(error) {
    post({ type: "error", message: error && error.message ? error.message : String(error) });
  }

  function blobUrl(code) {
    return URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
  }

  // "lucia" and "lucia/internal" share one blob, so the runtime is a single module instance.
  function addImportMap(run) {
    var imports = { lucia: blobUrl(run.runtime) };
    imports["lucia/internal"] = imports.lucia;
    for (var name in run.modules) {
      imports[MODULE_PREFIX + name] = blobUrl(run.modules[name]);
    }
    var map = document.createElement("script");
    map.type = "importmap";
    map.textContent = JSON.stringify({ imports: imports });
    document.head.append(map);
  }

  async function run(data) {
    try {
      addImportMap(data);
      var runtime = await import("lucia");
      var app = await import(MODULE_PREFIX + data.entry);
      var root = document.createElement("div");
      root.id = "app";
      document.body.append(root);
      runtime.attach(app.default, root);
      post({ type: "mounted" });
    } catch (error) {
      report(error);
    }
  }

  window.addEventListener("message", function (event) {
    if (event.source !== window.parent || !event.data || event.data.type !== "run") return;
    void run(event.data);
  });
  window.addEventListener("error", function (event) {
    report(event.error || event.message);
  });
  window.addEventListener("unhandledrejection", function (event) {
    report(event.reason);
  });
  post({ type: "ready" });
})();
