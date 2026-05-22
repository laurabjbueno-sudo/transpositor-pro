// app.js

// ==========================================
// 1. VARIÁVEIS GLOBAIS DE INTERFACE E ESTADO
// ==========================================
window.musicasOriginais = [];
window.pastasOriginais = [];
window.setlistsOriginais = [];

let musicaAbertaId = null;
let setlistAbertaId = null;
let original = "";
let semitons = 0;
let editId = null;
let editPastaId = null;
let editSetlistId = null;
let scrollAutomatico = false;
let scrollAnimationId = null; 
let modoPalcoAtivo = false;
let wakeLock = null;

// Elementos do DOM frequentemente utilizados
const listaMusicas = document.getElementById("lista-musicas");
const painelMusica = document.getElementById("painel-musica");
const painelMusicas = document.getElementById("painel-musicas");
const painelPastas = document.getElementById("painel-pastas");
const painelSetlists = document.getElementById("painel-setlists");
const tituloMusica = document.getElementById("titulo-musica");
const artistaMusica = document.getElementById("artista-musica");
const capoMusica = document.getElementById("capo-musica");
const youtubeMusica = document.getElementById("youtube-musica");
const tomMusica = document.getElementById("tom-musica");
const conteudoMusica = document.getElementById("conteudo-musica");
const busca = document.getElementById("busca");

// Helper seguro para obter o usuário logado
function obterUsuarioAtual() {
  return window.user || (window.auth ? window.auth.currentUser : null);
}

// ==========================================
// 2. FUNÇÕES DE SUPORTE OFFLINE (IndexedDB)
// ==========================================
async function salvarColecaoOffline(nomeColecao, dados) {
  try {
    if (typeof window.abrirBancoOffline !== "function") return;
    const dbIDB = await window.abrirBancoOffline();
    const tx = dbIDB.transaction(nomeColecao, "readwrite");
    const store = tx.objectStore(nomeColecao);
    await store.clear();
    for (const item of dados) {
      await store.put(item);
    }
  } catch (e) {
    console.error("Erro ao salvar no IndexedDB:", nomeColecao, e);
  }
}

async function carregarColecaoOffline(nomeColecao) {
  try {
    if (typeof window.abrirBancoOffline !== "function") return [];
    const dbIDB = await window.abrirBancoOffline();
    return new Promise((resolve) => {
      const tx = dbIDB.transaction(nomeColecao, "readonly");
      const store = tx.objectStore(nomeColecao);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    console.error("Erro ao carregar do IndexedDB:", nomeColecao, e);
    return [];
  }
}

function carregarMusicasOffline() {
  try { return JSON.parse(localStorage.getItem("musicas_offline")) || []; } catch { return []; }
}
function salvarMusicasOffline(arr) {
  localStorage.setItem("musicas_offline", JSON.stringify(arr));
}
function carregarPastasOffline() {
  try { return JSON.parse(localStorage.getItem("pastas_offline")) || []; } catch { return []; }
}
function salvarPastasOffline(arr) {
  localStorage.setItem("pastas_offline", JSON.stringify(arr));
}
function carregarSetlistsOffline() {
  try { return JSON.parse(localStorage.getItem("setlists_offline")) || []; } catch { return []; }
}
function salvarSetlistsOffline(arr) {
  localStorage.setItem("setlists_offline", JSON.stringify(arr));
}

function carregarFilaOffline() {
  try { return JSON.parse(localStorage.getItem("fila_offline")) || []; } catch { return []; }
}
function salvarFilaOffline(fila) {
  localStorage.setItem("fila_offline", JSON.stringify(fila));
}
function adicionarNaFilaOffline(acao) {
  const fila = carregarFilaOffline();
  fila.push(acao);
  salvarFilaOffline(fila);
}

async function sincronizarFilaOffline() {
  const usuarioLogado = obterUsuarioAtual();
  if (!navigator.onLine || !usuarioLogado || !window.db) return;
  const fila = carregarFilaOffline();
  if (fila.length === 0) return;

  console.log(`Sincronizando ${fila.length} ações pendentes...`);
  const filaRestante = [];

  for (const acao of fila) {
    try {
      if (acao.tipo === "criarMusica") {
        const payload = { ...acao.payload };
        delete payload.id;
        delete payload.criadoEmLocal;
        payload.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
        await window.db.collection("musicas").add(payload);
      } else if (acao.tipo === "editarMusica") {
        await window.db.collection("musicas").doc(acao.id).update(acao.payload);
      } else if (acao.tipo === "deletarMusica") {
        await window.db.collection("musicas").doc(acao.id).delete();
      } else if (acao.tipo === "criarPasta") {
        const payload = { ...acao.payload };
        delete payload.id;
        await window.db.collection("pastas").add(payload);
      } else if (acao.tipo === "deletarPasta") {
        await window.db.collection("pastas").doc(acao.id).delete();
      } else if (acao.tipo === "criarSetlist") {
        const payload = { ...acao.payload };
        delete payload.id;
        await window.db.collection("setlists").add(payload);
      } else if (acao.tipo === "editarSetlist") {
        await window.db.collection("setlists").doc(acao.id).update(acao.payload);
      } else if (acao.tipo === "deletarSetlist") {
        await window.db.collection("setlists").doc(acao.id).delete();
      }
    } catch (e) {
      console.error("Erro ao sincronizar ação, mantendo na fila:", acao, e);
      filaRestante.push(acao);
    }
  }

  salvarFilaOffline(filaRestante);
}

async function sincronizarMusicasOffline() {
  const usuarioLogado = obterUsuarioAtual();
  if (navigator.onLine && usuarioLogado && window.db) {
    try {
      const snap = await window.db.collection("musicas").where("uid", "==", usuarioLogado.uid).get();
      const list = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      window.musicasOriginais = list;
      salvarMusicasOffline(list);
      await salvarColecaoOffline("musicas", list);
    } catch (e) {
      console.error("Erro ao puxar músicas online:", e);
      window.musicasOriginais = await carregarColecaoOffline("musicas");
    }
  } else {
    window.musicasOriginais = await carregarColecaoOffline("musicas");
  }
  carregarListaMemoria();
}

// ==========================================
// 3. LOGICA DE INTERFACE, MENUS E INTERAÇÕES
// ==========================================
function normalizarTexto(str) {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function carregarListaMemoria() {
  if (!listaMusicas) return;
  const tBusca = normalizarTexto(busca ? busca.value : "");
  let filtradas = window.musicasOriginais || [];

  if (tBusca) {
    filtradas = filtradas.filter(m => {
      const tit = m.tituloNormalizado || normalizarTexto(m.titulo);
      const art = m.artistaNormalizado || normalizarTexto(m.artista);
      return tit.includes(tBusca) || art.includes(tBusca);
    });
  }

  filtradas.sort((a, b) => a.titulo.localeCompare(b.titulo));

  listaMusicas.innerHTML = "";
  if (filtradas.length === 0) {
    listaMusicas.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>Nenhuma música encontrada.</p></div>';
    return;
  }

  filtradas.forEach(m => {
    const item = document.createElement("div");
    item.className = "musica-item";
    item.onclick = () => abrir(m.id);
    item.innerHTML = `
      <div class="musica-info-block">
        <span class="musica-titulo">${m.titulo}</span>
        <span class="musica-artista">${m.artista || "Desconhecido"}</span>
      </div>
      <div class="musica-meta-block">
        ${m.tom ? `<span class="badge-tom">${m.tom}</span>` : ""}
      </div>
    `;
    listaMusicas.appendChild(item);
  });
}

async function carregarLista() {
  await sincronizarMusicasOffline();
}

function abrirPainel(id) {
  document.querySelectorAll(".painel-aba").forEach(p => p.classList.remove("visible"));
  document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));

  if (id === "musicas") {
    if (painelMusicas) painelMusicas.classList.add("visible");
    const tab = document.querySelector('.nav-item[onclick*="musicas"]');
    if (tab) tab.classList.add("active");
    carregarListaMemoria();
  } else if (id === "pastas") {
    if (painelPastas) painelPastas.classList.add("visible");
    const tab = document.querySelector('.nav-item[onclick*="pastas"]');
    if (tab) tab.classList.add("active");
    buscarPastasOnlineOuOffline();
  } else if (id === "setlists") {
    if (painelSetlists) painelSetlists.classList.add("visible");
    const tab = document.querySelector('.nav-item[onclick*="setlists"]');
    if (tab) tab.classList.add("active");
    buscarSetlistsOnlineOuOffline();
  }
  window.scrollTo({ top: 0 });
}

function abrirModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("visible");
  document.body.style.overflow = "hidden";
}

function abrirFormularioNovaMusica() {
  abrirFormulario(null);
}

function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("visible");
  document.body.style.overflow = "";
}

function abrirFormulario(id = null) {
  editId = id;
  const tituloModal = document.getElementById("modalTituloAcao");
  const selectPasta = document.getElementById("modalPasta");

  if (selectPasta) {
    selectPasta.innerHTML = '<option value="">Sem pasta (Raiz)</option>';
    (window.pastasOriginais || []).forEach(p => {
      selectPasta.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
    });
  }

  if (id) {
    if (tituloModal) tituloModal.innerText = "Editar Música";
    const m = (window.musicasOriginais || []).find(item => item.id === id);
    if (m) {
      document.getElementById("modalNomeMusica").value = m.titulo || "";
      document.getElementById("modalNomeArtista").value = m.artista || "";
      document.getElementById("modalCapo").value = m.capo || "";
      document.getElementById("modalTom").value = m.tom || "";
      document.getElementById("modalYoutube").value = m.youtube || "";
      document.getElementById("modalGenero").value = m.genero || "";
      document.getElementById("modalPasta").value = m.pastaId || "";
      document.getElementById("modalLetra").value = m.musica || "";
    }
  } else {
    if (tituloModal) tituloModal.innerText = "Nova Música";
    const form = document.getElementById("modalFormData");
    if (form) form.reset();
    if (editPastaId && selectPasta) {
      selectPasta.value = editPastaId;
    }
  }
  abrirModal("modalForm");
}

function fecharFormulario() {
  fecharModal("modalForm");
  editId = null;
}

// ==========================================
// 4. FUNÇÃO SALVAR MODAL
// ==========================================
async function salvarModal() {
  const usuarioLogado = obterUsuarioAtual();
  if (!usuarioLogado) {
    alert("Faça login primeiro.");
    return;
  }

  const btnSalvar = document.querySelector("#modalForm button[type='submit']") || 
                    document.querySelector("#modalForm .primary");

  if (btnSalvar && btnSalvar.disabled) return;

  const modalNomeMusica = document.getElementById("modalNomeMusica");
  const modalNomeArtista = document.getElementById("modalNomeArtista");
  const modalCapo = document.getElementById("modalCapo");
  const modalTom = document.getElementById("modalTom");
  const modalYoutube = document.getElementById("modalYoutube");
  const modalGenero = document.getElementById("modalGenero");
  const modalPasta = document.getElementById("modalPasta");
  const modalLetra = document.getElementById("modalLetra");

  const tituloTexto = modalNomeMusica.value.trim();
  const artistaTexto = modalNomeArtista.value.trim();
  const capoTexto = modalCapo.value.trim();
  let tomTexto = modalTom.value.trim();
  const youtubeTexto = modalYoutube.value.trim();
  const generoTexto = modalGenero.value || "";
  const pastaIdTexto = modalPasta.value || "";
  const pastaNomeTexto = modalPasta.options[modalPasta.selectedIndex]?.text || "Sem pasta";
  const musicaTexto = typeof limparCifraTexto === "function" ? limparCifraTexto(modalLetra.value) : modalLetra.value;

  if (!tomTexto && typeof detectarTom === "function") {
    tomTexto = detectarTom(musicaTexto);
  }

  if (!tituloTexto) { alert("Informe o nome da música."); modalNomeMusica.focus(); return; }
  if (!artistaTexto) { alert("Informe o nome do artista."); modalNomeArtista.focus(); return; }
  if (!musicaTexto) { alert("Cole a letra e cifra da música."); modalLetra.focus(); return; }

  let textoOriginal = "";
  if (btnSalvar) {
    textoOriginal = btnSalvar.innerHTML;
    btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    btnSalvar.disabled = true;
  }

  try {
    const tituloNormalizado = normalizarTexto(tituloTexto);
    const artistaNormalizado = normalizarTexto(artistaTexto);

    let duplicada = false;
    if (window.db) {
      const snap = await window.db.collection("musicas").where("uid", "==", usuarioLogado.uid).get();
      snap.forEach(doc => {
        if (editId && doc.id === editId) return;
        const data = doc.data();
        if (normalizarTexto(data.titulo) === tituloNormalizado && normalizarTexto(data.artista) === artistaNormalizado) {
          duplicada = true;
        }
      });
    }

    if (duplicada) {
      alert("Já existe uma música com esse nome e esse artista.");
      if (btnSalvar) { btnSalvar.innerHTML = textoOriginal; btnSalvar.disabled = false; }
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
      uid: usuarioLogado.uid,
      autorNome: usuarioLogado.displayName || usuarioLogado.email || "Usuário",
      autorEmail: usuarioLogado.email || "",
      tituloNormalizado,
      artistaNormalizado,
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (editId) {
      if (window.db) {
        await window.db.collection("musicas").doc(editId).update(payload);
      }
    } else {
      if (navigator.onLine && window.db) {
        payload.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
        const novaMusicaRef = await window.db.collection("musicas").add(payload);
        musicaAbertaId = novaMusicaRef.id;
      } else {
        const fakeId = "offline-musica-" + Date.now();
        const payloadOffline = { ...payload, id: fakeId, criadoEmLocal: new Date().toISOString() };
        adicionarNaFilaOffline({ tipo: "criarMusica", payload: payloadOffline });
        const musicas = await carregarColecaoOffline("musicas");
        await salvarColecaoOffline("musicas", [...musicas, payloadOffline]);
        musicaAbertaId = fakeId;
      }
    }

    original = musicaTexto;
    semitons = 0;

    atualizarCabecalhoMusica(tituloTexto, artistaTexto, capoTexto, youtubeTexto, tomTexto);
    atualizarVisualizacao();
    fecharFormulario();

    await carregarLista();

  } catch (globalError) {
    console.error("Erro ao salvar:", globalError);
    alert("Ocorreu um erro ao salvar.");
  } finally {
    if (btnSalvar) {
      btnSalvar.innerHTML = textoOriginal;
      btnSalvar.disabled = false;
    }
  }
}

function podeEditarMusica(m) {
  const usuarioLogado = obterUsuarioAtual();
  if (!usuarioLogado) return false;
  if (window.roleAtual === "admin") return true;
  return m.uid === usuarioLogado.uid;
}

// ==========================================
// 5. MANIPULAÇÃO DE EXIBIÇÃO DE MÚSICA & TOM
// ==========================================
function abrir(id) {
  const m = (window.musicasOriginais || []).find(item => item.id === id);
  if (!m) return;

  musicaAbertaId = id;
  original = m.musica;
  semitons = 0;

  atualizarCabecalhoMusica(m.titulo, m.artista, m.capo, m.youtube, m.tom);
  atualizarVisualizacao();

  if (painelMusica) painelMusica.classList.add("visible");
  
  const bEdit = document.getElementById("btn-edit-musica");
  const bDel = document.getElementById("btn-del-musica");
  if (bEdit) bEdit.style.display = podeEditarMusica(m) ? "inline-flex" : "none";
  if (bDel) bDel.style.display = podeEditarMusica(m) ? "inline-flex" : "none";
}

function fecharMusica() {
  pararRolagemAutomatica();
  if (modoPalcoAtivo) toggleModoPalco();
  if (painelMusica) painelMusica.classList.remove("visible");
  musicaAbertaId = null;
}

function atualizarCabecalhoMusica(titulo="", artista="", capo="", youtube="", tom="") {
  if(!tituloMusica) return;
  tituloMusica.innerText = titulo || "Sem título";
  if (artistaMusica) artistaMusica.innerText = artista || "Artista desconhecido";
  if (capoMusica) capoMusica.innerHTML = capo ? `<i class="fas fa-hands"></i> Capo: ${capo}ª casa` : "";
  
  if (youtubeMusica) {
    if (youtube) {
      let yId = youtube;
      if (youtube.includes("v=")) yId = youtube.split("v=")[1].split("&")[0];
      else if (youtube.includes("youtu.be/")) yId = youtube.split("youtu.be/")[1].split("?")[0];
      youtubeMusica.innerHTML = `<a href="https://youtube.com/watch?v=${yId}" target="_blank" rel="noopener"><i class="fab fa-youtube"></i> Ver no YouTube</a>`;
    } else {
      youtubeMusica.innerHTML = "";
    }
  }

  if (tomMusica) {
    if (tom) {
      tomMusica.innerText = typeof transporAcorde === "function" ? transporAcorde(tom, semitons) : tom;
    } else {
      tomMusica.innerText = "N/A";
    }
  }
}

function alterarTom(delta) {
  semitons += delta;
  if (semitons >= 12) semitons -= 12;
  if (semitons <= -12) semitons += 12;

  const m = (window.musicasOriginais || []).find(item => item.id === musicaAbertaId);
  if (m && m.tom && tomMusica && typeof transporAcorde === "function") {
    tomMusica.innerText = transporAcorde(m.tom, semitons);
  }
  atualizarVisualizacao();
}

function atualizarVisualizacao() {
  if (!original || !conteudoMusica) return;

  let txtProcessado = original.replace(/\[ch\]([^\]]+)\[\/ch\]/g, (match, acorde) => {
    const acTransposto = typeof transporAcorde === "function" ? transporAcorde(acorde.trim(), semitons) : acorde;
    return `<span class="chord">${acTransposto}</span>`;
  });

  conteudoMusica.innerHTML = txtProcessado;
}

async function deletarMusica() {
  if (!musicaAbertaId) return;
  if (!confirm("Tem a certeza que deseja eliminar esta música?")) return;

  if (navigator.onLine && window.db) {
    try { await window.db.collection("musicas").doc(musicaAbertaId).delete(); } catch {
      adicionarNaFilaOffline({ tipo: "deletarMusica", id: musicaAbertaId });
    }
  } else {
    adicionarNaFilaOffline({ tipo: "deletarMusica", id: musicaAbertaId });
  }

  const musicas = (window.musicasOriginais || []).filter(m => m.id !== musicaAbertaId);
  window.musicasOriginais = musicas;
  salvarMusicasOffline(musicas);
  await salvarColecaoOffline("musicas", musicas);

  fecharMusica();
  carregarListaMemoria();
}

// ==========================================
// 6. ROLAGEM AUTOMÁTICA
// ==========================================
function obterVelocidadeScroll() {
  const seletor = document.getElementById("scroll-speed");
  const v = seletor ? parseInt(seletor.value) : 3;
  if (v === 1) return 90;
  if (v === 2) return 60;
  if (v === 3) return 40;
  if (v === 4) return 25;
  if (v === 5) return 12;
  return 40;
}

function iniciarRolagemAutomatica() {
  if (scrollAnimationId) cancelAnimationFrame(scrollAnimationId);
  scrollAutomatico = true;
  const btn = document.getElementById("btn-scroll-palco");
  if (btn) btn.innerHTML = '<i class="fas fa-pause"></i><span>Pausar</span>';
  
  const velocidade = obterVelocidadeScroll();
  let ultimaExecucao = performance.now();

  function darPassoDeRolagem(tempoAtual) {
    if (!scrollAutomatico) return;

    if (tempoAtual - ultimaExecucao >= velocidade) {
      window.scrollBy(0, 1);
      ultimaExecucao = tempoAtual;
    }
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
  const btn = document.getElementById("btn-scroll-palco");
  if (btn) btn.innerHTML = '<i class="fas fa-play"></i><span>Rolar</span>';
}

function mudarVelocidadeScroll() {
  if (scrollAutomatico) iniciarRolagemAutomatica();
}

// ==========================================
// 7. MODO PALCO & WAKE LOCK
// ==========================================
async function toggleModoPalco() {
  modoPalcoAtivo = !modoPalcoAtivo;
  const bNav = document.querySelector(".bottom-nav");
  const hCont = document.querySelector(".header-container");
  const mAcoes = document.getElementById("musica-acoes-flutuantes");

  if (modoPalcoAtivo) {
    document.body.classList.add("modo-palco");
    if (bNav) bNav.style.display = "none";
    if (hCont) hCont.style.display = "none";
    if (mAcoes) mAcoes.style.display = "none";
    const btn = document.getElementById("btn-modo-palco");
    if (btn) btn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>';
    const cPalco = document.getElementById("controles-palco");
    if (cPalco) cPalco.style.display = "flex";

    try {
      if ("wakeLock" in navigator) wakeLock = await navigator.wakeLock.request("screen");
    } catch (err) { console.warn("Wake Lock falhou:", err); }
  } else {
    document.body.classList.remove("modo-palco");
    if (bNav) bNav.style.display = "flex";
    if (hCont) hCont.style.display = "flex";
    if (mAcoes) mAcoes.style.display = "flex";
    const btn = document.getElementById("btn-modo-palco");
    if (btn) btn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i>';
    const cPalco = document.getElementById("controles-palco");
    if (cPalco) cPalco.style.display = "none";
    pararRolagemAutomatica();

    if (wakeLock) { await wakeLock.release(); wakeLock = null; }
  }
}

// ==========================================
// 8. GERENCIAMENTO DE PASTAS
// ==========================================
async function buscarPastasOnlineOuOffline() {
  const usuarioLogado = obterUsuarioAtual();
  if (navigator.onLine && usuarioLogado && window.db) {
    try {
      const snap = await window.db.collection("pastas").where("uid", "==", usuarioLogado.uid).get();
      const list = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      window.pastasOriginais = list;
      salvarPastasOffline(list);
      await salvarColecaoOffline("pastas", list);
    } catch {
      window.pastasOriginais = await carregarColecaoOffline("pastas");
    }
  } else {
    window.pastasOriginais = await carregarColecaoOffline("pastas");
  }
  if (painelPastas && painelPastas.classList.contains("visible")) carregarPainelPastasIniciais();
}

function carregarPainelPastasIniciais() {
  const container = document.getElementById("lista-pastas");
  if (!container) return;
  container.innerHTML = "";

  const pastas = window.pastasOriginais || [];
  if (pastas.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>Nenhuma pasta criada.</p></div>';
    return;
  }

  pastas.forEach(p => {
    const card = document.createElement("div");
    card.className = "pasta-card";
    card.innerHTML = `
      <div class="pasta-card-click" onclick="abrirPasta('${p.id}')">
        <i class="fas fa-folder folder-icon"></i>
        <span class="pasta-card-nome">${p.nome}</span>
      </div>
      <button class="btn-icon-del" onclick="deletarPasta('${p.id}', event)"><i class="fas fa-trash"></i></button>
    `;
    container.appendChild(card);
  });
}

function abrirModalNovaPasta() {
  const input = document.getElementById("modalPastaNome");
  if (input) input.value = "";
  abrirModal("modalNovaPasta");
}

async function salvarNovaPasta() {
  const usuarioLogado = obterUsuarioAtual();
  if (!usuarioLogado) return;
  const nome = document.getElementById("modalPastaNome").value.trim();
  if (!nome) return;

  const payload = { nome, uid: usuarioLogado.uid };

  if (navigator.onLine && window.db) {
    try { await window.db.collection("pastas").add(payload); } catch {
      adicionarNaFilaOffline({ tipo: "criarPasta", payload });
    }
  } else {
    adicionarNaFilaOffline({ tipo: "criarPasta", payload });
  }

  fecharModal("modalNovaPasta");
  await buscarPastasOnlineOuOffline();
}

async function deletarPasta(id, event) {
  if (event) event.stopPropagation();
  if (!confirm("Eliminar esta pasta NÃO apaga as músicas dentro dela. Deseja continuar?")) return;

  if (navigator.onLine && window.db) {
    try { await window.db.collection("pastas").doc(id).delete(); } catch {
      adicionarNaFilaOffline({ tipo: "deletarPasta", id });
    }
  } else {
    adicionarNaFilaOffline({ tipo: "deletarPasta", id });
  }

  (window.musicasOriginais || []).forEach(m => {
    if (m.pastaId === id) { m.pastaId = ""; m.pastaNome = "Sem pasta"; }
  });

  await buscarPastasOnlineOuOffline();
}

function abrirPasta(id) {
  editPastaId = id;
  const p = (window.pastasOriginais || []).find(item => item.id === id);
  const tit = document.getElementById("titulo-pasta-aberta");
  if (tit) tit.innerText = p ? p.nome : "Pasta";
  
  const container = document.getElementById("lista-musicas-pasta");
  if (!container) return;
  container.innerHTML = "";

  const filtradas = (window.musicasOriginais || []).filter(m => m.pastaId === id);
  filtradas.sort((a, b) => a.titulo.localeCompare(b.titulo));

  if (filtradas.length === 0) {
    container.innerHTML = '<p class="empty-text">Nenhuma música nesta pasta ainda.</p>';
  } else {
    filtradas.forEach(m => {
      const item = document.createElement("div");
      item.className = "musica-item";
      item.onclick = () => abrir(m.id);
      item.innerHTML = `<div class="musica-info-block"><span class="musica-titulo">${m.titulo}</span><span class="musica-artista">${m.artista}</span></div>`;
      container.appendChild(item);
    });
  }

  document.getElementById("view-pastas-inicial").style.display = "none";
  document.getElementById("view-pasta-detalhe").style.display = "block";
}

function fecharPasta() {
  editPastaId = null;
  document.getElementById("view-pasta-detalhe").style.display = "none";
  document.getElementById("view-pastas-inicial").style.display = "block";
}

// ==========================================
// 9. GERENCIAMENTO DE SETLISTS
// ==========================================
async function buscarSetlistsOnlineOuOffline() {
  const usuarioLogado = obterUsuarioAtual();
  if (navigator.onLine && usuarioLogado && window.db) {
    try {
      const snap = await window.db.collection("setlists").where("uid", "==", usuarioLogado.uid).get();
      const list = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      window.setlistsOriginais = list;
      salvarSetlistsOffline(list);
      await salvarColecaoOffline("setlists", list);
    } catch {
      window.setlistsOriginais = await carregarColecaoOffline("setlists");
    }
  } else {
    window.setlistsOriginais = await carregarColecaoOffline("setlists");
  }
  if (painelSetlists && painelSetlists.classList.contains("visible")) carregarPainelSetlistsIniciais();
}

function carregarPainelSetlistsIniciais() {
  const container = document.getElementById("lista-setlists");
  if (!container) return;
  container.innerHTML = "";

  const setlists = window.setlistsOriginais || [];
  if (setlists.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-list-ul"></i><p>Nenhum repertório criado.</p></div>';
    return;
  }

  setlists.forEach(s => {
    const card = document.createElement("div");
    card.className = "setlist-card";
    card.innerHTML = `
      <div class="setlist-card-click" onclick="abrirSetlist('${s.id}')">
        <i class="fas fa-music setlist-icon"></i>
        <div class="setlist-card-info">
          <span class="setlist-card-nome">${s.nome}</span>
          <span class="setlist-card-count">${s.musicas ? s.musicas.length : 0} músicas</span>
        </div>
      </div>
      <button class="btn-icon-del" onclick="deletarSetlist('${s.id}', event)"><i class="fas fa-trash"></i></button>
    `;
    container.appendChild(card);
  });
}

function abrirModalNovoSetlist() {
  const input = document.getElementById("modalSetlistNome");
  if (input) input.value = "";
  abrirModal("modalNovoSetlist");
}

async function salvarNovoSetlist() {
  const usuarioLogado = obterUsuarioAtual();
  if (!usuarioLogado) return;
  const nome = document.getElementById("modalSetlistNome").value.trim();
  if (!nome) return;

  const payload = { nome, musicas: [], uid: usuarioLogado.uid };

  if (navigator.onLine && window.db) {
    try { await window.db.collection("setlists").add(payload); } catch {
      adicionarNaFilaOffline({ tipo: "criarSetlist", payload });
    }
  } else {
    adicionarNaFilaOffline({ tipo: "criarSetlist", payload });
  }

  fecharModal("modalNovoSetlist");
  await buscarSetlistsOnlineOuOffline();
}

async function deletarSetlist(id, event) {
  if (event) event.stopPropagation();
  if (!confirm("Deseja eliminar este repertório?")) return;

  if (navigator.onLine && window.db) {
    try { await window.db.collection("setlists").doc(id).delete(); } catch {
      adicionarNaFilaOffline({ tipo: "deletarSetlist", id });
    }
  } else {
    adicionarNaFilaOffline({ tipo: "deletarSetlist", id });
  }
  await buscarSetlistsOnlineOuOffline();
}

function abrirSetlist(id) {
  setlistAbertaId = id;
  const s = (window.setlistsOriginais || []).find(item => item.id === id);
  const tit = document.getElementById("titulo-setlist-aberto");
  if (tit) tit.innerText = s ? s.nome : "Repertório";

  const container = document.getElementById("lista-musicas-setlist");
  if (!container) return;
  container.innerHTML = "";

  if (!s || !s.musicas || s.musicas.length === 0) {
    container.innerHTML = '<p class="empty-text">Nenhuma música neste repertório.</p>';
  } else {
    s.musicas.forEach((mItem, index) => {
      const card = document.createElement("div");
      card.className = "musica-item setlist-item-flex";
      card.innerHTML = `
        <div class="info-set-click" style="flex:1;" onclick="abrir('${mItem.id}')">
          <span class="musica-titulo">${mItem.titulo}</span>
          <span class="musica-artista">${mItem.artista}</span>
        </div>
        <button class="btn-remove-item-set" onclick="removerDaSetlist(${index}, event)"><i class="fas fa-times"></i></button>
      `;
      container.appendChild(card);
    });
  }

  document.getElementById("view-setlists-inicial").style.display = "none";
  document.getElementById("view-setlist-detalhe").style.display = "block";
}

function fecharSetlist() {
  setlistAbertaId = null;
  document.getElementById("view-setlist-detalhe").style.display = "none";
  document.getElementById("view-setlists-inicial").style.display = "block";
}

function abrirModalAdicionarNaSetlist() {
  if (!musicaAbertaId) return;
  const container = document.getElementById("lista-escolha-setlists");
  if (!container) return;
  container.innerHTML = "";

  const setlists = window.setlistsOriginais || [];
  if (setlists.length === 0) {
    container.innerHTML = '<p class="empty-text">Crie um Repertório primeiro na aba correspondente.</p>';
    abrirModal("modalAddSetlist");
    return;
  }

  setlists.forEach(s => {
    const item = document.createElement("div");
    item.className = "selecao-setlist-item";
    item.onclick = () => confirmarAdicionarNaSetlist(s.id);
    item.innerText = s.nome;
    container.appendChild(item);
  });

  abrirModal("modalAddSetlist");
}

async function confirmarAdicionarNaSetlist(sId) {
  const s = (window.setlistsOriginais || []).find(item => item.id === sId);
  const m = (window.musicasOriginais || []).find(item => item.id === musicaAbertaId);
  if (!s || !m) return;

  if (!s.musicas) s.musicas = [];
  if (s.musicas.some(item => item.id === m.id)) {
    alert("Esta música já se encontra neste repertório.");
    fecharModal("modalAddSetlist");
    return;
  }

  s.musicas.push({ id: m.id, titulo: m.titulo, artista: m.artista });

  if (navigator.onLine && window.db) {
    try { await window.db.collection("setlists").doc(sId).update({ musicas: s.musicas }); } catch {
      adicionarNaFilaOffline({ tipo: "editarSetlist", id: sId, payload: { musicas: s.musicas } });
    }
  } else {
    adicionarNaFilaOffline({ tipo: "editarSetlist", id: sId, payload: { musicas: s.musicas } });
  }

  fecharModal("modalAddSetlist");
  alert("Música adicionada ao repertório.");
  await buscarSetlistsOnlineOuOffline();
}

async function removerDaSetlist(index, event) {
  if (event) event.stopPropagation();
  const s = (window.setlistsOriginais || []).find(item => item.id === setlistAbertaId);
  if (!s || !s.musicas) return;

  s.musicas.splice(index, 1);

  if (navigator.onLine && window.db) {
    try { await window.db.collection("setlists").doc(setlistAbertaId).update({ musicas: s.musicas }); } catch {
      adicionarNaFilaOffline({ tipo: "editarSetlist", id: setlistAbertaId, payload: { musicas: s.musicas } });
    }
  } else {
    adicionarNaFilaOffline({ tipo: "editarSetlist", id: setlistAbertaId, payload: { musicas: s.musicas } });
  }

  abrirSetlist(setlistAbertaId);
  await buscarSetlistsOnlineOuOffline();
}

// ==========================================
// 10. AUTENTICAÇÃO GOOGLE E AJUSTES DE TELA
// ==========================================
function loginGoogle() {
  if (window.auth) {
    const provider = new firebase.auth.GoogleAuthProvider();

    window.auth.signInWithPopup(provider)
      .then((result) => {
        console.log("Login realizado:", result.user.email);
      })
      .catch((error) => {
        console.error("Erro no login:", error);
        alert("Erro ao fazer login: " + error.message);
      });

  } else {
    alert("Erro: O sistema do Firebase não foi inicializado corretamente.");
  }
}

function logout() {
  if (window.auth) {
    window.auth.signOut().then(() => { window.location.reload(); });
  }
}

function atualizarAreaAuth(u) {

  const loginBtn = document.getElementById("loginBtn");

  const profileTopBox = document.getElementById("profileTopBox");
  const profilePhotoTop = document.getElementById("profilePhotoTop");
  const profileNameTop = document.getElementById("profileNameTop");
  const profileEmailTop = document.getElementById("profileEmailTop");

  if (u) {

    loginBtn.style.display = "none";

    profileTopBox.classList.add("visible");

    profilePhotoTop.src =
      u.photoURL ||
      "https://via.placeholder.com/80";

    profileNameTop.textContent =
      u.displayName || "Usuário";

    profileEmailTop.textContent =
      u.email || "";

  } else {

    loginBtn.style.display = "inline-flex";

    profileTopBox.classList.remove("visible");

  }
}

function toggleMenuUsuario() {
  const drop = document.getElementById("menu-usuario-dropdown");
  if (drop) drop.classList.toggle("visible");
}

function controlarBottomNavAoRolar() {
  const bNav = document.querySelector(".bottom-nav");
  if (!bNav || modoPalcoAtivo) return;
  if (window.scrollY > 200) {
    bNav.style.transform = "translateY(100%)";
  } else {
    bNav.style.transform = "translateY(0)";
  }
}

function fecharMenusAoClicarFora(e) {
  const drop = document.getElementById("menu-usuario-dropdown");
  if (drop && drop.classList.contains("visible") && !e.target.closest(".user-profile-nav")) {
    drop.classList.remove("visible");
  }
}

// Preferências de Letra
function obterPreferencias() {
  try { return JSON.parse(localStorage.getItem("preferencias_pro")) || { fontSize: 16 }; } catch { return { fontSize: 16 }; }
}
function salvarPreferencias(pref) {
  localStorage.setItem("preferencias_pro", JSON.stringify(pref));
}
function aplicarPreferenciasNaTela(pref) {
  if (conteudoMusica) conteudoMusica.style.fontSize = pref.fontSize + "px";
}
function alterarTamanhoFonte(delta) {
  const pref = obterPreferencias();
  pref.fontSize = Math.max(12, Math.min(32, pref.fontSize + delta));
  salvarPreferencias(pref);
  aplicarPreferenciasNaTela(pref);
}

// ==========================================
// 11. EXPORTAÇÃO PDF
// ==========================================
function exportarPDF() {
  if (!musicaAbertaId) return;
  const m = (window.musicasOriginais || []).find(item => item.id === musicaAbertaId);
  if (!m) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const tomAtual = tomMusica ? tomMusica.innerText : (m.tom || "N/A");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(m.titulo, 15, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text(m.artista || "Artista Desconhecido", 15, 28);

  doc.setFontSize(11);
  doc.text(`Tom: ${tomAtual}`, 15, 35);
  if (m.capo) doc.text(`Capo: ${m.capo}ª casa`, 50, 35);

  doc.setDrawColor(200);
  doc.line(15, 38, 195, 38);

  doc.setFont("courier", "normal");
  doc.setFontSize(12);
  doc.setTextColor(0);

  let textoTransposto = original.replace(/\[ch\]([^\]]+)\[\/ch\]/g, (match, ac) => {
    return typeof transporAcorde === "function" ? transporAcorde(ac.trim(), semitons) : ac;
  });

  const linhas = doc.splitTextToSize(textoTransposto, 180);
  let y = 46;
  const alturaPagina = doc.internal.pageSize.height;

  linhas.forEach(linha => {
    if (y > alturaPagina - 20) {
      doc.addPage();
      y = 20;
    }
    doc.text(linha, 15, y);
    y += 6;
  });

  doc.save(`${m.titulo} - ${m.artista || "artista"}.pdf`);
}

// ==========================================
// 12. EVENTOS DE INICIALIZAÇÃO DO SISTEMA
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
  aplicarPreferenciasNaTela(obterPreferencias());
  
  if (busca) {
    busca.addEventListener("input", carregarListaMemoria);
  }

  document.addEventListener("keydown", (event) => {
    const tecla = event.key;
    if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;

    if (tecla === " ") {
      event.preventDefault();
      if (scrollAutomatico) pararRolagemAutomatica();
      else iniciarRolagemAutomatica();
    }
    if (tecla === "ArrowDown") { event.preventDefault(); window.scrollBy(0, 120); }
    if (tecla === "ArrowUp") { event.preventDefault(); window.scrollBy(0, -120); }
    if (tecla.toLowerCase() === "p") toggleModoPalco();
    if (tecla === "Escape" && modoPalcoAtivo) toggleModoPalco();
  });

  window.addEventListener("online", async () => {
    console.log("Internet reestabelecida. Sincronizando fila...");
    await sincronizarFilaOffline();
    await carregarLista();
  });

  window.addEventListener("scroll", controlarBottomNavAoRolar);
  document.addEventListener("click", fecharMenusAoClicarFora);

  carregarLista();
});

// ==========================================
// 13. MONITOR DE AUTENTICAÇÃO DO FIREBASE
// ==========================================
if (window.auth) {
  window.auth.onAuthStateChanged(async (u) => {
    window.user = u;
    atualizarAreaAuth(u);

    if (u && window.db) {
      const userRef = window.db.collection("usuarios").doc(u.uid);
      try {
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
          window.roleAtual = "user";
        } else {
          const dadosUsuario = doc.data();
          window.roleAtual = dadosUsuario.role || "user";
          await userRef.update({
            ultimoLogin: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      } catch (erro) {
        console.error("Erro ao verificar perfil no Firestore:", erro);
        window.roleAtual = "user"; 
      }
    } else {
      window.roleAtual = "user";
    }

    await buscarPastasOnlineOuOffline();
    await buscarSetlistsOnlineOuOffline();
    await sincronizarMusicasOffline();

    const paramsUrl = new URLSearchParams(window.location.search);
    const pastaUrl = paramsUrl.get("pasta");
    if (pastaUrl) {
      setTimeout(() => { abrirPasta(pastaUrl); }, 1200);
    } else {
      carregarPainelPastasIniciais();
    }
  });
}

// ===== COMPATIBILIDADE NOVA UI =====

// Mapeia IDs novos
window.addEventListener("DOMContentLoaded", () => {

  window.listaMusicas = document.getElementById("lista");
  window.tituloMusica = document.getElementById("displayTitulo");
  window.artistaMusica = document.getElementById("displayArtista");
  window.capoMusica = document.getElementById("displayCapo");
  window.tomMusica = document.getElementById("displayTom");
  window.conteudoMusica = document.getElementById("output");

});

// Tema
function alternarTemaRapido() {
  document.body.classList.toggle("light-theme");
}

// Menu perfil
function toggleProfileMenu() {
  document.getElementById("profileDropdown")
    ?.classList.toggle("visible");
}

// Painéis
function fecharPainel() {
  document.querySelectorAll(".bottom-sheet-panel")
    .forEach(p => p.classList.remove("visible"));

  document.getElementById("panelOverlay")
    ?.classList.remove("visible");
}

function abrirPainel(nome) {

  fecharPainel();

  const mapa = {
    buscar: "painelBusca",
    pastas: "painelPastas",
    musicas: "painelMusicas",
    setlists: "painelSetlists"
  };

  const painel = document.getElementById(mapa[nome]);

  if (painel) {
    painel.classList.add("visible");
    document.getElementById("panelOverlay")
      ?.classList.add("visible");
  }

}

// Compatibilidade
function criarPasta() {
  abrirModalNovaPasta();
}

function criarSetlist() {
  abrirModalNovoSetlist();
}

function transpor(v) {
  alterarTom(v);
}

function resetarTom() {
  semitons = 0;
  atualizarVisualizacao();
}

function alterarFonte(v) {
  alterarTamanhoFonte(v);
}

function editarMusicaAberta() {
  if (musicaAbertaId)
    abrirFormulario(musicaAbertaId);
}

function favoritarMusicaAberta() {
  alert("Favoritos será ligado depois.");
}

function copiarLinkMusica() {
  navigator.clipboard.writeText(location.href);
  alert("Link copiado.");
}