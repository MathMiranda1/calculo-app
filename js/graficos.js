/* ==========================================================
   graficos.js — mini biblioteca de gráficos em SVG.
   Sem dependências: desenha grade, eixos, funções, pontos,
   retas, retângulos e áreas em coordenadas matemáticas.
   ========================================================== */

const Grafico = (() => {
  const NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs, pai) {
    const no = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v !== undefined && v !== null) no.setAttribute(k, v);
    }
    if (pai) pai.appendChild(no);
    return no;
  }

  // Escolhe um passo "redondo" (1, 2, 5, 10...) para a grade
  function passoRedondo(intervalo, alvo = 10) {
    const bruto = intervalo / alvo;
    const pot = Math.pow(10, Math.floor(Math.log10(bruto)));
    const m = bruto / pot;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * pot;
  }

  function formatar(n) {
    const r = Math.round(n * 1000) / 1000;
    return String(r).replace(".", ",").replace("-", "−");
  }

  function criar(container, opcoes) {
    const W = opcoes.largura || 640;
    const H = opcoes.altura || 400;
    const M = 26; // margem interna
    let [x0, x1] = opcoes.x;
    let [y0, y1] = opcoes.y;

    const sx = (x) => M + ((x - x0) / (x1 - x0)) * (W - 2 * M);
    const sy = (y) => H - M - ((y - y0) / (y1 - y0)) * (H - 2 * M);
    const invX = (px) => x0 + ((px - M) / (W - 2 * M)) * (x1 - x0);

    const svg = el("svg", {
      viewBox: `0 0 ${W} ${H}`,
      class: "grafico",
      role: "img",
      "aria-label": opcoes.rotulo || "Gráfico de função",
    }, container);

    const idClip = `recorte-${Math.random().toString(36).slice(2, 9)}`;
    const clip = el("clipPath", { id: idClip }, el("defs", {}, svg));
    el("rect", { x: M - 8, y: M - 8, width: W - 2 * M + 16, height: H - 2 * M + 16 }, clip);

    const gGrade = el("g", {}, svg);
    const gConteudo = el("g", { "clip-path": `url(#${idClip})` }, svg);

    function desenharGrade() {
      gGrade.replaceChildren();
      const dx = opcoes.passoX || passoRedondo(x1 - x0);
      const dy = opcoes.passoY || passoRedondo(y1 - y0, 8);

      for (let x = Math.ceil(x0 / dx) * dx; x <= x1 + 1e-9; x += dx) {
        el("line", { x1: sx(x), x2: sx(x), y1: M, y2: H - M, class: "linha-grade" }, gGrade);
      }
      for (let y = Math.ceil(y0 / dy) * dy; y <= y1 + 1e-9; y += dy) {
        el("line", { x1: M, x2: W - M, y1: sy(y), y2: sy(y), class: "linha-grade" }, gGrade);
      }

      // Eixos (presos à borda quando o zero está fora da janela)
      const ey = Math.min(Math.max(sy(0), M), H - M);
      const ex = Math.min(Math.max(sx(0), M), W - M);
      el("line", { x1: M, x2: W - M, y1: ey, y2: ey, class: "eixo" }, gGrade);
      el("line", { x1: ex, x2: ex, y1: M, y2: H - M, class: "eixo" }, gGrade);

      for (let x = Math.ceil(x0 / dx) * dx; x <= x1 + 1e-9; x += dx) {
        if (Math.abs(x) < 1e-9) continue;
        const t = el("text", { x: sx(x), y: ey + 15, "text-anchor": "middle", class: "rotulo-eixo" }, gGrade);
        t.textContent = formatar(x);
      }
      for (let y = Math.ceil(y0 / dy) * dy; y <= y1 + 1e-9; y += dy) {
        if (Math.abs(y) < 1e-9) continue;
        const t = el("text", { x: ex - 6, y: sy(y) + 4, "text-anchor": "end", class: "rotulo-eixo" }, gGrade);
        t.textContent = formatar(y);
      }
    }

    function estilo(no, o, padrao) {
      no.style.stroke = o.cor || padrao || "var(--funcoes)";
      no.style.strokeWidth = o.espessura || 2.5;
      no.style.fill = "none";
      no.style.strokeLinecap = "round";
      no.style.strokeLinejoin = "round";
      if (o.tracejado) no.style.strokeDasharray = o.tracejado === true ? "6 6" : o.tracejado;
      if (o.opacidade) no.style.opacity = o.opacidade;
      return no;
    }

    // Caminho de f(x), quebrando em assíntotas e pontos fora do domínio
    function caminhoFuncao(f, a, b, n) {
      let d = "";
      let caneta = false;
      let anterior = null;
      const salto = (y1 - y0) * 1.5;
      for (let i = 0; i <= n; i++) {
        const x = a + ((b - a) * i) / n;
        const y = f(x);
        if (!Number.isFinite(y) || (anterior !== null && Math.abs(y - anterior) > salto)) {
          caneta = false;
          anterior = Number.isFinite(y) ? y : null;
          if (!Number.isFinite(y)) continue;
        }
        const yc = Math.max(Math.min(y, y1 + (y1 - y0)), y0 - (y1 - y0));
        d += `${caneta ? "L" : "M"}${sx(x).toFixed(2)},${sy(yc).toFixed(2)}`;
        caneta = true;
        anterior = y;
      }
      return d;
    }

    const api = {
      sx, sy, invX,
      get dominio() { return { x0, x1, y0, y1 }; },

      limpar() { gConteudo.replaceChildren(); return api; },

      janela(x, y) { [x0, x1] = x; [y0, y1] = y; desenharGrade(); return api; },

      funcao(f, o = {}) {
        const d = caminhoFuncao(f, o.de ?? x0, o.ate ?? x1, o.amostras || 500);
        estilo(el("path", { d }, gConteudo), o);
        return api;
      },

      reta(m, px, py, o = {}) {
        // reta de inclinação m passando por (px, py), cortada na janela
        const f = (x) => py + m * (x - px);
        return api.segmento(x0, f(x0), x1, f(x1), o);
      },

      segmento(xa, ya, xb, yb, o = {}) {
        estilo(el("line", { x1: sx(xa), y1: sy(ya), x2: sx(xb), y2: sy(yb) }, gConteudo), o);
        return api;
      },

      ponto(x, y, o = {}) {
        const c = el("circle", { cx: sx(x), cy: sy(y), r: o.raio || 6 }, gConteudo);
        c.style.fill = o.vazio ? "var(--superficie, #fff)" : (o.cor || "var(--tinta)");
        c.style.stroke = o.cor || "var(--tinta)";
        c.style.strokeWidth = o.vazio ? 2.5 : 2;
        if (o.halo) {
          const h = el("circle", { cx: sx(x), cy: sy(y), r: (o.raio || 6) + 7 }, gConteudo);
          h.style.fill = o.cor || "var(--tinta)";
          h.style.opacity = 0.15;
          gConteudo.insertBefore(h, c);
        }
        return api;
      },

      retangulo(xa, xb, altura, o = {}) {
        const ya = sy(Math.max(altura, 0));
        const yb = sy(Math.min(altura, 0));
        const r = el("rect", { x: sx(xa), y: ya, width: Math.max(sx(xb) - sx(xa), 0), height: Math.max(yb - ya, 0) }, gConteudo);
        r.style.fill = o.cor || "var(--integrais)";
        r.style.fillOpacity = o.opacidade ?? 0.18;
        r.style.stroke = o.cor || "var(--integrais)";
        r.style.strokeWidth = 1.25;
        return api;
      },

      area(f, a, b, o = {}) {
        const n = 200;
        let d = `M${sx(a)},${sy(0)}`;
        for (let i = 0; i <= n; i++) {
          const x = a + ((b - a) * i) / n;
          d += `L${sx(x).toFixed(2)},${sy(f(x)).toFixed(2)}`;
        }
        d += `L${sx(b)},${sy(0)}Z`;
        const p = el("path", { d }, gConteudo);
        p.style.fill = o.cor || "var(--integrais)";
        p.style.fillOpacity = o.opacidade ?? 0.2;
        p.style.stroke = "none";
        return api;
      },

      texto(x, y, conteudo, o = {}) {
        const t = el("text", {
          x: sx(x) + (o.dx || 0),
          y: sy(y) + (o.dy || 0),
          "text-anchor": o.ancora || "start",
          class: "rotulo",
        }, gConteudo);
        t.style.fill = o.cor || "var(--tinta)";
        t.textContent = conteudo;
        return api;
      },

      // Chama cb(x) com a coordenada x do ponteiro enquanto arrasta
      aoArrastar(cb) {
        svg.classList.add("arrastavel");
        let ativo = false;
        const mover = (e) => {
          const p = svg.createSVGPoint();
          p.x = e.clientX;
          p.y = e.clientY;
          const local = p.matrixTransform(svg.getScreenCTM().inverse());
          cb(Math.min(Math.max(invX(local.x), x0), x1));
        };
        svg.addEventListener("pointerdown", (e) => { ativo = true; svg.setPointerCapture(e.pointerId); mover(e); });
        svg.addEventListener("pointermove", (e) => { if (ativo) mover(e); });
        svg.addEventListener("pointerup", () => { ativo = false; });
        svg.addEventListener("pointercancel", () => { ativo = false; });
        return api;
      },
    };

    desenharGrade();
    return api;
  }

  return { criar, formatar };
})();
