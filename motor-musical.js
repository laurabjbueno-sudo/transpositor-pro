// motor-musical.js

// 1. Matrizes de Notas Principais e Equivalências Enarmónicas
const notas = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

const notasSustenidos = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const notasBemois     = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const equivalencias = {
  "Do": "C", "Re": "D", "Mi": "E", "Fa": "F", "Sol": "G", "La": "A", "Si": "B",
  "Db": "C#", "C#": "C#",
  "D#": "Eb", "Eb": "Eb",
  "Gb": "F#", "F#": "F#",
  "G#": "Ab", "Ab": "Ab",
  "A#": "Bb", "Bb": "Bb",
  "Cb": "B", "B#": "C", "Fb": "E", "E#": "F"
};

// 2. Função para Limpar o Texto da Cifra (Remove espaços em branco inúteis)
function limparCifraTexto(txt) {
  if (!txt) return "";
  return txt.split("\n").map(linha => linha.trimEnd()).join("\n");
}

// 3. Motor de Transposição de um Acorde Individual (Trata barras "/" e acidentes)
function transporAcorde(acorde, semitons) {
  if (!acorde) return "";

  // Se for um acorde invertido (ex: C/G), divide e transpõe ambos os lados
  if (acorde.includes("/")) {
    const partes = acorde.split("/");
    return transporAcorde(partes[0], semitons) + "/" + transporAcorde(partes[1], semitons);
  }

  // Identifica a nota base e o resto do acorde (m, 7, m7, etc.)
  let notaBase = "";
  let resto = "";

  if (acorde.length >= 2 && (acorde[1] === "#" || acorde[1] === "b")) {
    notaBase = acorde.substring(0, 2);
    resto = acorde.substring(2);
  } else {
    notaBase = acorde.substring(0, 1);
    resto = acorde.substring(1);
  }

  // Traduz a nota usando a tabela de equivalências se necessário
  if (equivalencias[notaBase]) {
    notaBase = equivalencias[notaBase];
  }

  let idx = notas.indexOf(notaBase);
  if (idx === -1) return acorde; // Se não for uma nota válida, devolve o texto original

  let novoIdx = (idx + semitons) % 12;
  if (novoIdx < 0) novoIdx += 12;

  // Decide se usa Sustenido ou Bemol baseado na preferência ou no acidente original
  let usaBemol = acorde.includes("b") || notaBase.includes("b") || ["Eb", "Ab", "Bb"].includes(notaBase);
  if (semitons !== 0) {
    // Se mudou de tom, tenta manter uma lógica musical padrão
    usaBemol = (novoIdx === 3 || novoIdx === 8 || novoIdx === 10); // Eb, Ab, Bb
  }

  const novaNotaBase = usaBemol ? notasBemois[novoIdx] : notasSustenidos[novoIdx];
  return novaNotaBase + resto;
}

// 4. Detetor Automático de Tonalidade (Analisa os acordes mais comuns na música)
function detectarTom(texto) {
  if (!texto) return "C";
  
  // Expressão regular para capturar os acordes dentro das marcas [ch] ou linhas de cifra
  const regexAcordes = /\[ch\]([^\]]+)\[\/ch\]/g;
  let match;
  const contagem = {};

  while ((match = regexAcordes.exec(texto)) !== null) {
    let ac = match[1].trim();
    if (ac.includes("/")) ac = ac.split("/")[0]; // Foca na nota principal
    
    // Remove detalhes do acorde para focar na nota base (ex: Am7 -> Am, C#m -> C#m)
    let base = ac;
    if (ac.length >= 2 && (ac[1] === "#" || ac[1] === "b")) {
      base = ac.substring(0, 2) + (ac[2] === "m" ? "m" : "");
    } else {
      base = ac.substring(0, 1) + (ac[1] === "m" ? "m" : "");
    }

    contagem[base] = (contagem[base] || 0) + 1;
  }

  const listaOrdenada = Object.entries(contagem).sort((a, b) => b[1] - a[1]);
  if (listaOrdenada.length === 0) return "C";

  let provavelTom = listaOrdenada[0][0];
  
  // Limpa o "m" de menor se houver, para devolver o tom na escala padrão do cabeçalho
  if (provavelTom.endsWith("m")) {
    provavelTom = provavelTom.slice(0, -1);
  }

  return equivalencias[provavelTom] || provavelTom;
}