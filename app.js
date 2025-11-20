// "Banco de dados" simples das unidades / trilhas
const tracks = {
  "meu-nome": {
    titulo: "Meu nome",
    passos: [
      {
        tipo: "texto",
        pergunta: "Vamos começar pelo seu nome.",
        instrucoes: "Digite seu primeiro nome como você gostaria de vê-lo escrito.",
        placeholder: "Ex.: João",
      },
      {
        tipo: "opcoes",
        pergunta: "Qual dessas opções está escrita corretamente?",
        instrucoes: "Toque na opção certa.",
        opcoes: ["joao", "JOAO", "João"],
        corretaIndex: 2,
      },
      {
        tipo: "texto",
        pergunta: "Agora escreva seu nome completo.",
        instrucoes: "Não se preocupe, você pode ajustar depois.",
        placeholder: "Seu nome completo",
      },
    ],
  },
  "palavras-simples": {
    titulo: "Palavras simples",
    passos: [
      {
        tipo: "opcoes",
        pergunta: "Qual palavra combina com a imagem de um livro?",
        instrucoes: "Escolha a palavra correta.",
        opcoes: ["Casa", "Livro", "Mesa"],
        corretaIndex: 1,
      },
      {
        tipo: "texto",
        pergunta: "Escreva a palavra CASA.",
        instrucoes: "Use letras maiúsculas ou minúsculas, como preferir.",
        placeholder: "Digite aqui",
      },
    ],
  },
  "mundo-digital": {
    titulo: "Mundo digital",
    passos: [
      {
        tipo: "opcoes",
        pergunta: "Para que serve o botão de ligar do celular?",
        instrucoes: "Escolha a melhor resposta.",
        opcoes: [
          "Acender a televisão",
          "Ligar e desligar o celular",
          "Chamar o elevador",
        ],
        corretaIndex: 1,
      },
    ],
  },
  "meu-curriculo": {
    titulo: "Meu currículo",
    bloqueada: true,
    passos: [],
  },
  "cursos-parceiros": {
    titulo: "Cursos em Vídeo",
    passos: [
      {
        tipo: "texto",
        pergunta: "Integração com cursos do Curso em Vídeo.",
        instrucoes:
          "No protótipo, mostramos a ideia de usar trilhas conectadas a esses cursos.",
        placeholder: "Qual curso você faria primeiro?",
      },
    ],
  },
};

// Referências de elementos
const screenHome = document.getElementById("screen-home");
const screenLesson = document.getElementById("screen-lesson");

const lessonTitle = document.getElementById("lesson-title");
const lessonSubtitle = document.getElementById("lesson-subtitle");
const lessonProgress = document.getElementById("lesson-progress");
const lessonStepContent = document.getElementById("lesson-step-content");

const btnNext = document.getElementById("btn-next");
const btnSkip = document.getElementById("btn-skip");
const backButton = document.querySelector('[data-action="go-home"]');
const btnContinueHero = document.getElementById("btn-continue");

let trilhaAtual = null;
let passoAtualIndex = 0;

// Abre trilha ao clicar em uma unidade
document.querySelectorAll(".unit-button").forEach((node) => {
  node.addEventListener("click", () => {
    const id = node.getAttribute("data-unit-id");
    const trilha = tracks[id];

    if (!trilha) return;

    if (trilha.bloqueada) {
      alert("Esta etapa será liberada quando você concluir as anteriores.");
      return;
    }

    abrirTrilha(id);
  });
});

// Botão “Continuar” do hero sempre abre “meu-nome”
btnContinueHero.addEventListener("click", () => {
  abrirTrilha("meu-nome");
});

// Função para abrir trilha
function abrirTrilha(idTrilha) {
  trilhaAtual = tracks[idTrilha];
  passoAtualIndex = 0;

  lessonTitle.textContent = trilhaAtual.titulo;
  atualizarPasso();

  screenHome.classList.remove("screen--active");
  screenLesson.classList.add("screen--active");
}

// Voltar para Home
function voltarParaHome() {
  screenLesson.classList.remove("screen--active");
  screenHome.classList.add("screen--active");
  trilhaAtual = null;
}

backButton.addEventListener("click", voltarParaHome);

// Atualiza conteúdo da lição
function atualizarPasso() {
  if (!trilhaAtual) return;

  const total = trilhaAtual.passos.length;
  const passo = trilhaAtual.passos[passoAtualIndex];
  const numero = passoAtualIndex + 1;

  lessonSubtitle.textContent = `Lição ${numero} de ${total}`;
  const porcentagem = Math.round((numero / total) * 100);
  lessonProgress.style.width = `${porcentagem}%`;

  if (passo.tipo === "texto") {
    lessonStepContent.innerHTML = `
      <div class="lesson-card">
        <p class="lesson-question">${passo.pergunta}</p>
        <p class="lesson-instruction">${passo.instrucoes}</p>
        <label class="sr-only" for="answer-text">Resposta</label>
        <input
          id="answer-text"
          class="answer-input"
          type="text"
          placeholder="${passo.placeholder || ""}"
        />
      </div>
    `;
  } else if (passo.tipo === "opcoes") {
    const opcoesHTML = passo.opcoes
      .map(
        (opcao, index) => `
        <button
          class="option-button"
          data-option-index="${index}"
        >
          ${opcao}
        </button>
      `
      )
      .join("");

    lessonStepContent.innerHTML = `
      <div class="lesson-card">
        <p class="lesson-question">${passo.pergunta}</p>
        <p class="lesson-instruction">${passo.instrucoes}</p>
        <div class="options-grid">
          ${opcoesHTML}
        </div>
      </div>
    `;

    lessonStepContent
      .querySelectorAll(".option-button")
      .forEach((button) => {
        button.addEventListener("click", () => {
          lessonStepContent
            .querySelectorAll(".option-button")
            .forEach((b) => b.classList.remove("option-button--selected"));

          button.classList.add("option-button--selected");
        });
      });
  }
}

// Avançar
btnNext.addEventListener("click", () => {
  if (!trilhaAtual) return;

  if (passoAtualIndex < trilhaAtual.passos.length - 1) {
    passoAtualIndex++;
    atualizarPasso();
  } else {
    alert("Parabéns! Você concluiu esta demonstração da trilha 🎉");
    voltarParaHome();
  }
});

// Pular
btnSkip.addEventListener("click", () => {
  if (!trilhaAtual) return;

  if (passoAtualIndex < trilhaAtual.passos.length - 1) {
    passoAtualIndex++;
    atualizarPasso();
  } else {
    voltarParaHome();
  }
});

// Navegação inferior – por enquanto só muda visual
document.querySelectorAll(".nav-item").forEach((navItem) => {
  navItem.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-item")
      .forEach((n) => n.classList.remove("nav-item--active"));

    navItem.classList.add("nav-item--active");

    const section = navItem.getAttribute("data-nav");
    if (section === "home") {
      screenLesson.classList.remove("screen--active");
      screenHome.classList.add("screen--active");
    } else {
      alert("No protótipo, só a tela Início está funcionando 😉");
    }
  });
});
