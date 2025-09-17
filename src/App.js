import React, { useState, useMemo } from "react";

// Protótipo de gerador de ponto-cruz (single-file React component).
// - Entrada de texto (aceita letras e números básicos)
// - Escolha de fonte (mapa de pixels interno)
// - Ajuste de tamanho (escala) e espaçamento entre caracteres
// - Renderiza como SVG (cada 'pixel' vira um X estilizado)
// - Permite baixar o padrão como SVG

// Nota: este componente usa Tailwind para estilo (já disponível no ambiente descrito).
// Fontes: temos dois mapas de pixel-font minimalistas: 5x7 (padrão) e 7x9 (opcional).

const FONT_5x7 = {
  A: ["  X  ", " X X ", "X   X", "XXXXX", "X   X", "X   X", "X   X"],
  B: ["XXXX ", "X   X", "X   X", "XXXX ", "X   X", "X   X", "XXXX "],
  C: [" XXX ", "X   X", "X    ", "X    ", "X    ", "X   X", " XXX "],
  D: ["XXXX ", "X   X", "X   X", "X   X", "X   X", "X   X", "XXXX "],
  E: ["XXXXX", "X    ", "X    ", "XXXX ", "X    ", "X    ", "XXXXX"],
  F: ["XXXXX", "X    ", "X    ", "XXXX ", "X    ", "X    ", "X    "],
  G: [" XXX ", "X   X", "X    ", "X  XX", "X   X", "X   X", " XXXX"],
  H: ["X   X", "X   X", "X   X", "XXXXX", "X   X", "X   X", "X   X"],
  I: [" XXX ", "  X  ", "  X  ", "  X  ", "  X  ", "  X  ", " XXX "],
  J: ["  XXX", "   X ", "   X ", "   X ", "X  X ", "X  X ", " XX  "],
  K: ["X   X", "X  X ", "X X  ", "XX   ", "X X  ", "X  X ", "X   X"],
  L: ["X    ", "X    ", "X    ", "X    ", "X    ", "X    ", "XXXXX"],
  M: ["X   X", "XX XX", "XX XX", "X X X", "X   X", "X   X", "X   X"],
  N: ["X   X", "XX  X", "X X X", "X  XX", "X   X", "X   X", "X   X"],
  O: [" XXX ", "X   X", "X   X", "X   X", "X   X", "X   X", " XXX "],
  P: ["XXXX ", "X   X", "X   X", "XXXX ", "X    ", "X    ", "X    "],
  Q: [" XXX ", "X   X", "X   X", "X   X", "X X X", "X  X ", " XX X"],
  R: ["XXXX ", "X   X", "X   X", "XXXX ", "X X  ", "X  X ", "X   X"],
  S: [" XXXX", "X    ", "X    ", " XXX ", "    X", "    X", "XXXX "],
  T: ["XXXXX", "  X  ", "  X  ", "  X  ", "  X  ", "  X  ", "  X  "],
  U: ["X   X", "X   X", "X   X", "X   X", "X   X", "X   X", " XXX "],
  V: ["X   X", "X   X", "X   X", "X   X", " X X ", " X X ", "  X  "],
  W: ["X   X", "X   X", "X   X", "X X X", "XX XX", "XX XX", "X   X"],
  X: ["X   X", " X X ", "  X  ", "  X  ", "  X  ", " X X ", "X   X"],
  Y: ["X   X", " X X ", "  X  ", "  X  ", "  X  ", "  X  ", "  X  "],
  Z: ["XXXXX", "    X", "   X ", "  X  ", " X   ", "X    ", "XXXXX"],
  0: [" XXX ", "X  XX", "X X X", "X X X", "X X X", "XX  X", " XXX "],
  1: ["  X  ", " XX  ", "  X  ", "  X  ", "  X  ", "  X  ", " XXX "],
  2: [" XXX ", "X   X", "    X", "   X ", "  X  ", " X   ", "XXXXX"],
  3: [" XXX ", "X   X", "    X", "  XX ", "    X", "X   X", " XXX "],
  4: ["   X ", "  XX ", " X X ", "X  X ", "XXXXX", "   X ", "   X "],
  5: ["XXXXX", "X    ", "XXXX ", "    X", "    X", "X   X", " XXX "],
  6: [" XXX ", "X    ", "X    ", "XXXX ", "X   X", "X   X", " XXX "],
  7: ["XXXXX", "    X", "   X ", "  X  ", " X   ", " X   ", " X   "],
  8: [" XXX ", "X   X", "X   X", " XXX ", "X   X", "X   X", " XXX "],
  9: [" XXX ", "X   X", "X   X", " XXXX", "    X", "    X", " XXX "],
  " ": ["     ", "     ", "     ", "     ", "     ", "     ", "     "],
};

const FONTS = {
  "5x7": { map: FONT_5x7, w: 5, h: 7 },
  // Poderíamos adicionar uma 7x9 aqui se desejado
};

function textToPixelGrid(text, fontKey) {
  const font = FONTS[fontKey];
  const chars = text.toUpperCase().split("");
  const rows = font.h;
  // Construir grid de linhas arrays
  const charGrids = chars.map((ch) => {
    const pattern = font.map[ch] || font.map[" "];
    return pattern.map((line) =>
      line.split("").map((c) => (c !== " " ? 1 : 0))
    );
  });

  // Concatenar lateralmente com 1 coluna de separação
  const gridRows = [];
  for (let r = 0; r < rows; r++) {
    let row = [];
    charGrids.forEach((cg, idx) => {
      row = row.concat(cg[r]);
      // espaço entre chars
      if (idx !== charGrids.length - 1) row.push(0);
    });
    gridRows.push(row);
  }
  return gridRows; // array de rows, cada row array de 0/1
}

export default function CrossStitchGenerator() {
  const [text, setText] = useState("ANA");
  const [fontKey, setFontKey] = useState("5x7");
  const [scale, setScale] = useState(16); // pixels por célula
  const [stitchType, setStitchType] = useState("x"); // x or filled
  const [color, setColor] = useState("#d6336c");
  const [bg, setBg] = useState("#fff");
  const [spacing, setSpacing] = useState(2); // gap between chars in pixels

  const grid = useMemo(() => textToPixelGrid(text, fontKey), [text, fontKey]);

  const cell = scale;
  const width = grid[0].length * cell;
  const height = grid.length * cell;

  function downloadSVG() {
    const svgEl = document.getElementById("crossstitch-svg");
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ponto-cruz-${text || "padrao"}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Gerador de Ponto Cruz — Protótipo
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-3">
          <label className="block">Texto</label>
          <input
            className="w-full p-2 border rounded"
            value={text}
            onChange={(e) =>
              setText(e.target.value.replace(/[^A-Za-z0-9 ]/g, ""))
            }
            placeholder="Digite palavra ou frase (A-Z, 0-9)"
          />

          <label className="block">Fonte</label>
          <select
            className="w-full p-2 border rounded"
            value={fontKey}
            onChange={(e) => setFontKey(e.target.value)}
          >
            {Object.keys(FONTS).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>

          <label className="block">Tamanho (pixels por célula): {scale}</label>
          <input
            type="range"
            min={8}
            max={32}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          />

          <label className="block">Cor do ponto</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />

          <label className="block">Fundo</label>
          <input
            type="color"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
          />

          <label className="block">Estilo de ponto</label>
          <select
            className="w-full p-2 border rounded"
            value={stitchType}
            onChange={(e) => setStitchType(e.target.value)}
          >
            <option value="x">X (pontos cruzados)</option>
            <option value="fill">Preenchido (quadrado)</option>
          </select>

          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-2 rounded bg-sky-600 text-white"
              onClick={downloadSVG}
            >
              Baixar SVG
            </button>
            <button
              className="px-3 py-2 rounded border"
              onClick={() => {
                navigator.clipboard?.writeText(text);
              }}
            >
              Copiar texto
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-2">
            Observação: este é um protótipo com mapa de caracteres limitado.
            Podemos ampliar fontes, incluir caracteres acentuados, controle de
            paleta e export PNG/PNG com canvas.
          </p>
        </div>

        <div
          className="md:col-span-2 bg-white p-4 rounded shadow"
          style={{ background: bg }}
        >
          <div className="overflow-auto">
            <svg
              id="crossstitch-svg"
              xmlns="http://www.w3.org/2000/svg"
              width={width}
              height={height}
              style={{ background: bg }}
            >
              <rect width={width} height={height} fill={bg} />
              {grid.map((row, r) =>
                row.map((cellOn, c) => {
                  if (!cellOn) return null;
                  const x = c * cell;
                  const y = r * cell;

                  if (stitchType === "fill") {
                    return (
                      <rect
                        key={`rc-${r}-${c}`}
                        x={x}
                        y={y}
                        width={cell}
                        height={cell}
                        fill={color}
                        stroke="#00000010"
                      />
                    );
                  }

                  // desenhar um X estilizado com duas linhas
                  const padding = Math.max(2, Math.floor(cell * 0.15));
                  return (
                    <g
                      key={`rc-${r}-${c}`}
                      stroke={color}
                      strokeWidth={Math.max(1, Math.floor(cell * 0.12))}
                      strokeLinecap="round"
                    >
                      <line
                        x1={x + padding}
                        y1={y + padding}
                        x2={x + cell - padding}
                        y2={y + cell - padding}
                      />
                      <line
                        x1={x + cell - padding}
                        y1={y + padding}
                        x2={x + padding}
                        y2={y + cell - padding}
                      />
                    </g>
                  );
                })
              )}
            </svg>
          </div>

          <div className="mt-4 text-sm text-gray-700">
            Dimensões: {width}px × {height}px — Linhas: {grid.length} × Colunas:{" "}
            {grid[0].length}
          </div>
        </div>
      </div>
    </div>
  );
}
