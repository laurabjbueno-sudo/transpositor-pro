const auth = window.auth;
const db = window.db;
let user = null;
    let usuarioAtual = null;
    let roleAtual = "user";
    let semitons = 0;
    let original = "";
    let editId = null;
    let musicaAbertaId = null;
    let setlistAtualIds = [];
    let setlistAtualIndice = -1;
    let tomUsuarioAtual = 0;
           let musicasOffline = [];

function estaOffline() {
  return !navigator.onLine;
}

    const notasSustenido = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const notasBemol = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    const notasIndice = {
      C: 0, "B#": 0,
      "C#": 1, Db: 1,
      D: 2,
      "D#": 3, Eb: 3,
      E: 4, Fb: 4,
      "E#": 5, F: 5,
      "F#": 6, Gb: 6,
      G: 7,
      "G#": 8, Ab: 8,
      A: 9,
      "A#": 10, Bb: 10,
      B: 11, Cb: 11,
      Do: 0, Re: 2, Mi: 4, Fa: 5, Sol: 7, La: 9, Si: 11
    };

const regexAcorde = /^([A-G](?:#|b)?)(.*)$/;
const PADRAO_ACORDE_TEXTO = String.raw`[A-G](?:#|b)?(?:(?:maj|min|dim|aug|sus|add|alt|m|M|°|ø|\+|-)?(?:\d+)?(?:M|maj|min)?(?:\([^)]+\))?(?:[#b+\-]\d+)*)?(?:\/[A-G](?:#|b)?)?`;
const regexAcordeNaLinha = new RegExp(
  String.raw`(^|[\s([{|])(${PADRAO_ACORDE_TEXTO})(?=$|[\s)\]}|.,;:])`,
  "g"
);

    const busca = document.getElementById("busca");
    const output = document.getElementById("output");
    const lista = document.getElementById("lista");
    const listaVazia = document.getElementById("listaVazia");

    const displayTitulo = document.getElementById("displayTitulo");
    const displayArtista = document.getElementById("displayArtista");
    const displayCapo = document.getElementById("displayCapo");
    const displayTom = document.getElementById("displayTom");
    const youtubeBox = document.getElementById("youtubeBox");
    const youtubePlayer = document.getElementById("youtubePlayer");

    const loginBtn = document.getElementById("loginBtn");


    const modalForm = document.getElementById("modalForm");
    const modalTitulo = document.getElementById("modalTitulo");
    const modalNomeMusica = document.getElementById("modalNomeMusica");
    const modalNomeArtista = document.getElementById("modalNomeArtista");
    const modalCapo = document.getElementById("modalCapo");
           const modalTom = document.getElementById("modalTom");
    const modalYoutube = document.getElementById("modalYoutube");
          const modalGenero = document.getElementById("modalGenero");
    const modalPasta = document.getElementById("modalPasta");
    const modalLetra = document.getElementById("modalLetra");
           const filtroPasta = document.getElementById("filtroPasta");

    const themeSelect = document.getElementById("themeSelect");
    const accentSelect = document.getElementById("accentSelect");

    const panelOverlay = document.getElementById("panelOverlay");
    const painelBusca = document.getElementById("painelBusca");
    const painelPastas = document.getElementById("painelPastas");
const painelMusicas = document.getElementById("painelMusicas");

const buscaTodasMusicas = document.getElementById("buscaTodasMusicas");
const listaTodasMusicas = document.getElementById("listaTodasMusicas");
const listaTodasMusicasVazia = document.getElementById("listaTodasMusicasVazia");

const painelSetlists = document.getElementById("painelSetlists");
const listaSetlists = document.getElementById("listaSetlists");
const listaSetlistsVazia = document.getElementById("listaSetlistsVazia");
const tituloMusicasDaSetlist = document.getElementById("tituloMusicasDaSetlist");
const listaMusicasDaSetlist = document.getElementById("listaMusicasDaSetlist");
const listaMusicasDaSetlistVazia = document.getElementById("listaMusicasDaSetlistVazia");

let tipoFiltroMusica = "todas";
let generoSelecionado = "";

    const listaPastas = document.getElementById("listaPastas");
    const listaPastasVazia = document.getElementById("listaPastasVazia");
    const tituloMusicasDaPasta = document.getElementById("tituloMusicasDaPasta");
    const listaMusicasDaPasta = document.getElementById("listaMusicasDaPasta");
    const listaMusicasDaPastaVazia = document.getElementById("listaMusicasDaPastaVazia");

const profileTopBox = document.getElementById("profileTopBox");
const profilePhotoTop = document.getElementById("profilePhotoTop");
const profileNameTop = document.getElementById("profileNameTop");
const profileEmailTop = document.getElementById("profileEmailTop");
const profileDropdown = document.getElementById("profileDropdown");
const bottomNav = document.getElementById("bottomNav");

let perfilUsuarioAtual = null;
let loginRedirectEmProcessamento = false;

    const PREFS_KEY = "transpositor-preferencias";

    function fecharPainel() {
  painelBusca.classList.remove("visible");
  painelPastas.classList.remove("visible");
  painelMusicas.classList.remove("visible");
  painelSetlists.classList.remove("visible");
  panelOverlay.classList.remove("visible");

  liberarBottomNav();
  document.activeElement?.blur();
}

function fecharMenu() {
  fecharPainel();
}

function abrirPainel(tipo) {
  fecharPainel();
 esconderBottomNav();

  panelOverlay.classList.add("visible");

  if (tipo === "buscar") {
    painelBusca.classList.add("visible");

    setTimeout(() => {
      busca.focus();
    }, 250);
  }

if (tipo === "pastas") {
  painelPastas.classList.add("visible");
  carregarPainelPastas();
}

  if (tipo === "musicas") {
  painelMusicas.classList.add("visible");
  carregarTodasMusicas();
 }

if (tipo === "setlists") {
  painelSetlists.classList.add("visible");
  carregarPainelSetlists();
   }
}

let ultimaPosicaoScroll = 0;
let bottomNavTravado = false;

function esconderBottomNav() {
  bottomNavTravado = true;
  bottomNav.classList.add("hidden");
}

function liberarBottomNav() {
  bottomNavTravado = false;
  bottomNav.classList.remove("hidden");
}

function toggleProfileMenu() {
  profileDropdown.classList.toggle("visible");
}

function fecharProfileMenu() {
  profileDropdown.classList.remove("visible");
}


function controlarBottomNavAoRolar() {
  if (bottomNavTravado) {
    bottomNav.classList.add("hidden");
    return;
  }

  const posicaoAtual = window.scrollY || document.documentElement.scrollTop;

  if (posicaoAtual > ultimaPosicaoScroll && posicaoAtual > 80) {
    bottomNav.classList.add("hidden");
  } else {
    bottomNav.classList.remove("hidden");
  }

  ultimaPosicaoScroll = Math.max(posicaoAtual, 0);
}

function fecharMenusAoClicarFora(event) {
  const clicouNoPerfil = event.target.closest(".header-profile");

  if (!clicouNoPerfil) {
    fecharProfileMenu();
  }
}
    function estaLogado() {
      return !!usuarioAtual;
    }

    function ehAdmin() {
      return roleAtual === "admin";
    }

    function ehEditora() {
      return roleAtual === "editora";
    }

    function podeEditarMusica(musica) {
      if (!usuarioAtual) return false;
      return ehAdmin() || ehEditora() || musica.uid === usuarioAtual.uid;
    }

    function podeExcluirMusica(musica) {
      if (!usuarioAtual) return false;
      return ehAdmin() || musica.uid === usuarioAtual.uid;
    }

    function normalizarNota(nota) {
  const indice = notasIndice[nota];
  return indice === undefined ? nota : notasSustenido[indice];
}

function transporNota(nota, passos) {
  const indice = notasIndice[nota];

  if (indice === undefined) return nota;

  const escala = String(nota).includes("b") ? notasBemol : notasSustenido;
  return escala[(indice + passos + 120) % 12];
}

function transporAcorde(acorde, passos) {
  const match = acorde.match(
    /^([A-G](?:#|b)?)(.*?)(?:\/([A-G](?:#|b)?))?$/
  );

  if (!match) return acorde;

  const [, notaBase, sufixo, baixo] = match;

  const novaNota = transporNota(notaBase, passos);
  const novoBaixo = baixo ? "/" + transporNota(baixo, passos) : "";

  return novaNota + sufixo + novoBaixo;
}

function linhaPareceCifra(linha) {
  const texto = linha.trim();

  if (!texto) return false;

  const regexAcordeCompleto = new RegExp(`^${PADRAO_ACORDE_TEXTO}$`);

  const palavras = texto.split(/\s+/);

  const acordesEncontrados = palavras.filter(palavra => {
    const limpa = palavra.replace(/[|,;.]/g, "");
    return regexAcordeCompleto.test(limpa);
  });

  const proporcao = acordesEncontrados.length / palavras.length;

  if (acordesEncontrados.length >= 2 && proporcao >= 0.35) return true;
  if (palavras.length <= 6 && acordesEncontrados.length >= 1) return true;

  return false;
}

function processarLinhaComAcordes(linha, passos) {
  return linha.replace(regexAcordeNaLinha, (match, antes, acorde) => {
    return `${antes}<span class="acorde">${transporAcorde(acorde, passos)}</span>`;
  });
}

function processar(t, passos) {
  return t
    .split("\n")
    .map(linha => {
      if (linha.includes("[") && linha.includes("]")) {
        return escapeHtml(linha).replace(/\[([^\]]+)\]/g, (_, acorde) => {
          return `<span class="acorde">[${transporAcorde(acorde, passos)}]</span>`;
        });
      }

      if (linhaPareceCifra(linha)) {
        return processarLinhaComAcordes(escapeHtml(linha), passos);
      }

      return escapeHtml(linha);
    })
    .join("\n");
}

function detectarTom(texto) {
  const linhas = String(texto || "").split("\n");

  const regexTom = new RegExp(PADRAO_ACORDE_TEXTO, "g");

  for (const linha of linhas) {
    if (linhaPareceCifra(linha)) {
      const acordes = linha.match(regexTom);

      if (acordes && acordes.length) {
        return acordes[0];
      }
    }
  }

  return "";
}

    function atualizarVisualizacao() {
  if (!original.trim()) {
    output.textContent = "Abra ou digite uma música para visualizar aqui.";
    return;
  }

  const larguraPequena = window.innerWidth <= 640;

  if (larguraPequena) {
    output.innerHTML = processarResponsivo(original, semitons);
  } else {
    output.innerHTML = processar(original, semitons);
  }
}

function linhaTemAcordes(linha) {
  return linhaPareceCifra(linha);
}

function dividirLinha(
  texto,
  limite = 34
) {

  const partes = [];

  let resto = texto;

  while (
    resto.length > limite
  ) {

    let corte =
      resto.lastIndexOf(
        " ",
        limite
      );

    if (corte < 10) {
      corte = limite;
    }

    partes.push(
      resto.slice(0, corte)
    );

    resto =
      resto
      .slice(corte)
      .trimStart();
  }

  partes.push(resto);

  return partes;
}

function processarResponsivo(
  texto,
  passos
) {

  const linhas =
    texto.split("\n");

  const resultado = [];

  for (
    let i = 0;
    i < linhas.length;
    i++
  ) {

    const cifra =
      linhas[i] || "";

    const letra =
      linhas[i + 1] || "";

    if (
      linhaTemAcordes(cifra)
      &&
      letra
      &&
      !linhaTemAcordes(
        letra
      )
    ) {

      const blocos =
        dividirLinha(
          letra,
          34
        );

      let pos = 0;

      blocos.forEach(
        bloco => {

        const cifraBloco =
          cifra.slice(
            pos,
            pos +
            bloco.length
          );

        resultado.push(
          processarLinhaComAcordes(
            escapeHtml(
              cifraBloco
            ),
            passos
          )
        );

        resultado.push(
          escapeHtml(
            bloco
          )
        );

        pos +=
          bloco.length + 1;

      });

      i++;

      continue;
    }

    resultado.push(
      linhaTemAcordes(
        cifra
      )
      ?
      processarLinhaComAcordes(
        escapeHtml(
          cifra
        ),
        passos
      )
      :
      escapeHtml(
        cifra
      )
    );

  }

  return resultado.join(
    "\n"
  );

}

    function obterEmbedYoutube(url) {
  if (!url) return "";

  const texto = String(url).trim();

  let videoId = "";

  if (texto.includes("youtube.com/watch?v=")) {
    videoId = texto.split("v=")[1]?.split("&")[0] || "";
  } else if (texto.includes("youtu.be/")) {
    videoId = texto.split("youtu.be/")[1]?.split("?")[0] || "";
  } else if (texto.includes("youtube.com/embed/")) {
    videoId = texto.split("youtube.com/embed/")[1]?.split("?")[0] || "";
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
}

function atualizarCabecalhoMusica(nome = "", cantor = "", capo = "", youtube = "", tom = "") {
  displayTitulo.textContent = nome || "Nenhuma música aberta";
  displayArtista.textContent = cantor || "";

  if (capo !== "" && capo !== null && capo !== undefined) {
    displayCapo.textContent = Number(capo) > 0 ? `Capo: ${capo}` : "";
  } else {
    displayCapo.textContent = "";
  }

 if (tom) {
  const tomExibicao = transporAcorde(tom, semitons);

  if (semitons === 0) {
    displayTom.textContent = `Tom: ${tom}`;
  } else {
    displayTom.textContent = `Tom: ${tomExibicao} (${tom})`;
  }
} else {
  displayTom.textContent = "";
}

  const embed = obterEmbedYoutube(youtube);

  if (embed) {
    youtubePlayer.src = embed;
    youtubeBox.style.display = "block";
  } else {
    youtubePlayer.removeAttribute("src");
    youtubeBox.style.display = "none";
  }
}

    async function transpor(v) {
  if (!original) return;

  semitons += v;

  atualizarVisualizacao();

atualizarCabecalhoMusica(
  displayTitulo.textContent,
  displayArtista.textContent,
  displayCapo.textContent.replace("Capo: ", ""),
  youtubePlayer.src,
  detectarTom(original)
);

  await salvarTomUsuario();
}

async function salvarTomUsuario() {
  if (!user || !musicaAbertaId) return;

  try {
    await db
      .collection("usuarios")
      .doc(user.uid)
      .collection("tons")
      .doc(musicaAbertaId)
      .set({
        semitons,
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
  } catch (erro) {
    console.error("Erro ao salvar tom:", erro);
  }
}

    async function resetarTom() {
  semitons = 0;

  atualizarVisualizacao();

atualizarCabecalhoMusica(
  displayTitulo.textContent,
  displayArtista.textContent,
  displayCapo.textContent.replace("Capo: ", ""),
  youtubePlayer.src,
  detectarTom(original)
);

  await salvarTomUsuario();
}

    function abrirFormularioNovaMusica() {
      if (!user) {
        alert("Faça login primeiro.");
        return;
      }

      editId = null;
      modalTitulo.textContent = "Adicionar música";
      modalNomeMusica.value = "";
      modalNomeArtista.value = "";
      modalLetra.value = "";
      modalCapo.value = "";
      modalTom.value = "";
      modalYoutube.value = "";
      modalGenero.value = "";
      modalPasta.value = "";
                esconderBottomNav();
      modalForm.classList.add("visible");
    }

    function fecharFormulario() {
  modalForm.classList.remove("visible");
  liberarBottomNav();
}

   async function login() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account"
    });

    auth.useDeviceLanguage();
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    localStorage.setItem("loginRedirectPendente", "1");
    localStorage.setItem("loginRedirectInicio", String(Date.now()));

    await auth.signInWithRedirect(provider);
  } catch (erro) {
    console.error("Erro ao iniciar login:", erro);
    localStorage.removeItem("loginRedirectPendente");
    alert("Erro ao iniciar login: " + erro.code + " - " + erro.message);
  }
}

async function finalizarLoginRedirect() {
  if (loginRedirectEmProcessamento) return;
  loginRedirectEmProcessamento = true;

  try {
    const result = await auth.getRedirectResult();

    if (result && result.user) {
      console.log("Login por redirecionamento finalizado:", result.user.email);
      localStorage.removeItem("loginRedirectPendente");
      localStorage.removeItem("loginRedirectInicio");
    }
  } catch (erro) {
    console.error("Erro ao finalizar redirect:", erro);

    const pendente = localStorage.getItem("loginRedirectPendente");

    if (pendente) {
      localStorage.removeItem("loginRedirectPendente");
      localStorage.removeItem("loginRedirectInicio");
      alert(
        "O login voltou do Google, mas o navegador não concluiu a sessão. " +
        "Confira se o domínio do Cloudflare está autorizado no Firebase Authentication e tente abrir pelo Chrome/Safari normal, fora do modo anônimo.

" +
        "Erro: " + erro.code
      );
    }
  } finally {
    if (auth.currentUser) {
      localStorage.removeItem("loginRedirectPendente");
      localStorage.removeItem("loginRedirectInicio");
    }

    loginRedirectEmProcessamento = false;
  }
}

async function loginGoogle() {
  return login();
}

    async function logout() {
  await auth.signOut();
  fecharMenu();
  fecharProfileMenu();
}

    function normalizarTexto(str) {
      return String(str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
    }

async function carregarPastas() {
  modalPasta.innerHTML = '<option value="">Sem pasta</option>';
  filtroPasta.innerHTML = '<option value="">Todas as músicas</option>';

  if (!user) return;

  try {
    const snap = await db.collection("pastas").get();

    const pastas = [];
    snap.forEach(doc => pastas.push({ id: doc.id, ...doc.data() }));

    pastas.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));

    pastas.forEach(pasta => {
      const optionModal = document.createElement("option");
      optionModal.value = pasta.id;
      optionModal.textContent = pasta.nome || "Pasta sem nome";
      modalPasta.appendChild(optionModal);

      const optionFiltro = document.createElement("option");
      optionFiltro.value = pasta.id;
      optionFiltro.textContent = pasta.nome || "Pasta sem nome";
      filtroPasta.appendChild(optionFiltro);
    });
  } catch (erro) {
    console.error("Erro ao carregar pastas:", erro);
    alert("Não foi possível carregar as pastas.");
  }
}

async function criarPasta() {
  if (!user) {
    alert("Faça login primeiro.");
    return;
  }

  const nome = prompt("Nome da nova pasta:");
  if (!nome || !nome.trim()) return;

  const nomeLimpo = nome.trim();
  const nomeNormalizado = normalizarTexto(nomeLimpo);

  const payload = {
    nome: nomeLimpo,
    nomeNormalizado,
    privada: false,
    compartilhadaCom: []
  };

  try {
    const pastas = await buscarPastasOnlineOuOffline();

    const duplicada = pastas.some(pasta =>
      normalizarTexto(pasta.nome || "") === nomeNormalizado
    );

    if (duplicada) {
      alert("Já existe uma pasta com esse nome.");
      return;
    }

    const ref = await db.collection("pastas").add({
      ...payload,
      uid: user.uid,
      autorNome: user.displayName || user.email || "Usuário",
      autorEmail: user.email || "",
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });

    await carregarPastas();
    modalPasta.value = ref.id;
    filtroPasta.value = ref.id;

    await carregarLista();

    if (painelPastas.classList.contains("visible")) {
      await carregarPainelPastas();
    }

    alert("Pasta criada com sucesso.");
  } catch (erro) {
    adicionarNaFilaOffline({
      tipo: "criarPasta",
      payload
    });

    const pastaOffline = {
      id: "offline-pasta-" + Date.now(),
      ...payload,
      uid: user.uid,
      autorNome: user.displayName || user.email || "Usuário",
      autorEmail: user.email || ""
    };

    const pastas = await carregarColecaoOffline("pastas");
    await salvarColecaoOffline("pastas", [...pastas, pastaOffline]);

    alert("Sem internet. Pasta salva offline e será sincronizada depois.");
  }
}

function importarCifraColada() {
  const texto = modalLetra.value || "";

  if (!texto.trim()) {
    alert("Cole a cifra primeiro.");
    return;
  }

  const linhas = texto
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  let titulo = "";
  let artista = "";
  let tom = "";
  let capo = "";

  for (const linha of linhas.slice(0, 25)) {
    const linhaLower = linha.toLowerCase();

    if (!tom && (linhaLower.startsWith("tom:") || linhaLower.startsWith("tom "))) {
      tom = linha.split(":")[1]?.trim() || linha.replace(/tom/i, "").trim();
    }

    if (!capo && (linhaLower.startsWith("capo:") || linhaLower.includes("capotraste"))) {
      const numero = linha.match(/\d+/);
      capo = numero ? numero[0] : "";
    }

    if (!artista && linhaLower.startsWith("artista:")) {
      artista = linha.split(":")[1]?.trim() || "";
    }

    if (!titulo && (linhaLower.startsWith("música:") || linhaLower.startsWith("musica:"))) {
      titulo = linha.split(":")[1]?.trim() || "";
    }
  }

  if (!titulo && linhas.length) {
    titulo = linhas[0]
      .replace(/^música:/i, "")
      .replace(/^musica:/i, "")
      .trim();
  }

  if (!artista && linhas.length > 1 && !linhaPareceCifra(linhas[1])) {
    artista = linhas[1]
      .replace(/^artista:/i, "")
      .trim();
  }

  if (!tom) {
    tom = detectarTom(texto);
  }

  if (titulo && !modalNomeMusica.value.trim()) {
    modalNomeMusica.value = titulo;
  }

  if (artista && !modalNomeArtista.value.trim()) {
    modalNomeArtista.value = artista;
  }

  if (tom && !modalTom.value.trim()) {
    modalTom.value = tom;
  }

  if (capo && !modalCapo.value.trim()) {
    modalCapo.value = capo;
  }

  alert("Dados importados. Confira antes de salvar.");
}

function limparCifraTexto(texto) {
  return String(texto || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

    async function salvarModal() {
      if (!user) {
        alert("Faça login primeiro.");
        return;
      }

      // CAPTURA O BOTÃO DE SALVAR (Procura pelo botão dentro do formulário do modal)
      const btnSalvar = document.querySelector("#modalForm button[type='submit']") || 
                        document.querySelector("#modalForm .primary") || 
                        document.getElementById("btn-salvar-modal");

      // SE O BOTÃO JÁ ESTIVER DESATIVADO, IMPEDE O CLIQUE DUPLO
      if (btnSalvar && btnSalvar.disabled) return;

      const tituloTexto = modalNomeMusica.value.trim();
      const artistaTexto = modalNomeArtista.value.trim();
      const capoTexto = modalCapo.value.trim();
      let tomTexto = modalTom.value.trim();
      const youtubeTexto = modalYoutube.value.trim();
      const generoTexto = modalGenero.value || "";
      const pastaIdTexto = modalPasta.value || "";
      const pastaNomeTexto = modalPasta.options[modalPasta.selectedIndex]?.text || "Sem pasta";
      const musicaTexto = limparCifraTexto(modalLetra.value);

      if (!tomTexto) {
        tomTexto = detectarTom(musicaTexto);
      }

      if (!tituloTexto) {
        alert("Informe o nome da música.");
        modalNomeMusica.focus();
        return;
      }

      if (!artistaTexto) {
        alert("Informe o nome do artista.");
        modalNomeArtista.focus();
        return;
      }

      if (!musicaTexto) {
        alert("Cole a letra e cifra da música.");
        modalLetra.focus();
        return;
      }

      // TRAVA O BOTÃO: Guarda o texto original e muda para "Salvando..."
      let textoOriginal = "";
      if (btnSalvar) {
        textoOriginal = btnSalvar.innerHTML;
        btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        btnSalvar.disabled = true;
      }

      try { // Início do bloco de segurança principal

        const tituloNormalizado = normalizarTexto(tituloTexto);
        const artistaNormalizado = normalizarTexto(artistaTexto);

        const snap = await db.collection("musicas").get();

        let duplicada = false;

        snap.forEach(doc => {
          if (editId && doc.id === editId) return;

          const data = doc.data();
          const tituloExistente = normalizarTexto(data.titulo);
          const artistaExistente = normalizarTexto(data.artista);

          if (
            tituloExistente === tituloNormalizado &&
            artistaExistente === artistaNormalizado
          ) {
            duplicada = true;
          }
        });

        if (duplicada) {
          alert("Já existe uma música com esse nome e esse artista.");
          // DESTRAVA O BOTÃO SE APRESENTAR MÚSICA DUPLICADA
          if (btnSalvar) {
            btnSalvar.innerHTML = textoOriginal;
            btnSalvar.disabled = false;
          }
          return;
        }

        const payload = {
          titulo: tituloTexto,
          artista: artistaTexto,
          musica: musicaTexto,
          capo: capoTexto,
          tom: tomTexto,
          youtube: youtubeTexto,
          genero: generoTexto,
          pastaId: pastaIdTexto,
          pastaNome: pastaNomeTexto || "Sem pasta",
          privada: true,
          compartilhadaCom: [],
          uid: user.uid,
          autorNome: user.displayName || user.email || "Usuário",
          autorEmail: user.email || "",
          tituloNormalizado,
          artistaNormalizado,
          atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (editId) {
          const docAtual = await db.collection("musicas").doc(editId).get();
          const musicaAtual = docAtual.data();

          if (!musicaAtual || !podeEditarMusica(musicaAtual)) {
            alert("Você não tem permissão para editar esta música.");
            if (btnSalvar) {
              btnSalvar.innerHTML = textoOriginal;
              btnSalvar.disabled = false;
            }
            return;
          }

          await db.collection("musicas").doc(editId).update(payload);
        } else {
          try {
            payload.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
            const novaMusicaRef = await db.collection("musicas").add(payload);
            musicaAbertaId = novaMusicaRef.id;
          } catch (erro) {
            const payloadOffline = {
              ...payload,
              id: "offline-musica-" + Date.now(),
              criadoEmLocal: new Date().toISOString()
            };

            adicionarNaFilaOffline({
              tipo: "criarMusica",
              payload: payloadOffline
            });

            const musicaOffline = {
              id: "offline-musica-" + Date.now(),
              ...payloadOffline
            };

            const musicas = await carregarColecaoOffline("musicas");
            await salvarColecaoOffline("musicas", [...musicas, musicaOffline]);
            salvarMusicasOffline([...carregarMusicasOffline(), musicaOffline]);

            musicaAbertaId = musicaOffline.id;

            alert("Sem internet. Música salva offline e será sincronizada depois.");
          }
        }

        original = musicaTexto;
        semitons = 0;

        atualizarCabecalhoMusica(
          tituloTexto,
          artistaTexto,
          capoTexto,
          youtubeTexto,
          tomTexto
        );

        atualizarVisualizacao();
        fecharFormulario();

        if (busca.value.trim()) {
          await carregarLista();
        }

        if (painelMusicas.classList.contains("visible")) {
          await carregarTodasMusicas();
        }

        if (navigator.onLine) {
          alert(
            editId
              ? "Música atualizada com sucesso."
              : "Música salva com sucesso."
          );
        }

        editId = null;

      } catch (globalError) {
        console.error("Erro no processo de salvamento:", globalError);
        alert("Ocorreu um erro inesperado ao salvar.");
      } finally {
        // ISSO AQUI É MÁGICA: Não importa se deu certo ou errado, o botão destrava no final!
        if (btnSalvar) {
          btnSalvar.innerHTML = textoOriginal;
          btnSalvar.disabled = false;
        }
      }
}

function musicaCombinaComBusca(m, termo) {
  if (!termo) return true;

  const termoNormalizado = normalizarTexto(termo);

  const campos = [
    m.titulo,
    m.artista,
    m.genero,
    m.pastaNome,
    m.tom,
    m.capo ? `capo ${m.capo}` : "",
    m.autorNome,
    m.musica
  ];

  return campos.some(campo =>
    normalizarTexto(campo || "").includes(termoNormalizado)
  );
}

    async function carregarLista() {
      const termo = busca.value.trim();
      const pastaSelecionada = filtroPasta.value || "";

      if (!termo && !pastaSelecionada) {
  lista.classList.remove("visible");
  lista.innerHTML = "";
  listaVazia.style.display = "none";
  return;
}

      lista.classList.add("visible");
      lista.innerHTML = "Carregando...";
      listaVazia.style.display = "none";

      const docs = await buscarMusicasOnlineOuOffline();
musicasOffline = docs;

      const filtradas = docs
  .filter(m => {
  const buscaMatch = musicaCombinaComBusca(m, termo);

  const pastaMatch =
    !pastaSelecionada ||
    (m.pastaId || "") === pastaSelecionada;

  return buscaMatch && pastaMatch;
})
        .sort((a, b) => (a.titulo || "").localeCompare(b.titulo || "", "pt-BR"));

      lista.innerHTML = "";

      if (!filtradas.length) {
        listaVazia.textContent = "Nenhuma música encontrada.";
        listaVazia.style.display = "block";
        return;
      }

      filtradas.forEach(m => {
        const div = document.createElement("div");
        div.className = "song-item";

        const podeEditar = podeEditarMusica(m);
        const podeExcluir = podeExcluirMusica(m);

        div.innerHTML = `
          <div class="song-item-title">${escapeHtml(m.titulo || "Sem título")}</div>
          <div class="song-item-artist">${escapeHtml(m.artista || "Artista não informado")}</div>
          <div class="song-item-author">Salva por: ${escapeHtml(m.autorNome || "Usuário")}</div>
<div class="song-item-author">Pasta: ${escapeHtml(m.pastaNome || "Sem pasta")}</div>
          <div class="result-actions">
            <button onclick="abrir('${m.id}'); fecharMenu();">Abrir</button>
            ${podeEditar ? `<button onclick="editar('${m.id}'); fecharMenu();">Editar</button>` : ""}
            ${podeEditar ? `<button onclick="moverParaPasta('${m.id}')">Mover pasta</button>` : ""}
            ${podeExcluir ? `<button class="danger" onclick="excluirMusica('${m.id}')">Excluir</button>` : ""}
          </div>
        `;

        lista.appendChild(div);
      });
    }

async function obterMusicaPorIdRapido(id) {
  if (!id) return null;

  let m = musicasOffline.find(item => item.id === id);
  if (m) return m;

  m = carregarMusicasOffline().find(item => item.id === id);
  if (m) return m;

  try {
    m = (await carregarColecaoOffline("musicas")).find(item => item.id === id);
    if (m) return m;
  } catch (erro) {
    console.log("IndexedDB indisponível para busca rápida.", erro);
  }

  if (!estaOffline()) {
    try {
      const doc = await db.collection("musicas").doc(id).get();
      if (doc.exists) return { id: doc.id, ...doc.data() };
    } catch (erro) {
      console.error("Erro ao buscar música por ID:", erro);
    }
  }

  return null;
}

async function abrir(id) {
  mostrarCifra();

  const m = await obterMusicaPorIdRapido(id);

  if (!m) {
    alert("Música não encontrada.");
    return;
  }

  musicaAbertaId = id;
  original = m.musica || "";
  semitons = 0;

  salvarRecente(id);
  carregarInicio();

  atualizarCabecalhoMusica(
    m.titulo || "",
    m.artista || "",
    m.capo || "",
    m.youtube || "",
    m.tom || ""
  );

  atualizarVisualizacao();
  fecharPainel();
  window.scrollTo(0, 0);
}

function editarMusicaAberta() {
  if (!musicaAbertaId) {
    alert("Abra uma música antes de editar.");
    return;
  }

  editar(musicaAbertaId);
}

    async function editar(id) {
      if (!user) {
        alert("Faça login primeiro.");
        return;
      }

      const doc = await db.collection("musicas").doc(id).get();
      const m = doc.data();
      if (!m) return;

      if (!podeEditarMusica(m)) {
        alert("Você não tem permissão para editar esta música.");
        return;
      }

      editId = id;
      modalTitulo.textContent = "Editar música";
      modalNomeMusica.value = m.titulo || "";
      modalNomeArtista.value = m.artista || "";
      modalCapo.value = m.capo || "";
      modalTom.value = m.tom || "";
      modalYoutube.value = m.youtube || "";
                modalGenero.value = m.genero || "";
      modalPasta.value = m.pastaId || "";
      modalLetra.value = m.musica || "";

      esconderBottomNav();
      modalForm.classList.add("visible");
    }

function filtrarMusicasPorGenero(genero) {
  generoSelecionado = genero;
  carregarTodasMusicas();
}

async function adicionarMusicaAoGenero(genero) {
  if (!user) {
    alert("Faça login primeiro.");
    return;
  }

  if (!(ehAdmin() || ehEditora())) {
    alert("Somente admin ou acessos autorizados podem alterar gêneros.");
    return;
  }

  let musicasBase = [];

  try {
    const snap = await db.collection("musicas").get();
    snap.forEach(doc => musicasBase.push({ id: doc.id, ...doc.data() }));
  } catch {
    musicasBase = carregarMusicasOffline();
  }

  const disponiveis = musicasBase
    .filter(m => !m.genero)
    .sort((a, b) => (a.titulo || "").localeCompare(b.titulo || "", "pt-BR"));

  if (!disponiveis.length) {
    alert("Não há músicas sem gênero para adicionar.");
    return;
  }

  let mensagem = `Escolha a música para adicionar ao gênero ${genero}:\n\n`;

  disponiveis.forEach((m, index) => {
    mensagem += `${index + 1} - ${m.titulo || "Sem título"} — ${m.artista || "Artista não informado"}\n`;
  });

  const escolha = prompt(mensagem);
  if (escolha === null) return;

  const numero = Number(escolha);

  if (Number.isNaN(numero) || numero < 1 || numero > disponiveis.length) {
    alert("Opção inválida.");
    return;
  }

  const musicaEscolhida = disponiveis[numero - 1];

  await db.collection("musicas").doc(musicaEscolhida.id).update({
    genero,
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });

  await sincronizarMusicasOffline();
  await carregarTodasMusicas();

  alert(`Música adicionada ao gênero ${genero}.`);
}

function filtrarTipoMusica(tipo) {
  tipoFiltroMusica = tipo;
  carregarTodasMusicas();
}

async function carregarTodasMusicas() {
  const container = document.getElementById("listaTodasMusicas");
  const vazio = document.getElementById("listaTodasMusicasVazia");
  const campoBusca = document.getElementById("buscaTodasMusicas");

  if (!container) return;

  const termo = normalizarTexto(campoBusca?.value || "");
  const todas = await buscarMusicasOnlineOuOffline();

  let musicas = [...todas];

  if (generoSelecionado) {
    musicas = musicas.filter(m => m.genero === generoSelecionado);
  }

  if (tipoFiltroMusica === "favoritas") {
    const favoritos = obterFavoritos();
    musicas = musicas.filter(m => favoritos.includes(m.id));
  }

  if (tipoFiltroMusica === "recentes") {
    const recentes = obterRecentes();
    musicas = recentes
      .map(id => todas.find(m => m.id === id))
      .filter(Boolean);
  }

  if (termo) {
    musicas = musicas.filter(m => musicaCombinaComBusca(m, termo));
  }

  musicas.sort((a, b) =>
    (a.titulo || "").localeCompare(b.titulo || "", "pt-BR")
  );

  container.innerHTML = "";
  container.style.display = "block";

  if (!musicas.length) {
    if (vazio) {
      vazio.style.display = "block";
      vazio.innerText = "Nenhuma música encontrada.";
    }
    return;
  }

  if (vazio) vazio.style.display = "none";

  musicas.forEach(m => {
    const item = document.createElement("div");
    item.className = "song-item";

    const podeEditar = user && podeEditarMusica(m);
    const podeExcluir = user && podeExcluirMusica(m);

    item.innerHTML = `
      <div class="song-item-title">${escapeHtml(m.titulo || "Sem título")}</div>
      <div class="song-item-artist">${escapeHtml(m.artista || "")}</div>
      <div class="song-item-author">Pasta: ${escapeHtml(m.pastaNome || "Sem pasta")}</div>

      <div class="result-actions">
        <button onclick="abrir('${m.id}')">Abrir</button>
        ${podeEditar ? `<button onclick="editar('${m.id}')">Editar</button>` : ""}
        ${podeEditar ? `<button onclick="moverParaPasta('${m.id}')">Mover pasta</button>` : ""}
        ${podeExcluir ? `<button class="danger" onclick="excluirMusica('${m.id}')">Excluir</button>` : ""}
      </div>
    `;

    container.appendChild(item);
  });
}

async function carregarPainelPastas() {
  if (!user && !estaOffline()) {
    listaPastas.innerHTML = "";
    listaPastasVazia.textContent = "Faça login para ver as pastas.";
    listaPastasVazia.style.display = "block";
    return;
  }

  listaPastas.innerHTML = "Carregando pastas...";
  listaPastasVazia.style.display = "none";

  const pastas = await buscarPastasOnlineOuOffline();

  pastas.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));

  listaPastas.innerHTML = "";

  if (!pastas.length) {
    listaPastasVazia.textContent = estaOffline()
      ? "Nenhuma pasta salva offline. Abra o app com internet e entre em Pastas uma vez."
      : "Nenhuma pasta criada ainda.";
    listaPastasVazia.style.display = "block";
    tituloMusicasDaPasta.textContent = "Músicas da pasta";
    listaMusicasDaPasta.innerHTML = "";
    listaMusicasDaPastaVazia.style.display = "none";
    return;
  }

  listaPastasVazia.style.display = "none";

  pastas.forEach(pasta => {
    const div = document.createElement("div");
    div.className = "song-item";

    const podeExcluirPasta = user && (pasta.uid === user.uid || ehAdmin());

    div.innerHTML = `
      <div class="song-item-title">📁 ${escapeHtml(pasta.nome || "Pasta sem nome")}</div>
      <div class="song-item-author">Criada por: ${escapeHtml(pasta.autorNome || "Usuário")}</div>

      <div class="result-actions">
        <button onclick="abrirPasta('${pasta.id}', '${escapeHtml(pasta.nome || "Pasta sem nome")}')">Abrir pasta</button>
        ${podeExcluirPasta ? `<button class="danger" onclick="excluirPasta('${pasta.id}')">Excluir pasta</button>` : ""}
      </div>
    `;

    listaPastas.appendChild(div);
  });
}

async function abrirPasta(pastaId, pastaNome) {
  tituloMusicasDaPasta.textContent = `Músicas em: ${pastaNome}`;
  listaMusicasDaPasta.innerHTML = "Carregando músicas...";
  listaMusicasDaPastaVazia.style.display = "none";

  const musicasBase = await buscarMusicasOnlineOuOffline();

  const musicas = musicasBase
    .filter(m => (m.pastaId || "") === pastaId)
    .sort((a, b) => (a.titulo || "").localeCompare(b.titulo || "", "pt-BR"));

  listaMusicasDaPasta.innerHTML = "";

  if (!musicas.length) {
    listaMusicasDaPastaVazia.textContent = estaOffline()
      ? "Nenhuma música desta pasta salva offline."
      : "Nenhuma música nesta pasta.";
    listaMusicasDaPastaVazia.style.display = "block";
    return;
  }

  musicas.forEach(m => {
    const div = document.createElement("div");
    div.className = "song-item";

    const podeEditar = user && podeEditarMusica(m);
    const podeExcluir = user && podeExcluirMusica(m);

    div.innerHTML = `
      <div class="song-item-title">${escapeHtml(m.titulo || "Sem título")}</div>
      <div class="song-item-artist">${escapeHtml(m.artista || "Artista não informado")}</div>
      <div class="result-actions">
        <button onclick="abrir('${m.id}'); fecharPainel();">Abrir</button>
        ${podeEditar ? `<button onclick="moverParaPasta('${m.id}')">Mover pasta</button>` : ""}
        ${podeEditar ? `<button onclick="removerDaPasta('${m.id}')">Remover da pasta</button>` : ""}
        ${podeExcluir ? `<button class="danger" onclick="excluirMusica('${m.id}')">Excluir</button>` : ""}
      </div>
    `;

    listaMusicasDaPasta.appendChild(div);
  });
}

async function removerDaPasta(id) {
  if (!user) {
    alert("Faça login primeiro.");
    return;
  }

  const confirmar = confirm("Remover esta música da pasta? Ela continuará salva no sistema.");
  if (!confirmar) return;

  try {
    await db.collection("musicas").doc(id).update({
      pastaId: "",
      pastaNome: "Sem pasta",
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });

    await sincronizarMusicasOffline();
    await carregarPastas();

    if (painelPastas.classList.contains("visible")) {
      await carregarPainelPastas();
    }

    if (painelMusicas.classList.contains("visible")) {
      await carregarTodasMusicas();
    }

    alert("Música removida da pasta.");
  } catch (erro) {
    console.error("Erro ao remover música da pasta:", erro);
    alert("Não foi possível remover a música da pasta.");
  }
}

async function moverParaPasta(id) {
  if (!user) {
    alert("Faça login primeiro.");
    return;
  }

  const doc = await db.collection("musicas").doc(id).get();
  const m = doc.data();

  if (!m) return;

  if (!podeEditarMusica(m)) {
    alert("Você não tem permissão para mover esta música.");
    return;
  }

  const snapPastas = await db.collection("pastas").get();

  const pastas = [];
  snapPastas.forEach(doc => {
    pastas.push({
      id: doc.id,
      nome: doc.data().nome || "Pasta sem nome"
    });
  });

  pastas.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  let mensagem = "Digite o número da pasta para mover a música:\n\n";
  mensagem += "0 - Sem pasta\n";

  pastas.forEach((pasta, index) => {
    mensagem += `${index + 1} - ${pasta.nome}\n`;
  });

  if (!pastas.length) {
    mensagem += "\nNenhuma pasta criada ainda.";
  }

  const escolha = prompt(mensagem);

  if (escolha === null) return;

  const numero = Number(escolha);

  if (Number.isNaN(numero) || numero < 0 || numero > pastas.length) {
    alert("Opção inválida.");
    return;
  }

  let pastaId = "";
  let pastaNome = "Sem pasta";

  if (numero > 0) {
    const pastaEscolhida = pastas[numero - 1];
    pastaId = pastaEscolhida.id;
    pastaNome = pastaEscolhida.nome;
  }

  await db.collection("musicas").doc(id).update({
    pastaId,
    pastaNome,
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });

  await carregarPastas();
  await carregarLista();

  alert(`Música movida para: ${pastaNome}`);
}

async function excluirMusica(id) {
  if (!user) {
    alert("Faça login primeiro.");
    return;
  }

  const confirmar = confirm("Deseja excluir esta música do sistema?");
  if (!confirmar) return;

  try {
    const ref = db.collection("musicas").doc(id);
    const doc = await ref.get();
    const musica = doc.data();

    if (!musica) {
      alert("Música não encontrada.");
      return;
    }

    if (!podeExcluirMusica(musica)) {
      alert("Você não tem permissão para excluir esta música.");
      return;
    }

    await ref.delete();

    await sincronizarMusicasOffline();

    if (painelMusicas.classList.contains("visible")) {
      await carregarTodasMusicas();
    }

    if (busca.value.trim() || filtroPasta.value) {
      await carregarLista();
    }

    if (painelPastas.classList.contains("visible")) {
      await carregarPainelPastas();
    }

    alert("Música excluída com sucesso.");
  } catch (erro) {
    console.error("Erro ao excluir música:", erro);
    alert("Não foi possível excluir esta música. Verifique sua permissão.");
  }
}

async function excluirPasta(id) {
  if (!user) {
    alert("Faça login primeiro.");
    return;
  }

  const doc = await db.collection("pastas").doc(id).get();
  const pasta = doc.data();

  if (!pasta) return;

  if (!(pasta.uid === user.uid || ehAdmin())) {
    alert("Você não tem permissão para excluir esta pasta.");
    return;
  }

  const confirmar = confirm(
    `Deseja excluir a pasta "${pasta.nome || "Pasta sem nome"}"?\n\nAs músicas dentro dela NÃO serão excluídas. Elas voltarão para "Sem pasta".`
  );

  if (!confirmar) return;

  const snapMusicas = await db
    .collection("musicas")
    .where("pastaId", "==", id)
    .get();

  const batch = db.batch();

  snapMusicas.forEach(docMusica => {
    batch.update(docMusica.ref, {
      pastaId: "",
      pastaNome: "Sem pasta",
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
  });

  batch.delete(db.collection("pastas").doc(id));

  await batch.commit();

  await carregarPastas();
  await carregarLista();

  if (painelPastas.classList.contains("visible")) {
    await carregarPainelPastas();
  }

  alert("Pasta excluída com sucesso.");
}

const DB_NAME = "transpositor-pro-db";
const DB_VERSION = 1;

function abrirBancoOffline() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const dbOffline = event.target.result;

      if (!dbOffline.objectStoreNames.contains("musicas")) {
        dbOffline.createObjectStore("musicas", { keyPath: "id" });
      }

      if (!dbOffline.objectStoreNames.contains("pastas")) {
        dbOffline.createObjectStore("pastas", { keyPath: "id" });
      }

      if (!dbOffline.objectStoreNames.contains("setlists")) {
        dbOffline.createObjectStore("setlists", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function salvarColecaoOffline(nomeColecao, lista) {
  const dbOffline = await abrirBancoOffline();

  return new Promise((resolve, reject) => {
    const tx = dbOffline.transaction(nomeColecao, "readwrite");
    const store = tx.objectStore(nomeColecao);

    store.clear();

    (lista || []).forEach(item => {
      if (item && item.id) {
        store.put(item);
      }
    });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function carregarColecaoOffline(nomeColecao) {
  const dbOffline = await abrirBancoOffline();

  return new Promise((resolve, reject) => {
    const tx = dbOffline.transaction(nomeColecao, "readonly");
    const store = tx.objectStore(nomeColecao);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function salvarPastasOffline(lista) {
  localStorage.setItem("transpositor-pastas-offline", JSON.stringify(lista || []));
}

function carregarPastasOffline() {
  try {
    return JSON.parse(localStorage.getItem("transpositor-pastas-offline") || "[]");
  } catch {
    return [];
  }
}

async function buscarPastasOnlineOuOffline() {
  try {
    const snap = await db.collection("pastas").get();

    const pastas = [];
    snap.forEach(doc => {
      pastas.push({ id: doc.id, ...doc.data() });
    });

    if (pastas.length) {
      salvarPastasOffline(pastas);
      await salvarColecaoOffline("pastas", pastas);
    }

    if (pastas.length) return pastas;
  } catch (erro) {
    console.log("Usando pastas offline.");
  }

  const pastasIndexedDB = await carregarColecaoOffline("pastas");
  return pastasIndexedDB.length ? pastasIndexedDB : carregarPastasOffline();
}

function salvarMusicasOffline(lista) {
  localStorage.setItem("transpositor-musicas-offline", JSON.stringify(lista || []));
}

function carregarMusicasOffline() {
  try {
    return JSON.parse(localStorage.getItem("transpositor-musicas-offline") || "[]");
  } catch {
    return [];
  }
}

async function buscarMusicasOnlineOuOffline() {
  try {
    const snap = await db.collection("musicas").get();

    const musicas = [];
    snap.forEach(doc => {
      musicas.push({ id: doc.id, ...doc.data() });
    });

    if (musicas.length) {
      salvarMusicasOffline(musicas);
      await salvarColecaoOffline("musicas", musicas);
    }

    if (musicas.length) return musicas;
  } catch (erro) {
    console.log("Usando músicas offline.");
  }

  const musicasIndexedDB = await carregarColecaoOffline("musicas");
  return musicasIndexedDB.length ? musicasIndexedDB : carregarMusicasOffline();
}

async function sincronizarMusicasOffline() {
  const musicas = await buscarMusicasOnlineOuOffline();
  salvarMusicasOffline(musicas);
  console.log("Músicas offline disponíveis:", musicas.length);
}

function obterFavoritos() {
  try {
    return JSON.parse(localStorage.getItem("transpositor-favoritos") || "[]");
  } catch {
    return [];
  }
}

function salvarFavoritos(lista) {
  localStorage.setItem("transpositor-favoritos", JSON.stringify(lista || []));
}

function alternarFavorito(id) {
  const favoritos = obterFavoritos();

  if (favoritos.includes(id)) {
    salvarFavoritos(favoritos.filter(item => item !== id));
    return false;
  }

  favoritos.push(id);
  salvarFavoritos(favoritos);
  return true;
}

function salvarRecente(id) {
  if (!id) return;

  let recentes = [];

  try {
    recentes = JSON.parse(localStorage.getItem("transpositor-recentes") || "[]");
  } catch {
    recentes = [];
  }

  recentes = recentes.filter(item => item !== id);
  recentes.unshift(id);
  recentes = recentes.slice(0, 15);

  localStorage.setItem("transpositor-recentes", JSON.stringify(recentes));
}

function obterRecentes() {
  try {
    return JSON.parse(localStorage.getItem("transpositor-recentes") || "[]");
  } catch {
    return [];
  }
}

function favoritarMusicaAberta() {
  if (!musicaAbertaId) {
    alert("Abra uma música antes de favoritar.");
    return;
  }

  const favorito = alternarFavorito(musicaAbertaId);
  carregarInicio();
  alert(favorito ? "Música adicionada aos favoritos." : "Música removida dos favoritos.");
}

let modoPalcoAtivo = false;
let scrollAutomatico = null;

function carregarSetlistsOffline() {
  try {
    return JSON.parse(localStorage.getItem("transpositor-setlists-offline") || "[]");
  } catch {
    return [];
  }
}

function salvarSetlistsOffline(lista) {
  localStorage.setItem("transpositor-setlists-offline", JSON.stringify(lista || []));
}

async function buscarSetlistsOnlineOuOffline() {
  try {
    const snap = await db.collection("setlists").get();

    const setlists = [];
    snap.forEach(doc => {
      setlists.push({ id: doc.id, ...doc.data() });
    });

    if (setlists.length) {
      salvarSetlistsOffline(setlists);
      await salvarColecaoOffline("setlists", setlists);
    }

    if (setlists.length) return setlists;
  } catch {
    console.log("Usando setlists offline.");
  }

  const setlistsIndexedDB = await carregarColecaoOffline("setlists");
  return setlistsIndexedDB.length ? setlistsIndexedDB : carregarSetlistsOffline();
}


async function criarSetlist() {
  if (!user) {
    alert("Faça login primeiro.");
    return;
  }

  const nome = prompt("Nome da setlist/repertório:");
  if (!nome || !nome.trim()) return;

  await db.collection("setlists").add({
    nome: nome.trim(),
    musicas: [],
    uid: user.uid,
    autorNome: user.displayName || user.email || "Usuário",
    autorEmail: user.email || "",
    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });

  await carregarPainelSetlists();
  alert("Setlist criada.");
}

async function carregarPainelSetlists() {
  if (!user && !estaOffline()) {
    listaSetlists.innerHTML = "";
    listaSetlistsVazia.textContent = "Faça login para ver suas setlists.";
    listaSetlistsVazia.style.display = "block";
    return;
  }

  listaSetlists.innerHTML = "Carregando setlists...";
  listaSetlistsVazia.style.display = "none";

  const setlists = await buscarSetlistsOnlineOuOffline();

  const todas = setlists
  .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));

  listaSetlists.innerHTML = "";

  if (!todas.length) {
    listaSetlistsVazia.textContent = estaOffline()
      ? "Nenhuma setlist salva offline."
      : "Nenhuma setlist criada ainda.";
    listaSetlistsVazia.style.display = "block";
    return;
  }

  todas.forEach(setlist => {
    const div = document.createElement("div");
    div.className = "song-item";

    const podeExcluir = user && (setlist.uid === user.uid || ehAdmin());

    div.innerHTML = `
      <div class="song-item-title">📋 ${escapeHtml(setlist.nome || "Setlist sem nome")}</div>
      <div class="song-item-author">Músicas: ${(setlist.musicas || []).length}</div>
      <div class="result-actions">
        <button onclick="abrirSetlist('${setlist.id}')">Abrir</button>
        <button onclick="copiarLinkSetlist('${setlist.id}')">🔗 Link</button>
        <button onclick="adicionarMusicaNaSetlist('${setlist.id}')">Adicionar música</button>
        ${podeExcluir ? `<button class="danger" onclick="excluirSetlist('${setlist.id}')">Excluir</button>` : ""}
      </div>
    `;

    listaSetlists.appendChild(div);
  });
}

async function abrirSetlist(setlistId) {
  localStorage.setItem("setlistEmAndamentoId", setlistId);
  document.body.classList.add("tem-setlist-ativa");

  history.replaceState(null, "", `?setlist=${setlistId}`);

history.replaceState(null, "", `?setlist=${setlistId}`);  
const setlists = await buscarSetlistsOnlineOuOffline();
  const setlist = setlists.find(s => s.id === setlistId);

  if (!setlist) {
    alert("Setlist não encontrada.");
    return;
  }

  tituloMusicasDaSetlist.innerHTML = `
  Músicas em: ${escapeHtml(setlist.nome || "Setlist")}
  <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
    <button onclick="adicionarMusicaNaSetlist('${setlistId}')">
      + Add músicas
    </button>

  </div>
`;

listaMusicasDaSetlist.innerHTML = "Carregando músicas...";
listaMusicasDaSetlistVazia.style.display = "none";

const musicasBase = await buscarMusicasOnlineOuOffline();

setlistAtualIds = setlist.musicas || [];
setlistAtualIndice = -1;

const musicas = setlistAtualIds
  .map(id => musicasBase.find(m => m.id === id))
  .filter(Boolean);

listaMusicasDaSetlist.innerHTML = "";

if (!musicas.length) {
  listaMusicasDaSetlistVazia.innerText = "Nenhuma música nesta setlist.";
  listaMusicasDaSetlistVazia.style.display = "block";
  return;
}

  musicas.forEach((m, index) => {
    const div = document.createElement("div");
    div.className = "song-item";

    div.innerHTML = `
      <div class="song-item-title">${index + 1}. ${escapeHtml(m.titulo || "Sem título")}</div>
      <div class="song-item-artist">${escapeHtml(m.artista || "Artista não informado")}</div>
      <div class="result-actions">
  <button onclick="abrirMusicaDaSetlist('${m.id}'); fecharPainel();">Abrir</button>
  <button onclick="moverMusicaNaSetlist('${setlistId}', '${m.id}', -1)">⬆️ Subir</button>
  <button onclick="moverMusicaNaSetlist('${setlistId}', '${m.id}', 1)">⬇️ Descer</button>
  <button onclick="removerMusicaDaSetlist('${setlistId}', '${m.id}')">Remover</button>
</div>
    `;

    listaMusicasDaSetlist.appendChild(div);
  });
}

async function adicionarMusicaNaSetlist(setlistId) {
  if (!user) {
    alert("Faça login primeiro.");
    return;
  }

  const setlists = await buscarSetlistsOnlineOuOffline();
  const setlist = setlists.find(s => s.id === setlistId);

  if (!setlist) return;

  const musicas = await buscarMusicasOnlineOuOffline();
  const idsAtuais = setlist.musicas || [];

  const disponiveis = musicas
    .filter(m => !idsAtuais.includes(m.id))
    .sort((a, b) => (a.titulo || "").localeCompare(b.titulo || "", "pt-BR"));

  if (!disponiveis.length) {
    alert("Não há músicas disponíveis para adicionar.");
    return;
  }

  let mensagem = "Escolha a música para adicionar:\n\n";

  disponiveis.forEach((m, i) => {
    mensagem += `${i + 1} - ${m.titulo || "Sem título"} — ${m.artista || "Artista não informado"}\n`;
  });

  const escolha = prompt(mensagem);
  if (escolha === null) return;

  const numero = Number(escolha);

  if (Number.isNaN(numero) || numero < 1 || numero > disponiveis.length) {
    alert("Opção inválida.");
    return;
  }

  const musicaEscolhida = disponiveis[numero - 1];

  await db.collection("setlists").doc(setlistId).update({
  musicas: [...idsAtuais, musicaEscolhida.id],
  atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
});

await buscarSetlistsOnlineOuOffline();
await carregarPainelSetlists();
await abrirSetlist(setlistId);
}

async function moverMusicaNaSetlist(setlistId, musicaId, direcao) {
  if (!user) {
    alert("Faça login primeiro.");
    return;
  }

  const setlists = await buscarSetlistsOnlineOuOffline();
  const setlist = setlists.find(s => s.id === setlistId);

  if (!setlist) return;

  const musicas = [...(setlist.musicas || [])];
  const index = musicas.indexOf(musicaId);

  if (index === -1) return;

  const novoIndex = index + direcao;

  if (novoIndex < 0 || novoIndex >= musicas.length) return;

  const temp = musicas[index];
  musicas[index] = musicas[novoIndex];
  musicas[novoIndex] = temp;

  await db.collection("setlists").doc(setlistId).update({
    musicas,
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });

  await buscarSetlistsOnlineOuOffline();
  await abrirSetlist(setlistId);
}

async function removerMusicaDaSetlist(setlistId, musicaId) {
  if (!user) {
    alert("Faça login primeiro.");
    return;
  }

  const setlists = await buscarSetlistsOnlineOuOffline();
  const setlist = setlists.find(s => s.id === setlistId);

  if (!setlist) return;

  const confirmar = confirm("Remover esta música da setlist?");
  if (!confirmar) return;

  await db.collection("setlists").doc(setlistId).update({
    musicas: (setlist.musicas || []).filter(id => id !== musicaId),
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });

  await carregarPainelSetlists();
  await abrirSetlist(setlistId);
}

async function excluirSetlist(setlistId) {
  if (!user) {
    alert("Faça login primeiro.");
    return;
  }

  const confirmar = confirm("Deseja excluir esta setlist?");
  if (!confirmar) return;

  await db.collection("setlists").doc(setlistId).delete();

  await carregarPainelSetlists();

  listaMusicasDaSetlist.innerHTML = "";
  tituloMusicasDaSetlist.textContent = "Músicas da setlist";
}

async function abrirMusicaDaSetlist(id) {
  setlistAtualIndice = setlistAtualIds.indexOf(id);
  await abrir(id);
}

async function proximaMusicaSetlist() {
  if (!setlistAtualIds.length) {
    alert("Abra uma música por uma setlist primeiro.");
    return;
  }

  if (setlistAtualIndice < 0) {
    setlistAtualIndice = 0;
  } else if (setlistAtualIndice < setlistAtualIds.length - 1) {
    setlistAtualIndice++;
  } else {
    alert("Você chegou ao fim da setlist.");
    return;
  }

  await abrir(setlistAtualIds[setlistAtualIndice]);
}

async function musicaAnteriorSetlist() {
  if (!setlistAtualIds.length) {
    alert("Abra uma música por uma setlist primeiro.");
    return;
  }

  if (setlistAtualIndice > 0) {
    setlistAtualIndice--;
  } else {
    alert("Você está na primeira música da setlist.");
    return;
  }

  await abrir(setlistAtualIds[setlistAtualIndice]);
}

async function importarDadosBackup(backup) {
  const confirmar = confirm(
    "Deseja importar este backup?\n\nO app tentará evitar duplicidades e não apagará seus dados atuais."
  );

  if (!confirmar) return;

  const musicasAtuais = await buscarMusicasOnlineOuOffline();
  const pastasAtuais = await buscarPastasOnlineOuOffline();
  const setlistsAtuais = await buscarSetlistsOnlineOuOffline();

  const chavesMusicas = new Set(
    musicasAtuais.map(m => `${normalizarTexto(m.titulo)}|${normalizarTexto(m.artista)}`)
  );

  const chavesPastas = new Set(
    pastasAtuais.map(p => normalizarTexto(p.nome))
  );

  const chavesSetlists = new Set(
    setlistsAtuais.map(s => normalizarTexto(s.nome))
  );

  let importadasMusicas = 0;
  let importadasPastas = 0;
  let importadasSetlists = 0;

  for (const pasta of backup.pastas || []) {
    const chave = normalizarTexto(pasta.nome);

    if (!chave || chavesPastas.has(chave)) continue;

    await db.collection("pastas").add({
      nome: pasta.nome || "Pasta importada",
      nomeNormalizado: normalizarTexto(pasta.nome || "Pasta importada"),
      uid: user.uid,
      autorNome: user.displayName || user.email || "Usuário",
      autorEmail: user.email || "",
      privada: false,
      compartilhadaCom: [],
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });

    importadasPastas++;
  }

  for (const musica of backup.musicas || []) {
    const chave = `${normalizarTexto(musica.titulo)}|${normalizarTexto(musica.artista)}`;

    if (!normalizarTexto(musica.titulo) || !normalizarTexto(musica.artista)) continue;
    if (chavesMusicas.has(chave)) continue;

    await db.collection("musicas").add({
      titulo: musica.titulo || "",
      artista: musica.artista || "",
      musica: musica.musica || "",
      capo: musica.capo || "",
      tom: musica.tom || "",
      youtube: musica.youtube || "",
      genero: musica.genero || "",
      pastaId: "",
      pastaNome: musica.pastaNome || "Sem pasta",
      privada: true,
      compartilhadaCom: [],
      uid: user.uid,
      autorNome: user.displayName || user.email || "Usuário",
      autorEmail: user.email || "",
      tituloNormalizado: normalizarTexto(musica.titulo || ""),
      artistaNormalizado: normalizarTexto(musica.artista || ""),
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });

    importadasMusicas++;
  }

  for (const setlist of backup.setlists || []) {
    const chave = normalizarTexto(setlist.nome);

    if (!chave || chavesSetlists.has(chave)) continue;

    await db.collection("setlists").add({
      nome: setlist.nome || "Setlist importada",
      uid: user.uid,
      autorNome: user.displayName || user.email || "Usuário",
      autorEmail: user.email || "",
      musicas: [],
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });

    importadasSetlists++;
  }

  if (backup.favoritos) {
    salvarFavoritos(backup.favoritos);
  }

  if (backup.recentes) {
    localStorage.setItem("transpositor-recentes", JSON.stringify(backup.recentes));
  }

  if (backup.preferencias) {
    await salvarPreferencias(backup.preferencias);
    aplicarPreferenciasNaTela(backup.preferencias);
  }

  await carregarPastas();
  await sincronizarMusicasOffline();
  await buscarPastasOnlineOuOffline();
  await buscarSetlistsOnlineOuOffline();

  alert(
    `Importação concluída.\n\nMúsicas: ${importadasMusicas}\nPastas: ${importadasPastas}\nSetlists: ${importadasSetlists}`
  );
}

async function exportarBackup() {
  const musicas = await buscarMusicasOnlineOuOffline();
  const pastas = await buscarPastasOnlineOuOffline();
  const setlists = await buscarSetlistsOnlineOuOffline();

  const backup = {
    versao: "1.0",
    exportadoEm: new Date().toISOString(),
    musicas,
    pastas,
    setlists,
    favoritos: obterFavoritos(),
    recentes: obterRecentes(),
    preferencias: obterPreferencias()
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `transpositor-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

function importarBackup() {
  if (!user) {
    alert("Faça login primeiro.");
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";

  input.onchange = async () => {
    const arquivo = input.files[0];
    if (!arquivo) return;

    try {
      const texto = await arquivo.text();
      const backup = JSON.parse(texto);

      if (!backup || backup.versao !== "1.0") {
        alert("Arquivo de backup inválido.");
        return;
      }

      await importarDadosBackup(backup);
    } catch (erro) {
      console.error("Erro ao importar backup:", erro);
      alert("Não foi possível importar o backup.");
    }
  };

  input.click();
}

async function copiarLinkSetlist(setlistId) {
  const url = `${window.location.origin}${window.location.pathname}?setlist=${setlistId}`;

  try {
    await navigator.clipboard.writeText(url);
    alert("Link da setlist copiado.");
  } catch {
    prompt("Copie o link:", url);
  }
}

async function copiarLinkMusica() {
  if (!musicaAbertaId) {
    alert("Abra uma música antes de copiar o link.");
    return;
  }

  const url = `${window.location.origin}${window.location.pathname}?musica=${musicaAbertaId}`;

  try {
    await navigator.clipboard.writeText(url);
    alert("Link da música copiado.");
  } catch {
    prompt("Copie o link:", url);
  }
}

function obterFilaOffline() {
  try {
    return JSON.parse(localStorage.getItem("transpositor-fila-offline") || "[]");
  } catch {
    return [];
  }
}

function salvarFilaOffline(fila) {
  localStorage.setItem("transpositor-fila-offline", JSON.stringify(fila || []));
}

function adicionarNaFilaOffline(acao) {
  const fila = obterFilaOffline();

  fila.push({
  ...acao,
  criadoEmLocal: new Date().toISOString()
});

  salvarFilaOffline(fila);
}

async function sincronizarFilaOffline() {
  if (!user || estaOffline()) return;

  const fila = obterFilaOffline();

  if (!fila.length) return;

  const restante = [];

  for (const item of fila) {
    try {
      if (item.tipo === "criarMusica") {
        const docRef = await db.collection("musicas").add({
  ...item.payload,
  uid: user.uid,
  autorNome: user.displayName || user.email || "Usuário",
  autorEmail: user.email || "",
  criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
  atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
});

// remover versão offline antiga
let musicasOffline = await carregarColecaoOffline("musicas");
musicasOffline = musicasOffline.filter(
  m => m.id !== item.payload.id
);
await salvarColecaoOffline("musicas", musicasOffline);
      }

      if (item.tipo === "criarPasta") {
        await db.collection("pastas").add({
          ...item.payload,
          uid: user.uid,
          autorNome: user.displayName || user.email || "Usuário",
          autorEmail: user.email || "",
          criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
          atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      if (item.tipo === "criarSetlist") {
        await db.collection("setlists").add({
          ...item.payload,
          uid: user.uid,
          autorNome: user.displayName || user.email || "Usuário",
          autorEmail: user.email || "",
          criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
          atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    } catch (erro) {
      restante.push(item);
    }
  }

  salvarFilaOffline(restante);

  if (fila.length !== restante.length) {
    await buscarPastasOnlineOuOffline();
    await buscarSetlistsOnlineOuOffline();
    await sincronizarMusicasOffline();
    alert("Dados salvos offline foram sincronizados.");
  }
}

    function escapeHtml(str) {
      return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

function obterNomePerfil(u) {
  return (
    perfilUsuarioAtual?.nomePerfil ||
    perfilUsuarioAtual?.nome ||
    u?.displayName ||
    u?.email ||
    "Usuária"
  );
}

function obterFotoPerfil(u) {
  return (
    perfilUsuarioAtual?.fotoPerfil ||
    perfilUsuarioAtual?.foto ||
    u?.photoURL ||
    "https://via.placeholder.com/52?text=U"
  );
}

async function editarPerfil() {
  if (!user) {
    alert("Faça login primeiro.");
    return;
  }

  const nomeAtual = obterNomePerfil(user);
  const fotoAtual = obterFotoPerfil(user);

  const novoNome = prompt("Nome que aparecerá no app:", nomeAtual);
  if (novoNome === null) return;

  const novoNomeLimpo = novoNome.trim() || nomeAtual;

  const novaFoto = prompt(
    "Link da foto de perfil (opcional).

Você pode colar um link de imagem. Se deixar vazio, usaremos a foto do Google.",
    fotoAtual && !fotoAtual.includes("via.placeholder.com") ? fotoAtual : ""
  );

  if (novaFoto === null) return;

  const novaFotoLimpa = novaFoto.trim();

  try {
    const dadosPerfil = {
      nomePerfil: novoNomeLimpo,
      fotoPerfil: novaFotoLimpa || user.photoURL || "",
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("usuarios").doc(user.uid).set(dadosPerfil, { merge: true });

    perfilUsuarioAtual = {
      ...(perfilUsuarioAtual || {}),
      ...dadosPerfil
    };

    atualizarAreaAuth(user);
    alert("Perfil atualizado.");
  } catch (erro) {
    console.error("Erro ao atualizar perfil:", erro);
    alert("Não foi possível atualizar o perfil agora.");
  }
}

    function atualizarAreaAuth(u) {
  if (u) {
    loginBtn.style.display = "none";

    profileTopBox.classList.add("visible");
    profilePhotoTop.src = obterFotoPerfil(u);
    profilePhotoTop.onerror = () => {
      profilePhotoTop.src = u.photoURL || "https://via.placeholder.com/52?text=U";
    };
    profileNameTop.textContent = obterNomePerfil(u);
    profileEmailTop.textContent = u.email || "";
  } else {
    loginBtn.style.display = "inline-flex";

    perfilUsuarioAtual = null;
    profileTopBox.classList.remove("visible");
    profilePhotoTop.removeAttribute("src");
    profileNameTop.textContent = "";
    profileEmailTop.textContent = "";
    fecharProfileMenu();
  }
}

function obterPreferencias() {
  const salvas = localStorage.getItem(PREFS_KEY);

  if (!salvas) {
    return {
      theme: "dark",
      accent: "#22c55e",
      fontScale: 0
    };
  }

  try {
    return JSON.parse(salvas);
  } catch {
    return {
      theme: "dark",
      accent: "#22c55e",
      fontScale: 0
    };
  }
}

async function salvarPreferencias(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));

  if (!user) return;

  try {
    await db.collection("usuarios").doc(user.uid).set({
      preferencias: prefs
    }, { merge: true });
  } catch (erro) {
    console.error("Erro ao salvar preferências:", erro);
  }
}

async function carregarPreferenciasDoUsuario() {
  if (!user) {
    aplicarPreferenciasNaTela(obterPreferencias());
    return;
  }

  try {
    const doc = await db.collection("usuarios").doc(user.uid).get();

    if (doc.exists && doc.data().preferencias) {
      const prefs = doc.data().preferencias;
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
      aplicarPreferenciasNaTela(prefs);
    } else {
      aplicarPreferenciasNaTela(obterPreferencias());
    }
  } catch (erro) {
    console.error("Erro ao carregar preferências:", erro);
    aplicarPreferenciasNaTela(obterPreferencias());
  }
}

    function aplicarPreferenciasNaTela(prefs) {
      document.body.classList.toggle("light-theme", prefs.theme === "light");
      document.documentElement.style.setProperty("--accent", prefs.accent);
      document.documentElement.style.setProperty("--accent-dark", prefs.theme === "light" ? "#082f49" : "#052e16");

      const base = 16 + (prefs.fontScale * 1);
      const title = 24 + (prefs.fontScale * 1.4);
      const cifra = 17 + (prefs.fontScale * 1);

      document.documentElement.style.setProperty("--font-size-base", `${base}px`);
      document.documentElement.style.setProperty("--font-size-title", `${title}px`);
      document.documentElement.style.setProperty("--font-size-pre", `${cifra}px`);

      if (accentSelect) {
  accentSelect.value = prefs.accent;
}

const themeToggleBtn = document.getElementById("themeToggleBtn");
if (themeToggleBtn) {
  themeToggleBtn.textContent = prefs.theme === "light" ? "🌙" : "☀️";
}
}

async function alternarTemaRapido() {
  const prefs = obterPreferencias();

  prefs.theme = prefs.theme === "light" ? "dark" : "light";

  await salvarPreferencias(prefs);
  aplicarPreferenciasNaTela(prefs);
}


    async function aplicarCorSelecionada() {
  const prefs = obterPreferencias();
  prefs.accent = accentSelect.value;
  await salvarPreferencias(prefs);
  aplicarPreferenciasNaTela(prefs);
}

    async function alterarFonte(delta) {
  const prefs = obterPreferencias();
  prefs.fontScale = Math.max(-2, Math.min(5, (prefs.fontScale || 0) + delta));
  await salvarPreferencias(prefs);
  aplicarPreferenciasNaTela(prefs);
}


auth.getRedirectResult()
  .then((result) => {
    if (result && result.user) {
      console.log("Login por redirecionamento realizado:", result.user.email);
    }
    localStorage.removeItem("loginRedirectPendente");
  })
  .catch((erro) => {
    console.error("Erro no retorno do login:", erro);
    localStorage.removeItem("loginRedirectPendente");
  });

finalizarLoginRedirect();

    auth.onAuthStateChanged(async (u) => {
      user = u || null;
      usuarioAtual = u || null;
      roleAtual = "user";
      perfilUsuarioAtual = null;

      atualizarAreaAuth(user);

      if (u) {
        try {
          console.log("Usuário logado:", u.uid);

          const userRef = db.collection("usuarios").doc(u.uid);
          const doc = await userRef.get();

          if (!doc.exists) {
            await userRef.set({
              uid: u.uid,
              nome: u.displayName || "",
              email: u.email || "",
              foto: u.photoURL || "",
              nomePerfil: u.displayName || u.email || "Usuária",
              fotoPerfil: u.photoURL || "",
              role: "user",
              criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
              ultimoLogin: firebase.firestore.FieldValue.serverTimestamp()
            });

            roleAtual = "user";
            perfilUsuarioAtual = {
              uid: u.uid,
              nomePerfil: u.displayName || u.email || "Usuária",
              fotoPerfil: u.photoURL || "",
              role: "user"
            };
            console.log("Usuário criado com sucesso");
          } else {
            const dadosUsuario = doc.data();
            roleAtual = dadosUsuario.role || "user";
            perfilUsuarioAtual = dadosUsuario;

            await userRef.set({
              uid: u.uid,
              nome: u.displayName || dadosUsuario.nome || "",
              email: u.email || dadosUsuario.email || "",
              foto: u.photoURL || dadosUsuario.foto || "",
            }, { merge: true });

            await userRef.update({
              ultimoLogin: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log("Último login atualizado");
          }

          console.log("Role do usuário:", roleAtual);
        } catch (erro) {
          console.error("Erro ao salvar/carregar usuário:", erro);
        }
      } else {
        console.log("Nenhum usuário logado");
      }

      atualizarAreaAuth(user);

      if (busca.value.trim()) {
        await carregarLista();
      }
await carregarPreferenciasDoUsuario();

if (user) {
  await carregarPastas();
  await buscarPastasOnlineOuOffline();
  await buscarSetlistsOnlineOuOffline();
  await sincronizarMusicasOffline();
 await sincronizarFilaOffline();
}

await carregarInicio();
});

document.addEventListener("keydown", async (event) => {
  const tecla = event.key;

  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
    return;
  }

  if (tecla === "ArrowRight" || tecla === "PageDown" || tecla === "Enter") {
    event.preventDefault();
    await proximaMusicaSetlist();
  }

  if (tecla === "ArrowLeft" || tecla === "PageUp" || tecla === "Backspace") {
    event.preventDefault();
    await musicaAnteriorSetlist();
  }

  if (tecla === " ") {
    event.preventDefault();

    if (scrollAutomatico) {
      pararRolagemAutomatica();
    } else {
      iniciarRolagemAutomatica();
    }
  }

  if (tecla === "ArrowDown") {
    event.preventDefault();
    window.scrollBy(0, 120);
  }

  if (tecla === "ArrowUp") {
    event.preventDefault();
    window.scrollBy(0, -120);
  }

  if (tecla.toLowerCase() === "p") {
    toggleModoPalco();
  }

  if (tecla === "Escape" && modoPalcoAtivo) {
    toggleModoPalco();
  }
});

window.addEventListener("online", async () => {
  console.log("Internet voltou. Sincronizando...");

  await sincronizarFilaOffline();

  await carregarLista();

  if (painelMusicas.classList.contains("visible")) {
    await carregarTodasMusicas();
  }
});

window.addEventListener("scroll", controlarBottomNavAoRolar);
document.addEventListener("click", fecharMenusAoClicarFora);

    aplicarPreferenciasNaTela(obterPreferencias());
    atualizarCabecalhoMusica();
    atualizarVisualizacao();

const paramsUrl = new URLSearchParams(window.location.search);
const musicaUrl = paramsUrl.get("musica");
const setlistUrl = paramsUrl.get("setlist");

if (musicaUrl) {
  setTimeout(() => {
    abrir(musicaUrl);
  }, 1200);
}

if (setlistUrl) {
  setTimeout(() => {
    abrirPainel("setlists");
    abrirSetlist(setlistUrl);
  }, 1200);
}

if (carregarMusicasOffline().length) {
  console.log("Músicas offline disponíveis:", carregarMusicasOffline().length);
}

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js?v=10").catch(console.error);
    }

window.addEventListener("online", async () => {
  console.log("Internet voltou. Sincronizando...");
  await sincronizarFilaOffline();
  await carregarLista();
});

function mostrarDebugLogin() {
  const box = document.createElement("div");
  box.style.position = "fixed";
  box.style.inset = "10px";
  box.style.zIndex = "99999";
  box.style.background = "#111827";
  box.style.color = "#e5e7eb";
  box.style.padding = "12px";
  box.style.borderRadius = "12px";
  box.style.overflow = "auto";
  box.style.fontSize = "13px";
  box.style.whiteSpace = "pre-wrap";

  const usuario = firebase.auth().currentUser;

  box.textContent =
    "DEBUG LOGIN\n\n" +
    "URL: " + location.href + "\n\n" +
    "Host: " + location.hostname + "\n\n" +
    "UserAgent: " + navigator.userAgent + "\n\n" +
    "Online: " + navigator.onLine + "\n\n" +
    "auth.currentUser: " + (usuario ? usuario.email : "null") + "\n\n" +
    "localStorage loginRedirectPendente: " + localStorage.getItem("loginRedirectPendente") + "\n\n" +
    "authDomain: " + firebase.app().options.authDomain + "\n\n";

  const fechar = document.createElement("button");
  fechar.textContent = "Fechar";
  fechar.style.marginTop = "12px";
  fechar.onclick = () => box.remove();

  box.appendChild(fechar);
  document.body.appendChild(box);
}

window.addEventListener("load", () => {
  if (location.search.includes("debug=1")) {
    setTimeout(mostrarDebugLogin, 1000);
  }
});

/* ===== PATCH ESTÁVEL ===== */

let intervaloRolagem = null;
let velocidadeRolagem = 3;

function mostrarCifra() {

 const inicio =
 document.getElementById("telaInicio");

 const cifra =
 document.getElementById("telaCifra");

 if(inicio) inicio.style.display="none";

 if(cifra) cifra.style.display="block";

 document.body.classList.add(
   "visualizando-cifra"
 );
}


function toggleRolagemAutomatica(){
  if (scrollAutomatico) {
    pararRolagemAutomatica();
  } else {
    iniciarRolagemAutomatica();
  }
}

function iniciarRolagemAutomatica(){
  pararRolagemAutomatica();

  scrollAutomatico = true;

  intervaloRolagem = setInterval(()=>{
    window.scrollBy(0,velocidadeRolagem);
  },40);

  document.getElementById("btn-scroll-palco")?.replaceChildren(document.createTextNode("⏸"));
}

function pararRolagemAutomatica(){
  scrollAutomatico = false;

  if(intervaloRolagem){
    clearInterval(intervaloRolagem);
    intervaloRolagem = null;
  }

  document.getElementById("btn-scroll-palco")?.replaceChildren(document.createTextNode("▶"));
}

function aumentarVelocidadeRolagem(){
  velocidadeRolagem = Math.min(10,velocidadeRolagem+1);
}

function diminuirVelocidadeRolagem(){
  velocidadeRolagem = Math.max(1,velocidadeRolagem-1);
}



function toggleModoPalco() {
  modoPalcoAtivo = !modoPalcoAtivo;

  document.body.classList.toggle("modo-palco", modoPalcoAtivo);

  if (modoPalcoAtivo) {
    iniciarControlesPalco();
  } else {
    pararRolagemAutomatica();
    document.getElementById("controlePalco")?.remove();
  }
}

function iniciarControlesPalco() {
  document.getElementById("controlePalco")?.remove();

  const controle = document.createElement("div");
  controle.id = "controlePalco";

  controle.innerHTML = `
    <button id="btn-scroll-palco" onclick="toggleRolagemAutomatica()">▶</button>
    <button onclick="diminuirVelocidadeRolagem()">−</button>
    <button onclick="aumentarVelocidadeRolagem()">+</button>
    <button class="setlist-only" onclick="musicaAnteriorSetlist()">⬅️</button>
    <button class="setlist-only" onclick="proximaMusicaSetlist()">➡️</button>
    <button onclick="toggleModoPalco()">✕</button>
  `;

  document.body.appendChild(controle);
}

async function carregarInicio() {
  const boxRecentes = document.getElementById("inicioRecentes");
  const boxFavoritas = document.getElementById("inicioFavoritas");
  const boxSetlists = document.getElementById("inicioSetlists");

  if (!boxRecentes || !boxFavoritas || !boxSetlists) return;

  const [musicas, setlists] = await Promise.all([
    buscarMusicasOnlineOuOffline(),
    buscarSetlistsOnlineOuOffline()
  ]);

  function montarListaMusicas(ids, vazio) {
    const itens = ids
      .map(id => musicas.find(m => m.id === id))
      .filter(Boolean)
      .slice(0, 5);

    if (!itens.length) return `<div class="empty-state">${vazio}</div>`;

    return `<div class="inicio-compacto">${itens.map(m => `
      <button onclick="abrir('${m.id}')">
        ${escapeHtml(m.titulo || "Sem título")}<br>
        <small>${escapeHtml(m.artista || "Artista não informado")}</small>
      </button>
    `).join("")}</div>`;
  }

  boxRecentes.innerHTML = montarListaMusicas(obterRecentes(), "Nenhuma música recente.");
  boxFavoritas.innerHTML = montarListaMusicas(obterFavoritos(), "Nenhuma música favoritada.");

  const setlistsRecentes = setlists.slice(0, 5);
  boxSetlists.innerHTML = setlistsRecentes.length
    ? `<div class="inicio-compacto">${setlistsRecentes.map(s => `
        <button onclick="abrirPainel('setlists'); abrirSetlist('${s.id}')">
          ${escapeHtml(s.nome || "Setlist sem nome")}<br>
          <small>${(s.musicas || []).length} música(s)</small>
        </button>
      `).join("")}</div>`
    : `<div class="empty-state">Nenhuma setlist recente.</div>`;
}

function abrirInicio() {
  const inicio = document.getElementById("telaInicio");
  const cifra = document.getElementById("telaCifra");

  if (inicio) inicio.style.display = "block";
  if (cifra) cifra.style.display = "none";

  fecharPainel();
  carregarInicio();
}

function continuarUltimaMusica() {
  const recentes = obterRecentes();

  if (!recentes.length) {
    alert("Nenhuma música recente.");
    return;
  }

  abrir(recentes[0]);
}

function retomarSetlistEmAndamento() {
  const id = localStorage.getItem("setlistEmAndamentoId");

  if (!id) {
    alert("Nenhuma setlist em andamento.");
    return;
  }

  abrirPainel("setlists");
  abrirSetlist(id);
}

async function abrirProximaDaSetlistEmAndamento() {
  const id = localStorage.getItem("setlistEmAndamentoId");

  if (!id) {
    alert("Nenhuma setlist em andamento.");
    return;
  }

  if (!setlistAtualIds.length) {
    await abrirSetlist(id);
  }

  await proximaMusicaSetlist();
}

function aplicarFundoSelecionado() {
  const select = document.getElementById("bgSelect");
  if (!select) return;

  document.body.classList.remove(
    "light-theme",
    "bg-pastel-green",
    "bg-pastel-blue",
    "bg-pastel-pink",
    "bg-pastel-yellow",
    "bg-strong-purple",
    "bg-strong-blue",
    "bg-strong-green",
    "bg-strong-red"
  );

  const valor = select.value;

  if (valor === "light") {
    document.body.classList.add("light-theme");
  }

  if (valor && valor !== "dark" && valor !== "light") {
    document.body.classList.add("bg-" + valor);
  }

  localStorage.setItem("transpositor-bg", valor);
}

window.addEventListener("load", () => {
  const bgSalvo = localStorage.getItem("transpositor-bg");

  if (bgSalvo) {
    const select = document.getElementById("bgSelect");

    if (select) {
      select.value = bgSalvo;
      aplicarFundoSelecionado();
    }
  }
});

window.login = login;
window.loginGoogle = loginGoogle;
window.logout = logout;