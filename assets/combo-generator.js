(function () {
  "use strict";

  const MAX_MOVES = 12;
  const MOVE_GROUPS = {
    head: [["ljh", "L Jab", "Head"], ["rch", "R Cross", "Head"], ["lhh", "L Hook", "Head"], ["rhh", "R Hook", "Head"], ["loh", "L Overhand", "Head"], ["roh", "R Overhand", "Head"], ["luh", "L Uppercut", "Head"], ["ruh", "R Uppercut", "Head"]],
    body: [["ljb", "L Jab", "Body"], ["rcb", "R Cross", "Body"], ["lhb", "L Hook", "Body"], ["rhb", "R Hook", "Body"], ["lgb", "L Guard", "Body"], ["rgb", "R Guard", "Body"]],
    low: [["ljl", "L Jab", "Low"], ["rcl", "R Cross", "Low"], ["lhl", "L Hook", "Low"], ["rhl", "R Hook", "Low"]],
    defense: [["sl", "Slip Left", "Defense"], ["sr", "Slip Right", "Defense"], ["rolll", "Roll Left", "Defense"], ["rollr", "Roll Right", "Defense"], ["lgh", "L Guard", "Head"], ["rgh", "R Guard", "Head"]],
    utility: [["rest10", "Rest", "10 sec"], ["rest30", "Rest", "30 sec"], ["repeat", "Repeat", "Combo"]]
  };
  const labels = Object.fromEntries(Object.values(MOVE_GROUPS).flat().map(function (move) { return [move[0], move[1] + " - " + move[2]]; }));

  function cleanSource(value) { return typeof value === "string" ? value.trim().replace(/[^a-z0-9_.-]/gi, "_").slice(0, 40) : ""; }
  function currentSource() { try { return cleanSource(new URLSearchParams(window.location.search).get("src")); } catch (error) { return ""; } }
  function makeHttpsUrl(tokens) {
    const url = new URL("/combo", window.location.origin);
    url.searchParams.set("v", "1");
    url.searchParams.set("c", tokens.join("-"));
    const source = currentSource();
    if (source) url.searchParams.set("src", source);
    return url.toString();
  }
  function makeAppUrl(tokens) {
    const url = new URL("arboxing://combo");
    url.searchParams.set("v", "1");
    url.searchParams.set("c", tokens.join("-"));
    const source = currentSource();
    if (source) url.searchParams.set("src", source);
    return url.toString();
  }
  function emit(action, extra) { window.dispatchEvent(new CustomEvent("arboxing:combo_builder", { detail: Object.assign({ action: action }, extra || {}) })); }
  function renderQr(node, url) {
    node.textContent = "";
    if (!window.qrcode) { node.textContent = "QR unavailable"; return; }
    const qr = window.qrcode(0, "M");
    qr.addData(url);
    qr.make();
    node.innerHTML = qr.createImgTag(4, 8);
    const image = node.querySelector("img");
    if (image) { image.alt = "QR code for this AR Boxing combo"; image.width = 196; image.height = 196; }
  }

  function setupBuilder(tool) {
    const output = tool.querySelector("[data-combo-output]");
    const count = tool.querySelector("[data-combo-count]");
    const empty = tool.querySelector("[data-combo-empty]");
    const clear = tool.querySelector("[data-clear-combo]");
    const note = tool.querySelector("[data-combo-note]");
    const sharePanel = tool.querySelector("[data-share-panel]");
    const linkInput = tool.querySelector("[data-combo-link]");
    const qr = tool.querySelector("[data-combo-qr]");
    const preview = tool.querySelector("[data-preview-combo]");
    const openApp = tool.querySelector("[data-open-builder-app]");
    const copy = tool.querySelector("[data-copy-combo]");
    const download = tool.querySelector("[data-download-qr]");
    const sequence = [];

    Object.entries(MOVE_GROUPS).forEach(function (entry) {
      const group = tool.querySelector('[data-move-group="' + entry[0] + '"]');
      if (!group) return;
      entry[1].forEach(function (move) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "move-button";
        button.dataset.token = move[0];
        const strong = document.createElement("strong");
        strong.textContent = move[1];
        const span = document.createElement("span");
        span.textContent = move[2];
        button.appendChild(strong);
        button.appendChild(span);
        button.addEventListener("click", function () {
          if (sequence.length >= MAX_MOVES) { note.textContent = "Your combo is full. Remove a move before adding another."; return; }
          sequence.push(move[0]);
          emit("move_added", { combo_length: String(sequence.length), move: move[0] });
          render();
        });
        group.appendChild(button);
      });
    });

    function render() {
      count.textContent = String(sequence.length);
      clear.disabled = sequence.length === 0;
      output.textContent = "";
      if (!sequence.length) {
        output.appendChild(empty);
        sharePanel.hidden = true;
        note.textContent = "Each move is compatible with the AR Boxing app’s shared combo format.";
        return;
      }
      sequence.forEach(function (token, index) {
        const item = document.createElement("li");
        item.className = "sequence-item";
        const text = document.createElement("span");
        text.textContent = labels[token];
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove-move";
        remove.textContent = "Remove";
        remove.addEventListener("click", function () { sequence.splice(index, 1); emit("move_removed", { combo_length: String(sequence.length), move: token }); render(); });
        item.appendChild(text);
        item.appendChild(remove);
        output.appendChild(item);
      });
      updateShare();
    }
    function updateShare() {
      const publicUrl = makeHttpsUrl(sequence);
      linkInput.value = publicUrl;
      preview.href = publicUrl;
      openApp.href = makeAppUrl(sequence);
      renderQr(qr, publicUrl);
      sharePanel.hidden = false;
      note.textContent = "Share the HTTPS link or QR code. Use Open in AR Boxing to send this combo directly to the app.";
      emit("link_generated", { combo_length: String(sequence.length) });
    }
    clear.addEventListener("click", function () { sequence.length = 0; emit("cleared"); render(); });
    copy.addEventListener("click", function () {
      if (!navigator.clipboard || !navigator.clipboard.writeText) return;
      navigator.clipboard.writeText(linkInput.value).then(function () { copy.textContent = "Copied"; window.setTimeout(function () { copy.textContent = "Copy"; }, 1400); }).catch(function () {});
    });
    download.addEventListener("click", function () {
      const image = qr.querySelector("img");
      if (!image) return;
      const anchor = document.createElement("a");
      anchor.href = image.src;
      anchor.download = "ar-boxing-combo-qr.png";
      anchor.click();
      emit("qr_downloaded", { combo_length: String(sequence.length) });
    });
    openApp.addEventListener("click", function () { emit("open_in_app_clicked", { combo_length: String(sequence.length) }); });
    render();
    emit("opened");
  }
  document.addEventListener("DOMContentLoaded", function () { document.querySelectorAll("[data-combo-generator]").forEach(setupBuilder); });
})();
