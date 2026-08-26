(function () {
  "use strict";

  const MAX_MOVES = 12;
  const SUPPORTED_VERSION = "1";
  const TOKEN_LABELS = {
    ljh: "Left Jab - Head",
    ljb: "Left Jab - Body",
    ljl: "Left Jab - Low",
    rch: "Right Cross - Head",
    rcb: "Right Cross - Body",
    rcl: "Right Cross - Low",
    lhh: "Left Hook - Head",
    lhb: "Left Hook - Body",
    lhl: "Left Hook - Low",
    rhh: "Right Hook - Head",
    rhb: "Right Hook - Body",
    rhl: "Right Hook - Low",
    loh: "Left Overhand - Head",
    roh: "Right Overhand - Head",
    luh: "Left Uppercut - Head",
    ruh: "Right Uppercut - Head",
    sl: "Slip Left",
    sr: "Slip Right",
    rolll: "Roll Left",
    rollr: "Roll Right",
    lgh: "Left Guard - Head",
    rgh: "Right Guard - Head",
    lgb: "Left Guard - Body",
    rgb: "Right Guard - Body",
    rest10: "Rest - 10 seconds",
    rest30: "Rest - 30 seconds",
    repeat: "Repeat Combo"
  };

  function emitSharedComboEvent(detail) {
    window.dispatchEvent(new CustomEvent("arboxing:shared_combo", { detail }));
  }

  function readParams() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (error) {
      return new URLSearchParams();
    }
  }

  function appOpenUrl(result) {
    const params = readParams();
    const appParams = new URLSearchParams();
    appParams.set("v", SUPPORTED_VERSION);
    appParams.set("c", result.tokens.join("-"));

    if (params.get("src")) {
      appParams.set("src", params.get("src"));
    }

    return "arboxing://combo?" + appParams.toString();
  }

  function cleanSource(value) {
    if (typeof value !== "string") {
      return "";
    }

    return value.trim().replace(/[^a-z0-9_.-]/gi, "_").slice(0, 40);
  }

  function parseCombo() {
    if (!["/combo", "/combo/"].includes(window.location.pathname)) {
      return { ok: false, reason: "wrong_path" };
    }

    if (window.location.href.length > 1200) {
      return { ok: false, reason: "url_too_long" };
    }

    const params = readParams();
    const version = params.get("v");
    const combo = params.get("c");
    const source = cleanSource(params.get("src"));

    if (version !== SUPPORTED_VERSION) {
      return { ok: false, reason: "unsupported_version", source };
    }

    if (!combo) {
      return { ok: false, reason: "missing_combo", source };
    }

    const tokens = combo.split("-");
    if (!tokens.length || tokens.length > MAX_MOVES) {
      return { ok: false, reason: "invalid_length", source };
    }

    for (const token of tokens) {
      if (!token || !Object.prototype.hasOwnProperty.call(TOKEN_LABELS, token)) {
        return { ok: false, reason: "unknown_token", source };
      }
    }

    return {
      ok: true,
      source,
      tokens,
      labels: tokens.map(function (token) {
        return TOKEN_LABELS[token];
      })
    };
  }

  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node) {
      node.textContent = value;
    }
  }

  function show(selector) {
    const node = document.querySelector(selector);
    if (node) {
      node.hidden = false;
    }
  }

  function showAppOpenFallback() {
    window.setTimeout(function () {
      if (!document.hidden) {
        show("[data-open-fallback]");
      }
    }, 900);
  }

  function renderValidCombo(result) {
    setText("[data-combo-title]", "Shared Combo");
    setText("[data-combo-message]", "Preview this combo, then open it in AR Boxing to import it.");
    show("[data-combo-actions]");
    show("[data-combo-preview]");
    show("[data-combo-note]");

    const sourceNode = document.querySelector("[data-combo-source]");
    if (sourceNode && result.source) {
      sourceNode.textContent = "Source: " + result.source;
      sourceNode.hidden = false;
    }

    const openLink = document.querySelector("[data-open-combo-app]");
    if (openLink) {
      openLink.href = appOpenUrl(result);
      openLink.addEventListener("click", function () {
        emitSharedComboEvent({
          action: "open_in_app_clicked",
          valid: "true",
          combo_length: String(result.tokens.length),
          combo_source: result.source || "none"
        });
        showAppOpenFallback();
      });
    }

    const list = document.querySelector("[data-combo-moves]");
    if (list) {
      list.textContent = "";
      result.labels.forEach(function (label) {
        const item = document.createElement("li");
        item.textContent = label;
        list.appendChild(item);
      });
    }

    emitSharedComboEvent({
      action: "viewed",
      valid: "true",
      combo_length: String(result.tokens.length),
      combo_source: result.source || "none"
    });
  }

  function renderInvalidCombo(result) {
    setText("[data-combo-title]", "That combo link is not supported.");
    setText("[data-combo-message]", "This QR code may be old, incomplete, or built with moves this version of AR Boxing does not recognize.");
    show("[data-combo-error-actions]");

    emitSharedComboEvent({
      action: "viewed",
      valid: "false",
      error_reason: result.reason || "unknown",
      combo_source: result.source || "none"
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    const result = parseCombo();
    if (result.ok) {
      renderValidCombo(result);
    } else {
      renderInvalidCombo(result);
    }
  });
})();
