/* ==========================================================
   app.js — fórmulas, progresso, exercícios e quiz.
   ========================================================== */

// ---------- Fórmulas (KaTeX) ----------

function renderizarMat(el) {
  if (!window.renderMathInElement) return;
  renderMathInElement(el, {
    delimiters: [
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false },
    ],
    throwOnError: false,
  });
}

// ---------- Progresso salvo no navegador ----------

const Progresso = {
  chave: "tangente.progresso",
  ler() {
    try { return JSON.parse(localStorage.getItem(this.chave)) || {}; }
    catch { return {}; }
  },
  salvar(id, acertou) {
    const p = this.ler();
    p[id] = p[id] || acertou; // uma vez certa, continua certa
    try { localStorage.setItem(this.chave, JSON.stringify(p)); } catch { /* modo privado */ }
  },
  doBloco(bloco) {
    const p = this.ler();
    const qs = QUESTOES.filter((q) => q.bloco === bloco);
    return { certas: qs.filter((q) => p[q.id]).length, total: qs.length };
  },
};

// ---------- Questão de múltipla escolha ----------

const LETRAS = ["A", "B", "C", "D", "E"];

function montarQuestao(q, numero, aoResponder) {
  const art = document.createElement("article");
  art.className = "questao";
  art.innerHTML = `
    <p class="enunciado"><span class="n">${numero}.</span>${q.enunciado}</p>
    <ul class="opcoes">
      ${q.opcoes.map((o, i) => `<li><button type="button" data-i="${i}"><span class="letra">${LETRAS[i]}</span><span>${o}</span></button></li>`).join("")}
    </ul>
    <div class="retorno" hidden aria-live="polite"></div>`;

  const botoes = art.querySelectorAll(".opcoes button");
  const retorno = art.querySelector(".retorno");

  botoes.forEach((b) => b.addEventListener("click", () => {
    const escolha = +b.dataset.i;
    const acertou = escolha === q.correta;
    botoes.forEach((x) => { x.disabled = true; });
    botoes[q.correta].classList.add("certa");
    if (!acertou) b.classList.add("errada");
    retorno.hidden = false;
    retorno.className = "retorno " + (acertou ? "acerto" : "erro");
    retorno.innerHTML = `<span class="veredito">${acertou ? "Correto." : `Resposta certa: ${LETRAS[q.correta]}.`}</span>${q.explicacao}`;
    renderizarMat(retorno);
    Progresso.salvar(q.id, acertou);
    if (aoResponder) aoResponder(acertou);
  }));

  renderizarMat(art);
  return art;
}

// Lista de exercícios no fim de cada página de bloco
function montarExercicios(container) {
  const bloco = container.dataset.exercicios;
  const qs = QUESTOES.filter((q) => q.bloco === bloco);
  const resumo = document.createElement("p");
  resumo.className = "resumo-exercicios";
  const atualizar = () => {
    const { certas, total } = Progresso.doBloco(bloco);
    resumo.textContent = `${total} questões. Você já acertou ${certas}. Clique numa alternativa para ver a correção.`;
  };
  container.appendChild(resumo);
  qs.forEach((q, i) => container.appendChild(montarQuestao(q, i + 1, atualizar)));
  atualizar();
}

// ---------- Página inicial: barras de progresso ----------

function mostrarProgressoInicio() {
  document.querySelectorAll("[data-progresso]").forEach((el) => {
    const { certas, total } = Progresso.doBloco(el.dataset.progresso);
    el.innerHTML = `${certas} de ${total} exercícios certos<div class="barra"><span></span></div>`;
    requestAnimationFrame(() => {
      el.querySelector(".barra span").style.width = `${(certas / total) * 100}%`;
    });
  });
}

// ---------- Abas: um painel visível por vez, escolhido pelo #endereço ----------

function ativarAbas() {
  const nav = document.querySelector(".abas");
  if (!nav) return;
  const links = [...nav.querySelectorAll("a")];
  const paineis = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if (!paineis.length) return;

  function mostrar(id, rolar) {
    const alvo = paineis.find((p) => p.id === id);
    if (!alvo) return false;
    paineis.forEach((p) => { p.hidden = p !== alvo; });
    links.forEach((a) => {
      if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    if (rolar) nav.scrollIntoView({ block: "start" });
    return true;
  }

  if (!mostrar(decodeURIComponent(location.hash.slice(1)), true)) mostrar(paineis[0].id, false);
  window.addEventListener("hashchange", () => mostrar(decodeURIComponent(location.hash.slice(1)), true));
}

// ---------- Sumário lateral: destaca a seção visível ----------

function ativarSumario() {
  const links = [...document.querySelectorAll(".sumario a")];
  if (!links.length || !("IntersectionObserver" in window)) return;
  const secoes = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("ativo", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-20% 0px -70% 0px" });
  secoes.forEach((s) => obs.observe(s));
}

// ---------- Quiz ----------

const NOMES_BLOCO = { funcoes: "Funções", limites: "Limites", derivadas: "Derivadas", integrais: "Integrais" };

function embaralhar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function iniciarQuiz(raiz) {
  const inicio = raiz.querySelector("#quiz-inicio");
  const palco = raiz.querySelector("#quiz-palco");
  const form = inicio.querySelector("form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const blocos = [...form.querySelectorAll("input[name=bloco]:checked")].map((i) => i.value);
    if (!blocos.length) {
      form.querySelector(".aviso").hidden = false;
      return;
    }
    const total = +form.querySelector("select").value;
    const lista = embaralhar(QUESTOES.filter((q) => blocos.includes(q.bloco))).slice(0, total);
    rodar(lista);
  });

  function rodar(lista) {
    inicio.hidden = true;
    palco.hidden = false;
    const respostas = [];
    let atual = 0;

    function mostrar() {
      const q = lista[atual];
      palco.innerHTML = `
        <div class="quiz-topo"><span>Questão ${atual + 1} de ${lista.length}</span><span>${NOMES_BLOCO[q.bloco]}</span></div>
        <div class="quiz-barra"><span style="width:${(atual / lista.length) * 100}%"></span></div>`;
      document.body.className = "bloco-" + q.bloco;
      const art = montarQuestao(q, atual + 1, (acertou) => {
        respostas.push({ q, acertou });
        prox.disabled = false;
        prox.focus();
      });
      palco.appendChild(art);
      const nav = document.createElement("div");
      nav.className = "quiz-navegacao";
      const prox = document.createElement("button");
      prox.type = "button";
      prox.className = "botao";
      prox.disabled = true;
      prox.textContent = atual === lista.length - 1 ? "Ver resultado" : "Próxima questão";
      prox.addEventListener("click", () => {
        atual++;
        if (atual < lista.length) mostrar();
        else resultado();
      });
      nav.appendChild(prox);
      palco.appendChild(nav);
      art.querySelector("button").focus();
    }

    function resultado() {
      document.body.className = "";
      const certas = respostas.filter((r) => r.acertou).length;
      const pct = Math.round((certas / lista.length) * 100);
      const msg = pct >= 80 ? "Domínio sólido do conteúdo." : pct >= 50 ? "Bom caminho. Revise os assuntos das questões que errou." : "Vale reler a teoria e refazer os exemplos resolvidos antes de tentar de novo.";
      const erradas = respostas.filter((r) => !r.acertou);
      const paginas = { funcoes: "funcoes.html", limites: "limites.html", derivadas: "derivadas.html", integrais: "integrais.html" };
      palco.innerHTML = `
        <div class="placar">
          <p class="nota">${certas}<small> / ${lista.length}</small></p>
          <p>${pct}% de acerto. ${msg}</p>
          ${erradas.length ? `<h2 style="font-size:1.2rem;margin:1.5rem 0 .75rem">Para revisar</h2>
          <ul>${erradas.map((r) => `<li>${r.q.enunciado} <a href="${paginas[r.q.bloco]}">Rever ${NOMES_BLOCO[r.q.bloco]}</a></li>`).join("")}</ul>` : ""}
          <div class="acoes">
            <button type="button" class="botao" id="refazer">Fazer outro quiz</button>
            <a class="botao secundario" href="index.html">Voltar ao início</a>
          </div>
        </div>`;
      renderizarMat(palco);
      palco.querySelector("#refazer").addEventListener("click", () => {
        palco.hidden = true;
        inicio.hidden = false;
      });
    }

    mostrar();
  }
}

// ---------- Inicialização ----------

document.addEventListener("DOMContentLoaded", () => {
  renderizarMat(document.body);
  document.querySelectorAll("[data-exercicios]").forEach(montarExercicios);
  mostrarProgressoInicio();
  ativarAbas();
  ativarSumario();
  const quiz = document.querySelector("#quiz");
  if (quiz) iniciarQuiz(quiz);
});
