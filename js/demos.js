/* ==========================================================
   demos.js — figuras interativas de cada página.
   Cada <figure data-demo="nome"> é montada pela função
   de mesmo nome em DEMOS.
   ========================================================== */

const fmt = (n, casas = 3) => {
  if (!Number.isFinite(n)) return n > 0 ? "+∞" : n < 0 ? "−∞" : "indefinido";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }).replace("-", "−");
};

// ---------- Construtores de controles ----------

function painel(fig) {
  const area = fig.querySelector(".area-grafico");
  const ctr = document.createElement("div");
  ctr.className = "controles";
  const leitura = document.createElement("div");
  leitura.className = "leitura";
  leitura.setAttribute("aria-live", "polite");
  area.after(ctr);
  ctr.after(leitura);
  return { area, ctr, leitura };
}

let contadorId = 0;

function deslizador(pai, { rotulo, min, max, passo, valor, mostrar }) {
  const id = `ctl-${++contadorId}`;
  const box = document.createElement("div");
  box.className = "controle";
  box.innerHTML = `<label for="${id}"><span>${rotulo}</span><output for="${id}"></output></label>
    <input type="range" id="${id}" min="${min}" max="${max}" step="${passo}" value="${valor}">`;
  pai.appendChild(box);
  const input = box.querySelector("input");
  const out = box.querySelector("output");
  const atualizar = () => { out.textContent = mostrar ? mostrar(+input.value) : fmt(+input.value, 2); };
  input.addEventListener("input", atualizar);
  atualizar();
  return input;
}

function seletor(pai, { rotulo, opcoes }) {
  const id = `ctl-${++contadorId}`;
  const box = document.createElement("div");
  box.className = "controle";
  box.innerHTML = `<label for="${id}"><span>${rotulo}</span></label>
    <select id="${id}">${opcoes.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select>`;
  pai.appendChild(box);
  return box.querySelector("select");
}

function botao(pai, texto, secundario) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "botao" + (secundario ? " secundario" : "");
  b.textContent = texto;
  pai.appendChild(b);
  return b;
}

function ler(leitura, itens) {
  leitura.innerHTML = itens
    .map(([rot, val, cor]) => `<span class="${cor ? "cor-" + cor : ""}">${rot} <b>${val}</b></span>`)
    .join("");
}

// ---------- Demos ----------

const DEMOS = {
  // Página inicial: arraste o ponto e veja a reta tangente
  tangente(fig) {
    const { area, ctr, leitura } = painel(fig);
    const f = (x) => x ** 3 / 6 - x;
    const df = (x) => x ** 2 / 2 - 1;
    const g = Grafico.criar(area, { x: [-4, 4], y: [-3.5, 3.5], altura: 420, rotulo: "Curva f(x) = x³/6 − x com reta tangente móvel" });
    const s = deslizador(ctr, { rotulo: "Posição do ponto (x)", min: -3.6, max: 3.6, passo: 0.01, valor: 2.2, mostrar: (v) => fmt(v, 2) });

    function desenhar() {
      const a = +s.value;
      const m = df(a);
      g.limpar()
        .funcao(f, { cor: "var(--funcoes)", espessura: 3 })
        .reta(m, a, f(a), { cor: "var(--derivadas)", espessura: 2.5 })
        .ponto(a, f(a), { cor: "var(--derivadas)", halo: true, raio: 7 });
      const estado = Math.abs(m) < 0.05 ? "plana: ponto crítico" : m > 0 ? "subindo" : "descendo";
      ler(leitura, [
        ["x =", fmt(a, 2)],
        ["f(x) =", fmt(f(a), 2), "funcoes"],
        ["inclinação f′(x) =", fmt(m, 2), "derivadas"],
        ["a curva está", estado],
      ]);
    }
    s.addEventListener("input", desenhar);
    g.aoArrastar((x) => { s.value = x.toFixed(2); s.dispatchEvent(new Event("input")); });
    desenhar();
  },

  // Bloco 1: famílias de funções com parâmetros
  familias(fig) {
    const { area, ctr, leitura } = painel(fig);
    const tipos = {
      linear:      { nome: "1º grau",      f: (x, a, b) => a * x + b,                 txt: (a, b) => `f(x) = ${fmt(a, 1)}x + ${fmt(b, 1)}`, a: [-3, 3, 1], b: [-4, 4, 1], ra: "a (inclinação)", rb: "b (corte no eixo y)" },
      quadratica:  { nome: "2º grau",      f: (x, a, b) => a * x * x + b,             txt: (a, b) => `f(x) = ${fmt(a, 1)}x² + ${fmt(b, 1)}`, a: [-2, 2, 0.5], b: [-4, 4, -2], ra: "a (abertura)", rb: "c (altura do vértice)" },
      exponencial: { nome: "Exponencial",  f: (x, a, b) => a * Math.pow(b, x),        txt: (a, b) => `f(x) = ${fmt(a, 1)} · ${fmt(b, 1)}ˣ`, a: [0.2, 3, 1], b: [0.2, 3, 2], ra: "a (valor inicial)", rb: "b (base)" },
      logaritmica: { nome: "Logarítmica",  f: (x, a, b) => (x > 0 ? a * Math.log(x) + b : NaN), txt: (a, b) => `f(x) = ${fmt(a, 1)} · ln x + ${fmt(b, 1)}`, a: [-3, 3, 1], b: [-3, 3, 0], ra: "a (escala)", rb: "b (deslocamento)" },
      seno:        { nome: "Trigonométrica", f: (x, a, b) => a * Math.sin(b * x),     txt: (a, b) => `f(x) = ${fmt(a, 1)} · sen(${fmt(b, 1)}x)`, a: [-3, 3, 2], b: [0.25, 4, 1], ra: "a (amplitude)", rb: "b (frequência)" },
    };
    const sel = seletor(ctr, { rotulo: "Tipo de função", opcoes: Object.entries(tipos).map(([k, t]) => [k, t.nome]) });
    const sa = deslizador(ctr, { rotulo: "a", min: -3, max: 3, passo: 0.1, valor: 1, mostrar: (v) => fmt(v, 1) });
    const sb = deslizador(ctr, { rotulo: "b", min: -4, max: 4, passo: 0.1, valor: 1, mostrar: (v) => fmt(v, 1) });
    const g = Grafico.criar(area, { x: [-6, 6], y: [-6, 6], altura: 400, rotulo: "Gráfico da família de funções escolhida" });

    function configurar() {
      const t = tipos[sel.value];
      [[sa, t.a, t.ra], [sb, t.b, t.rb]].forEach(([inp, [mn, mx, v], rot]) => {
        inp.min = mn; inp.max = mx; inp.value = v;
        inp.closest(".controle").querySelector("label span").textContent = rot;
        inp.dispatchEvent(new Event("input"));
      });
    }
    function desenhar() {
      const t = tipos[sel.value];
      const a = +sa.value, b = +sb.value;
      g.limpar().funcao((x) => t.f(x, a, b), { cor: "var(--funcoes)", espessura: 3 });
      let extra = [];
      if (sel.value === "quadratica") extra = [["vértice", `(0; ${fmt(b, 1)})`], ["concavidade", a > 0 ? "para cima" : a < 0 ? "para baixo" : "vira reta"]];
      if (sel.value === "exponencial") extra = [["comportamento", b > 1 ? "crescente" : b < 1 ? "decrescente" : "constante"]];
      if (sel.value === "logaritmica") extra = [["domínio", "x > 0"]];
      if (sel.value === "seno") extra = [["período", fmt((2 * Math.PI) / b, 2)]];
      if (sel.value === "linear") extra = [["raiz", a !== 0 ? `x = ${fmt(-b / a, 2)}` : "não tem (ou infinitas)"]];
      ler(leitura, [[t.txt(a, b), "", "funcoes"], ...extra]);
    }
    sel.addEventListener("change", () => { configurar(); desenhar(); });
    sa.addEventListener("input", desenhar);
    sb.addEventListener("input", desenhar);
    configurar();
    desenhar();
  },

  // Bloco 2: limite em um ponto onde a função não está definida
  buraco(fig) {
    const { area, ctr, leitura } = painel(fig);
    const f = (x) => (x * x - 1) / (x - 1);
    const g = Grafico.criar(area, { x: [-1, 3], y: [-0.5, 4.5], altura: 380, rotulo: "Gráfico de (x² − 1)/(x − 1) com um furo em x = 1" });
    const s = deslizador(ctr, { rotulo: "Distância até 1", min: 0, max: 3, passo: 0.01, valor: 0.3, mostrar: (v) => fmt(Math.pow(10, -v), 4) });
    const tabela = document.createElement("table");
    tabela.className = "tabela-valores";
    leitura.after(tabela);

    function desenhar() {
      const h = Math.pow(10, -s.value) * 0.8;
      const e = 1 - h, d = 1 + h;
      g.limpar()
        .funcao(f, { cor: "var(--funcoes)", espessura: 3 })
        .segmento(1, -0.5, 1, 4.5, { cor: "var(--limites)", espessura: 1.25, tracejado: "4 5", opacidade: 0.7 })
        .segmento(-1, 2, 3, 2, { cor: "var(--limites)", espessura: 1.25, tracejado: "4 5", opacidade: 0.7 })
        .ponto(1, 2, { vazio: true, cor: "var(--funcoes)", raio: 6 })
        .ponto(e, f(e), { cor: "var(--limites)", raio: 5 })
        .ponto(d, f(d), { cor: "var(--limites)", raio: 5 })
        .texto(1, 2, "L = 2", { cor: "var(--limites)", dx: 12, dy: -12 });
      ler(leitura, [
        ["pela esquerda f(" + fmt(e, 4) + ") =", fmt(f(e), 4), "limites"],
        ["pela direita f(" + fmt(d, 4) + ") =", fmt(f(d), 4), "limites"],
        ["f(1) =", "não existe (0/0)"],
      ]);
      const xs = [0.9, 0.99, 0.999, 1.001, 1.01, 1.1];
      tabela.innerHTML = `<caption class="visually-hidden">Valores de f perto de x = 1</caption>
        <tr><th scope="row">x</th>${xs.map((x) => `<td>${fmt(x, 3)}</td>`).join("")}</tr>
        <tr><th scope="row">f(x)</th>${xs.map((x) => `<td>${fmt(f(x), 3)}</td>`).join("")}</tr>`;
    }
    s.addEventListener("input", desenhar);
    desenhar();
  },

  // Bloco 2: crescimento no infinito (Big-O)
  infinito(fig) {
    const { area, ctr, leitura } = painel(fig);
    const curvas = [
      ["log₂ n", (n) => Math.log2(n), "var(--integrais)"],
      ["n", (n) => n, "var(--funcoes)"],
      ["n · log₂ n", (n) => n * Math.log2(n), "var(--limites)"],
      ["n²", (n) => n * n, "var(--derivadas)"],
    ];
    const legenda = document.createElement("div");
    legenda.className = "legenda";
    legenda.innerHTML = curvas.map(([t, , c]) => `<span style="--c:${c}">${t}</span>`).join("");
    area.after(legenda);
    const s = deslizador(ctr, { rotulo: "Tamanho da entrada (n até)", min: 1, max: 3, passo: 0.01, valor: 1.3, mostrar: (v) => Math.round(Math.pow(10, v)).toLocaleString("pt-BR") });
    const g = Grafico.criar(area, { x: [1, 20], y: [0, 100], altura: 360, rotulo: "Comparação do crescimento de log n, n, n log n e n²" });

    function desenhar() {
      const nMax = Math.pow(10, +s.value);
      g.janela([0, nMax], [0, nMax * Math.log2(nMax) * 1.15]).limpar();
      curvas.forEach(([, f, c]) => g.funcao((n) => (n >= 1 ? f(n) : NaN), { cor: c, espessura: 2.75 }));
      ler(leitura, [
        ["n =", Math.round(nMax).toLocaleString("pt-BR")],
        ["n² ÷ (n log₂ n) =", fmt((nMax * nMax) / (nMax * Math.log2(nMax)), 1), "derivadas"],
        ["(n log₂ n) ÷ n² =", fmt(Math.log2(nMax) / nMax, 4), "limites"],
      ]);
    }
    s.addEventListener("input", desenhar);
    desenhar();
  },

  // Bloco 3: secante virando tangente
  secante(fig) {
    const { area, ctr, leitura } = painel(fig);
    const f = (x) => 0.5 * x * x;
    const g = Grafico.criar(area, { x: [-1, 4.5], y: [-1, 8], altura: 400, rotulo: "Retas secantes se aproximando da tangente em f(x) = x²/2" });
    const sa = deslizador(ctr, { rotulo: "Ponto a", min: 0, max: 3, passo: 0.05, valor: 1, mostrar: (v) => fmt(v, 2) });
    const sh = deslizador(ctr, { rotulo: "Distância h", min: 0.01, max: 2.5, passo: 0.01, valor: 2, mostrar: (v) => fmt(v, 2) });

    function desenhar() {
      const a = +sa.value, h = +sh.value;
      const msec = (f(a + h) - f(a)) / h;
      g.limpar()
        .funcao(f, { cor: "var(--funcoes)", espessura: 3 })
        .reta(a, a, f(a), { cor: "var(--derivadas)", espessura: 2, tracejado: "2 6", opacidade: 0.9 })
        .reta(msec, a, f(a), { cor: "var(--limites)", espessura: 2.5 })
        .segmento(a, f(a), a + h, f(a), { cor: "var(--grafite, #566173)", espessura: 1.25, tracejado: "3 4" })
        .segmento(a + h, f(a), a + h, f(a + h), { cor: "var(--grafite, #566173)", espessura: 1.25, tracejado: "3 4" })
        .ponto(a, f(a), { cor: "var(--derivadas)", raio: 6 })
        .ponto(a + h, f(a + h), { cor: "var(--limites)", raio: 6 });
      ler(leitura, [
        ["secante Δy/Δx =", fmt(msec, 3), "limites"],
        ["tangente f′(a) =", fmt(a, 3), "derivadas"],
        ["diferença", fmt(msec - a, 3)],
      ]);
    }
    sa.addEventListener("input", desenhar);
    sh.addEventListener("input", desenhar);
    desenhar();
  },

  // Bloco 3: gradient descent em uma função de custo
  gradiente(fig) {
    const { area, ctr, leitura } = painel(fig);
    const f = (w) => 0.3 * (w - 2) ** 2 + Math.sin(2 * w) + 2;
    const df = (w) => 0.6 * (w - 2) + 2 * Math.cos(2 * w);
    const g = Grafico.criar(area, { x: [-3, 6], y: [0, 10], altura: 380, rotulo: "Descida do gradiente em uma função de custo" });
    const sη = deslizador(ctr, { rotulo: "Taxa de aprendizado η", min: 0.05, max: 1.2, passo: 0.05, valor: 0.3, mostrar: (v) => fmt(v, 2) });
    const bPasso = botao(ctr, "Dar um passo");
    const bAuto = botao(ctr, "Rodar 20 passos", true);
    const bReset = botao(ctr, "Recomeçar", true);
    let trilha = [-2.5];

    function desenhar() {
      const w = trilha[trilha.length - 1];
      g.limpar().funcao(f, { cor: "var(--funcoes)", espessura: 3 });
      for (let i = 1; i < trilha.length; i++) {
        g.segmento(trilha[i - 1], f(trilha[i - 1]), trilha[i], f(trilha[i]), { cor: "var(--derivadas)", espessura: 1.5, opacidade: 0.55 });
      }
      trilha.forEach((p, i) => { if (i < trilha.length - 1) g.ponto(p, f(p), { cor: "var(--derivadas)", raio: 3.5 }); });
      if (Math.abs(w) < 50) g.reta(df(w), w, f(w), { cor: "var(--derivadas)", espessura: 1.5, tracejado: "5 5" });
      g.ponto(w, f(w), { cor: "var(--derivadas)", raio: 7, halo: true });
      ler(leitura, [
        ["passo", trilha.length - 1],
        ["w =", fmt(w, 3)],
        ["custo f(w) =", fmt(f(w), 3), "funcoes"],
        ["gradiente f′(w) =", fmt(df(w), 3), "derivadas"],
      ]);
    }
    const passo = () => {
      const w = trilha[trilha.length - 1];
      const novo = w - +sη.value * df(w);
      if (Math.abs(novo) < 1e6) trilha.push(novo);
      desenhar();
    };
    bPasso.addEventListener("click", passo);
    bAuto.addEventListener("click", () => {
      let i = 0;
      const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduzir) { for (; i < 20; i++) passo(); return; }
      const t = setInterval(() => { passo(); if (++i >= 20) clearInterval(t); }, 120);
    });
    bReset.addEventListener("click", () => { trilha = [-2.5]; desenhar(); });
    sη.addEventListener("input", () => { trilha = [trilha[0]]; desenhar(); });
    desenhar();
  },

  // Bloco 4: somas de Riemann
  riemann(fig) {
    const { area, ctr, leitura } = painel(fig);
    const f = (x) => x * x / 3 + 0.5;
    const a = 0, b = 3, exato = 4.5; // ∫₀³ (x²/3 + 1/2) dx = 3 + 1,5
    const g = Grafico.criar(area, { x: [-0.5, 3.5], y: [-0.5, 4], altura: 380, rotulo: "Retângulos aproximando a área sob a curva" });
    const sn = deslizador(ctr, { rotulo: "Número de retângulos n", min: 1, max: 60, passo: 1, valor: 4, mostrar: (v) => String(v) });
    const sm = seletor(ctr, { rotulo: "Altura do retângulo", opcoes: [["esq", "Ponta esquerda"], ["meio", "Ponto médio"], ["dir", "Ponta direita"]] });

    function desenhar() {
      const n = +sn.value;
      const dx = (b - a) / n;
      const desloc = { esq: 0, meio: 0.5, dir: 1 }[sm.value];
      let soma = 0;
      g.limpar().area(f, a, b, { opacidade: 0.08 });
      for (let i = 0; i < n; i++) {
        const xi = a + i * dx;
        const h = f(xi + desloc * dx);
        soma += h * dx;
        g.retangulo(xi, xi + dx, h, { opacidade: 0.22 });
      }
      g.funcao(f, { cor: "var(--funcoes)", espessura: 3 });
      ler(leitura, [
        ["soma dos retângulos =", fmt(soma, 4), "integrais"],
        ["integral exata =", fmt(exato, 4), "integrais"],
        ["erro =", fmt(Math.abs(soma - exato), 4)],
      ]);
    }
    sn.addEventListener("input", desenhar);
    sm.addEventListener("change", desenhar);
    desenhar();
  },
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("figure[data-demo]").forEach((fig) => {
    const demo = DEMOS[fig.dataset.demo];
    if (demo) demo(fig);
  });
});
