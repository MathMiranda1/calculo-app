/* ==========================================================
   geradores.js — exercícios com números sorteados.
   Cada <div data-gerador="tipo"> recebe um exercício do
   gerador de mesmo nome em GERADORES. O botão "Novo
   exercício" sorteia outros números.
   ========================================================== */

// ---------- Sorteio ----------

const sortear = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const sortearNaoNulo = (min, max) => {
  let n = 0;
  while (n === 0) n = sortear(min, max);
  return n;
};
const escolher = (lista) => lista[Math.floor(Math.random() * lista.length)];

// ---------- Escrita em LaTeX ----------

// Número com vírgula decimal: 2.5 -> 2{,}5
function num(n) {
  const r = Math.round(n * 1000) / 1000;
  return String(r).replace(".", "{,}");
}

// Polinômio a partir de pares [coeficiente, parte literal]: [[2,"x^2"],[-3,"x"],[1,""]] -> 2x^2 - 3x + 1
function polinomio(termos) {
  let s = "";
  termos.forEach(([c, lit]) => {
    if (c === 0) return;
    const abs = Math.abs(c);
    const coef = lit && abs === 1 ? "" : num(abs);
    if (!s) s = (c < 0 ? "-" : "") + coef + lit;
    else s += (c < 0 ? " - " : " + ") + coef + lit;
  });
  return s || "0";
}

// Fator de raiz r: 2 -> (x - 2), -3 -> (x + 3), 0 -> x
const fator = (r) => (r === 0 ? "x" : `(x ${r < 0 ? "+" : "-"} ${num(Math.abs(r))})`);

// Número entre parênteses quando negativo: -3 -> (-3)
const par = (n) => (n < 0 ? `(${num(n)})` : num(n));

// ---------- Leitura da resposta ----------

// Aceita 2 | -2,5 | 3/4 | √3/2 | 2√3 | -√2/2 | raiz(3)/2. Devolve NaN se não entender.
function lerResposta(texto) {
  let t = String(texto).trim().toLowerCase()
    .replace(/\s+/g, "")
    .replace(/−/g, "-")
    .replace(/,/g, ".")
    .replace(/raiz|sqrt/g, "√")
    .replace(/√\(([\d.]+)\)/g, "√$1");
  const m = t.match(/^([+-])?(\d+(?:\.\d+)?)?(?:√(\d+(?:\.\d+)?))?(?:\/(\d+(?:\.\d+)?))?$/);
  if (!m || (m[2] === undefined && m[3] === undefined)) return NaN;
  const sinal = m[1] === "-" ? -1 : 1;
  const coef = m[2] !== undefined ? +m[2] : 1;
  const raiz = m[3] !== undefined ? Math.sqrt(+m[3]) : 1;
  const den = m[4] !== undefined ? +m[4] : 1;
  if (den === 0) return NaN;
  return (sinal * coef * raiz) / den;
}

// Tolera arredondamento com 2 casas (ex.: 0,87 para √3/2)
const confere = (resp, certo) => Math.abs(resp - certo) <= Math.max(0.006, Math.abs(certo) * 1e-3);

// ---------- Geradores ----------
// Cada um devolve { enunciado, campos: [{ rotulo, valor }], solucao: [passos] }

const GERADORES = {
  constante() {
    const b = sortearNaoNulo(-9, 9);
    return escolher([
      () => {
        const k = sortear(-10, 10);
        return {
          enunciado: `Seja \\(f(x) = ${num(b)}\\). Quanto vale \\(f(${num(k)})\\)?`,
          campos: [{ rotulo: `\\(f(${num(k)})\\)`, valor: b }],
          solucao: [
            `Na função constante a saída é sempre a mesma, qualquer que seja \\(x\\).`,
            `Logo \\(f(${num(k)}) = ${num(b)}\\).`,
          ],
        };
      },
      () => {
        const k1 = sortear(-10, 10), k2 = sortear(-10, 10);
        return {
          enunciado: `Seja \\(f(x) = ${num(b)}\\). Calcule \\(f(${num(k1)}) + f(${num(k2)})\\).`,
          campos: [{ rotulo: "Resultado", valor: 2 * b }],
          solucao: [
            `As duas saídas valem \\(${num(b)}\\), porque a função é constante.`,
            `\\(f(${num(k1)}) + f(${num(k2)}) = ${num(b)} + ${par(b)} = ${num(2 * b)}\\).`,
          ],
        };
      },
      () => ({
        enunciado: `O gráfico de \\(f(x) = ${num(b)}\\) é uma reta. Qual é a inclinação (taxa de variação) dessa reta?`,
        campos: [{ rotulo: "Inclinação", valor: 0 }],
        solucao: [
          `A reta é horizontal: quando \\(x\\) aumenta, \\(f(x)\\) não muda.`,
          `Variação de \\(y\\) igual a zero, então a inclinação é \\(0\\).`,
        ],
      }),
    ])();
  },

  afim() {
    return escolher([
      () => {
        const a = sortearNaoNulo(-5, 5), b = sortearNaoNulo(-9, 9), k = sortear(-6, 6);
        return {
          enunciado: `Seja \\(f(x) = ${polinomio([[a, "x"], [b, ""]])}\\). Calcule \\(f(${num(k)})\\).`,
          campos: [{ rotulo: `\\(f(${num(k)})\\)`, valor: a * k + b }],
          solucao: [
            `Troque \\(x\\) por \\(${num(k)}\\): \\(f(${num(k)}) = ${num(a)} \\cdot ${par(k)} + ${par(b)}\\).`,
            `\\(= ${num(a * k)} + ${par(b)} = ${num(a * k + b)}\\).`,
          ],
        };
      },
      () => {
        const r = sortearNaoNulo(-6, 6), a = sortearNaoNulo(-4, 4), b = -a * r;
        return {
          enunciado: `Encontre o zero (raiz) da função \\(f(x) = ${polinomio([[a, "x"], [b, ""]])}\\).`,
          campos: [{ rotulo: "\\(x\\)", valor: r }],
          solucao: [
            `O zero é o \\(x\\) que faz \\(f(x) = 0\\): \\(${polinomio([[a, "x"], [b, ""]])} = 0\\).`,
            `\\(${num(a)}x = ${num(-b)} \\Rightarrow x = \\dfrac{${num(-b)}}{${num(a)}} = ${num(r)}\\).`,
            `A reta corta o eixo \\(x\\) no ponto \\((${num(r)}, 0)\\).`,
          ],
        };
      },
      () => {
        const a = sortearNaoNulo(-4, 4), b = sortear(-6, 6);
        const x1 = sortear(-3, 1), x2 = x1 + sortear(1, 4);
        const y1 = a * x1 + b, y2 = a * x2 + b;
        return {
          enunciado: `Uma função afim \\(f(x) = ax + b\\) passa pelos pontos \\((${num(x1)}, ${num(y1)})\\) e \\((${num(x2)}, ${num(y2)})\\). Encontre \\(a\\) e \\(b\\).`,
          campos: [{ rotulo: "\\(a\\)", valor: a }, { rotulo: "\\(b\\)", valor: b }],
          solucao: [
            `Inclinação: \\(a = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{${num(y2)} - ${par(y1)}}{${num(x2)} - ${par(x1)}} = \\dfrac{${num(y2 - y1)}}{${num(x2 - x1)}} = ${num(a)}\\).`,
            `Use um dos pontos: \\(${num(y1)} = ${num(a)} \\cdot ${par(x1)} + b \\Rightarrow b = ${num(y1)} - ${par(a * x1)} = ${num(b)}\\).`,
            `Logo \\(f(x) = ${polinomio([[a, "x"], [b, ""]])}\\).`,
          ],
        };
      },
    ])();
  },

  linear() {
    const a = sortearNaoNulo(-6, 6);
    return escolher([
      () => {
        const k = sortearNaoNulo(-8, 8);
        return {
          enunciado: `Seja \\(f(x) = ${polinomio([[a, "x"]])}\\). Calcule \\(f(${num(k)})\\).`,
          campos: [{ rotulo: `\\(f(${num(k)})\\)`, valor: a * k }],
          solucao: [`\\(f(${num(k)}) = ${num(a)} \\cdot ${par(k)} = ${num(a * k)}\\).`],
        };
      },
      () => {
        const p = sortearNaoNulo(-5, 5);
        return {
          enunciado: `Uma função linear \\(f(x) = ax\\) tem \\(f(${num(p)}) = ${num(a * p)}\\). Qual é o valor de \\(a\\)?`,
          campos: [{ rotulo: "\\(a\\)", valor: a }],
          solucao: [
            `\\(f(${num(p)}) = a \\cdot ${par(p)} = ${num(a * p)}\\).`,
            `\\(a = \\dfrac{${num(a * p)}}{${num(p)}} = ${num(a)}\\).`,
          ],
        };
      },
      () => {
        const p = sortear(1, 5), m = sortear(2, 9);
        return {
          enunciado: `Uma função linear tem \\(f(${num(p)}) = ${num(a * p)}\\). Quanto vale \\(f(${num(m)})\\)?`,
          campos: [{ rotulo: `\\(f(${num(m)})\\)`, valor: a * m }],
          solucao: [
            `Na função linear \\(f(x) = ax\\), então \\(a = \\dfrac{${num(a * p)}}{${num(p)}} = ${num(a)}\\).`,
            `\\(f(${num(m)}) = ${num(a)} \\cdot ${num(m)} = ${num(a * m)}\\).`,
            `Outra forma: a saída é proporcional à entrada.`,
          ],
        };
      },
    ])();
  },

  quadratica() {
    const a = escolher([1, 1, -1, 2, -2]);
    const r1 = sortear(-5, 4), r2 = r1 + sortear(1, 6);
    const b = -a * (r1 + r2), c = a * r1 * r2;
    const f = (x) => a * x * x + b * x + c;
    const expr = polinomio([[a, "x^2"], [b, "x"], [c, ""]]);
    const delta = b * b - 4 * a * c;
    const xv = (r1 + r2) / 2, yv = f(xv);
    return escolher([
      () => ({
        enunciado: `Encontre as raízes de \\(f(x) = ${expr}\\). Escreva a menor em \\(x_1\\) e a maior em \\(x_2\\).`,
        campos: [{ rotulo: "\\(x_1\\)", valor: r1 }, { rotulo: "\\(x_2\\)", valor: r2 }],
        solucao: [
          `\\(a = ${num(a)}\\), \\(b = ${num(b)}\\), \\(c = ${num(c)}\\).`,
          `\\(\\Delta = b^2 - 4ac = ${par(b)}^2 - 4 \\cdot ${par(a)} \\cdot ${par(c)} = ${num(delta)}\\).`,
          `\\(x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a} = \\dfrac{${num(-b)} \\pm ${num(Math.sqrt(delta))}}{${num(2 * a)}}\\).`,
          `Raízes: \\(x_1 = ${num(r1)}\\) e \\(x_2 = ${num(r2)}\\). Confira na forma fatorada: \\(f(x) = ${a === 1 ? "" : a === -1 ? "-" : num(a)}${fator(r1)}${fator(r2)}\\).`,
        ],
      }),
      () => ({
        enunciado: `Encontre o vértice \\(V = (x_v, y_v)\\) da parábola \\(f(x) = ${expr}\\).`,
        campos: [{ rotulo: "\\(x_v\\)", valor: xv }, { rotulo: "\\(y_v\\)", valor: yv }],
        solucao: [
          `\\(x_v = -\\dfrac{b}{2a} = -\\dfrac{${num(b)}}{${num(2 * a)}} = ${num(xv)}\\).`,
          `Sem Bhaskara: substitua \\(x_v\\) na função. \\(y_v = f(${num(xv)}) = ${num(yv)}\\).`,
          `Como \\(a ${a > 0 ? "> 0" : "< 0"}\\), o vértice é um ponto de ${a > 0 ? "mínimo" : "máximo"}.`,
        ],
      }),
      () => ({
        enunciado: `Calcule o discriminante \\(\\Delta\\) de \\(f(x) = ${expr}\\).`,
        campos: [{ rotulo: "\\(\\Delta\\)", valor: delta }],
        solucao: [
          `\\(\\Delta = b^2 - 4ac = ${par(b)}^2 - 4 \\cdot ${par(a)} \\cdot ${par(c)}\\).`,
          `\\(= ${num(b * b)} - ${par(4 * a * c)} = ${num(delta)}\\).`,
          `Como \\(\\Delta > 0\\), a parábola corta o eixo \\(x\\) em dois pontos.`,
        ],
      }),
    ])();
  },

  modular() {
    const h = sortear(-5, 5), k = sortear(-4, 4);
    const dentro = polinomio([[1, "x"], [-h, ""]]);
    const expr = `|${dentro}|${k === 0 ? "" : k > 0 ? ` + ${num(k)}` : ` - ${num(-k)}`}`;
    return escolher([
      () => {
        const p = sortear(-8, 8);
        const v = Math.abs(p - h) + k;
        return {
          enunciado: `Seja \\(f(x) = ${expr}\\). Calcule \\(f(${num(p)})\\).`,
          campos: [{ rotulo: `\\(f(${num(p)})\\)`, valor: v }],
          solucao: [
            `Dentro do módulo: \\(${num(p)} - ${par(h)} = ${num(p - h)}\\).`,
            `\\(|${num(p - h)}| = ${num(Math.abs(p - h))}\\), pois o módulo tira o sinal.`,
            k === 0 ? `Logo \\(f(${num(p)}) = ${num(v)}\\).` : `\\(f(${num(p)}) = ${num(Math.abs(p - h))} + ${par(k)} = ${num(v)}\\).`,
          ],
        };
      },
      () => {
        const d = sortear(1, 7);
        return {
          enunciado: `Resolva \\(|${dentro}| = ${num(d)}\\). Escreva a menor solução em \\(x_1\\) e a maior em \\(x_2\\).`,
          campos: [{ rotulo: "\\(x_1\\)", valor: h - d }, { rotulo: "\\(x_2\\)", valor: h + d }],
          solucao: [
            `\\(|u| = ${num(d)}\\) quando \\(u = ${num(d)}\\) ou \\(u = -${num(d)}\\).`,
            `\\(${dentro} = -${num(d)} \\Rightarrow x = ${num(h - d)}\\).`,
            `\\(${dentro} = ${num(d)} \\Rightarrow x = ${num(h + d)}\\).`,
          ],
        };
      },
      () => ({
        enunciado: `Qual é o menor valor que \\(f(x) = ${expr}\\) assume?`,
        campos: [{ rotulo: "Valor mínimo", valor: k }],
        solucao: [
          `O módulo nunca é negativo: \\(|${dentro}| \\ge 0\\), e vale \\(0\\) em \\(x = ${num(h)}\\).`,
          `Então o menor valor de \\(f\\) é \\(0 ${k === 0 ? "" : k > 0 ? `+ ${num(k)}` : `- ${num(-k)}`} = ${num(k)}\\). O gráfico tem a ponta (vértice) em \\((${num(h)}, ${num(k)})\\).`,
        ],
      }),
    ])();
  },

  exponencial() {
    const b = escolher([2, 3, 4, 5, 10]);
    return escolher([
      () => {
        const n = sortear(-2, 4);
        const v = Math.pow(b, n);
        const valor = n >= 0 ? num(v) : `\\dfrac{1}{${num(Math.pow(b, -n))}}`;
        return {
          enunciado: `Seja \\(f(x) = ${b}^x\\). Calcule \\(f(${num(n)})\\). Frações como 1/9 também valem.`,
          campos: [{ rotulo: `\\(f(${num(n)})\\)`, valor: v }],
          solucao: n >= 0
            ? [`\\(f(${num(n)}) = ${b}^{${num(n)}} = ${valor}\\).`]
            : [`Expoente negativo inverte a base: \\(${b}^{${num(n)}} = \\dfrac{1}{${b}^{${num(-n)}}}\\).`, `\\(= ${valor}\\).`],
        };
      },
      () => {
        const n = sortear(1, b === 10 ? 4 : 5);
        return {
          enunciado: `Resolva a equação \\(${b}^x = ${num(Math.pow(b, n))}\\).`,
          campos: [{ rotulo: "\\(x\\)", valor: n }],
          solucao: [
            `Escreva o lado direito como potência de ${b}: \\(${num(Math.pow(b, n))} = ${b}^{${n}}\\).`,
            `Bases iguais, expoentes iguais: \\(${b}^x = ${b}^{${n}} \\Rightarrow x = ${n}\\).`,
          ],
        };
      },
      () => {
        const p0 = escolher([50, 100, 200, 500]), t = sortear(1, 6);
        return {
          enunciado: `Uma colônia de bactérias começa com ${p0} indivíduos e dobra a cada hora: \\(P(t) = ${p0} \\cdot 2^t\\). Quantas bactérias há depois de ${t} ${t === 1 ? "hora" : "horas"}?`,
          campos: [{ rotulo: `\\(P(${t})\\)`, valor: p0 * Math.pow(2, t) }],
          solucao: [
            `\\(P(${t}) = ${p0} \\cdot 2^{${t}} = ${p0} \\cdot ${Math.pow(2, t)} = ${num(p0 * Math.pow(2, t))}\\).`,
            `Repare: cada hora a mais multiplica o total por 2. Isso é crescimento exponencial.`,
          ],
        };
      },
    ])();
  },

  logaritmica() {
    return escolher([
      () => {
        const b = escolher([2, 3, 5, 10]);
        const n = sortear(-2, b === 2 ? 6 : 4);
        const arg = n >= 0 ? num(Math.pow(b, n)) : `\\dfrac{1}{${num(Math.pow(b, -n))}}`;
        return {
          enunciado: `Calcule \\(\\log_{${b}} ${arg}\\).`,
          campos: [{ rotulo: "Resultado", valor: n }],
          solucao: [
            `Pergunta: a que expoente devo elevar ${b} para obter \\(${arg}\\)?`,
            `\\(${b}^{${num(n)}} = ${arg}\\), então \\(\\log_{${b}} ${arg} = ${num(n)}\\).`,
          ],
        };
      },
      () => {
        const b = escolher([2, 3, 5, 10]);
        const n = sortear(1, b === 2 ? 6 : 3);
        return {
          enunciado: `Resolva \\(\\log_{${b}} x = ${n}\\).`,
          campos: [{ rotulo: "\\(x\\)", valor: Math.pow(b, n) }],
          solucao: [
            `Pela definição, \\(\\log_{${b}} x = ${n}\\) significa \\(${b}^{${n}} = x\\).`,
            `\\(x = ${num(Math.pow(b, n))}\\). Confira: o argumento é positivo, então a solução vale.`,
          ],
        };
      },
      () => {
        const [b, m, k, r] = escolher([[6, 4, 9, 2], [10, 4, 25, 2], [10, 2, 50, 2], [10, 5, 200, 3], [2, 4, 8, 5], [3, 3, 27, 4], [2, 2, 16, 5]]);
        const base = b === 10 ? "" : `_{${b}}`;
        return {
          enunciado: `Calcule \\(\\log${base} ${m} + \\log${base} ${k}\\)${b === 10 ? " (base 10)" : ""}.`,
          campos: [{ rotulo: "Resultado", valor: r }],
          solucao: [
            `Soma de logaritmos de mesma base vira logaritmo do produto: \\(\\log${base} ${m} + \\log${base} ${k} = \\log${base} (${m} \\cdot ${k})\\).`,
            `\\(= \\log${base} ${m * k} = ${r}\\), pois \\(${b}^{${r}} = ${m * k}\\).`,
          ],
        };
      },
    ])();
  },

  trigonometrica() {
    return escolher([
      () => {
        // [graus, radianos, sen, cos, sen em LaTeX, cos em LaTeX]
        const notaveis = [
          [0, "0", 0, 1, "0", "1"],
          [30, "\\frac{\\pi}{6}", 1 / 2, Math.sqrt(3) / 2, "\\frac{1}{2}", "\\frac{\\sqrt{3}}{2}"],
          [45, "\\frac{\\pi}{4}", Math.SQRT2 / 2, Math.SQRT2 / 2, "\\frac{\\sqrt{2}}{2}", "\\frac{\\sqrt{2}}{2}"],
          [60, "\\frac{\\pi}{3}", Math.sqrt(3) / 2, 1 / 2, "\\frac{\\sqrt{3}}{2}", "\\frac{1}{2}"],
          [90, "\\frac{\\pi}{2}", 1, 0, "1", "0"],
          [180, "\\pi", 0, -1, "0", "-1"],
          [270, "\\frac{3\\pi}{2}", -1, 0, "-1", "0"],
        ];
        const [g, rad, s, c, sl, cl] = escolher(notaveis);
        const ehSeno = Math.random() < 0.5;
        const nome = ehSeno ? "\\operatorname{sen}" : "\\cos";
        const angulo = Math.random() < 0.5 ? `${g}^\\circ` : rad;
        return {
          enunciado: `Quanto vale \\(${nome}\\left(${angulo}\\right)\\)? Pode responder com raiz (ex.: √3/2) ou decimal com 2 casas.`,
          campos: [{ rotulo: "Valor", valor: ehSeno ? s : c }],
          solucao: [
            `\\(${angulo}\\) ${angulo === rad && g !== 0 ? `equivale a \\(${g}^\\circ\\)` : `corresponde a \\(${rad}\\) rad`}.`,
            `Na tabela de valores notáveis: \\(${nome}(${g}^\\circ) = ${ehSeno ? sl : cl}\\).`,
            `No círculo trigonométrico, o ${ehSeno ? "seno é a ordenada (y)" : "cosseno é a abscissa (x)"} do ponto do ângulo.`,
          ],
        };
      },
      () => {
        const a = sortearNaoNulo(-4, 4);
        const [b, bl] = escolher([[1, ""], [2, "2"], [3, "3"], [4, "4"], [0.5, "\\tfrac{1}{2}"]]);
        const k = 2 / b;
        return {
          enunciado: `Para \\(f(x) = ${a === 1 ? "" : a === -1 ? "-" : num(a)}\\operatorname{sen}(${bl}x)\\), encontre a amplitude e o período. Escreva o período como \\(k\\pi\\) e informe só o \\(k\\).`,
          campos: [{ rotulo: "Amplitude", valor: Math.abs(a) }, { rotulo: "\\(k\\) (período \\(= k\\pi\\))", valor: k }],
          solucao: [
            `Em \\(a\\operatorname{sen}(bx)\\), a amplitude é \\(|a| = ${num(Math.abs(a))}\\).`,
            `Período: \\(\\dfrac{2\\pi}{b} = \\dfrac{2\\pi}{${num(b)}} = ${k === 1 ? "" : num(k)}\\pi\\). Logo \\(k = ${num(k)}\\).`,
          ],
        };
      },
      () => {
        const a = sortearNaoNulo(-3, 3), d = sortear(-3, 3);
        const expr = `${a === 1 ? "" : a === -1 ? "-" : num(a)}\\cos x${d === 0 ? "" : d > 0 ? ` + ${d}` : ` - ${-d}`}`;
        return {
          enunciado: `A imagem de \\(f(x) = ${expr}\\) é um intervalo \\([m, M]\\). Encontre \\(m\\) e \\(M\\).`,
          campos: [{ rotulo: "\\(m\\)", valor: d - Math.abs(a) }, { rotulo: "\\(M\\)", valor: d + Math.abs(a) }],
          solucao: [
            `\\(\\cos x\\) varia entre \\(-1\\) e \\(1\\). Multiplicado por \\(${num(a)}\\), varia entre \\(-${num(Math.abs(a))}\\) e \\(${num(Math.abs(a))}\\).`,
            `Somando \\(${num(d)}\\): de \\(${num(d - Math.abs(a))}\\) a \\(${num(d + Math.abs(a))}\\). Imagem \\([${num(d - Math.abs(a))}, ${num(d + Math.abs(a))}]\\).`,
          ],
        };
      },
    ])();
  },
};

// ---------- Montagem na página ----------

let contadorCampo = 0;

function montarGerador(container) {
  const gerar = GERADORES[container.dataset.gerador];
  if (!gerar) return;
  const art = document.createElement("article");
  art.className = "questao gerada";
  container.appendChild(art);
  let anterior = "";

  function novo() {
    let ex = gerar();
    for (let i = 0; i < 5 && ex.enunciado === anterior; i++) ex = gerar();
    anterior = ex.enunciado;

    art.innerHTML = `
      <p class="enunciado">${ex.enunciado}</p>
      <form class="campos-resposta" novalidate>
        ${ex.campos.map((c) => {
          const id = `resp-${++contadorCampo}`;
          return `<div class="campo"><label for="${id}">${c.rotulo}</label><input id="${id}" type="text" inputmode="text" autocomplete="off" spellcheck="false"></div>`;
        }).join("")}
        <div class="acoes-gerada">
          <button type="submit" class="botao">Verificar</button>
          <button type="button" class="botao secundario" data-novo>Novo exercício</button>
        </div>
      </form>
      <p class="dica-formato">Use vírgula para decimais. Frações (3/4) e raízes (√3/2) também valem.</p>
      <div class="retorno" hidden aria-live="polite"></div>`;

    const form = art.querySelector("form");
    const inputs = [...form.querySelectorAll("input")];
    const retorno = art.querySelector(".retorno");
    const passos = `<ol>${ex.solucao.map((p) => `<li>${p}</li>`).join("")}</ol>`;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const lidas = inputs.map((i) => lerResposta(i.value));
      const vazio = lidas.findIndex((v) => Number.isNaN(v));
      retorno.hidden = false;
      if (vazio !== -1) {
        retorno.className = "retorno erro";
        retorno.innerHTML = `<span class="veredito">Não entendi a resposta.</span>Escreva um número, como 2, -1,5, 3/4 ou √2/2.`;
        inputs[vazio].focus();
        return;
      }
      const certos = lidas.map((v, i) => confere(v, ex.campos[i].valor));
      inputs.forEach((inp, i) => inp.setAttribute("aria-invalid", String(!certos[i])));
      if (certos.every(Boolean)) {
        retorno.className = "retorno acerto";
        retorno.innerHTML = `<span class="veredito">Correto.</span>Veja a resolução:${passos}`;
      } else {
        retorno.className = "retorno erro";
        retorno.innerHTML = `<span class="veredito">Ainda não.</span>Tente de novo ou abra a solução.<details><summary>Ver solução</summary>${passos}</details>`;
      }
      renderizarMat(retorno);
    });
    form.querySelector("[data-novo]").addEventListener("click", () => {
      novo();
      art.querySelector("input").focus();
    });
    renderizarMat(art);
  }
  novo();
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-gerador]").forEach(montarGerador);
  });
}

if (typeof module !== "undefined") module.exports = { lerResposta, confere, polinomio, num, GERADORES };
