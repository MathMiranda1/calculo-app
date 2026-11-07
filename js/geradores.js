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
// Valor em reais fora do LaTeX: 3.5 -> 3,50
const dinheiro = (v) => v.toFixed(2).replace(".", ",");

const par = (n) => (n < 0 ? `(${num(n)})` : num(n));

// Máximo divisor comum de inteiros
const mdc = (a, b) => (b === 0 ? Math.abs(a) : mdc(b, a % b));

// Fração simplificada em LaTeX: (6, 4) -> \dfrac{3}{2}, (-4, 2) -> -2
function fracao(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = mdc(n, d) || 1;
  n /= g; d /= g;
  if (d === 1) return num(n);
  return `${n < 0 ? "-" : ""}\\dfrac{${Math.abs(n)}}{${d}}`;
}

// Fração entre parênteses quando negativa, para vir depois de um sinal de operação
const parFracao = (n, d) => (n * d < 0 ? `\\left(${fracao(n, d)}\\right)` : fracao(n, d));

// Potência b^n em LaTeX, com expoente negativo como fração: (2, -3) -> \dfrac{1}{8}
const potencia = (b, n) => (n >= 0 ? num(Math.pow(b, n)) : `\\dfrac{1}{${num(Math.pow(b, -n))}}`);

// Coeficiente na frente de uma expressão: 1 -> "", -1 -> "-", 3 -> "3"
const coefTexto = (a) => (a === 1 ? "" : a === -1 ? "-" : num(a));

// ---------- Ângulos notáveis ----------

// Ângulo em graus -> radianos em LaTeX: 150 -> \frac{5\pi}{6}
function radianos(g) {
  if (g === 0) return "0";
  const d0 = 180 / mdc(g, 180), n0 = g / mdc(g, 180);
  const sinal = n0 < 0 ? "-" : "";
  const n = Math.abs(n0), d = d0;
  const topo = `${n === 1 ? "" : n}\\pi`;
  return d === 1 ? `${sinal}${topo}` : `${sinal}\\frac{${topo}}{${d}}`;
}

// Valor exato (em módulo) de seno, cosseno ou tangente de ângulo notável -> LaTeX
const EXATOS = [
  [0, "0"], [1 / 2, "\\frac{1}{2}"], [Math.SQRT2 / 2, "\\frac{\\sqrt{2}}{2}"], [Math.sqrt(3) / 2, "\\frac{\\sqrt{3}}{2}"],
  [1, "1"], [Math.sqrt(3) / 3, "\\frac{\\sqrt{3}}{3}"], [Math.sqrt(3), "\\sqrt{3}"],
];
function exato(v) {
  const achado = EXATOS.find(([x]) => Math.abs(Math.abs(v) - x) < 1e-9);
  if (!achado) throw new Error(`valor não notável: ${v}`);
  return (v < -1e-9 ? "-" : "") + achado[1];
}

// Seno, cosseno e tangente de um ângulo em graus, sem ruído de ponto flutuante
function trig(g) {
  const r = (g * Math.PI) / 180;
  const limpo = (v) => (Math.abs(v) < 1e-9 ? 0 : v);
  const s = limpo(Math.sin(r)), c = limpo(Math.cos(r));
  return { s, c, t: c === 0 ? NaN : limpo(s / c) };
}

// Ternas pitagóricas [cateto, hipotenusa, outro cateto] para seno e cosseno racionais
const TRIPLAS = [[3, 5, 4], [4, 5, 3], [5, 13, 12], [12, 13, 5], [8, 17, 15], [15, 17, 8], [7, 25, 24], [24, 25, 7]];

// Quadrante (1 a 4) de um ângulo que não está sobre os eixos
const quadrante = (g) => Math.floor((((g % 360) + 360) % 360) / 90) + 1;

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
      () => {
        const a = sortearNaoNulo(-5, 5), b = sortearNaoNulo(-9, 9), x = sortear(-6, 6);
        const v = a * x + b;
        const expr = polinomio([[a, "x"], [b, ""]]);
        return {
          enunciado: `Seja \\(f(x) = ${expr}\\). Para qual valor de \\(x\\) temos \\(f(x) = ${num(v)}\\)?`,
          campos: [{ rotulo: "\\(x\\)", valor: x }],
          solucao: [
            `Iguale a função ao valor dado: \\(${expr} = ${num(v)}\\).`,
            `\\(${num(a)}x = ${num(v)} - ${par(b)} = ${num(v - b)}\\).`,
            `\\(x = \\dfrac{${num(v - b)}}{${num(a)}} = ${num(x)}\\).`,
          ],
        };
      },
      () => {
        const b = escolher([3.5, 4, 4.5, 5, 5.5, 6]), c = escolher([1.5, 2, 2.25, 2.5, 3, 3.2]), d = sortear(2, 25);
        const v = Math.round((b + c * d) * 100) / 100;
        return {
          enunciado: `Um táxi cobra R$ ${dinheiro(b)} de bandeirada mais R$ ${dinheiro(c)} por quilômetro rodado. O preço é a função afim \\(P(x) = ${num(c)}x + ${num(b)}\\). Quanto custa uma corrida de ${d} km?`,
          campos: [{ rotulo: `\\(P(${d})\\) em reais`, valor: v }],
          solucao: [
            `O coeficiente angular \\(${num(c)}\\) é o preço por km; o coeficiente linear \\(${num(b)}\\) é o valor fixo.`,
            `\\(P(${d}) = ${num(c)} \\cdot ${d} + ${num(b)} = ${num(c * d)} + ${num(b)} = ${num(v)}\\).`,
            `A corrida custa R$ ${dinheiro(v)}.`,
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
      () => {
        const x = sortearNaoNulo(-9, 9);
        return {
          enunciado: `Seja \\(f(x) = ${polinomio([[a, "x"]])}\\). Para qual valor de \\(x\\) temos \\(f(x) = ${num(a * x)}\\)?`,
          campos: [{ rotulo: "\\(x\\)", valor: x }],
          solucao: [
            `\\(${polinomio([[a, "x"]])} = ${num(a * x)}\\).`,
            `Divida os dois lados por \\(${num(a)}\\): \\(x = \\dfrac{${num(a * x)}}{${num(a)}} = ${num(x)}\\).`,
          ],
        };
      },
      () => {
        const [prod, un] = escolher([["O arroz", "kg"], ["A gasolina", "litro"], ["O tecido", "metro"], ["O café", "kg"]]);
        const c = escolher([2.5, 3, 4, 4.5, 6, 7.5, 8, 12]), m = sortear(2, 12);
        const v = Math.round(c * m * 100) / 100;
        const plural = un === "kg" ? "kg" : `${un}s`;
        return Math.random() < 0.5
          ? {
            enunciado: `${prod} custa R$ ${dinheiro(c)} por ${un}. O preço é a função linear \\(P(x) = ${num(c)}x\\). Quanto custam ${m} ${plural}?`,
            campos: [{ rotulo: `\\(P(${m})\\) em reais`, valor: v }],
            solucao: [
              `\\(P(${m}) = ${num(c)} \\cdot ${m} = ${num(v)}\\).`,
              `Preço e quantidade são proporcionais: o dobro da quantidade custa o dobro.`,
            ],
          }
          : {
            enunciado: `${prod} custa R$ ${dinheiro(c)} por ${un} (\\(P(x) = ${num(c)}x\\)). Com R$ ${dinheiro(v)}, quantos ${plural} dá para comprar?`,
            campos: [{ rotulo: "Quantidade", valor: m }],
            solucao: [
              `Resolva \\(P(x) = ${num(v)}\\): \\(${num(c)}x = ${num(v)}\\).`,
              `\\(x = \\dfrac{${num(v)}}{${num(c)}} = ${m}\\) ${plural}.`,
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
      () => ({
        enunciado: `Sem calcular as raízes, encontre a soma \\(S\\) e o produto \\(P\\) das raízes de \\(f(x) = ${expr}\\).`,
        campos: [{ rotulo: "\\(S\\)", valor: r1 + r2 }, { rotulo: "\\(P\\)", valor: r1 * r2 }],
        solucao: [
          `\\(a = ${num(a)}\\), \\(b = ${num(b)}\\), \\(c = ${num(c)}\\).`,
          `\\(S = -\\dfrac{b}{a} = -\\dfrac{${num(b)}}{${num(a)}} = ${num(r1 + r2)}\\).`,
          `\\(P = \\dfrac{c}{a} = \\dfrac{${num(c)}}{${num(a)}} = ${num(r1 * r2)}\\).`,
          `Confira com as raízes \\(${num(r1)}\\) e \\(${num(r2)}\\): soma \\(${num(r1 + r2)}\\), produto \\(${num(r1 * r2)}\\).`,
        ],
      }),
      () => ({
        enunciado: `A imagem de \\(f(x) = ${expr}\\) é \\(${a > 0 ? "[m, +\\infty)" : "(-\\infty, m]"}\\). Encontre \\(m\\) usando \\(y_v = -\\dfrac{\\Delta}{4a}\\).`,
        campos: [{ rotulo: "\\(m\\)", valor: yv }],
        solucao: [
          `\\(\\Delta = ${par(b)}^2 - 4 \\cdot ${par(a)} \\cdot ${par(c)} = ${num(delta)}\\).`,
          `\\(y_v = -\\dfrac{\\Delta}{4a} = -\\dfrac{${num(delta)}}{${num(4 * a)}} = ${num(yv)}\\).`,
          `Como \\(a ${a > 0 ? "> 0" : "< 0"}\\), a parábola tem concavidade para ${a > 0 ? "cima" : "baixo"} e \\(y_v\\) é o valor ${a > 0 ? "mínimo" : "máximo"}. Imagem: \\(${a > 0 ? `[${num(yv)}, +\\infty)` : `(-\\infty, ${num(yv)}]`}\\).`,
        ],
      }),
      () => {
        const k = sortear(-4, 4);
        return {
          enunciado: `Seja \\(f(x) = ${expr}\\). Calcule \\(f(${num(k)})\\).`,
          campos: [{ rotulo: `\\(f(${num(k)})\\)`, valor: f(k) }],
          solucao: [
            `Troque \\(x\\) por \\(${num(k)}\\): \\(f(${num(k)}) = ${num(a)} \\cdot ${par(k)}^2 + ${par(b)} \\cdot ${par(k)} + ${par(c)}\\).`,
            `\\(= ${num(a * k * k)} + ${par(b * k)} + ${par(c)} = ${num(f(k))}\\).`,
          ],
        };
      },
      () => {
        // Incompleta com b = 0: ax² + c = 0
        const a2 = escolher([1, 2, 3, -1, -2]), r = sortear(1, 6);
        const e2 = polinomio([[a2, "x^2"], [-a2 * r * r, ""]]);
        return {
          enunciado: `Encontre as raízes de \\(f(x) = ${e2}\\) sem usar Bhaskara. Escreva a menor em \\(x_1\\) e a maior em \\(x_2\\).`,
          campos: [{ rotulo: "\\(x_1\\)", valor: -r }, { rotulo: "\\(x_2\\)", valor: r }],
          solucao: [
            `É uma equação incompleta, com \\(b = 0\\): \\(${e2} = 0\\).`,
            `Isole \\(x^2\\): \\(x^2 = ${a2 === 1 ? "" : `\\dfrac{${num(a2 * r * r)}}{${num(a2)}} = `}${num(r * r)}\\).`,
            `\\(x = \\pm\\sqrt{${num(r * r)}} = \\pm ${num(r)}\\). Raízes: \\(x_1 = ${num(-r)}\\) e \\(x_2 = ${num(r)}\\).`,
          ],
        };
      },
      () => {
        // Aplicações: altura máxima de um projétil ou maior área com uma cerca
        if (Math.random() < 0.5) {
          const v = escolher([10, 20, 30, 40]), tv = v / 10, hmax = (v * v) / 20;
          return {
            enunciado: `Uma bola é lançada para cima e sua altura, em metros, é \\(h(t) = -5t^2 + ${v}t\\), com \\(t\\) em segundos. Em que instante ela atinge a altura máxima, e qual é essa altura?`,
            campos: [{ rotulo: "Instante \\(t\\) (s)", valor: tv }, { rotulo: "Altura máxima (m)", valor: hmax }],
            solucao: [
              `A trajetória é uma parábola com \\(a = -5 \\lt 0\\): o vértice é o ponto de máximo.`,
              `\\(t_v = -\\dfrac{b}{2a} = -\\dfrac{${v}}{2 \\cdot (-5)} = ${num(tv)}\\) s.`,
              `\\(h(${num(tv)}) = -5 \\cdot ${num(tv * tv)} + ${v} \\cdot ${num(tv)} = ${num(-5 * tv * tv)} + ${num(v * tv)} = ${num(hmax)}\\) m.`,
            ],
          };
        }
        const P = 4 * sortear(5, 25), lado = P / 4, meio = P / 2;
        return {
          enunciado: `Com ${P} m de cerca, quer-se cercar um terreno retangular com a maior área possível. Qual é a medida do lado e qual é a área máxima?`,
          campos: [{ rotulo: "Lado \\(x\\) (m)", valor: lado }, { rotulo: "Área (m²)", valor: lado * lado }],
          solucao: [
            `Lados \\(x\\) e \\(y\\): \\(2x + 2y = ${P}\\), então \\(y = ${meio} - x\\).`,
            `Área: \\(A(x) = x(${meio} - x) = -x^2 + ${meio}x\\). Como \\(a = -1 \\lt 0\\), o vértice é o máximo.`,
            `\\(x_v = -\\dfrac{${meio}}{2 \\cdot (-1)} = ${num(lado)}\\) e \\(A(${num(lado)}) = ${num(lado)} \\cdot ${num(meio - lado)} = ${num(lado * lado)}\\) m². É um quadrado.`,
          ],
        };
      },
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
      () => {
        // Erro absoluto de uma previsão (Na computação)
        const real = sortear(20, 90), dif = sortearNaoNulo(-12, 12), prev = real + dif;
        return {
          enunciado: `Um modelo previu ${prev} acessos para um site, mas o valor real foi ${real}. Qual é o erro absoluto \\(|\\text{real} - \\text{previsto}|\\)?`,
          campos: [{ rotulo: "Erro", valor: Math.abs(dif) }],
          solucao: [
            `\\(|${real} - ${prev}| = |${num(-dif)}| = ${num(Math.abs(dif))}\\).`,
            `O modelo errou para ${dif > 0 ? "mais" : "menos"}, mas o módulo ignora o sinal: errar para mais ou para menos conta igual.`,
          ],
        };
      },
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
      () => {
        // Decaimento: a quantidade cai pela metade a cada meia-vida
        const n = sortear(1, 5), fim = 5 * sortear(1, 20), n0 = fim * Math.pow(2, n);
        const [h, un] = escolher([[2, "horas"], [3, "dias"], [5, "anos"], [8, "dias"], [10, "anos"], [12, "horas"], [20, "anos"], [30, "anos"]]);
        const t = n * h;
        return {
          enunciado: `Uma substância radioativa tem meia-vida de ${h} ${un}: \\(N(t) = ${n0} \\cdot \\left(\\tfrac{1}{2}\\right)^{t/${h}}\\), com \\(N\\) em mg. Quantos mg restam depois de ${t} ${un}?`,
          campos: [{ rotulo: `\\(N(${t})\\)`, valor: fim }],
          solucao: [
            `Número de meias-vidas: \\(\\dfrac{${t}}{${h}} = ${n}\\).`,
            `\\(N(${t}) = ${n0} \\cdot \\left(\\tfrac{1}{2}\\right)^{${n}} = \\dfrac{${n0}}{${Math.pow(2, n)}} = ${num(fim)}\\).`,
            `Base entre 0 e 1: a função é decrescente. Isso é decaimento exponencial.`,
          ],
        };
      },
      () => {
        // Equação b^(ax + k) = b^n
        const base = escolher([2, 3, 5]);
        const lim = { 2: [-3, 6], 3: [-2, 4], 5: [-2, 3] }[base];
        let a, k, x, n;
        do {
          a = escolher([1, 1, 2, 3]); k = sortearNaoNulo(-3, 3); x = sortear(-2, 4);
          n = a * x + k;
        } while (n < lim[0] || n > lim[1]);
        const expo = polinomio([[a, "x"], [k, ""]]);
        return {
          enunciado: `Resolva a equação \\(${base}^{${expo}} = ${potencia(base, n)}\\).`,
          campos: [{ rotulo: "\\(x\\)", valor: x }],
          solucao: [
            `Escreva o lado direito como potência de ${base}: \\(${potencia(base, n)} = ${base}^{${num(n)}}\\).`,
            `Bases iguais, expoentes iguais: \\(${expo} = ${num(n)}\\).`,
            a === 1
              ? `\\(x = ${num(n)} - ${par(k)} = ${num(x)}\\).`
              : `\\(${num(a)}x = ${num(n)} - ${par(k)} = ${num(n - k)} \\Rightarrow x = \\dfrac{${num(n - k)}}{${num(a)}} = ${num(x)}\\).`,
          ],
        };
      },
      () => {
        // Propriedades das potências de mesma base
        const b = sortear(2, 9), m = sortear(2, 9), n = sortear(2, 6);
        const [expr, k, regra] = escolher([
          [`${b}^{${m}} \\cdot ${b}^{${n}}`, m + n, `Produto de mesma base: conserva a base e soma os expoentes. \\(k = ${m} + ${n} = ${m + n}\\).`],
          [`\\dfrac{${b}^{${m}}}{${b}^{${n}}}`, m - n, `Divisão de mesma base: conserva a base e subtrai os expoentes. \\(k = ${m} - ${n} = ${num(m - n)}\\).`],
          [`\\left(${b}^{${m}}\\right)^{${n}}`, m * n, `Potência de potência: multiplica os expoentes. \\(k = ${m} \\cdot ${n} = ${m * n}\\).`],
        ]);
        return {
          enunciado: `Escreva \\(${expr}\\) como uma única potência \\(${b}^k\\). Quanto vale \\(k\\)?`,
          campos: [{ rotulo: "\\(k\\)", valor: k }],
          solucao: [regra, `Logo \\(${expr} = ${b}^{${num(k)}}\\).`],
        };
      },
      () => {
        // Base fracionária: (1/b)^x
        const b = escolher([2, 3, 4, 5]), n = sortearNaoNulo(-3, 3);
        const v = Math.pow(b, -n);
        return {
          enunciado: `Seja \\(f(x) = \\left(\\tfrac{1}{${b}}\\right)^x\\). Calcule \\(f(${num(n)})\\). Frações como 1/9 também valem.`,
          campos: [{ rotulo: `\\(f(${num(n)})\\)`, valor: v }],
          solucao: [
            `\\(\\left(\\tfrac{1}{${b}}\\right)^x = ${b}^{-x}\\), então \\(f(${num(n)}) = ${b}^{${num(-n)}}\\).`,
            `\\(= ${potencia(b, -n)}\\).`,
            `Base entre 0 e 1: quanto maior o \\(x\\), menor o valor. A função é decrescente.`,
          ],
        };
      },
      () => {
        // Juros compostos M = C(1 + i)^t
        const C = escolher([1000, 2000, 5000, 10000]), i = escolher([10, 20]), t = sortear(1, 3);
        const fator = Math.pow(1 + i / 100, t), M = Math.round(C * fator * 100) / 100;
        return {
          enunciado: `R$ ${C} são aplicados a juros compostos de ${i}% ao mês. Qual é o montante, em reais, depois de ${t} ${t === 1 ? "mês" : "meses"}?`,
          campos: [{ rotulo: "Montante (R$)", valor: M }],
          solucao: [
            `Juros compostos: \\(M = C(1 + i)^t\\), com \\(C = ${C}\\), \\(i = ${num(i / 100)}\\) e \\(t = ${t}\\).`,
            `\\(M = ${C} \\cdot ${num(1 + i / 100)}^{${t}} = ${C} \\cdot ${num(Math.round(fator * 1000) / 1000)}\\).`,
            `\\(M = ${num(M)}\\) reais.`,
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
      () => {
        // Quociente: log M − log N = log(M/N)
        const b = escolher([2, 3, 10]), r = sortear(1, b === 2 ? 4 : b === 3 ? 3 : 2);
        const n = sortear(2, 9), m = n * Math.pow(b, r);
        const base = b === 10 ? "" : `_{${b}}`;
        return {
          enunciado: `Calcule \\(\\log${base} ${m} - \\log${base} ${n}\\)${b === 10 ? " (base 10)" : ""}.`,
          campos: [{ rotulo: "Resultado", valor: r }],
          solucao: [
            `Diferença de logaritmos de mesma base vira logaritmo do quociente: \\(\\log${base} ${m} - \\log${base} ${n} = \\log${base} \\dfrac{${m}}{${n}}\\).`,
            `\\(= \\log${base} ${Math.pow(b, r)} = ${r}\\), pois \\(${b}^{${r}} = ${Math.pow(b, r)}\\).`,
          ],
        };
      },
      () => {
        // Potência: log_b (b^k)^p = p·k
        const b = escolher([2, 3, 5, 10]), k = sortear(1, b === 2 ? 4 : 2), p = sortear(2, 7);
        const c = Math.pow(b, k);
        const base = b === 10 ? "" : `_{${b}}`;
        return {
          enunciado: `Calcule \\(\\log${base} ${c}^{${p}}\\)${b === 10 ? " (base 10)" : ""}.`,
          campos: [{ rotulo: "Resultado", valor: p * k }],
          solucao: [
            `O expoente do argumento passa multiplicando: \\(\\log${base} ${c}^{${p}} = ${p} \\cdot \\log${base} ${c}\\).`,
            `\\(\\log${base} ${c} = ${k}\\), pois \\(${b}^{${k}} = ${c}\\).`,
            `Logo o resultado é \\(${p} \\cdot ${k} = ${p * k}\\).`,
          ],
        };
      },
      () => {
        // Mudança de base: log_{b^m} b^n = n/m
        const b = escolher([2, 3]), m = escolher([2, 3]), n = sortear(1, b === 2 ? 6 : 4);
        if (n === m) return GERADORES.logaritmica();
        const B = Math.pow(b, m), A = Math.pow(b, n);
        return {
          enunciado: `Use a mudança de base para calcular \\(\\log_{${B}} ${A}\\). Frações como 3/2 também valem.`,
          campos: [{ rotulo: "Resultado", valor: n / m }],
          solucao: [
            `Passe tudo para a base ${b}: \\(\\log_{${B}} ${A} = \\dfrac{\\log_{${b}} ${A}}{\\log_{${b}} ${B}}\\).`,
            `\\(\\log_{${b}} ${A} = ${n}\\) e \\(\\log_{${b}} ${B} = ${m}\\).`,
            `Resultado: \\(${fracao(n, m)}\\). Confira: \\(${B}^{${fracao(n, m)}} = ${A}\\).`,
          ],
        };
      },
      () => {
        // Domínio de log(ax + c)
        const a = sortear(1, 4), c = sortearNaoNulo(-12, 12);
        const dentro = polinomio([[a, "x"], [c, ""]]);
        const b = escolher([2, 3, 10]);
        const base = b === 10 ? "" : `_{${b}}`;
        return {
          enunciado: `O domínio de \\(f(x) = \\log${base}(${dentro})\\) é \\(x > m\\). Encontre \\(m\\). Frações como 5/2 também valem.`,
          campos: [{ rotulo: "\\(m\\)", valor: -c / a }],
          solucao: [
            `O logaritmo só existe para argumento positivo: \\(${dentro} > 0\\).`,
            a === 1
              ? `\\(x > ${num(-c)}\\).`
              : `\\(${a}x > ${num(-c)} \\Rightarrow x > \\dfrac{${num(-c)}}{${a}} = ${fracao(-c, a)}\\).`,
            `Logo \\(m = ${fracao(-c, a)}\\) e o domínio é \\(\\{x \\in \\mathbb{R} \\mid x > ${fracao(-c, a)}\\}\\).`,
          ],
        };
      },
      () => {
        // Equação log_b(x + k) = n
        const b = escolher([2, 3, 5, 10]), n = sortear(0, b === 2 ? 5 : b === 10 ? 2 : 3), k = sortearNaoNulo(-9, 9);
        const dentro = polinomio([[1, "x"], [k, ""]]);
        const base = b === 10 ? "" : `_{${b}}`;
        const x = Math.pow(b, n) - k;
        return {
          enunciado: `Resolva \\(\\log${base}(${dentro}) = ${n}\\)${b === 10 ? " (base 10)" : ""}.`,
          campos: [{ rotulo: "\\(x\\)", valor: x }],
          solucao: [
            `Pela definição: \\(${dentro} = ${b}^{${n}} = ${Math.pow(b, n)}\\).`,
            `\\(x = ${Math.pow(b, n)} - ${par(k)} = ${num(x)}\\).`,
            `Confira: o argumento \\(${num(x)} ${k < 0 ? "-" : "+"} ${Math.abs(k)} = ${Math.pow(b, n)}\\) é positivo, então a solução vale.`,
          ],
        };
      },
      () => {
        // Inequação log_b(x + k) < n, base > 1: solução -k < x < b^n - k
        const b = escolher([2, 3, 10]), n = sortear(1, b === 2 ? 5 : 2), k = sortearNaoNulo(-9, 9);
        const dentro = polinomio([[1, "x"], [k, ""]]);
        const base = b === 10 ? "" : `_{${b}}`;
        const pot = Math.pow(b, n);
        return {
          enunciado: `Resolva \\(\\log${base}(${dentro}) \\lt ${n}\\)${b === 10 ? " (base 10)" : ""}. A solução é um intervalo \\(m \\lt x \\lt M\\): informe \\(m\\) e \\(M\\).`,
          campos: [{ rotulo: "\\(m\\)", valor: -k }, { rotulo: "\\(M\\)", valor: pot - k }],
          solucao: [
            `Condição de existência: \\(${dentro} \\gt 0 \\Rightarrow x \\gt ${num(-k)}\\).`,
            `Escreva \\(${n}\\) como logaritmo: \\(${n} = \\log${base} ${pot}\\). Como a base \\(${b} \\gt 1\\), o sinal se mantém: \\(${dentro} \\lt ${pot}\\).`,
            `\\(x \\lt ${pot} - ${par(k)} = ${num(pot - k)}\\).`,
            `Juntando as duas condições: \\(${num(-k)} \\lt x \\lt ${num(pot - k)}\\). Logo \\(m = ${num(-k)}\\) e \\(M = ${num(pot - k)}\\).`,
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
      () => {
        // Conversão graus <-> radianos
        const g = 15 * sortear(1, 24);
        const k = g / 180;
        if (Math.random() < 0.5) {
          return {
            enunciado: `Converta \\(${g}^\\circ\\) para radianos. Escreva o resultado como \\(k\\pi\\) e informe só o \\(k\\) (frações como 5/6 valem).`,
            campos: [{ rotulo: "\\(k\\)", valor: k }],
            solucao: [
              `\\(180^\\circ = \\pi\\) rad, então multiplique por \\(\\dfrac{\\pi}{180}\\).`,
              `\\(${g} \\cdot \\dfrac{\\pi}{180} = ${radianos(g)}\\). Logo \\(k = ${fracao(g, 180)}\\).`,
            ],
          };
        }
        return {
          enunciado: `Converta \\(${radianos(g)}\\) rad para graus.`,
          campos: [{ rotulo: "Graus", valor: g }],
          solucao: [
            `\\(\\pi\\) rad \\(= 180^\\circ\\): troque \\(\\pi\\) por \\(180^\\circ\\).`,
            `\\(${radianos(g)} = ${fracao(g, 180)} \\cdot 180^\\circ = ${g}^\\circ\\).`,
          ],
        };
      },
      () => {
        // Quadrante, inclusive ângulos negativos ou maiores que uma volta
        let g = 0;
        while (g % 90 === 0) g = 5 * sortear(-72, 144);
        const red = ((g % 360) + 360) % 360;
        const q = quadrante(g);
        const passos = g === red
          ? [`\\(${g}^\\circ\\) já está entre \\(0^\\circ\\) e \\(360^\\circ\\).`]
          : [`Some ou tire voltas de \\(360^\\circ\\): \\(${g}^\\circ\\) para no mesmo lugar que \\(${red}^\\circ\\).`];
        return {
          enunciado: `Em qual quadrante (1, 2, 3 ou 4) fica o ângulo de \\(${g}^\\circ\\)?`,
          campos: [{ rotulo: "Quadrante", valor: q }],
          solucao: [
            ...passos,
            `\\(${red}^\\circ\\) está entre \\(${(q - 1) * 90}^\\circ\\) e \\(${q * 90}^\\circ\\): ${q}º quadrante.`,
            `Sinais no ${q}º quadrante: seno ${q <= 2 ? "positivo" : "negativo"}, cosseno ${q === 1 || q === 4 ? "positivo" : "negativo"}.`,
          ],
        };
      },
      () => {
        // Seno ou cosseno fora do 1º quadrante, por redução
        const g = escolher([120, 135, 150, 210, 225, 240, 300, 315, 330]);
        const q = quadrante(g);
        const ref = q === 2 ? 180 - g : q === 3 ? g - 180 : 360 - g;
        const ehSeno = Math.random() < 0.5;
        const nome = ehSeno ? "\\operatorname{sen}" : "\\cos";
        const v = ehSeno ? trig(g).s : trig(g).c;
        const angulo = Math.random() < 0.5 ? `${g}^\\circ` : radianos(g);
        return {
          enunciado: `Quanto vale \\(${nome}\\left(${angulo}\\right)\\)? Pode responder com raiz (ex.: -√2/2) ou decimal com 2 casas.`,
          campos: [{ rotulo: "Valor", valor: v }],
          solucao: [
            `\\(${angulo}\\) ${angulo === radianos(g) ? `equivale a \\(${g}^\\circ\\), no` : "fica no"} ${q}º quadrante.`,
            `Ângulo de referência (distância até o eixo \\(x\\)): \\(${ref}^\\circ\\). Então \\(|${nome}(${g}^\\circ)| = ${nome}(${ref}^\\circ) = ${exato(Math.abs(v))}\\).`,
            `No ${q}º quadrante o ${ehSeno ? "seno" : "cosseno"} é ${v > 0 ? "positivo" : "negativo"}: \\(${nome}(${g}^\\circ) = ${exato(v)}\\).`,
          ],
        };
      },
      () => {
        // Tangente de ângulo notável
        const g = escolher([0, 30, 45, 60, 120, 135, 150, 180, 210, 225, 240, 300, 315, 330]);
        const { s, c, t } = trig(g);
        const angulo = Math.random() < 0.5 ? `${g}^\\circ` : radianos(g);
        return {
          enunciado: `Quanto vale \\(\\operatorname{tg}\\left(${angulo}\\right)\\)? Pode responder com raiz (ex.: √3/3) ou decimal com 2 casas.`,
          campos: [{ rotulo: "Valor", valor: t }],
          solucao: [
            `\\(\\operatorname{tg} x = \\dfrac{\\operatorname{sen} x}{\\cos x}\\).${angulo === radianos(g) && g !== 0 ? ` \\(${angulo}\\) equivale a \\(${g}^\\circ\\).` : ""}`,
            `\\(\\operatorname{sen}(${g}^\\circ) = ${exato(s)}\\) e \\(\\cos(${g}^\\circ) = ${exato(c)}\\).`,
            `\\(\\operatorname{tg}(${g}^\\circ) = ${exato(t)}\\).`,
          ],
        };
      },
      () => {
        // Relação fundamental sen²x + cos²x = 1
        const [p, h, o] = escolher(TRIPLAS);
        const q = sortear(1, 4);
        const dadoSeno = Math.random() < 0.5;
        const sinalS = q <= 2 ? 1 : -1, sinalC = q === 1 || q === 4 ? 1 : -1;
        const [dado, pedido, sDado, sPedido] = dadoSeno
          ? ["\\operatorname{sen}", "\\cos", sinalS, sinalC]
          : ["\\cos", "\\operatorname{sen}", sinalC, sinalS];
        return {
          enunciado: `Sabendo que \\(${dado} x = ${fracao(sDado * p, h)}\\) e que \\(x\\) está no ${q}º quadrante, calcule \\(${pedido} x\\). Frações como 3/5 valem.`,
          campos: [{ rotulo: `\\(${pedido} x\\)`, valor: (sPedido * o) / h }],
          solucao: [
            `Relação fundamental: \\(\\operatorname{sen}^2 x + \\cos^2 x = 1\\).`,
            `\\(${pedido}^2 x = 1 - \\left(${fracao(sDado * p, h)}\\right)^2 = 1 - \\dfrac{${p * p}}{${h * h}} = \\dfrac{${o * o}}{${h * h}}\\), então \\(${pedido} x = \\pm${fracao(o, h)}\\).`,
            `No ${q}º quadrante o ${dadoSeno ? "cosseno" : "seno"} é ${sPedido > 0 ? "positivo" : "negativo"}: \\(${pedido} x = ${fracao(sPedido * o, h)}\\).`,
          ],
        };
      },
      () => {
        // Ângulo duplo a partir de sen x (ou cos x) e do quadrante
        const [p, h, o] = escolher(TRIPLAS);
        const q = sortear(1, 4);
        const sn = (q <= 2 ? 1 : -1) * p, cs = (q === 1 || q === 4 ? 1 : -1) * o; // numeradores sobre h
        const h2 = h * h;
        if (Math.random() < 0.5) {
          return {
            enunciado: `Sabendo que \\(\\operatorname{sen} x = ${fracao(sn, h)}\\) e que \\(x\\) está no ${q}º quadrante, calcule \\(\\operatorname{sen}(2x)\\). Frações valem.`,
            campos: [{ rotulo: "\\(\\operatorname{sen}(2x)\\)", valor: (2 * sn * cs) / h2 }],
            solucao: [
              `Primeiro o cosseno: \\(\\cos^2 x = 1 - \\dfrac{${p * p}}{${h2}} = \\dfrac{${o * o}}{${h2}}\\). No ${q}º quadrante o cosseno é ${cs > 0 ? "positivo" : "negativo"}: \\(\\cos x = ${fracao(cs, h)}\\).`,
              `Ângulo duplo: \\(\\operatorname{sen}(2x) = 2 \\operatorname{sen} x \\cos x = 2 \\cdot ${parFracao(sn, h)} \\cdot ${parFracao(cs, h)}\\).`,
              `\\(= ${fracao(2 * sn * cs, h2)}\\).`,
            ],
          };
        }
        return {
          enunciado: `Sabendo que \\(\\operatorname{sen} x = ${fracao(sn, h)}\\), calcule \\(\\cos(2x)\\). Frações valem.`,
          campos: [{ rotulo: "\\(\\cos(2x)\\)", valor: (h2 - 2 * p * p) / h2 }],
          solucao: [
            `Use a forma que só depende do seno: \\(\\cos(2x) = 1 - 2\\operatorname{sen}^2 x\\). Assim não é preciso saber o quadrante.`,
            `\\(= 1 - 2 \\cdot \\dfrac{${p * p}}{${h2}} = \\dfrac{${h2} - ${2 * p * p}}{${h2}}\\).`,
            `\\(= ${fracao(h2 - 2 * p * p, h2)}\\).`,
          ],
        };
      },
      () => {
        // Tangente e secante a partir do cosseno e do quadrante
        const [o, h, p] = escolher(TRIPLAS); // cos = o/h, |sen| = p/h
        const q = escolher([1, 2, 3, 4]);
        const cs = (q === 1 || q === 4 ? 1 : -1) * o, sn = (q <= 2 ? 1 : -1) * p;
        return {
          enunciado: `Sabendo que \\(\\cos x = ${fracao(cs, h)}\\) e que \\(x\\) está no ${q}º quadrante, calcule \\(\\operatorname{tg} x\\) e \\(\\sec x\\). Frações valem.`,
          campos: [{ rotulo: "\\(\\operatorname{tg} x\\)", valor: sn / cs }, { rotulo: "\\(\\sec x\\)", valor: h / cs }],
          solucao: [
            `\\(\\operatorname{sen}^2 x = 1 - \\dfrac{${o * o}}{${h * h}} = \\dfrac{${p * p}}{${h * h}}\\). No ${q}º quadrante o seno é ${sn > 0 ? "positivo" : "negativo"}: \\(\\operatorname{sen} x = ${fracao(sn, h)}\\).`,
            `\\(\\operatorname{tg} x = \\dfrac{\\operatorname{sen} x}{\\cos x} = \\dfrac{${num(sn)}}{${num(cs)}} = ${fracao(sn, cs)}\\).`,
            `\\(\\sec x = \\dfrac{1}{\\cos x} = ${fracao(h, cs)}\\).`,
            `Confira com \\(1 + \\operatorname{tg}^2 x = \\sec^2 x\\): \\(1 + \\dfrac{${p * p}}{${o * o}} = \\dfrac{${h * h}}{${o * o}}\\).`,
          ],
        };
      },
      () => {
        // Adição e subtração de arcos com ângulos notáveis
        const [g, a, b, op] = escolher([[75, 45, 30, "+"], [15, 45, 30, "-"], [105, 60, 45, "+"], [15, 60, 45, "-"]]);
        const ta = trig(a), tb = trig(b);
        const ehSeno = Math.random() < 0.5;
        const v = ehSeno ? trig(g).s : trig(g).c;
        const EXATO = { "75s": "\\dfrac{\\sqrt{6} + \\sqrt{2}}{4}", "75c": "\\dfrac{\\sqrt{6} - \\sqrt{2}}{4}", "15s": "\\dfrac{\\sqrt{6} - \\sqrt{2}}{4}", "15c": "\\dfrac{\\sqrt{6} + \\sqrt{2}}{4}", "105s": "\\dfrac{\\sqrt{6} + \\sqrt{2}}{4}", "105c": "\\dfrac{\\sqrt{2} - \\sqrt{6}}{4}" };
        const nome = ehSeno ? "\\operatorname{sen}" : "\\cos";
        const formula = ehSeno
          ? `\\operatorname{sen} ${a}^\\circ \\cos ${b}^\\circ ${op} \\cos ${a}^\\circ \\operatorname{sen} ${b}^\\circ`
          : `\\cos ${a}^\\circ \\cos ${b}^\\circ ${op === "+" ? "-" : "+"} \\operatorname{sen} ${a}^\\circ \\operatorname{sen} ${b}^\\circ`;
        const valores = ehSeno
          ? `${exato(ta.s)} \\cdot ${exato(tb.c)} ${op} ${exato(ta.c)} \\cdot ${exato(tb.s)}`
          : `${exato(ta.c)} \\cdot ${exato(tb.c)} ${op === "+" ? "-" : "+"} ${exato(ta.s)} \\cdot ${exato(tb.s)}`;
        return {
          enunciado: `Use a fórmula de ${op === "+" ? "adição" : "subtração"} para calcular \\(${nome}(${g}^\\circ) = ${nome}(${a}^\\circ ${op} ${b}^\\circ)\\). Responda com decimal de 2 casas.`,
          campos: [{ rotulo: `\\(${nome}(${g}^\\circ)\\)`, valor: v }],
          solucao: [
            `\\(${nome}(${a}^\\circ ${op} ${b}^\\circ) = ${formula}\\).`,
            `\\(= ${valores}\\).`,
            `\\(= ${EXATO[g + (ehSeno ? "s" : "c")]} \\approx ${num(Math.round(v * 100) / 100)}\\).`,
          ],
        };
      },
      () => {
        // Meia-ângulo a partir de cos x, com x no 1º quadrante
        const [o, h, p] = escolher(TRIPLAS); // cos x = o/h, sen x = p/h
        const tipo = escolher(["sen", "cos", "tg"]);
        const cosx = fracao(o, h);
        if (tipo === "tg") {
          return {
            enunciado: `Sabendo que \\(\\cos x = ${cosx}\\) e que \\(x\\) está no 1º quadrante, calcule \\(\\operatorname{tg}\\left(\\dfrac{x}{2}\\right)\\). Frações valem.`,
            campos: [{ rotulo: "\\(\\operatorname{tg}(x/2)\\)", valor: p / (h + o) }],
            solucao: [
              `Primeiro o seno: \\(\\operatorname{sen}^2 x = 1 - \\dfrac{${o * o}}{${h * h}} = \\dfrac{${p * p}}{${h * h}}\\). No 1º quadrante, \\(\\operatorname{sen} x = ${fracao(p, h)}\\).`,
              `\\(\\operatorname{tg}\\left(\\dfrac{x}{2}\\right) = \\dfrac{\\operatorname{sen} x}{1 + \\cos x} = \\dfrac{${fracao(p, h)}}{1 + ${cosx}} = \\dfrac{${fracao(p, h)}}{${fracao(h + o, h)}}\\).`,
              `\\(= ${fracao(p, h + o)}\\).`,
            ],
          };
        }
        const ehSen = tipo === "sen";
        const num2 = ehSen ? h - o : h + o;
        return {
          enunciado: `Sabendo que \\(\\cos x = ${cosx}\\), calcule \\(${ehSen ? "\\operatorname{sen}" : "\\cos"}^2\\left(\\dfrac{x}{2}\\right)\\). Frações valem.`,
          campos: [{ rotulo: `\\(${ehSen ? "\\operatorname{sen}" : "\\cos"}^2(x/2)\\)`, valor: num2 / (2 * h) }],
          solucao: [
            `Fórmula de meia-ângulo: \\(${ehSen ? "\\operatorname{sen}" : "\\cos"}^2\\left(\\dfrac{x}{2}\\right) = \\dfrac{1 ${ehSen ? "-" : "+"} \\cos x}{2}\\).`,
            `\\(= \\dfrac{1 ${ehSen ? "-" : "+"} ${cosx}}{2} = \\dfrac{${fracao(num2, h)}}{2}\\).`,
            `\\(= ${fracao(num2, 2 * h)}\\).`,
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
