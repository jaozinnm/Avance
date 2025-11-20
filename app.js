// -------------------------
// CONFIGURAÇÕES GLOBAIS
// -------------------------
let voiceAssistEnabled = true;
let voiceInputEnabled = true;

// Carrega preferências do localStorage
function loadSettings() {
  const voiceAssist = localStorage.getItem("avance_voiceAssist");
  const voiceInput = localStorage.getItem("avance_voiceInput");

  if (voiceAssist !== null) {
    voiceAssistEnabled = voiceAssist === "true";
  }
  if (voiceInput !== null) {
    voiceInputEnabled = voiceInput === "true";
  }
}

function saveSettings() {
  localStorage.setItem("avance_voiceAssist", String(voiceAssistEnabled));
  localStorage.setItem("avance_voiceInput", String(voiceInputEnabled));
}

// -------------------------
// TEXTO EM VOZ ALTA
// -------------------------
let currentUtterance = null;

function speakText(text) {
  if (!voiceAssistEnabled) return;
  if (!("speechSynthesis" in window)) return;

  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 1;
  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

// Habilita "pressionar e segurar" para ler
function enablePressToSpeak() {
  const speakableElements = document.querySelectorAll("[data-speak]");

  speakableElements.forEach((el) => {
    if (el.dataset.speakBound === "true") return;
    el.dataset.speakBound = "true";

    const text = el.textContent.trim();

    const start = (event) => {
      event.preventDefault();
      speakText(text);
    };

    const end = () => {
      stopSpeaking();
    };

    el.addEventListener("mousedown", start);
    el.addEventListener("touchstart", start, { passive: false });

    el.addEventListener("mouseup", end);
    el.addEventListener("mouseleave", end);
    el.addEventListener("touchend", end);
    el.addEventListener("touchcancel", end);
  });
}

// -------------------------
// RECONHECIMENTO DE VOZ
// -------------------------
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.continuous = false;
  recognition.interimResults = false;
}

// Liga botão de voz a um input (usado na tela de lição)
function attachVoiceToInput(inputElement, statusElement, buttonElement) {
  if (!recognition || !voiceInputEnabled) {
    statusElement.textContent =
      "Se o seu navegador permitir, esta opção ficará disponível.";
    buttonElement.disabled = !recognition || !voiceInputEnabled;
    return;
  }

  buttonElement.disabled = false;

  let isListening = false;

  buttonElement.addEventListener("click", () => {
    if (!isListening) {
      try {
        recognition.start();
        isListening = true;
        buttonElement.classList.add("voice-button--active");
        statusElement.textContent =
          "Ouvindo. Fale claramente perto do microfone.";
      } catch (error) {
        statusElement.textContent =
          "Não foi possível iniciar o reconhecimento de voz.";
      }
    } else {
      recognition.stop();
      isListening = false;
      buttonElement.classList.remove("voice-button--active");
      statusElement.textContent = "";
    }
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    inputElement.value = transcript;
    statusElement.textContent = "Texto preenchido com a sua fala.";
  };

  recognition.onerror = () => {
    statusElement.textContent =
      "Ocorreu um erro no reconhecimento de voz. Tente novamente.";
    buttonElement.classList.remove("voice-button--active");
    isListening = false;
  };

  recognition.onend = () => {
    buttonElement.classList.remove("voice-button--active");
    isListening = false;
  };
}

// -------------------------
// DADOS DA TRILHA (tela de lição)
// -------------------------
const tracks = {
  "meu-nome": {
    titulo: "Meu nome",
    passos: [
      {
        tipo: "texto",
        pergunta: "Vamos começar pelo seu nome.",
        instrucoes:
          "Digite o seu primeiro nome como você gostaria de vê-lo escrito.",
        placeholder: "Exemplo: João",
      },
      {
        tipo: "opcoes",
        pergunta: "Qual destas opções está escrita corretamente?",
        instrucoes: "Selecione a opção correta.",
        opcoes: ["joao", "JOAO", "João"],
        corretaIndex: 2,
      },
      {
        tipo: "texto",
        pergunta: "Agora escreva o seu nome completo.",
        instrucoes: "Não se preocupe. Depois você poderá ajustar.",
        placeholder: "Seu nome completo",
      },
    ],
  },
};

// -------------------------
// TELA DE LIÇÃO
// -------------------------
function initLessonPage() {
  const container = document.getElementById("lesson-step-content");
  if (!container) return; // não está na página de lição

  const lessonTitle = document.getElementById("lesson-title");
  const lessonSubtitle = document.getElementById("lesson-subtitle");
  const lessonProgress = document.getElementById("lesson-progress");
  const btnNext = document.getElementById("btn-next");
  const btnSkip = document.getElementById("btn-skip");
  const backButton = document.getElementById("btn-back-home");

  let trilhaAtual = tracks["meu-nome"];
  let passoAtualIndex = 0;

  function atualizarPasso() {
    const total = trilhaAtual.passos.length;
    const passo = trilhaAtual.passos[passoAtualIndex];
    const numero = passoAtualIndex + 1;

    lessonTitle.textContent = trilhaAtual.titulo;
    lessonSubtitle.textContent = `Lição ${numero} de ${total}`;
    lessonProgress.style.width = `${Math.round((numero / total) * 100)}%`;

    if (passo.tipo === "texto") {
      container.innerHTML = `
        <div class="lesson-card">
          <p class="lesson-question" data-speak>${passo.pergunta}</p>
          <p class="lesson-instruction" data-speak>${passo.instrucoes}</p>

          <div class="answer-input-wrap">
            <label class="sr-only" for="answer-text">Resposta</label>
            <input
              id="answer-text"
              class="answer-input"
              type="text"
              placeholder="${passo.placeholder || ""}"
            />
            <button
              type="button"
              class="voice-button"
              id="voice-button"
            >
              Falar
            </button>
          </div>

          <p class="voice-status" id="voice-status"></p>
        </div>
      `;

      const input = document.getElementById("answer-text");
      const voiceButton = document.getElementById("voice-button");
      const voiceStatus = document.getElementById("voice-status");
      attachVoiceToInput(input, voiceStatus, voiceButton);
    } else if (passo.tipo === "opcoes") {
      const opcoesHTML = passo.opcoes
        .map(
          (opcao, index) => `
            <button
              class="option-button"
              data-option-index="${index}"
              data-speak
            >
              ${opcao}
            </button>
          `
        )
        .join("");

      container.innerHTML = `
        <div class="lesson-card">
          <p class="lesson-question" data-speak>${passo.pergunta}</p>
          <p class="lesson-instruction" data-speak>${passo.instrucoes}</p>
          <div class="options-grid">
            ${opcoesHTML}
          </div>
        </div>
      `;

      container.querySelectorAll(".option-button").forEach((button) => {
        button.addEventListener("click", () => {
          container
            .querySelectorAll(".option-button")
            .forEach((b) => b.classList.remove("option-button--selected"));

          button.classList.add("option-button--selected");
        });
      });
    }

    enablePressToSpeak();
  }

  btnNext.addEventListener("click", () => {
    if (passoAtualIndex < trilhaAtual.passos.length - 1) {
      passoAtualIndex++;
      atualizarPasso();
    } else {
      alert("Parabéns. Você concluiu esta demonstração da trilha.");
      window.location.href = "home.html";
    }
  });

  btnSkip.addEventListener("click", () => {
    if (passoAtualIndex < trilhaAtual.passos.length - 1) {
      passoAtualIndex++;
      atualizarPasso();
    } else {
      window.location.href = "home.html";
    }
  });

  if (backButton) {
    backButton.addEventListener("click", () => {
      window.location.href = "home.html";
    });
  }

  atualizarPasso();
}

// -------------------------
// TELA DE CONFIGURAÇÕES
// -------------------------
function initSettingsPage() {
  const toggleVoiceAssist = document.getElementById("toggle-voice-assist");
  const toggleVoiceInput = document.getElementById("toggle-voice-input");
  const textSizeButtons = document.querySelectorAll(".text-size-btn");

  if (!toggleVoiceAssist || !toggleVoiceInput) return;

  const updateToggleVisual = (button, isOn) => {
    if (isOn) {
      button.classList.add("toggle--on");
      button.setAttribute("aria-checked", "true");
    } else {
      button.classList.remove("toggle--on");
      button.setAttribute("aria-checked", "false");
    }
  };

  updateToggleVisual(toggleVoiceAssist, voiceAssistEnabled);
  updateToggleVisual(toggleVoiceInput, voiceInputEnabled);

  toggleVoiceAssist.addEventListener("click", () => {
    voiceAssistEnabled = !voiceAssistEnabled;
    updateToggleVisual(toggleVoiceAssist, voiceAssistEnabled);
    saveSettings();
    if (!voiceAssistEnabled) stopSpeaking();
  });

  toggleVoiceInput.addEventListener("click", () => {
    voiceInputEnabled = !voiceInputEnabled;
    updateToggleVisual(toggleVoiceInput, voiceInputEnabled);
    saveSettings();
  });

  textSizeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      textSizeButtons.forEach((b) =>
        b.classList.remove("text-size-btn--active")
      );
      btn.classList.add("text-size-btn--active");

      const size = btn.getAttribute("data-size");
      if (size === "small") {
        document.documentElement.style.setProperty("--font-size-base", "0.95rem");
      } else if (size === "large") {
        document.documentElement.style.setProperty("--font-size-base", "1.1rem");
      } else {
        document.documentElement.style.setProperty("--font-size-base", "1rem");
      }
    });
  });
}

// -------------------------
// TELA DE ONBOARDING
// -------------------------
function initOnboardingPage() {
  const levelCards = document.querySelectorAll(".level-card");
  const levelSummary = document.getElementById("level-summary");
  const btnApplyLevel = document.getElementById("btn-apply-level");
  if (!levelCards.length) return;

  let selectedLevel = null;

  levelCards.forEach((card) => {
    card.addEventListener("click", () => {
      levelCards.forEach((c) => c.classList.remove("level-card--selected"));
      card.classList.add("level-card--selected");
      selectedLevel = card.getAttribute("data-level");

      if (selectedLevel === "iniciante") {
        levelSummary.textContent =
          "Você escolheu começar do zero. A trilha recomendada começa em 'Meu nome' e 'Palavras simples'.";
      } else if (selectedLevel === "intermediario") {
        levelSummary.textContent =
          "Você já lê algumas palavras. A trilha recomendada começa em 'Palavras simples' e 'Mundo digital'.";
      } else if (selectedLevel === "avancado") {
        levelSummary.textContent =
          "Você já lê textos simples. Vamos focar em 'Mundo digital' e 'Meu currículo'.";
      }
    });
  });

  btnApplyLevel.addEventListener("click", () => {
    if (!selectedLevel) {
      alert("Escolha uma opção de nível para que possamos sugerir a trilha.");
      return;
    }
    alert("Trilha sugerida aplicada para este protótipo.");
    window.location.href = "home.html";
  });
}

// -------------------------
// INICIALIZAÇÃO GERAL
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  enablePressToSpeak();

  const page = document.body.dataset.page;

  if (page === "lesson") {
    initLessonPage();
  } else if (page === "settings") {
    initSettingsPage();
  } else if (page === "onboarding") {
    initOnboardingPage();
  }
});
