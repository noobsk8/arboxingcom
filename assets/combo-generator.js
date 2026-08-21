(function () {
  "use strict";

  const punchSets = {
    balanced: ["Jab", "Cross", "Lead hook", "Rear hook", "Lead uppercut", "Rear uppercut", "Body jab", "Cross to body"],
    punches: ["Jab", "Cross", "Lead hook", "Rear hook", "Lead uppercut", "Rear uppercut", "Double jab", "Overhand"],
    defense: ["Jab", "Cross", "Lead hook", "Slip left", "Slip right", "Roll", "Guard block", "Step back"],
    body: ["Body jab", "Cross to body", "Lead hook to body", "Rear hook to body", "Jab", "Cross", "Roll", "Step back"]
  };

  const defenseMoves = ["Slip left", "Slip right", "Roll", "Guard block", "Step back"];
  const notes = [
    "Suggested rhythm: steady pace, clean form, reset your guard after the final move.",
    "Suggested rhythm: start slow, then repeat the combo with a sharper finish.",
    "Suggested rhythm: breathe on each punch and return to stance after the defense.",
    "Suggested rhythm: treat the last movement as your reset before the next repetition."
  ];

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function buildCombo(length, focus, includeDefense) {
    const pool = punchSets[focus] || punchSets.balanced;
    const combo = [];

    for (let index = 0; index < length; index += 1) {
      const shouldUseDefense = includeDefense && index > 0 && index < length - 1 && Math.random() < 0.28;
      combo.push(shouldUseDefense ? pick(defenseMoves) : pick(pool));
    }

    if (includeDefense && !combo.some(function (move) { return defenseMoves.includes(move); }) && length >= 4) {
      combo[length - 2] = pick(defenseMoves);
    }

    return combo;
  }

  function renderCombo(output, combo) {
    output.innerHTML = "";
    combo.forEach(function (move) {
      const item = document.createElement("li");
      item.textContent = move;
      output.appendChild(item);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-combo-generator]").forEach(function (tool) {
      const lengthInput = tool.querySelector("[data-combo-length]");
      const focusInput = tool.querySelector("[data-combo-focus]");
      const defenseInput = tool.querySelector("[data-combo-defense]");
      const generateButton = tool.querySelector("[data-generate-combo]");
      const output = tool.querySelector("[data-combo-output]");
      const note = tool.querySelector("[data-combo-note]");

      if (!lengthInput || !focusInput || !defenseInput || !generateButton || !output || !note) {
        return;
      }

      generateButton.addEventListener("click", function () {
        const length = Number(lengthInput.value) || 4;
        const combo = buildCombo(length, focusInput.value, defenseInput.checked);
        renderCombo(output, combo);
        note.textContent = pick(notes);
      });
    });
  });
})();
