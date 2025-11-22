document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const body = document.body;
  const page = body.dataset.page || "";

  /* -----------------------
   * 1. Tema claro/escuro
   * --------------------- */
  const THEME_KEY = "avance-theme";

  function applyTheme(theme) {
    const normalized = theme === "dark" ? "dark" : "light";
    root.setAttribute("data-theme", normalized);

    document.querySelectorAll("#theme-toggle").forEach((btn) => {
      const isDark = normalized === "dark";
      btn.setAttribute("aria-pressed", String(isDark));
      const icon = btn.querySelector(".theme-toggle-icon");
      if (icon) {
        icon.textContent = isDark ? "🌙" : "☀️";
      }
    });

    const darkToggle = document.getElementById("toggle-dark-mode");
    if (darkToggle) {
      const isDark = normalized === "dark";
      darkToggle.classList.toggle("toggle--on", isDark);
      darkToggle.setAttribute("aria-checked", String(isDark));
    }
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    let theme = stored;

    if (!theme) {
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      theme = prefersDark ? "dark" : "light";
    }

    applyTheme(theme);

    document.querySelectorAll("#theme-toggle, #toggle-dark-mode").forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = root.getAttribute("data-theme") || "light";
        const next = current === "light" ? "dark" : "light";
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
      });
    });
  }

  initTheme();

  /* -----------------------
   * 2. Tamanho do texto
   * --------------------- */
  const TEXT_SIZE_KEY = "avance-text-size";

  function applyTextSize(size) {
    const validSizes = ["small", "medium", "large"];
    const finalSize = validSizes.includes(size) ? size : "medium";

    root.setAttribute("data-text-size", finalSize);
    root.classList.remove("text-size-small", "text-size-medium", "text-size-large");
    root.classList.add("text-size-" + finalSize);

    document.querySelectorAll(".text-size-btn").forEach((btn) => {
      const btnSize = btn.dataset.size;
      btn.classList.toggle("text-size-btn--active", btnSize === finalSize);
    });
  }

  function initTextSize() {
    const stored = localStorage.getItem(TEXT_SIZE_KEY) || "medium";
    applyTextSize(stored);

    document.querySelectorAll(".text-size-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const size = btn.dataset.size || "medium";
        localStorage.setItem(TEXT_SIZE_KEY, size);
        applyTextSize(size);
      });
    });
  }

  initTextSize();

  /* -----------------------
   * 3. Toggles de acessibilidade
   * --------------------- */

  const VOICE_ASSIST_KEY = "avance-voice-assist";
  const VOICE_INPUT_KEY = "avance-voice-input";

  function applyToggleState(button, isOn) {
    if (!button) return;
    button.classList.toggle("toggle--on", isOn);
    button.setAttribute("aria-checked", String(isOn));
  }

  function initToggle(id, storageKey, defaultOn = true) {
    const btn = document.getElementById(id);
    if (!btn) return;

    const stored = localStorage.getItem(storageKey);
    const initial =
      stored === null ? defaultOn : stored === "true" || stored === "1";

    applyToggleState(btn, initial);

    btn.addEventListener("click", () => {
      const current = btn.getAttribute("aria-checked") === "true";
      const next = !current;
      applyToggleState(btn, next);
      localStorage.setItem(storageKey, String(next));
    });
  }

  function isVoiceAssistEnabled() {
    const stored = localStorage.getItem(VOICE_ASSIST_KEY);
    return stored === null || stored === "true" || stored === "1";
  }

  function isVoiceInputEnabled() {
    const stored = localStorage.getItem(VOICE_INPUT_KEY);
    return stored === null || stored === "true" || stored === "1";
  }

  initToggle("toggle-voice-assist", VOICE_ASSIST_KEY, true);
  initToggle("toggle-voice-input", VOICE_INPUT_KEY, true);

  /* -----------------------
   * 4. Leitura em voz alta (pressionar e segurar)
   * --------------------- */

  function initVoiceReading() {
    if (!("speechSynthesis" in window)) {
      return;
    }

    let pressTimer = null;

    function speak(text) {
      if (!text) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "pt-BR";
      utter.rate = 1;
      speechSynthesis.speak(utter);
    }

    function startPress(event) {
      if (!isVoiceAssistEnabled()) return;
      const target = event.currentTarget;
      const text = target.innerText || target.textContent || "";

      pressTimer = window.setTimeout(() => {
        speak(text.trim());
      }, 500);
    }

    function cancelPress() {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    }

    document.querySelectorAll("[data-speak]").forEach((el) => {
      el.addEventListener("mousedown", startPress);
      el.addEventListener("touchstart", startPress);
      el.addEventListener("mouseup", cancelPress);
      el.addEventListener("mouseleave", cancelPress);
      el.addEventListener("touchend", cancelPress);
      el.addEventListener("touchcancel", cancelPress);
    });
  }

  initVoiceReading();

  /* -----------------------
   * 5. Navegação inferior (marca página atual)
   * --------------------- */

  function initBottomNav() {
    const currentPage = body.dataset.page;
    if (!currentPage) return;

    const navItems = document.querySelectorAll(".bottom-nav .nav-item");
    if (!navItems.length) return;

    navItems.forEach((item) => item.classList.remove("nav-item--active"));

    navItems.forEach((item) => {
      const href = item.getAttribute("href") || "";
      if (href.includes(currentPage)) {
        item.classList.add("nav-item--active");
      }
    });
  }

  initBottomNav();

  /* -----------------------
   * 6. Página de lição – fluxo dinâmico
   * --------------------- */

  if (page === "lesson") {
    const LESSON_STEPS = [
      {
        id: "seu-nome",
        type: "input",
        question: "Qual é o seu nome?",
        instruction: "Escreva seu nome como você costuma assinar.",
        placeholder: "Digite seu nome",
      },
      {
        id: "reconhecer-nome",
        type: "choice",
        question: "Qual destas opções está igual ao seu nome?",
        instruction: "Escolha a opção escrita corretamente.",
        options: [
          "joao silva",
          "João silva",
          "João Silva",
          "JOAO SILVA",
        ],
      },
      {
        id: "treino-final",
        type: "input",
        question: "Treine escrever seu nome mais uma vez",
        instruction: "Escreva seu nome em letra de forma, com calma.",
        placeholder: "Escreva seu nome novamente",
      },
    ];

    const progressFill = document.getElementById("lesson-progress");
    const subtitle = document.getElementById("lesson-subtitle");
    const content = document.getElementById("lesson-step-content");
    const btnNext = document.getElementById("btn-next");
    const btnSkip = document.getElementById("btn-skip");
    const btnBackHome = document.getElementById("btn-back-home");

    let currentStepIndex = 0;

    function updateProgress() {
      if (!progressFill) return;
      const total = LESSON_STEPS.length;
      const percent = ((currentStepIndex + 1) / total) * 100;
      progressFill.style.width = percent + "%";

      if (subtitle) {
        subtitle.textContent = `Lição ${currentStepIndex + 1} de ${total}`;
      }
    }

    function renderStep() {
      if (!content) return;

      const step = LESSON_STEPS[currentStepIndex];
      if (!step) {
        content.innerHTML = `
          <article class="lesson-card">
            <h2 class="lesson-question" data-speak>Parabéns!</h2>
            <p class="lesson-instruction" data-speak>
              Você completou esta lição. Continue praticando seu nome sempre que puder.
            </p>
          </article>
        `;
        if (btnNext) {
          btnNext.textContent = "Concluir";
        }
        initVoiceReading();
        return;
      }

      let inner = `
        <article class="lesson-card">
          <h2 class="lesson-question" data-speak>${step.question}</h2>
          <p class="lesson-instruction" data-speak>${step.instruction}</p>
      `;

      if (step.type === "input") {
        inner += `
          <div class="answer-input-wrap">
            <input
              id="answer-input"
              class="answer-input"
              type="text"
              autocomplete="off"
              placeholder="${step.placeholder || ""}"
            />
            <button
              type="button"
              class="voice-button"
              id="voice-input-btn"
            >
              Falar
            </button>
          </div>
          <p class="voice-status" id="voice-status">
            Toque em "Falar" para responder por voz.
          </p>
        `;
      } else if (step.type === "choice") {
        inner += `<div class="options-grid">`;
        (step.options || []).forEach((opt, index) => {
          inner += `
            <button
              type="button"
              class="option-button"
              data-option-index="${index}"
            >
              ${opt}
            </button>
          `;
        });
        inner += `</div>`;
      }

      inner += `</article>`;
      content.innerHTML = inner;

      updateProgress();
      initVoiceReading();
      initLessonVoiceInput(step);
      initChoiceStep(step);
    }

    function initLessonVoiceInput(step) {
      if (!isVoiceInputEnabled()) return;
      if (!step || step.type !== "input") return;

      const input = document.getElementById("answer-input");
      const btn = document.getElementById("voice-input-btn");
      const statusEl = document.getElementById("voice-status");

      if (!input || !btn) return;

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        if (statusEl) {
          statusEl.textContent =
            "Seu navegador não suporta entrada por voz. Tudo bem, você pode digitar.";
        }
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      let listening = false;

      recognition.addEventListener("start", () => {
        listening = true;
        btn.classList.add("voice-button--active");
        if (statusEl) {
          statusEl.textContent = "Ouvindo... fale seu nome.";
        }
      });

      recognition.addEventListener("end", () => {
        listening = false;
        btn.classList.remove("voice-button--active");
        if (statusEl && !input.value) {
          statusEl.textContent =
            'Não entendi. Toque em "Falar" e tente novamente.';
        }
      });

      recognition.addEventListener("result", (event) => {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        if (statusEl) {
          statusEl.textContent = "Tudo certo! Você pode ajustar o texto se quiser.";
        }
      });

      btn.addEventListener("click", () => {
        if (!isVoiceInputEnabled()) {
          if (statusEl) {
            statusEl.textContent =
              "Entrada por voz está desativada nas configurações.";
          }
          return;
        }

        if (listening) {
          recognition.stop();
        } else {
          try {
            recognition.start();
          } catch (e) {
          }
        }
      });
    }

    function initChoiceStep(step) {
      if (!step || step.type !== "choice") return;

      const buttons = content.querySelectorAll(".option-button");
      if (!buttons.length) return;

      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          buttons.forEach((b) =>
            b.classList.remove("option-button--selected")
          );
          btn.classList.add("option-button--selected");
        });
      });
    }

    if (btnNext) {
      btnNext.addEventListener("click", () => {
        if (currentStepIndex >= LESSON_STEPS.length) {
          window.location.href = "home.html";
          return;
        }
        currentStepIndex += 1;
        renderStep();
      });
    }

    if (btnSkip) {
      btnSkip.addEventListener("click", () => {
        currentStepIndex += 1;
        renderStep();
      });
    }

    if (btnBackHome) {
      btnBackHome.addEventListener("click", () => {
        window.location.href = "home.html";
      });
    }

    renderStep();
  }
});
