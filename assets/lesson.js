const activateStep = (stepper, selectedButton) => {
  const buttons = [...stepper.querySelectorAll("[data-step]")];
  const panels = [...stepper.querySelectorAll("[data-step-panel]")];
  const panelId = selectedButton.getAttribute("aria-controls");

  for (const button of buttons) {
    button.setAttribute("aria-selected", String(button === selectedButton));
  }

  for (const panel of panels) {
    panel.hidden = panel.id !== panelId;
  }
};

for (const stepper of document.querySelectorAll("[data-stepper]")) {
  const buttons = [...stepper.querySelectorAll("[data-step]")];

  for (const button of buttons) {
    button.addEventListener("click", () => activateStep(stepper, button));
  }

  const selectedButton =
    buttons.find((button) => button.getAttribute("aria-selected") === "true") ??
    buttons[0];

  if (selectedButton) {
    activateStep(stepper, selectedButton);
  }
}

for (const quiz of document.querySelectorAll("[data-quiz]")) {
  quiz.addEventListener("submit", (event) => {
    event.preventDefault();

    const answer = new FormData(quiz).get("answer");
    const result = quiz.querySelector("[data-quiz-result]");
    const correctAnswer = quiz.dataset.correct;

    if (!result) {
      return;
    }

    if (!answer) {
      result.dataset.state = "incorrect";
      result.textContent = "Elegí una respuesta antes de verificar.";
      return;
    }

    const isCorrect = answer === correctAnswer;
    result.dataset.state = isCorrect ? "correct" : "incorrect";
    result.textContent = isCorrect
      ? `Correcto. ${quiz.dataset.success ?? ""}`
      : `Todavía no. ${quiz.dataset.retry ?? "Volvé al mapa y seguí el artefacto."}`;
  });
}
