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

// Termo com sinal para textos: 2 -> "+ 2", -3 -> "− 3"
const sinal = (v, casas = 1) => (v < 0 ? `− ${fmt(-v, casas)}` : `+ ${fmt(v, casas)}`);

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

  // ---------- Bloco 1: um gráfico para cada tipo de função ----------

  constante(fig) {
    const { area, ctr, leitura } = painel(fig);
    const g = Grafico.criar(area, { x: [-6, 6], y: [-5, 5], altura: 360, rotulo: "Gráfico da função constante f(x) = b" });
    const sb = deslizador(ctr, { rotulo: "b (valor da saída)", min: -4, max: 4, passo: 0.5, valor: 2, mostrar: (v) => fmt(v, 1) });
    function desenhar() {
      const b = +sb.value;
      g.limpar().funcao(() => b, { cor: "var(--funcoes)", espessura: 3 }).ponto(0, b, { cor: "var(--funcoes)" });
      ler(leitura, [[`f(x) = ${fmt(b, 1)}`, "", "funcoes"], ["imagem", `{${fmt(b, 1)}}`], ["taxa de variação", "0"]]);
    }
    sb.addEventListener("input", desenhar);
    desenhar();
  },

  afim(fig) {
    const { area, ctr, leitura } = painel(fig);
    const g = Grafico.criar(area, { x: [-6, 6], y: [-6, 6], altura: 380, rotulo: "Gráfico da função afim f(x) = ax + b" });
    const sa = deslizador(ctr, { rotulo: "a (inclinação)", min: -3, max: 3, passo: 0.5, valor: 1, mostrar: (v) => fmt(v, 1) });
    const sb = deslizador(ctr, { rotulo: "b (corte no eixo y)", min: -4, max: 4, passo: 0.5, valor: 2, mostrar: (v) => fmt(v, 1) });
    function desenhar() {
      const a = +sa.value, b = +sb.value;
      g.limpar().funcao((x) => a * x + b, { cor: "var(--funcoes)", espessura: 3 }).ponto(0, b, { cor: "var(--funcoes)" });
      if (a !== 0) g.ponto(-b / a, 0, { cor: "var(--derivadas)" });
      ler(leitura, [
        [`f(x) = ${fmt(a, 1)}x ${sinal(b)}`, "", "funcoes"],
        ["comportamento", a > 0 ? "crescente" : a < 0 ? "decrescente" : "constante (a = 0)"],
        ["zero", a !== 0 ? `x = ${fmt(-b / a, 2)}` : "não tem um único zero", "derivadas"],
      ]);
    }
    sa.addEventListener("input", desenhar);
    sb.addEventListener("input", desenhar);
    desenhar();
  },

  linear(fig) {
    const { area, ctr, leitura } = painel(fig);
    const g = Grafico.criar(area, { x: [-6, 6], y: [-6, 6], altura: 380, rotulo: "Gráfico da função linear f(x) = ax" });
    const sa = deslizador(ctr, { rotulo: "a (inclinação)", min: -3, max: 3, passo: 0.25, valor: 1.5, mostrar: (v) => fmt(v, 2) });
    function desenhar() {
      const a = +sa.value;
      g.limpar().funcao((x) => a * x, { cor: "var(--funcoes)", espessura: 3 })
        .ponto(0, 0, { cor: "var(--funcoes)" })
        .ponto(1, a, { cor: "var(--derivadas)" })
        .segmento(0, 0, 1, 0, { cor: "var(--grafite, #566173)", espessura: 1.25, tracejado: "3 4" })
        .segmento(1, 0, 1, a, { cor: "var(--grafite, #566173)", espessura: 1.25, tracejado: "3 4" });
      ler(leitura, [
        [`f(x) = ${fmt(a, 2)}x`, "", "funcoes"],
        ["passa por", "(0, 0)"],
        ["f(1) =", fmt(a, 2), "derivadas"],
        ["comportamento", a > 0 ? "crescente" : a < 0 ? "decrescente" : "constante (a = 0)"],
      ]);
    }
    sa.addEventListener("input", desenhar);
    desenhar();
  },

  quadratica(fig) {
    const { area, ctr, leitura } = painel(fig);
    const g = Grafico.criar(area, { x: [-6, 6], y: [-6, 6], altura: 400, rotulo: "Parábola f(x) = ax² + bx + c com vértice e raízes" });
    const sa = deslizador(ctr, { rotulo: "a", min: -2, max: 2, passo: 0.25, valor: 1, mostrar: (v) => fmt(v, 2) });
    const sb = deslizador(ctr, { rotulo: "b", min: -4, max: 4, passo: 0.5, valor: -2, mostrar: (v) => fmt(v, 1) });
    const sc = deslizador(ctr, { rotulo: "c", min: -4, max: 4, passo: 0.5, valor: -3, mostrar: (v) => fmt(v, 1) });
    function desenhar() {
      const a = +sa.value, b = +sb.value, c = +sc.value;
      const f = (x) => a * x * x + b * x + c;
      g.limpar().funcao(f, { cor: "var(--funcoes)", espessura: 3 });
      const texto = `f(x) = ${fmt(a, 2)}x² ${sinal(b)}x ${sinal(c)}`;
      if (a === 0) {
        ler(leitura, [[texto, "", "funcoes"], ["a = 0", "deixa de ser quadrática: vira reta"]]);
        return;
      }
      const delta = b * b - 4 * a * c;
      const xv = -b / (2 * a);
      g.segmento(xv, -6, xv, 6, { cor: "var(--grafite, #566173)", espessura: 1.25, tracejado: "4 5", opacidade: 0.7 })
        .ponto(xv, f(xv), { cor: "var(--derivadas)", halo: true });
      let raizes = "não tem raízes reais (Δ < 0)";
      if (delta >= 0) {
        const r1 = (-b - Math.sqrt(delta)) / (2 * a), r2 = (-b + Math.sqrt(delta)) / (2 * a);
        g.ponto(r1, 0, { cor: "var(--funcoes)" }).ponto(r2, 0, { cor: "var(--funcoes)" });
        raizes = delta === 0 ? `x = ${fmt(r1, 2)} (raiz dupla)` : `x = ${fmt(Math.min(r1, r2), 2)} e x = ${fmt(Math.max(r1, r2), 2)}`;
      }
      ler(leitura, [
        [texto, "", "funcoes"],
        ["Δ =", fmt(delta, 2)],
        ["vértice", `(${fmt(xv, 2)}; ${fmt(f(xv), 2)})`, "derivadas"],
        ["concavidade", a > 0 ? "para cima (mínimo)" : "para baixo (máximo)"],
        ["raízes", raizes],
      ]);
    }
    [sa, sb, sc].forEach((s) => s.addEventListener("input", desenhar));
    desenhar();
  },

  modular(fig) {
    const { area, ctr, leitura } = painel(fig);
    const g = Grafico.criar(area, { x: [-6, 6], y: [-4, 8], altura: 380, rotulo: "Gráfico da função modular f(x) = |x − h| + k" });
    const sh = deslizador(ctr, { rotulo: "h (desloca para os lados)", min: -3, max: 3, passo: 0.5, valor: 0, mostrar: (v) => fmt(v, 1) });
    const sk = deslizador(ctr, { rotulo: "k (desloca para cima/baixo)", min: -3, max: 3, passo: 0.5, valor: 0, mostrar: (v) => fmt(v, 1) });
    function desenhar() {
      const h = +sh.value, k = +sk.value;
      g.limpar().funcao((x) => Math.abs(x - h) + k, { cor: "var(--funcoes)", espessura: 3 })
        .ponto(h, k, { cor: "var(--derivadas)", halo: true });
      const dentro = h === 0 ? "x" : `x ${sinal(-h)}`;
      ler(leitura, [
        [`f(x) = |${dentro}|${k === 0 ? "" : " " + sinal(k)}`, "", "funcoes"],
        ["vértice (ponta)", `(${fmt(h, 1)}; ${fmt(k, 1)})`, "derivadas"],
        ["imagem", `[${fmt(k, 1)}; +∞)`],
      ]);
    }
    sh.addEventListener("input", desenhar);
    sk.addEventListener("input", desenhar);
    desenhar();
  },

  exponencial(fig) {
    const { area, ctr, leitura } = painel(fig);
    const g = Grafico.criar(area, { x: [-4, 4], y: [-1, 8], altura: 380, rotulo: "Gráfico da função exponencial f(x) = aˣ" });
    const sb = deslizador(ctr, { rotulo: "a (base)", min: 0.2, max: 3, passo: 0.1, valor: 2, mostrar: (v) => fmt(v, 1) });
    function desenhar() {
      const b = +sb.value;
      g.limpar().funcao((x) => Math.pow(b, x), { cor: "var(--funcoes)", espessura: 3 }).ponto(0, 1, { cor: "var(--derivadas)", halo: true });
      const um = Math.abs(b - 1) < 1e-9;
      ler(leitura, [
        [`f(x) = ${fmt(b, 1)}ˣ`, "", "funcoes"],
        ["comportamento", um ? "a = 1 não vale: vira constante" : b > 1 ? "crescente (a > 1)" : "decrescente (0 < a < 1)"],
        ["passa por", "(0, 1)", "derivadas"],
        ["imagem", "(0, +∞)"],
      ]);
    }
    sb.addEventListener("input", desenhar);
    desenhar();
  },

  logaritmica(fig) {
    const { area, ctr, leitura } = painel(fig);
    const legenda = document.createElement("div");
    legenda.className = "legenda";
    legenda.innerHTML = `<span style="--c:var(--funcoes)">logₐ x</span><span style="--c:var(--grafite)">aˣ (inversa)</span>`;
    area.after(legenda);
    const g = Grafico.criar(area, { x: [-4, 6], y: [-4, 6], altura: 400, rotulo: "Gráfico da função logarítmica e da exponencial, espelhadas pela reta y = x" });
    const sb = deslizador(ctr, { rotulo: "a (base)", min: 0.2, max: 4, passo: 0.1, valor: 2, mostrar: (v) => fmt(v, 1) });
    function desenhar() {
      const b = +sb.value;
      const um = Math.abs(b - 1) < 1e-9;
      g.limpar().funcao((x) => x, { cor: "var(--grafite, #566173)", espessura: 1.25, tracejado: "4 5", opacidade: 0.6 });
      if (!um) {
        g.funcao((x) => Math.pow(b, x), { cor: "var(--grafite, #566173)", espessura: 2, opacidade: 0.5 })
          .funcao((x) => (x > 0 ? Math.log(x) / Math.log(b) : NaN), { cor: "var(--funcoes)", espessura: 3, amostras: 800 })
          .ponto(1, 0, { cor: "var(--derivadas)", halo: true });
      }
      ler(leitura, [
        [`f(x) = logₐ x, com a = ${fmt(b, 1)}`, "", "funcoes"],
        ["comportamento", um ? "a = 1 não vale como base" : b > 1 ? "crescente (a > 1)" : "decrescente (0 < a < 1)"],
        ["passa por", "(1, 0)", "derivadas"],
        ["domínio", "x > 0"],
      ]);
    }
    sb.addEventListener("input", desenhar);
    desenhar();
  },

  trigonometrica(fig) {
    const { area, ctr, leitura } = painel(fig);
    const g = Grafico.criar(area, { x: [-7, 7], y: [-4, 4], altura: 380, rotulo: "Gráfico de seno, cosseno ou tangente com amplitude e frequência ajustáveis" });
    const sel = seletor(ctr, { rotulo: "Função", opcoes: [["sen", "Seno"], ["cos", "Cosseno"], ["tg", "Tangente"]] });
    const sa = deslizador(ctr, { rotulo: "a (amplitude)", min: -3, max: 3, passo: 0.5, valor: 1, mostrar: (v) => fmt(v, 1) });
    const sb = deslizador(ctr, { rotulo: "b (frequência)", min: 0.5, max: 4, passo: 0.5, valor: 1, mostrar: (v) => fmt(v, 1) });
    // c em múltiplos de π: o valor do controle é k, e c = kπ
    const piTexto = (k) => (k === 0 ? "0" : `${k < 0 ? "−" : ""}${Math.abs(k) === 1 ? "" : fmt(Math.abs(k), 2)}π`);
    const sc = deslizador(ctr, { rotulo: "c (fase)", min: -1, max: 1, passo: 0.25, valor: 0, mostrar: piTexto });
    const fns = { sen: Math.sin, cos: Math.cos, tg: Math.tan };
    function desenhar() {
      const t = sel.value, a = +sa.value, b = +sb.value, k = +sc.value, c = k * Math.PI;
      g.limpar();
      if (k !== 0) g.funcao((x) => a * fns[t](b * x), { cor: "var(--grafite)", espessura: 1.5, tracejado: true, opacidade: 0.6, amostras: 1200 });
      g.funcao((x) => a * fns[t](b * x + c), { cor: "var(--funcoes)", espessura: 3, amostras: 1200 });
      const periodo = (t === "tg" ? Math.PI : 2 * Math.PI) / b;
      const nome = { sen: "sen", cos: "cos", tg: "tg" }[t];
      const desloc = -c / b;
      ler(leitura, [
        [`f(x) = ${fmt(a, 1)} · ${nome}(${fmt(b, 1)}x ${k < 0 ? "−" : "+"} ${piTexto(Math.abs(k))})`, "", "funcoes"],
        ["período", `${fmt(periodo, 2)} (= ${t === "tg" ? "π" : "2π"}/${fmt(b, 1)})`],
        t === "tg" ? ["imagem", "ℝ"] : ["imagem", `[${fmt(-Math.abs(a), 1)}; ${fmt(Math.abs(a), 1)}]`],
        ["deslocamento", k === 0 ? "nenhum" : `${fmt(Math.abs(desloc), 2)} para a ${desloc < 0 ? "esquerda" : "direita"}`],
      ]);
    }
    sel.addEventListener("change", desenhar);
    sa.addEventListener("input", desenhar);
    sb.addEventListener("input", desenhar);
    sc.addEventListener("input", desenhar);
    desenhar();
  },

  // Circunferência trigonométrica com os ângulos notáveis
  circulo(fig) {
    const { area, ctr, leitura } = painel(fig);
    const angulos = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    // Mesma escala nos dois eixos: (566 − 52) / (640 − 52) = 2,8 / 3,2
    const g = Grafico.criar(area, { x: [-1.6, 1.6], y: [-1.4, 1.4], altura: 566, passoX: 0.5, passoY: 0.5, rotulo: "Circunferência trigonométrica de raio 1 com o ponto do ângulo escolhido e suas projeções nos eixos" });
    const s = deslizador(ctr, { rotulo: "Ângulo θ", min: 0, max: angulos.length - 1, passo: 1, valor: 2, mostrar: (i) => `${angulos[i]}°` });

    // Valores exatos em texto: módulo -> forma com raiz
    const exatos = [[0, "0"], [0.5, "1/2"], [Math.SQRT2 / 2, "√2/2"], [Math.sqrt(3) / 2, "√3/2"], [1, "1"], [Math.sqrt(3) / 3, "√3/3"], [Math.sqrt(3), "√3"]];
    const exato = (v) => {
      if (!Number.isFinite(v)) return "não existe";
      const e = exatos.find(([x]) => Math.abs(Math.abs(v) - x) < 1e-9);
      return (v < -1e-9 ? "−" : "") + e[1];
    };
    const mdc = (a, b) => (b === 0 ? a : mdc(b, a % b));
    const rad = (gr) => {
      if (gr === 0) return "0";
      const d = mdc(gr, 180), n = gr / d, q = 180 / d;
      return `${n === 1 ? "" : n}π${q === 1 ? "" : "/" + q}`;
    };
    const limpo = (v) => (Math.abs(v) < 1e-9 ? 0 : v);

    function desenhar() {
      const gr = angulos[+s.value], r = (gr * Math.PI) / 180;
      const c = limpo(Math.cos(r)), sn = limpo(Math.sin(r));
      const tg = c === 0 ? NaN : limpo(sn / c);
      g.limpar()
        .funcao((x) => Math.sqrt(Math.max(0, 1 - x * x)), { de: -1, ate: 1, cor: "var(--grafite)", espessura: 2, amostras: 400 })
        .funcao((x) => -Math.sqrt(Math.max(0, 1 - x * x)), { de: -1, ate: 1, cor: "var(--grafite)", espessura: 2, amostras: 400 });
      angulos.slice(0, -1).forEach((a) => {
        const ra = (a * Math.PI) / 180;
        g.ponto(Math.cos(ra), Math.sin(ra), { raio: 3, cor: "var(--grafite)" });
      });
      // arco do ângulo, raio e projeções
      g.segmento(0, 0, 1, 0, { cor: "var(--tinta)", espessura: 1.5 }); // lado inicial do ângulo
      const arco = [];
      for (let i = 0; i <= 40; i++) arco.push((r * i) / 40);
      arco.slice(1).forEach((t, i) => g.segmento(0.22 * Math.cos(arco[i]), 0.22 * Math.sin(arco[i]), 0.22 * Math.cos(t), 0.22 * Math.sin(t), { cor: "var(--tinta)", espessura: 1.5 }));
      g.segmento(c, 0, c, sn, { cor: "var(--derivadas)", tracejado: "5 5", espessura: 1.5 })
        .segmento(0, sn, c, sn, { cor: "var(--funcoes)", tracejado: "5 5", espessura: 1.5 })
        .segmento(0, 0, c, 0, { cor: "var(--funcoes)", espessura: 5 })
        .segmento(0, 0, 0, sn, { cor: "var(--derivadas)", espessura: 5 })
        .segmento(0, 0, c, sn, { cor: "var(--tinta)", espessura: 2.5 })
        .ponto(c, sn, { cor: "var(--tinta)", halo: true })
        .texto(c, sn, `P(${exato(c)}; ${exato(sn)})`, { dx: c < 0 ? -12 : 12, dy: sn < 0 ? 22 : -12, ancora: c < 0 ? "end" : "start" });
      const q = gr % 90 === 0 ? "sobre um eixo" : `${Math.floor(gr / 90) + 1}º`;
      const sinal = (v) => (v > 0 ? "+" : v < 0 ? "−" : "0");
      ler(leitura, [
        ["θ =", `${gr}° = ${rad(gr)} rad`],
        ["quadrante", q],
        ["cos θ =", exato(c), "funcoes"],
        ["sen θ =", exato(sn), "derivadas"],
        ["tg θ =", exato(tg)],
        ["sinais (sen, cos)", `${sinal(sn)}  ${sinal(c)}`],
      ]);
    }
    s.addEventListener("input", desenhar);
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
