(function () {
  "use strict";

  const comboTemplates = {
    balanced: [
      { moves: ["Jab", "Cross", "Lead hook"], note: "Classic 1-2-3: straights set the line, then the hook changes the angle." },
      { moves: ["Jab", "Jab", "Cross"], note: "Double jab to measure distance, then finish with the rear hand." },
      { moves: ["Jab", "Cross", "Lead hook", "Cross"], note: "Classic 1-2-3-2: the hook loads the final cross." },
      { moves: ["Cross", "Lead hook", "Cross"], note: "Power combo for closer range. Keep your feet under you." },
      { moves: ["Jab", "Cross", "Lead uppercut", "Cross"], note: "Straight punches raise the guard, then the uppercut splits the middle." },
      { moves: ["Jab", "Cross", "Lead hook", "Cross", "Step back"], note: "Finish the combination with distance instead of standing in front of the target." },
      { moves: ["Jab", "Jab", "Cross", "Lead hook", "Cross", "Step back"], note: "Volume combination: double jab to enter, then keep the finish balanced." }
    ],
    punches: [
      { moves: ["Jab", "Cross", "Lead hook"], note: "Foundational 1-2-3. Snap each hand back to guard." },
      { moves: ["Jab", "Jab", "Cross"], note: "Use the first jab to find range and the second to set the cross." },
      { moves: ["Cross", "Lead hook", "Cross"], note: "A compact power chain for pocket-range drilling." },
      { moves: ["Lead hook", "Cross", "Lead hook"], note: "Hooks bookend the cross. Rotate, do not swing wide." },
      { moves: ["Jab", "Cross", "Lead uppercut", "Cross"], note: "A real uppercut pattern: straight, straight, lift, finish." },
      { moves: ["Jab", "Jab", "Rear uppercut", "Jab", "Cross"], note: "Double jab pressure, then uppercut through the center." },
      { moves: ["Jab", "Cross", "Lead hook", "Rear hook", "Lead uppercut", "Cross"], note: "Longer conditioning combo. Slow it down until the form stays clean." }
    ],
    defense: [
      { moves: ["Jab", "Slip right", "Cross"], note: "Hit, move your head off the center line, then counter." },
      { moves: ["Jab", "Cross", "Roll"], note: "Finish with defense instead of admiring the combo." },
      { moves: ["Jab", "Cross", "Slip left", "Cross"], note: "Throw the 1-2, slip the return, answer with the rear hand." },
      { moves: ["Jab", "Cross", "Roll", "Lead hook"], note: "Roll under the imagined counter and come back with the hook." },
      { moves: ["Jab", "Cross", "Lead hook", "Roll", "Cross"], note: "Punch in combination, defend, then finish from the new angle." },
      { moves: ["Jab", "Jab", "Cross", "Slip left", "Cross", "Step back"], note: "Enter behind the jab, counter after the slip, then exit." }
    ],
    body: [
      { moves: ["Jab", "Body jab", "Cross"], note: "Change levels with the jab, then bring the cross back upstairs." },
      { moves: ["Jab", "Cross to body", "Lead hook"], note: "Head-body-head: sell the body shot so the hook has room." },
      { moves: ["Jab", "Cross", "Lead hook to body"], note: "Start high, then bend your knees and dig the hook to the body." },
      { moves: ["Jab", "Cross to body", "Lead hook", "Cross"], note: "Body shot lowers the guard, then return upstairs." },
      { moves: ["Jab", "Body jab", "Cross", "Lead hook to body", "Lead hook"], note: "Level-change sequence: body work first, then back to the head." },
      { moves: ["Jab", "Jab", "Cross to body", "Lead hook to body", "Lead hook", "Cross"], note: "Double jab entry into body-head finishing work." }
    ]
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

  function isDefenseMove(move) {
    return defenseMoves.includes(move);
  }

  function findTemplate(length, focus, includeDefense) {
    const focusTemplates = comboTemplates[focus] || comboTemplates.balanced;
    const pool = includeDefense ? focusTemplates.concat(comboTemplates.defense) : focusTemplates;
    const exactMatches = pool.filter(function (template) {
      return template.moves.length === length;
    });

    if (exactMatches.length > 0) {
      return pick(exactMatches);
    }

    return pick(pool);
  }

  function fitComboToLength(template, length, includeDefense) {
    const combo = template.moves.slice(0, length);

    while (combo.length < length) {
      if (includeDefense && combo.length >= length - 1) {
        combo.push(pick(defenseMoves));
      } else if (combo.length % 2 === 0) {
        combo.push("Jab");
      } else {
        combo.push("Cross");
      }
    }

    if (includeDefense && !combo.some(isDefenseMove) && length >= 3) {
      combo[Math.max(1, length - 2)] = pick(defenseMoves);
    }

    return combo;
  }

  function buildCombo(length, focus, includeDefense) {
    const template = findTemplate(length, focus, includeDefense);
    const moves = fitComboToLength(template, length, includeDefense);
    const originalHadDefense = template.moves.slice(0, length).some(isDefenseMove);
    const note = includeDefense && !originalHadDefense && moves.some(isDefenseMove)
      ? "Suggested rhythm: throw the punches cleanly, make the defensive move small, then reset your guard."
      : template.note || pick(notes);

    return {
      moves,
      note
    };
  }

  function renderCombo(output, combo) {
    output.innerHTML = "";
    combo.moves.forEach(function (move) {
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
        note.textContent = combo.note;
      });
    });
  });
})();
