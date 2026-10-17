"use strict";
/* Math Pré-France — standalone offline PWA. No network calls at runtime, no AI. */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let BANK = [], TOPICS = [], GROUPS = {}, SEQS = [], byId = {}, topicById = {};
const COMP = { chercher: ["Search", "Chercher", "Mencari"], modeliser: ["Model", "Modéliser", "Memodelkan"], representer: ["Represent", "Représenter", "Mewakilkan"], raisonner: ["Reason", "Raisonner", "Menaakul"], calculer: ["Calculate", "Calculer", "Mengira"], communiquer: ["Communicate", "Communiquer", "Berkomunikasi"] };

/* ---------- storage (always try/catch) ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
};
let SET = Object.assign({ ui: "bm", content: "both" }, store.get("pfm.set", {}));
let PROG = store.get("pfm.prog", { att: {} });
const saveSet = () => store.set("pfm.set", SET);
const saveProg = () => store.set("pfm.prog", PROG);

/* ---------- UI strings (chrome only; question content is EN/FR) ---------- */
const T = {
  en: { home: "Home", practice: "Practice", mock: "Mock test", progress: "Progress", rules: "Marking", settings: "Settings", start: "Start", next: "Next", check: "Check", retry: "Try again",
    pick: "Choose an answer", correct: "Correct!", wrong: "Not quite.", second: "Second chance: half credit.", reveal: "Answer", routeQ: "Which route would you choose, and why?", routeHead: "How & why — choose your route",
    solution: "Solution", scheme: "Route", when: "Use it when", why: "Why it works", because: "Why choose it", tradeoff: "Trade-off", check_: "Check", best: "★ Best route here", valid: "✓ Valid alternative", only: "Standard course route",
    result: "Result", method: "Method", pts: "pts", topics: "Topics", all: "All", diff: "Difficulty", filter: "Show", f_all: "All questions", f_todo: "Not mastered yet", f_wrong: "My mistakes", questions: "questions",
    mastered: "Validated", learning: "In progress", fresh: "To start", competences: "Competences", weak: "To revise", none: "Nothing yet — start practising!", mockSetup: "Set up your mock test", nq: "Number of questions", minutes: "Minutes",
    scope: "Scope", submit: "Submit test", score: "Score", timeUp: "Time is up", review: "Review", answered: "answered", noans: "no answer", language: "Interface", content: "Question language", both: "EN + FR", export: "Export progress", import_: "Import progress",
    reset: "Reset progress", confirmReset: "Delete all saved progress on this device?", checkpoint: "Checkpoint", seq: "guided sequence", back: "Back", home1: "Pick a mode", official: "Internal estimate — not an official MFI mark.",
    home_p: "Practice by topic: answer, then choose your route and learn why.", home_m: "Mock test: timed, /20, no calculator.", home_d: "Progress: mastery per topic and per competence.", home_r: "How it is marked.",
    dueTitle: "Topics to revise first", yourScore: "Your mark", routeScore: "Route points", resultScore: "Result points", offline: "Works offline once opened.", stats: "questions answered" },
  fr: { home: "Accueil", practice: "S'entraîner", mock: "Test blanc", progress: "Progrès", rules: "Notation", settings: "Réglages", start: "Commencer", next: "Suivant", check: "Valider", retry: "Réessayer",
    pick: "Choisis une réponse", correct: "Correct !", wrong: "Pas tout à fait.", second: "Seconde chance : demi‑point.", reveal: "Réponse", routeQ: "Quelle voie choisirais‑tu, et pourquoi ?", routeHead: "Comment & pourquoi — choisis ta méthode",
    solution: "Corrigé", scheme: "Méthode", when: "À utiliser quand", why: "Pourquoi ça marche", because: "Pourquoi la choisir", tradeoff: "Limite", check_: "Vérification", best: "★ Meilleure voie ici", valid: "✓ Alternative valable", only: "Méthode standard du cours",
    result: "Résultat", method: "Méthode", pts: "pts", topics: "Chapitres", all: "Tous", diff: "Difficulté", filter: "Afficher", f_all: "Toutes les questions", f_todo: "Pas encore validés", f_wrong: "Mes erreurs", questions: "questions",
    mastered: "Validé", learning: "En cours", fresh: "À commencer", competences: "Compétences", weak: "À réviser", none: "Rien pour l'instant — lance‑toi !", mockSetup: "Prépare ton test blanc", nq: "Nombre de questions", minutes: "Minutes",
    scope: "Périmètre", submit: "Rendre la copie", score: "Note", timeUp: "Temps écoulé", review: "Correction", answered: "répondues", noans: "sans réponse", language: "Interface", content: "Langue des questions", both: "EN + FR", export: "Exporter la progression", import_: "Importer la progression",
    reset: "Réinitialiser", confirmReset: "Effacer toute la progression enregistrée sur cet appareil ?", checkpoint: "Étape", seq: "séquence guidée", back: "Retour", home1: "Choisis un mode", official: "Estimation interne — pas une note officielle MFI.",
    home_p: "S'entraîner par chapitre : réponds, puis choisis ta méthode et comprends pourquoi.", home_m: "Test blanc : chronométré, /20, sans calculatrice.", home_d: "Progrès : maîtrise par chapitre et par compétence.", home_r: "Comment c'est noté.",
    dueTitle: "Chapitres à réviser d'abord", yourScore: "Ta note", routeScore: "Points de méthode", resultScore: "Points de résultat", offline: "Fonctionne hors ligne après la première ouverture.", stats: "questions traitées" },
  bm: { home: "Utama", practice: "Latihan", mock: "Ujian cuba", progress: "Kemajuan", rules: "Cara markah", settings: "Tetapan", start: "Mula", next: "Seterusnya", check: "Semak", retry: "Cuba lagi",
    pick: "Pilih satu jawapan", correct: "Betul!", wrong: "Belum tepat.", second: "Peluang kedua: separuh markah.", reveal: "Jawapan", routeQ: "Jalan mana kamu pilih, dan kenapa?", routeHead: "Bagaimana & kenapa — pilih jalan kira",
    solution: "Penyelesaian", scheme: "Jalan", when: "Guna bila", why: "Kenapa ia berjaya", because: "Kenapa pilih ini", tradeoff: "Kelemahan", check_: "Semakan", best: "★ Jalan terbaik di sini", valid: "✓ Alternatif sah", only: "Jalan standard kursus",
    result: "Keputusan", method: "Kaedah", pts: "mrk", topics: "Topik", all: "Semua", diff: "Kesukaran", filter: "Papar", f_all: "Semua soalan", f_todo: "Belum dikuasai", f_wrong: "Kesilapan saya", questions: "soalan",
    mastered: "Disahkan", learning: "Sedang belajar", fresh: "Belum mula", competences: "Kompetensi", weak: "Perlu ulang kaji", none: "Belum ada — mula berlatih!", mockSetup: "Sediakan ujian cuba", nq: "Bilangan soalan", minutes: "Minit",
    scope: "Skop", submit: "Hantar ujian", score: "Markah", timeUp: "Masa tamat", review: "Semakan", answered: "dijawab", noans: "tiada jawapan", language: "Antara muka", content: "Bahasa soalan", both: "EN + FR", export: "Eksport kemajuan", import_: "Import kemajuan",
    reset: "Set semula", confirmReset: "Padam semua kemajuan di peranti ini?", checkpoint: "Langkah", seq: "urutan berpandu", back: "Kembali", home1: "Pilih mod", official: "Anggaran dalaman — bukan markah rasmi MFI.",
    home_p: "Latihan ikut topik: jawab, pilih jalan kira, faham kenapa.", home_m: "Ujian cuba: bermasa, /20, tanpa kalkulator.", home_d: "Kemajuan: penguasaan ikut topik & kompetensi.", home_r: "Cara ia dimarkahkan.",
    dueTitle: "Topik untuk diulang dahulu", yourScore: "Markah anda", routeScore: "Markah jalan kira", resultScore: "Markah keputusan", offline: "Boleh guna tanpa internet selepas dibuka sekali.", stats: "soalan dijawab" }
};
const t = k => (T[SET.ui] || T.en)[k] || T.en[k] || k;
const CL = () => (SET.content === "fr" ? "fr" : "en");
const ALT = () => (SET.content === "both" ? (CL() === "fr" ? "en" : "fr") : null);
const isDual = () => SET.content === "both";
/* content: when "both", English is the main line and French is shown beneath */
const MAIN = () => (SET.content === "fr" ? "fr" : "en");
const OTHER = () => (SET.content === "both" ? "fr" : null);

function qf(q, lang, f, sub) {
  if (lang === "en") { const v = q[f]; return sub ? v[sub] : v; }
  const fr = q.i18n && q.i18n.fr; if (!fr) return qf(q, "en", f, sub);
  const v = fr[f]; return sub ? v[sub] : v;
}
const bl = (o, lang) => (o && (o[lang] != null ? o[lang] : o.en)) || "";
/* two-language block: main + muted other */
function dual(getter) {
  const a = getter(MAIN()), b = OTHER() ? getter(OTHER()) : null;
  return esc(a) + (b && b !== a ? `<div class="alt">${esc(b)}</div>` : "");
}
const dualBL = o => dual(l => bl(o, l));

/* ---------- progress / scoring ---------- */
function record(qid, a) { (PROG.att[qid] = PROG.att[qid] || []).push(Object.assign({ ts: Date.now() }, a)); saveProg(); }
const latest = qid => { const a = PROG.att[qid]; return a && a.length ? a[a.length - 1] : null; };
function topicStats(tid) {
  const qs = BANK.filter(q => q.topic_id === tid); let got = 0, max = 0, rg = 0, rm = 0, n = 0;
  qs.forEach(q => { const a = latest(q.question_id); if (!a) return; n++; got += a.pts; max += a.max; rg += a.rpts || 0; rm += a.rmax || 0; });
  const ratio = max ? got / max : 0, rr = rm ? rg / rm : 1;
  let status = "fresh"; if (n > 0) status = "learning"; if (n >= 5 && ratio >= 0.7 && rr >= 0.5) status = "mastered";
  return { n, total: qs.length, ratio, rr, status, got, max };
}
function compStats() {
  const o = {}; Object.keys(COMP).forEach(k => o[k] = { g: 0, m: 0 });
  BANK.forEach(q => { const a = latest(q.question_id); if (!a) return; (q.competences || []).forEach(c => { if (o[c]) { o[c].g += a.pts + (a.rpts || 0); o[c].m += a.max + (a.rmax || 0); } }); });
  return o;
}
const ROUTEPTS = { BEST: 1, VALID: 0.5, WRONG_REASON: 0, INVALID: 0 };
const rmaxOf = q => (q.route_choice ? 1 : 0);

/* ---------- router ---------- */
const routes = {};
function go() {
  const h = location.hash.replace(/^#\/?/, "") || "home"; const [name, ...rest] = h.split("/");
  document.querySelectorAll("#nav a").forEach(a => a.classList.toggle("on", a.dataset.r === name || (name === "topic" && a.dataset.r === "practice")));
  const f = routes[name] || routes.home; stopTimer(); f(rest.map(decodeURIComponent)); window.scrollTo(0, 0);
}
function nav() {
  $("#nav").innerHTML = [["home", "home"], ["practice", "practice"], ["mock", "mock"], ["progress", "progress"], ["rules", "rules"], ["settings", "settings"]]
    .map(([r, k]) => `<a href="#/${r}" data-r="${r}">${esc(t(k))}</a>`).join("");
}
const app = html => { $("#app").innerHTML = html; };
document.documentElement.lang = "en";

/* ---------- views ---------- */
routes.home = () => {
  const done = Object.keys(PROG.att).length;
  app(`<h1>${esc(t("home1"))}</h1>
  <div class="grid">
    <a class="tile" href="#/practice"><h3>📐 ${esc(t("practice"))}</h3><div class="muted small">${esc(t("home_p"))}</div></a>
    <a class="tile" href="#/mock"><h3>⏱ ${esc(t("mock"))}</h3><div class="muted small">${esc(t("home_m"))}</div></a>
    <a class="tile" href="#/progress"><h3>📈 ${esc(t("progress"))}</h3><div class="muted small">${esc(t("home_d"))}</div></a>
    <a class="tile" href="#/rules"><h3>🧮 ${esc(t("rules"))}</h3><div class="muted small">${esc(t("home_r"))}</div></a>
  </div>
  <p class="muted small">${BANK.length} ${esc(t("questions"))} · ${done} ${esc(t("stats"))} · ${esc(t("offline"))}</p>`);
};

routes.practice = () => {
  const byGroup = {}; TOPICS.forEach(tp => (byGroup[tp.group] = byGroup[tp.group] || []).push(tp));
  let h = `<h1>${esc(t("practice"))}</h1>`;
  Object.keys(GROUPS).forEach(g => {
    if (!byGroup[g]) return;
    h += `<h2>${esc(GROUPS[g][SET.ui === "fr" ? "fr" : SET.ui === "bm" ? "bm" : "en"])}</h2><div class="grid">`;
    byGroup[g].forEach(tp => {
      const s = topicStats(tp.id); const cls = s.status === "mastered" ? "ok" : s.status === "learning" ? "am" : "";
      h += `<a class="tile" href="#/topic/${encodeURIComponent(tp.id)}"><div class="row sp"><b>${esc(SET.content === "fr" ? tp.fr : tp.en)}</b><span class="chip ${cls}">${esc(t(s.status === "mastered" ? "mastered" : s.status === "learning" ? "learning" : "fresh"))}</span></div>
      ${SET.content === "both" ? `<div class="muted small">${esc(tp.fr)}</div>` : ""}
      <div class="bar" style="margin:8px 0 4px"><i style="width:${Math.round(s.ratio * 100)}%"></i></div><div class="muted small">${s.n}/${s.total} ${esc(t("questions"))}</div></a>`;
    });
    h += "</div>";
  });
  app(h);
};

function orderedList(tid) {
  const qs = BANK.filter(q => q.topic_id === tid);
  const plain = qs.filter(q => !q.sequence_id).sort((a, b) => a.difficulty - b.difficulty || a.question_id.localeCompare(b.question_id));
  const seqs = {}; qs.filter(q => q.sequence_id).forEach(q => (seqs[q.sequence_id] = seqs[q.sequence_id] || []).push(q));
  const sq = Object.keys(seqs).sort().flatMap(k => seqs[k].sort((a, b) => a.sequence_index - b.sequence_index));
  return plain.concat(sq);
}
let SESS = null;
routes.topic = ([tid]) => {
  const tp = topicById[tid]; if (!tp) return routes.practice();
  const s = topicStats(tid);
  app(`<a href="#/practice">← ${esc(t("back"))}</a><h1>${esc(tp.en)} <span class="muted small">/ ${esc(tp.fr)}</span></h1>
  <div class="card"><div class="row sp"><span class="chip ${s.status === "mastered" ? "ok" : s.status === "learning" ? "am" : ""}">${esc(t(s.status === "mastered" ? "mastered" : s.status === "learning" ? "learning" : "fresh"))}</span>
  <span class="muted small">${s.n}/${s.total} · ${Math.round(s.ratio * 100)}%</span></div>
  <div class="row" style="margin-top:10px"><label>${esc(t("diff"))} <select id="fd"><option value="0">${esc(t("all"))}</option><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
  <label>${esc(t("filter"))} <select id="ff"><option value="all">${esc(t("f_all"))}</option><option value="todo">${esc(t("f_todo"))}</option><option value="wrong">${esc(t("f_wrong"))}</option></select></label>
  <button class="btn pri" id="go">${esc(t("start"))}</button></div></div>`);
  $("#go").onclick = () => {
    const d = +$("#fd").value, f = $("#ff").value;
    let list = orderedList(tid).filter(q => !d || q.difficulty === d);
    if (f === "todo") list = list.filter(q => { const a = latest(q.question_id); return !a || a.pts + (a.rpts || 0) < a.max + (a.rmax || 0); });
    if (f === "wrong") list = list.filter(q => { const a = latest(q.question_id); return a && a.pts + (a.rpts || 0) < a.max + (a.rmax || 0); });
    if (!list.length) { alert("—"); return; }
    startSession(list.map(q => q.question_id), tid);
  };
};

/* ---------- practice session ---------- */
function startSession(ids, tid) { SESS = { ids, i: 0, tid, got: 0, max: 0, log: [] }; renderQ(); }
function stateFresh() { return { picked: null, tries: 0, eliminated: [], pts: 0, done: false, route: null, rpts: 0 }; }
let ST = null;

function choicesHTML(q, st, locked) {
  return "ABCD".split("").map(k => {
    let cls = "opt";
    if (st.eliminated.includes(k)) cls += " bad dim"; else if (st.picked === k && !locked) cls += " sel";
    if (locked) { if (k === q.correct_choice) cls += " good"; else if (st.eliminated.includes(k)) cls += " bad"; }
    return `<button class="${cls}" data-k="${k}" ${locked || st.eliminated.includes(k) ? "disabled" : ""}><span class="k">${k}</span><span class="t">${dual(l => qf(q, l, "choices", k))}</span></button>`;
  }).join("");
}
function renderQ() {
  const q = byId[SESS.ids[SESS.i]]; ST = stateFresh();
  const n = SESS.ids.length;
  const pg = SESS.ids.map((id, i) => `<i class="${i < SESS.i ? (SESS.log[i] && SESS.log[i].full ? "g" : "d") : i === SESS.i ? "c" : ""}"></i>`).join("");
  const seqTag = q.sequence_id ? `<span class="chip cy">${esc(t("checkpoint"))} ${q.sequence_index}/3 · ${esc(t("seq"))}</span>` : "";
  app(`<div class="row sp"><a href="#/topic/${encodeURIComponent(SESS.tid || q.topic_id)}">← ${esc(t("back"))}</a><span class="muted small">${SESS.i + 1}/${n}</span></div><div class="pgs">${pg}</div>
  <div class="card"><div class="row" style="margin-bottom:4px"><span class="chip">${"★".repeat(q.difficulty)}</span>${seqTag}<span class="chip">${esc(topicById[q.topic_id] ? topicById[q.topic_id][CL()] : "")}</span></div>
  <div class="stem">${dual(l => qf(q, l, "stem"))}</div><div id="ch">${choicesHTML(q, ST, false)}</div>
  <div class="row" style="margin-top:8px"><button class="btn pri" id="ok" disabled>${esc(t("check"))}</button></div><div id="fb"></div></div><div id="after"></div>`);
  bindChoices(q);
  $("#ok").onclick = () => checkAnswer(q);
}
function bindChoices(q) {
  document.querySelectorAll("#ch .opt").forEach(b => b.onclick = () => { ST.picked = b.dataset.k; $("#ch").innerHTML = choicesHTML(q, ST, false); bindChoices(q); $("#ok").disabled = false; });
}
function checkAnswer(q) {
  ST.tries++; const ok = ST.picked === q.correct_choice;
  if (ok) {
    ST.pts = ST.tries === 1 ? 2 : 1; ST.done = true;
    $("#ch").innerHTML = choicesHTML(q, ST, true); $("#ok").style.display = "none";
    $("#fb").innerHTML = `<div class="fb ok"><b>${esc(t("correct"))}</b> ${ST.tries === 1 ? "+2" : "+1 · " + esc(t("second"))} ${esc(t("pts"))}<div class="small muted">${dual(l => qf(q, l, "correct_feedback") || "")}</div></div>`;
    afterResult(q);
  } else {
    ST.eliminated.push(ST.picked);
    const why = dual(l => qf(q, l, "distractor_reason", ST.picked));
    if (ST.tries >= 2) {
      ST.pts = 0; ST.done = true; $("#ch").innerHTML = choicesHTML(q, ST, true); $("#ok").style.display = "none";
      $("#fb").innerHTML = `<div class="fb bad"><b>${esc(t("wrong"))}</b> ${why}</div><div class="fb am"><b>${esc(t("reveal"))}:</b> ${q.correct_choice}) ${dual(l => qf(q, l, "choices", q.correct_choice))}</div>`;
      afterResult(q);
    } else {
      ST.picked = null; $("#ch").innerHTML = choicesHTML(q, ST, false); bindChoices(q); $("#ok").disabled = true; $("#ok").textContent = t("retry");
      $("#fb").innerHTML = `<div class="fb bad"><b>${esc(t("wrong"))}</b> ${why}</div>`;
    }
  }
}
function afterResult(q) {
  if (q.route_choice) renderRoute(q); else finishQ(q);
}
function renderRoute(q) {
  const rc = q.route_choice;
  $("#after").innerHTML = `<div class="card"><h3>🧭 ${esc(t("routeHead"))}</h3><div class="muted small">${esc(bl(rc.prompt, CL()))}</div><div id="rch">${rc.options.map(o => `<button class="opt" data-k="${o.option_id}"><span class="k">${o.option_id}</span><span class="t">${dualBL(o.text)}</span></button>`).join("")}</div><div id="rfb"></div></div>`;
  document.querySelectorAll("#rch .opt").forEach(b => b.onclick = () => {
    const o = rc.options.find(x => x.option_id === b.dataset.k); ST.route = o; ST.rpts = ROUTEPTS[o.verdict];
    document.querySelectorAll("#rch .opt").forEach(x => { x.disabled = true; const oo = rc.options.find(y => y.option_id === x.dataset.k); if (oo.verdict === "BEST") x.classList.add("good"); else if (x === b) x.classList.add("bad"); else x.classList.add("dim"); });
    const lab = { BEST: ["ok", "+1"], VALID: ["am", "+0,5"], WRONG_REASON: ["bad", "+0"], INVALID: ["bad", "+0"] }[o.verdict];
    $("#rfb").innerHTML = `<div class="fb ${lab[0]}"><b>${esc(t("routeScore"))}: ${lab[1]} ${esc(t("pts"))}</b><div>${dualBL(o.feedback)}</div></div>`;
    finishQ(q);
  });
}
function schemeHTML(q, s) {
  const lang = MAIN();
  const dl = o => dualBL(o);
  const badge = s.kind === "BEST" ? `<span class="chip ok">${esc(t("best"))}</span>` : `<span class="chip cy">${esc(t(q.alternatives_available ? "valid" : "only"))}</span>`;
  return `<div class="row">${badge}</div><dl class="kv"><dt>${esc(t("when"))}</dt><dd>${dl(s.when)}</dd><dt>${esc(t("why"))}</dt><dd>${dl(s.why)}</dd>${q.alternatives_available ? `<dt>${esc(t("because"))}</dt><dd>${dl(s.because)}</dd>` : ""}</dl>` +
    s.steps.map((st, i) => `<div class="step"><b>${i + 1}. ${dl(st.title)}</b><div class="w mono">${dl(st.what)}</div>${bl(st.why, "en") ? `<div class="y">${dl(st.why)}</div>` : ""}</div>`).join("") +
    (q.alternatives_available && bl(s.tradeoff, "en") ? `<div class="fb am"><b>${esc(t("tradeoff"))}:</b> ${dl(s.tradeoff)}</div>` : "") +
    (s.check ? `<div class="fb"><b>${esc(t("check_"))}:</b> ${dl(s.check)}</div>` : "");
}
function solutionHTML(q, id = "sol") {
  const ss = q.solution_schemes.slice().sort((a, b) => (a.kind === "BEST" ? -1 : 0) - (b.kind === "BEST" ? -1 : 0));
  const tabs = ss.length > 1 ? `<div class="tabs">${ss.map((s, i) => `<button class="tab ${i ? "" : "on"}" data-i="${i}">${esc(bl(s.name, MAIN()))}</button>`).join("")}</div>` : "";
  return `<div class="card" id="${id}"><h3>🧩 ${esc(t("solution"))}</h3>${tabs}${ss.map((s, i) => `<div class="pane" data-i="${i}" ${i ? "hidden" : ""}>${schemeHTML(q, s)}</div>`).join("")}
  <div class="fb"><b>★</b> ${dual(l => qf(q, l, "concept_summary"))}</div></div>`;
}
function bindTabs(root) {
  root.querySelectorAll(".tabs").forEach(tb => tb.querySelectorAll(".tab").forEach(b => b.onclick = () => {
    const card = tb.closest(".card"); tb.querySelectorAll(".tab").forEach(x => x.classList.toggle("on", x === b));
    card.querySelectorAll(".pane").forEach(p => p.hidden = p.dataset.i !== b.dataset.i);
  }));
}
function finishQ(q) {
  const max = 2, rmax = rmaxOf(q);
  record(q.question_id, { pts: ST.pts, max, rpts: ST.rpts, rmax, route: ST.route ? ST.route.verdict : null, tries: ST.tries, mode: "practice" });
  SESS.got += ST.pts + ST.rpts; SESS.max += max + rmax; SESS.log[SESS.i] = { full: ST.pts === 2 && ST.rpts === rmax };
  const last = SESS.i === SESS.ids.length - 1;
  const box = document.createElement("div"); box.innerHTML = solutionHTML(q) + `<div class="row"><button class="btn pri" id="nx">${esc(last ? t("progress") : t("next"))} →</button></div>`;
  $("#after").appendChild(box); bindTabs(box);
  $("#nx").onclick = () => { if (last) { routes.sessionEnd(); } else { SESS.i++; renderQ(); } };
}
routes.sessionEnd = () => {
  const pct = SESS.max ? Math.round(100 * SESS.got / SESS.max) : 0;
  app(`<h1>${esc(t("score"))}</h1><div class="card"><div class="score">${SESS.got.toString().replace(".", ",")}/${SESS.max}</div><div class="bar"><i style="width:${pct}%"></i></div><p class="muted small">${pct}% · ${esc(t("official"))}</p></div>
  <div class="row"><a class="btn pri" href="#/progress">${esc(t("progress"))}</a><a class="btn" href="#/practice">${esc(t("practice"))}</a></div>`);
};

/* ---------- mock test ---------- */
let MOCK = null, TIMER = null;
function stopTimer() { if (TIMER) { clearInterval(TIMER); TIMER = null; } }
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
routes.mock = () => {
  app(`<h1>${esc(t("mockSetup"))}</h1><div class="card"><div class="row"><label>${esc(t("nq"))} <select id="mn"><option>10</option><option selected>15</option><option>20</option></select></label>
  <label>${esc(t("minutes"))} <select id="mm"><option>20</option><option selected>30</option><option>45</option><option>60</option></select></label>
  <label>${esc(t("scope"))} <select id="ms"><option value="all">${esc(t("all"))}</option>${Object.keys(GROUPS).map(g => `<option value="${g}">${esc(GROUPS[g][SET.ui === "fr" ? "fr" : SET.ui === "bm" ? "bm" : "en"])}</option>`).join("")}</select></label></div>
  <p class="muted small">${esc(t("home_m"))}</p><button class="btn pri" id="mg">${esc(t("start"))}</button></div>`);
  $("#mg").onclick = () => {
    const n = +$("#mn").value, mins = +$("#mm").value, sc = $("#ms").value;
    const pool = BANK.filter(q => !q.sequence_id && (sc === "all" || (topicById[q.topic_id] || {}).group === sc));
    const r = rng(Date.now()); const arr = pool.slice(); for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    const pick = arr.slice(0, n);
    MOCK = { ids: pick.map(q => q.question_id), ans: {}, route: {}, left: mins * 60, total: mins * 60, i: 0, done: false };
    runMock();
  };
};
function runMock() {
  const m = MOCK, q = byId[m.ids[m.i]];
  const answered = m.ids.filter(id => m.ans[id]).length;
  app(`<div class="row sp"><span class="timer" id="tm">⏱ ${fmt(m.left)}</span><span class="muted small">${m.i + 1}/${m.ids.length} · ${answered} ${esc(t("answered"))}</span></div>
  <div class="pgs">${m.ids.map((id, i) => `<i data-i="${i}" style="cursor:pointer" class="${m.ans[id] ? "d" : ""} ${i === m.i ? "c" : ""}"></i>`).join("")}</div>
  <div class="card"><div class="stem">${dual(l => qf(q, l, "stem"))}</div>
  <div id="ch">${"ABCD".split("").map(k => `<button class="opt ${m.ans[q.question_id] === k ? "sel" : ""}" data-k="${k}"><span class="k">${k}</span><span class="t">${dual(l => qf(q, l, "choices", k))}</span></button>`).join("")}</div>
  ${q.route_choice ? `<h3 style="margin-top:14px">🧭 ${esc(t("routeQ"))}</h3><div id="rch">${q.route_choice.options.map(o => `<button class="opt ${m.route[q.question_id] === o.option_id ? "sel" : ""}" data-k="${o.option_id}"><span class="k">${o.option_id}</span><span class="t">${dualBL(o.text)}</span></button>`).join("")}</div>` : ""}</div>
  <div class="row sp"><button class="btn" id="pv" ${m.i ? "" : "disabled"}>←</button><button class="btn pri" id="sb">${esc(t("submit"))}</button><button class="btn" id="nx" ${m.i < m.ids.length - 1 ? "" : "disabled"}>→</button></div>`);
  document.querySelectorAll("#ch .opt").forEach(b => b.onclick = () => { m.ans[q.question_id] = b.dataset.k; runMock(); });
  document.querySelectorAll("#rch .opt").forEach(b => b.onclick = () => { m.route[q.question_id] = b.dataset.k; runMock(); });
  document.querySelectorAll(".pgs i").forEach(i => i.onclick = () => { m.i = +i.dataset.i; runMock(); });
  $("#pv").onclick = () => { m.i--; runMock(); }; $("#nx").onclick = () => { m.i++; runMock(); };
  $("#sb").onclick = () => { if (confirm(`${answered}/${m.ids.length} ${t("answered")}. ${t("submit")}?`)) submitMock(); };
  stopTimer(); TIMER = setInterval(() => { m.left--; const el = $("#tm"); if (el) el.textContent = "⏱ " + fmt(Math.max(0, m.left)); if (m.left <= 0) { stopTimer(); submitMock(true); } }, 1000);
}
function submitMock(timeUp) {
  stopTimer(); const m = MOCK; m.done = true; let got = 0, max = 0, rg = 0, rm = 0; const rows = [];
  m.ids.forEach(id => {
    const q = byId[id]; const a = m.ans[id]; const ok = a === q.correct_choice; const res = ok ? 2 : 0;
    const ro = q.route_choice ? q.route_choice.options.find(o => o.option_id === m.route[id]) : null; const rp = ro ? ROUTEPTS[ro.verdict] : 0; const rmax = rmaxOf(q);
    got += res; max += 2; rg += rp; rm += rmax;
    record(id, { pts: res, max: 2, rpts: rp, rmax, route: ro ? ro.verdict : (rmax ? "NONE" : null), tries: 1, mode: "mock" });
    rows.push({ q, a, ok, ro, rp });
  });
  const mark = max + rm ? 20 * (got + rg) / (max + rm) : 0;
  const fm = x => (Math.round(x * 10) / 10).toString().replace(".", ",");
  app(`<h1>${timeUp ? esc(t("timeUp")) + " — " : ""}${esc(t("score"))}</h1><div class="card"><div class="score">${fm(mark)}/20</div>
   <div class="muted">${esc(t("resultScore"))}: ${got}/${max} · ${esc(t("routeScore"))}: ${fm(rg)}/${rm}</div><p class="muted small">${esc(t("official"))}</p></div>
   <h2>${esc(t("review"))}</h2>` + rows.map((r, i) => `<details class="card"><summary>${i + 1}. ${r.ok ? "✅" : "❌"} ${r.a ? esc(r.a) : esc(t("noans"))} → ${r.q.correct_choice}${r.q.route_choice ? ` · 🧭 ${r.ro ? esc(r.ro.verdict) : esc(t("noans"))}` : ""}</summary>
     <div class="stem">${dual(l => qf(r.q, l, "stem"))}</div>
     ${r.a && !r.ok ? `<div class="fb bad">${dual(l => qf(r.q, l, "distractor_reason", r.a))}</div>` : ""}
     <div class="fb am"><b>${esc(t("reveal"))}:</b> ${r.q.correct_choice}) ${dual(l => qf(r.q, l, "choices", r.q.correct_choice))}</div>
     ${r.ro ? `<div class="fb ${r.ro.verdict === "BEST" ? "ok" : r.ro.verdict === "VALID" ? "am" : "bad"}">${dualBL(r.ro.feedback)}</div>` : ""}
     ${solutionHTML(r.q, "r" + i)}</details>`).join("") + `<div class="row"><a class="btn pri" href="#/progress">${esc(t("progress"))}</a><a class="btn" href="#/mock">${esc(t("mock"))}</a></div>`);
  document.querySelectorAll("details").forEach(d => bindTabs(d));
}

/* ---------- progress ---------- */
routes.progress = () => {
  const rows = TOPICS.map(tp => Object.assign({ tp }, topicStats(tp.id)));
  const seen = rows.reduce((a, r) => a + r.n, 0);
  const comp = compStats();
  const weak = rows.filter(r => r.n > 0 && r.status !== "mastered").sort((a, b) => a.ratio - b.ratio).slice(0, 5);
  app(`<h1>${esc(t("progress"))}</h1><p class="muted small">${seen}/${BANK.length} ${esc(t("stats"))} · ${esc(t("official"))}</p>
  <h2>${esc(t("competences"))}</h2><div class="card">${Object.keys(COMP).map(k => { const c = comp[k], p = c.m ? Math.round(100 * c.g / c.m) : 0; return `<div class="row sp small"><span>${esc(COMP[k][SET.ui === "fr" ? 1 : SET.ui === "bm" ? 2 : 0])}</span><span class="muted">${c.m ? p + "%" : "—"}</span></div><div class="bar" style="margin-bottom:8px"><i style="width:${p}%"></i></div>`; }).join("")}</div>
  <h2>${esc(t("dueTitle"))}</h2>${weak.length ? weak.map(r => `<a class="tile" style="margin:6px 0" href="#/topic/${encodeURIComponent(r.tp.id)}"><div class="row sp"><b>${esc(r.tp[CL()])}</b><span class="chip am">${Math.round(r.ratio * 100)}%</span></div></a>`).join("") : `<p class="muted">${esc(t("none"))}</p>`}
  <h2>${esc(t("topics"))}</h2><div class="card"><table><tr><th>${esc(t("topics"))}</th><th>${esc(t("questions"))}</th><th>%</th><th></th></tr>${rows.map(r => `<tr><td><a href="#/topic/${encodeURIComponent(r.tp.id)}">${esc(r.tp[CL()])}</a></td><td>${r.n}/${r.total}</td><td>${r.n ? Math.round(r.ratio * 100) : "—"}</td><td>${r.status === "mastered" ? "✅" : r.status === "learning" ? "…" : ""}</td></tr>`).join("")}</table></div>`);
};

/* ---------- rules ---------- */
const RULES = {
  bm: `<h1>Cara markah</h1>
<div class="card prose"><p><b>Apa yang diketahui dengan pasti.</b> Gaya Perancis menilai <i>kaedah</i> (méthode), bukan jawapan sahaja. Kurikulum Perancis menamakan enam kompetensi: <i>chercher, modéliser, représenter, raisonner, calculer, communiquer</i>; di pusat peperiksaan Perancis markah diberi kepada langkah yang betul walaupun jawapan akhir silap, dan <b>sebarang kaedah yang betul diterima</b>. Kuiz kursus MFI yang kami lihat: <b>30 minit, tanpa kalkulator</b>, markah bernombor.</p>
<p><b>Apa yang tidak diketahui.</b> UniKL/MFI <b>tidak menerbitkan</b> skema markah rasmi. Jadi markah di sini ialah <b>anggaran dalaman</b> yang diilhamkan oleh amalan Perancis — bukan markah rasmi MFI. Jika ada kertas lepas yang sudah ditanda, hantar supaya pemberat boleh diselaraskan.</p></div>
<h2>Markah satu soalan</h2><div class="card prose"><table><tr><th>Bahagian</th><th>Markah</th></tr>
<tr><td>Keputusan betul, cubaan pertama</td><td>2</td></tr><tr><td>Betul pada cubaan kedua (selepas petunjuk)</td><td>1</td></tr>
<tr><td>Pilih jalan kira terbaik <b>dengan sebab yang betul</b></td><td>1</td></tr><tr><td>Jalan kira lain yang sah (jawapan sama)</td><td>0,5</td></tr>
<tr><td>Jalan betul tetapi sebab salah / jalan tidak sah</td><td>0</td></tr></table>
<p class="small muted">Soalan tanpa pilihan jalan (hanya satu kaedah kursus) bernilai 2 markah sahaja.</p></div>
<h2>Ujian cuba /20</h2><div class="card prose"><p>Tanpa petunjuk dan cubaan semula. Markah = 20 × (markah diperoleh ÷ markah penuh). Masa lalai 30 minit.</p></div>
<h2>Topik “Disahkan”</h2><div class="card prose"><p>Sekurang-kurangnya 5 soalan dijawab, <b>≥ 70 %</b> markah keseluruhan dan <b>≥ 50 %</b> markah jalan kira.</p></div>
<h2>Kompetensi</h2><div class="card prose"><p>Setiap soalan ditag dengan 1–3 kompetensi (pemetaan kami sendiri). Bar di halaman Kemajuan ialah peratus markah bagi soalan bertag itu.</p></div>`,
  en: `<h1>How it is marked</h1>
<div class="card prose"><p><b>What is documented.</b> French practice values the <i>method</i>, not only the final answer. The curriculum names six competences (<i>chercher, modéliser, représenter, raisonner, calculer, communiquer</i>); French exam marking gives credit for correct steps even when the final result is wrong, and <b>any correct method is accepted</b>. The MFI course quiz we saw is <b>30 minutes, no calculator</b>, marks per question.</p>
<p><b>What is not.</b> UniKL/MFI does <b>not publish</b> its marking scheme. The marks here are an <b>internal estimate</b> inspired by French practice — not an official MFI mark. If you have a marked past paper, send it so the weights can be calibrated.</p></div>
<h2>One question</h2><div class="card prose"><table><tr><th>Part</th><th>Points</th></tr><tr><td>Correct result, first try</td><td>2</td></tr><tr><td>Correct on second try (after the hint)</td><td>1</td></tr>
<tr><td>Best route chosen <b>with the right reason</b></td><td>1</td></tr><tr><td>Another valid route (same answer)</td><td>0.5</td></tr><tr><td>Right method but wrong reason / invalid route</td><td>0</td></tr></table>
<p class="small muted">Questions with a single course method are worth 2 points only.</p></div>
<h2>Mock test /20</h2><div class="card prose"><p>No hints, no retry. Mark = 20 × earned ÷ possible. Default time 30 minutes.</p></div>
<h2>“Validated” topic</h2><div class="card prose"><p>At least 5 questions answered, <b>≥ 70 %</b> of all points and <b>≥ 50 %</b> of route points.</p></div>`,
  fr: `<h1>Comment c'est noté</h1>
<div class="card prose"><p><b>Ce qui est documenté.</b> La pratique française valorise la <i>méthode</i>, pas seulement le résultat. Le programme nomme six compétences (<i>chercher, modéliser, représenter, raisonner, calculer, communiquer</i>) ; en correction française, les étapes justes sont valorisées même si le résultat final est faux, et <b>toute méthode correcte est acceptée</b>. Le quiz MFI vu : <b>30 minutes, sans calculatrice</b>, points par question.</p>
<p><b>Ce qui ne l'est pas.</b> UniKL/MFI <b>ne publie pas</b> son barème. Les notes ici sont une <b>estimation interne</b> inspirée de la pratique française — pas une note officielle MFI. Envoyez un sujet corrigé pour calibrer les poids.</p></div>
<h2>Une question</h2><div class="card prose"><table><tr><th>Partie</th><th>Points</th></tr><tr><td>Résultat juste, du premier coup</td><td>2</td></tr><tr><td>Juste au second essai (après l'indice)</td><td>1</td></tr>
<tr><td>Meilleure voie choisie <b>avec la bonne raison</b></td><td>1</td></tr><tr><td>Autre voie valable (même réponse)</td><td>0,5</td></tr><tr><td>Bonne méthode mais mauvaise raison / voie invalide</td><td>0</td></tr></table>
<p class="small muted">Une question à méthode unique vaut 2 points.</p></div>
<h2>Test blanc /20</h2><div class="card prose"><p>Sans indice ni second essai. Note = 20 × points obtenus ÷ points possibles. Durée par défaut : 30 minutes.</p></div>
<h2>Chapitre « Validé »</h2><div class="card prose"><p>Au moins 5 questions, <b>≥ 70 %</b> des points et <b>≥ 50 %</b> des points de méthode.</p></div>`
};
routes.rules = () => app(RULES[SET.ui] || RULES.en);

/* ---------- settings ---------- */
routes.settings = () => {
  const seg = (id, opts, cur) => `<div class="seg" id="${id}">${opts.map(([v, l]) => `<button data-v="${v}" class="${v === cur ? "on" : ""}">${esc(l)}</button>`).join("")}</div>`;
  app(`<h1>${esc(t("settings"))}</h1><div class="card"><div class="row sp"><span>${esc(t("language"))}</span>${seg("su", [["bm", "BM"], ["en", "EN"], ["fr", "FR"]], SET.ui)}</div>
  <div class="row sp" style="margin-top:12px"><span>${esc(t("content"))}</span>${seg("sc", [["en", "EN"], ["fr", "FR"], ["both", t("both")]], SET.content)}</div></div>
  <div class="card"><div class="row"><button class="btn" id="ex">${esc(t("export"))}</button><label class="btn">${esc(t("import_"))}<input type="file" id="im" accept="application/json" hidden></label><button class="btn am" id="rs">${esc(t("reset"))}</button></div><textarea id="io" style="display:none;width:100%;height:120px;margin-top:10px"></textarea></div>
  <p class="muted small">v1.0 · ${BANK.length} ${esc(t("questions"))} · ${esc(t("offline"))}</p>`);
  $("#su").onclick = e => { const v = e.target.dataset.v; if (v) { SET.ui = v; saveSet(); nav(); routes.settings(); } };
  $("#sc").onclick = e => { const v = e.target.dataset.v; if (v) { SET.content = v; saveSet(); routes.settings(); } };
  $("#ex").onclick = () => {
    const blob = new Blob([JSON.stringify(PROG)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "pfm-progress.json"; a.click();
  };
  $("#im").onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); if (d && d.att) { PROG = d; saveProg(); alert("OK"); } } catch (er) { alert("Invalid file"); } }; r.readAsText(f); };
  $("#rs").onclick = () => { if (confirm(t("confirmReset"))) { PROG = { att: {} }; saveProg(); routes.settings(); } };
};

/* ---------- boot ---------- */
async function boot() {
  try {
    let b, tp, sq;
    if (window.PFM_DATA) { b = PFM_DATA.bank; tp = PFM_DATA.topics; sq = PFM_DATA.sequences; }
    else [b, tp, sq] = await Promise.all(["data/bank.json", "data/topics.json", "data/sequences.json"].map(u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.json(); })));
    BANK = b; TOPICS = tp.topics; GROUPS = {}; Object.keys(tp.groups).forEach(g => (GROUPS[g] = tp.groups[g])); SEQS = sq;
    BANK.forEach(q => (byId[q.question_id] = q)); TOPICS.forEach(x => (topicById[x.id] = x));
    nav(); window.addEventListener("hashchange", go); go();
  } catch (e) { app(`<p class="card">⚠ ${esc(e.message)}</p>`); }
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});
}
document.addEventListener("keydown", e => {
  const k = e.key.toUpperCase(); if ("ABCD".includes(k) && k.length === 1) { const b = document.querySelector(`#ch .opt[data-k="${k}"]:not(:disabled)`); if (b) b.click(); }
  if (e.key === "Enter") { const ok = $("#ok"); if (ok && !ok.disabled && ok.style.display !== "none") ok.click(); }
});
boot();
