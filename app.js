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

    const notas = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

const equivalencias = {
 "Do": "C", "Re": "D", "Mi": "E", "Fa": "F", "Sol": "G", "La": "A", "Si": "B",
 "Db": "C#", "C#": "C#",
 "D#": "Eb", "Eb": "Eb",
 "Gb": "F#", "F#": "F#",
 "G#": "Ab", "Ab": "Ab",
 "A#": "Bb", "Bb": "Bb",
 "Cb": "B", "B#": "C", "Fb": "E", "E#": "F"
};

const regexAcorde = /^([A-G](?:#|b)?)(.*)$/;
const regexAcordeNaLinha = /(^|[\s([{|])([A-G](?:#|b)?(?:maj|min|m|dim|aug|sus|add|alt|M|°|ø|\+|-)?(?:\d+)?(?:\([^)]+\))?(?:[#b+\-]\d+)?(?:\/[A-G](?:#|b)?)?)(?=$|[\s)\]}|.,;:])/g;

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
  return equivalencias[nota] || nota;
}

function transporNota(nota, passos) {
  const notaNormalizada = normalizarNota(nota);
  const indice = notas.indexOf(notaNormalizada);

  if (indice === -1) return nota;

  return notas[(indice + passos + 120) % 12];
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

  const regexAcordeCompleto =
    /^([A-G](?:#|b)?(?:maj|min|m|dim|aug|sus|add|alt|M|°|ø|\+|-)?(?:\d+)?(?:\([^)]+\))?(?:[#b+\-]\d+)?(?:\/[A-G](?:#|b)?)?)$/;

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

  const regexTom =
    /[A-G](?:#|b)?(?:(?:m|maj|min|dim|aug|sus|add|alt|M|ø|°|\+|-)?[0-9M#b+\-()]*)*(?:\/(?:[A-G](?:#|b)?|[0-9]+))?/g;

  for (const linha of linhas) {
    if (linhaPareceCifra(linha)) {
      const acordes = linha.match(/[A-G](?:#|b)?(?:maj|min|m|dim|aug|sus|add|alt|M|°|ø|\+|-)?(?:\d+)?(?:\([^)]+\))?/g);

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
      output.innerHTML = processar(original, semitons);
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
    const authRef = window.auth || auth;
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    await authRef.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    const resultado = await authRef.signInWithPopup(provider);
    console.log("Login realizado:", resultado.user?.email || resultado.user?.uid);
  } catch (erro) {
    console.error("Erro no login:", erro);

    if (erro && (erro.code === "auth/popup-blocked" || erro.code === "auth/cancelled-popup-request")) {
      try {
        const authRef = window.auth || auth;
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        await authRef.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        await authRef.signInWithRedirect(provider);
        return;
      } catch (erroRedirect) {
        console.error("Erro no redirect:", erroRedirect);
        alert("Erro no login: " + erroRedirect.message);
        return;
      }
    }

    alert("Erro no login: " + (erro?.message || erro));
  }
}

function loginGoogle() {
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

async function abrir(id) {
  let m = null;

  if (navigator.onLine) {
    try {
      const doc = await db.collection("musicas").doc(id).get();

      if (doc.exists) {
        m = { id: doc.id, ...doc.data() };
      }
    } catch (erro) {
      console.log("Falha online. Tentando offline.");
    }
  }

  if (!m) {
    const offline = carregarMusicasOffline();
    m = offline.find(item => item.id === id);
  }

  if (!m) {
    alert("Música não encontrada offline.");
    return;
  }

  musicaAbertaId = id;
  history.replaceState(null, "", `?musica=${id}`);
  salvarRecente(id);
  original = m.musica || "";
  semitons = 0;

if (user) {
  try {
    const tomDoc = await db
      .collection("usuarios")
      .doc(user.uid)
      .collection("tons")
      .doc(id)
      .get();

    if (tomDoc.exists) {
      semitons = tomDoc.data().semitons || 0;
    }
  } catch (erro) {
    console.log("Tom personalizado não carregado.");
  }
}

salvarRecente(id);

  atualizarCabecalhoMusica(
  m.titulo || "",
  m.artista || "",
  m.capo || "",
  m.youtube || "",
  m.tom || ""
);

  atualizarVisualizacao();

  window.scrollTo({ top: 0, behavior: "smooth" });
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
  if (!user && !estaOffline()) {
    listaTodasMusicas.innerHTML = "";
    listaTodasMusicasVazia.textContent = "Faça login para ver as músicas.";
    listaTodasMusicasVazia.style.display = "block";
    return;
  }

  listaTodasMusicas.innerHTML = "Carregando músicas...";
  listaTodasMusicasVazia.style.display = "none";

  const termo = normalizarTexto(buscaTodasMusicas.value || "");
  const musicasBase = await buscarMusicasOnlineOuOffline();

  if (!musicasBase.length) {
    listaTodasMusicas.innerHTML = "";
    listaTodasMusicasVazia.textContent = estaOffline()
      ? "Nenhuma música salva offline. Abra o app com internet e clique em Músicas uma vez."
      : "Nenhuma música encontrada.";
    listaTodasMusicasVazia.style.display = "block";
    return;
  }

  const musicas = [];
const favoritos = obterFavoritos();
const recentes = obterRecentes();

  musicasBase.forEach(m => {
    const genero = m.genero || "";

const generoMatch = !generoSelecionado || genero === generoSelecionado;
const termoMatch = musicaCombinaComBusca(m, termo);
    
    const tipoMatch =
  tipoFiltroMusica === "todas" ||
  (tipoFiltroMusica === "favoritas" && favoritos.includes(m.id)) ||
  (tipoFiltroMusica === "recentes" && recentes.includes(m.id));

    if (generoMatch && termoMatch && tipoMatch) {
      musicas.push(m);
    }
  });

  musicas.sort((a, b) => (a.titulo || "").localeCompare(b.titulo || "", "pt-BR"));

  listaTodasMusicas.innerHTML = "";

  if (!musicas.length) {
    listaTodasMusicasVazia.textContent = "Nenhuma música encontrada.";
    listaTodasMusicasVazia.style.display = "block";
    return;
  }

  musicas.forEach(m => {
    const div = document.createElement("div");
    div.className = "song-item";

    const podeEditar = podeEditarMusica(m);
    const podeExcluir = podeExcluirMusica(m);

    div.innerHTML = `
      <div class="song-item-title">${escapeHtml(m.titulo || "Sem título")}</div>
      <div class="song-item-artist">${escapeHtml(m.artista || "Artista não informado")}</div>
      <div class="song-item-author">Gênero: ${escapeHtml(m.genero || "Não informado")}</div>
      <div class="song-item-author">Pasta: ${escapeHtml(m.pastaNome || "Sem pasta")}</div>

      <div class="result-actions">
        <button onclick="abrir('${m.id}'); fecharPainel();">Abrir</button>
        ${podeEditar ? `<button onclick="editar('${m.id}'); fecharPainel();">Editar</button>` : ""}
        ${podeEditar ? `<button onclick="moverParaPasta('${m.id}')">Mover pasta</button>` : ""}
        ${podeExcluir ? `<button class="danger" onclick="excluirMusica('${m.id}')">Excluir</button>` : ""}
      </div>
    `;

    listaTodasMusicas.appendChild(div);
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
  alert(favorito ? "Música adicionada aos favoritos." : "Música removida dos favoritos.");
}

let modoPalcoAtivo = false;
let scrollAutomatico = null;
let velocidadeRolagem = 2;

function toggleModoPalco() {
  modoPalcoAtivo = !modoPalcoAtivo;

  document.body.classList.toggle("modo-palco", modoPalcoAtivo);

  if (modoPalcoAtivo) {
    iniciarControlesPalco();
  } else {
    pararRolagemAutomatica();
    removerControlesPalco();
  }
}

function iniciarControlesPalco() {
  if (document.getElementById("controlePalco")) return;

  const controle = document.createElement("div");
  controle.id = "controlePalco";

  controle.style.position = "fixed";
  controle.style.left = "50%";
  controle.style.bottom = "14px";
  controle.style.transform = "translateX(-50%)";
  controle.style.zIndex = "5000";
  controle.style.display = "flex";
  controle.style.gap = "8px";
  controle.style.flexWrap = "wrap";
  controle.style.alignItems = "center";
  controle.style.opacity = "1";
  controle.style.transition = "opacity .25s ease";

  controle.innerHTML = `
    <button id="btn-scroll-palco" onclick="iniciarRolagemAutomatica()">▶ Rolar</button>
    <button onclick="pararRolagemAutomatica()">⏸</button>
    <label style="display:flex;align-items:center;gap:6px;color:var(--text);font-size:13px;">
      Vel.
      <input type="range" min="1" max="6" value="${velocidadeRolagem}"
        oninput="ajustarVelocidadeRolagem(this.value)"
        style="width:90px;margin:0;">
    </label>
    <button onclick="musicaAnteriorSetlist()">⬅️</button>
    <button onclick="proximaMusicaSetlist()">➡️</button>
    <button onclick="toggleModoPalco()">❌</button>
  `;

  document.body.appendChild(controle);

  setTimeout(() => {
    if (document.body.classList.contains("modo-palco")) {
      controle.style.opacity = "0.25";
    }
  }, 4000);

  controle.addEventListener("mouseenter", () => {
    controle.style.opacity = "1";
  });

  controle.addEventListener("mouseleave", () => {
    controle.style.opacity = "0.25";
  });
}

function obterVelocidadeScroll() {
  const v = Number(velocidadeRolagem || 2);
  const mapa = { 1: 80, 2: 55, 3: 38, 4: 25, 5: 16, 6: 9 };
  return mapa[v] || 55;
}

function ajustarVelocidadeRolagem(valor) {
  velocidadeRolagem = Number(valor || 2);
  if (scrollAutomatico) iniciarRolagemAutomatica();
}

function removerControlesPalco() {
  document.getElementById("controlePalco")?.remove();
}

let scrollAnimationId = null; // Guarda o identificador da animação fluida

function iniciarRolagemAutomatica() {
  if (scrollAnimationId) cancelAnimationFrame(scrollAnimationId);
  scrollAutomatico = true;
  const btnScrollPalco = document.getElementById("btn-scroll-palco");
  if (btnScrollPalco) btnScrollPalco.innerHTML = "⏸ Pausar";
  
  const velocidade = obterVelocidadeScroll();
  // Quanto menor a velocidade selecionada, mais tempo espera para mover
  let ultimaExecucao = performance.now();

  function darPassoDeRolagem(tempoAtual) {
    if (!scrollAutomatico) return;

    // Controla o ritmo baseado na velocidade escolhida pelo usuário
    if (tempoAtual - ultimaExecucao >= velocidade) {
      window.scrollBy(0, 1);
      ultimaExecucao = tempoAtual;
    }

    // Pede ao navegador para rodar o próximo frame de forma suave
    scrollAnimationId = requestAnimationFrame(darPassoDeRolagem);
  }

  scrollAnimationId = requestAnimationFrame(darPassoDeRolagem);
}

function pararRolagemAutomatica() {
  scrollAutomatico = false;
  if (scrollAnimationId) {
    cancelAnimationFrame(scrollAnimationId);
    scrollAnimationId = null;
  }
  const btnScrollPalco = document.getElementById("btn-scroll-palco");
  if (btnScrollPalco) btnScrollPalco.innerHTML = "▶ Rolar";
}

function carregarSetlistsOffline() {
  try {
    return JSON.parse(localStorage.getItem("transpositor-setlists-offline") || "[]");
  } catch {
    return [];
  }
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

  const payload = {
    nome: nome.trim(),
    musicas: []
  };

  try {
    await db.collection("setlists").add({
      ...payload,
      uid: user.uid,
      autorNome: user.displayName || user.email || "Usuário",
      autorEmail: user.email || "",
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });

    await carregarPainelSetlists();
    alert("Setlist criada.");
  } catch (erro) {
    adicionarNaFilaOffline({
      tipo: "criarSetlist",
      payload
    });

    const setlistOffline = {
      id: "offline-setlist-" + Date.now(),
      ...payload,
      uid: user.uid,
      autorNome: user.displayName || user.email || "Usuário",
      autorEmail: user.email || ""
    };

    const setlists = await carregarColecaoOffline("setlists");
    await salvarColecaoOffline("setlists", [...setlists, setlistOffline]);

    await carregarPainelSetlists();

    alert("Sem internet. Setlist salva offline e será sincronizada depois.");
  }
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

  const minhas = setlists
    .filter(s => !user || s.uid === user.uid || ehAdmin() || ehEditora())
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));

  listaSetlists.innerHTML = "";

  if (!minhas.length) {
    listaSetlistsVazia.textContent = estaOffline()
      ? "Nenhuma setlist salva offline."
      : "Nenhuma setlist criada ainda.";
    listaSetlistsVazia.style.display = "block";
    return;
  }

  minhas.forEach(setlist => {
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
history.replaceState(null, "", `?setlist=${setlistId}`);  
const setlists = await buscarSetlistsOnlineOuOffline();
  const setlist = setlists.find(s => s.id === setlistId);

  if (!setlist) {
    alert("Setlist não encontrada.");
    return;
  }

  tituloMusicasDaSetlist.textContent = `Músicas em: ${setlist.nome || "Setlist"}`;
  listaMusicasDaSetlist.innerHTML = "Carregando músicas...";
  listaMusicasDaSetlistVazia.style.display = "none";

  const musicasBase = await buscarMusicasOnlineOuOffline();
  const ids = setlist.musicas || [];
 setlistAtualIds = ids;
 setlistAtualIndice = -1;

  const musicas = ids
    .map(id => musicasBase.find(m => m.id === id))
    .filter(Boolean);

  listaMusicasDaSetlist.innerHTML = "";

  if (!musicas.length) {
    listaMusicasDaSetlistVazia.textContent = "Nenhuma música nesta setlist.";
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

    function atualizarAreaAuth(u) {
  if (u) {
    loginBtn.style.display = "none";

    profileTopBox.classList.add("visible");
    profilePhotoTop.src = u.photoURL || "https://via.placeholder.com/52?text=U";
    profileNameTop.textContent = u.displayName || "Usuária";
    profileEmailTop.textContent = u.email || "";
  } else {
    loginBtn.style.display = "inline-flex";

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


    auth.onAuthStateChanged(async (u) => {
      user = u || null;
      usuarioAtual = u || null;
      roleAtual = "user";

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
              role: "user",
              criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
              ultimoLogin: firebase.firestore.FieldValue.serverTimestamp()
            });

            roleAtual = "user";
            console.log("Usuário criado com sucesso");
          } else {
            const dadosUsuario = doc.data();
            roleAtual = dadosUsuario.role || "user";

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
      navigator.serviceWorker.register("./sw.js?v=8").catch(console.error);
    }

window.addEventListener("online", async () => {
  console.log("Internet voltou. Sincronizando...");
  await sincronizarFilaOffline();
  await carregarLista();
});
/* =========================================================
   CORREÇÕES 2026-05-22: login mobile, barra da cifra,
   rolagem automática, botões de setlist e fundos do app.
   ========================================================= */
(function () {
  const abrirBase = window.abrir;
  const abrirMusicaDaSetlistBase = window.abrirMusicaDaSetlist;
  const proximaBase = window.proximaMusicaSetlist;
  const anteriorBase = window.musicaAnteriorSetlist;

  function isMobileLogin() {
    return window.matchMedia("(max-width: 768px)").matches ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      window.matchMedia("(display-mode: standalone)").matches;
  }

  window.login = async function login() {
    try {
      const authRef = window.auth || auth;
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await authRef.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

      // Celular e PWA: redirect é mais confiável que popup.
      if (isMobileLogin()) {
        await authRef.signInWithRedirect(provider);
        return;
      }

      const resultado = await authRef.signInWithPopup(provider);
      console.log("Login realizado:", resultado.user?.email || resultado.user?.uid);
    } catch (erro) {
      console.error("Erro no login por popup:", erro);
      try {
        const authRef = window.auth || auth;
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        await authRef.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        await authRef.signInWithRedirect(provider);
      } catch (erroRedirect) {
        console.error("Erro no login por redirect:", erroRedirect);
        alert("Erro no login: " + (erroRedirect?.message || erroRedirect));
      }
    }
  };

  window.loginGoogle = window.login;

  window.addEventListener("load", async () => {
    try {
      const authRef = window.auth || auth;
      if (authRef && typeof authRef.getRedirectResult === "function") {
        await authRef.getRedirectResult();
      }
    } catch (erro) {
      console.log("Resultado de redirect não disponível:", erro?.code || erro);
    }
  });

  function atualizarBotoesSetlist() {
    const ativa = Array.isArray(window.setlistAtualIds)
      ? window.setlistAtualIds.length > 0
      : (typeof setlistAtualIds !== "undefined" && setlistAtualIds.length > 0);

    document.body.classList.toggle("tem-setlist-ativa", !!ativa);
  }

  window.abrirMusicaDaSetlist = async function abrirMusicaDaSetlistCorrigida(id) {
    if (typeof setlistAtualIds !== "undefined") {
      setlistAtualIndice = setlistAtualIds.indexOf(id);
    }
    document.body.classList.add("tem-setlist-ativa");

    if (typeof abrirBase === "function") {
      await abrirBase(id);
    }
  };

  window.proximaMusicaSetlist = async function proximaMusicaSetlistCorrigida() {
    atualizarBotoesSetlist();
    if (typeof proximaBase === "function") {
      await proximaBase();
    }
  };

  window.musicaAnteriorSetlist = async function musicaAnteriorSetlistCorrigida() {
    atualizarBotoesSetlist();
    if (typeof anteriorBase === "function") {
      await anteriorBase();
    }
  };

  window.toggleRolagemAutomatica = function toggleRolagemAutomatica() {
    if (scrollAutomatico) {
      window.pararRolagemAutomatica();
    } else {
      window.iniciarRolagemAutomatica();
    }
  };

  window.obterVelocidadeScroll = function obterVelocidadeScrollCorrigida() {
    const v = Number(typeof velocidadeRolagem !== "undefined" ? velocidadeRolagem : 2);
    const mapa = { 1: 90, 2: 60, 3: 40, 4: 25, 5: 14, 6: 8 };
    return mapa[v] || 60;
  };

  window.iniciarRolagemAutomatica = function iniciarRolagemAutomaticaCorrigida() {
    if (scrollAnimationId) cancelAnimationFrame(scrollAnimationId);
    scrollAutomatico = true;

    const btns = [
      document.getElementById("btnAutoScroll"),
      document.getElementById("btn-scroll-palco")
    ];
    btns.forEach(btn => {
      if (btn) btn.innerHTML = "⏸ Pausar";
    });

    const intervalo = window.obterVelocidadeScroll();
    let ultimaExecucao = performance.now();

    function passo(agora) {
      if (!scrollAutomatico) return;

      if (agora - ultimaExecucao >= intervalo) {
        window.scrollBy(0, 1);
        ultimaExecucao = agora;
      }

      scrollAnimationId = requestAnimationFrame(passo);
    }

    scrollAnimationId = requestAnimationFrame(passo);
  };

  window.pararRolagemAutomatica = function pararRolagemAutomaticaCorrigida() {
    scrollAutomatico = false;
    if (scrollAnimationId) {
      cancelAnimationFrame(scrollAnimationId);
      scrollAnimationId = null;
    }

    const btns = [
      document.getElementById("btnAutoScroll"),
      document.getElementById("btn-scroll-palco")
    ];
    btns.forEach(btn => {
      if (btn) btn.innerHTML = "▶ Rolar";
    });
  };

  window.ajustarVelocidadeRolagem = function ajustarVelocidadeRolagemCorrigida(valor) {
    velocidadeRolagem = Number(valor || 2);
    if (scrollAutomatico) window.iniciarRolagemAutomatica();
  };

  // Atualiza os controles do modo palco para usar o botão único de rolagem.
  window.iniciarControlesPalco = function iniciarControlesPalcoCorrigido() {
    if (document.getElementById("controlePalco")) return;

    const controle = document.createElement("div");
    controle.id = "controlePalco";
    controle.style.position = "fixed";
    controle.style.left = "50%";
    controle.style.bottom = "14px";
    controle.style.transform = "translateX(-50%)";
    controle.style.zIndex = "5000";
    controle.style.display = "flex";
    controle.style.gap = "8px";
    controle.style.flexWrap = "wrap";
    controle.style.alignItems = "center";
    controle.style.opacity = "1";
    controle.style.transition = "opacity .25s ease";

    const botoesSetlist = document.body.classList.contains("tem-setlist-ativa")
      ? `<button onclick="musicaAnteriorSetlist()">⬅️</button><button onclick="proximaMusicaSetlist()">➡️</button>`
      : "";

    controle.innerHTML = `
      <button id="btn-scroll-palco" onclick="toggleRolagemAutomatica()">▶ Rolar</button>
      <label style="display:flex;align-items:center;gap:6px;color:var(--text);font-size:13px;">
        Vel.
        <input type="range" min="1" max="6" value="${velocidadeRolagem || 2}"
          oninput="ajustarVelocidadeRolagem(this.value)"
          style="width:90px;margin:0;">
      </label>
      ${botoesSetlist}
      <button onclick="toggleModoPalco()">❌</button>
    `;

    document.body.appendChild(controle);

    setTimeout(() => {
      if (document.body.classList.contains("modo-palco")) controle.style.opacity = "0.25";
    }, 4000);

    controle.addEventListener("mouseenter", () => controle.style.opacity = "1");
    controle.addEventListener("mouseleave", () => controle.style.opacity = "0.25");
  };

  function limparClassesFundo() {
    document.body.classList.remove(
      "bg-pastel-green", "bg-pastel-blue", "bg-pastel-pink", "bg-pastel-yellow",
      "bg-strong-purple", "bg-strong-blue", "bg-strong-green", "bg-strong-red"
    );
  }

  const obterPreferenciasBase = window.obterPreferencias;
  window.obterPreferencias = function obterPreferenciasCorrigida() {
    const prefs = typeof obterPreferenciasBase === "function"
      ? obterPreferenciasBase()
      : {};

    return {
      theme: prefs.theme || "dark",
      accent: prefs.accent || "#22c55e",
      fontScale: prefs.fontScale || 0,
      background: prefs.background || prefs.bg || prefs.theme || "dark"
    };
  };

  const aplicarPreferenciasBase = window.aplicarPreferenciasNaTela;
  window.aplicarPreferenciasNaTela = function aplicarPreferenciasNaTelaCorrigida(prefs) {
    prefs = prefs || window.obterPreferencias();

    if (typeof aplicarPreferenciasBase === "function") {
      aplicarPreferenciasBase(prefs);
    }

    limparClassesFundo();

    if (prefs.background && !["dark", "light"].includes(prefs.background)) {
      document.body.classList.add("bg-" + prefs.background);
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.toggle("light-theme", prefs.background === "light" || prefs.theme === "light");
    }

    const bgSelect = document.getElementById("bgSelect");
    if (bgSelect) bgSelect.value = prefs.background || prefs.theme || "dark";
  };

  const salvarPreferenciasBase = window.salvarPreferencias;
  window.salvarPreferencias = async function salvarPreferenciasCorrigida(prefs) {
    prefs = { ...window.obterPreferencias(), ...(prefs || {}) };

    if (typeof salvarPreferenciasBase === "function") {
      return salvarPreferenciasBase(prefs);
    }

    localStorage.setItem("transpositor-preferencias", JSON.stringify(prefs));
  };

  window.aplicarFundoSelecionado = async function aplicarFundoSelecionado() {
    const prefs = window.obterPreferencias();
    const bgSelect = document.getElementById("bgSelect");
    prefs.background = bgSelect ? bgSelect.value : "dark";
    prefs.theme = prefs.background === "light" ? "light" : "dark";
    await window.salvarPreferencias(prefs);
    window.aplicarPreferenciasNaTela(prefs);
  };

  window.alternarTemaRapido = async function alternarTemaRapidoCorrigida() {
    const prefs = window.obterPreferencias();
    prefs.background = (prefs.background === "light") ? "dark" : "light";
    prefs.theme = prefs.background;
    await window.salvarPreferencias(prefs);
    window.aplicarPreferenciasNaTela(prefs);
  };

  window.addEventListener("load", () => {
    window.aplicarPreferenciasNaTela(window.obterPreferencias());
    document.body.classList.remove("tem-setlist-ativa");
  });
})();
