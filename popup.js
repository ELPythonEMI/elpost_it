


const notepad    = document.getElementById('notepad');
const charCount  = document.getElementById('charCount');
const toast      = document.getElementById('toast');
const savedBadge = document.getElementById('savedBadge');
const noteSelect = document.getElementById('noteSelect');
const btnSave    = document.getElementById('btnSave');
const btnClear   = document.getElementById('btnClear');
const btnExport  = document.getElementById('btnExport');
const btnNew     = document.getElementById('btnNew');
const btnRename  = document.getElementById('btnRename');
const btnDelNote = document.getElementById('btnDelNote');
const swatches   = document.querySelectorAll('.color-swatch');

const META_KEY   = 'postit_meta_v3';
const DATA_KEY   = id => 'postit_data_' + id;
const TIME_KEY   = id => 'postit_time_' + id;

const DEFAULT_COLOR = {
  bg: '#fef08a', hd: '#facc15', bd: '#eab308', tx: '#713f12'
};

let meta = { current: null, notes: [] };


function sGet(keys, cb)    { chrome.storage.local.get(keys, cb); }
function sSet(obj, cb)     { chrome.storage.local.set(obj, cb || (() => {})); }
function sRemove(keys, cb) { chrome.storage.local.remove(keys, cb || (() => {})); }


function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function newId() { return 'n' + Date.now(); }


function applyColor(color) {
  const c = color || DEFAULT_COLOR;
  document.body.style.setProperty('--note-bg',        c.bg);
  document.body.style.setProperty('--note-header',    c.hd);
  document.body.style.setProperty('--note-border',    c.bd);
  document.body.style.setProperty('--note-text-dark', c.tx);

  swatches.forEach(s => {
    s.classList.toggle('active', s.dataset.bg === c.bg);
  });
}


function rebuildSelect() {
  noteSelect.innerHTML = '';
  meta.notes.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n.id;
    opt.textContent = n.name;
    if (n.id === meta.current) opt.selected = true;
    noteSelect.appendChild(opt);
  });
}


function loadCurrent(cb) {
  const id = meta.current;
  if (!id) { notepad.value = ''; charCount.textContent = '0'; savedBadge.textContent = ''; if (cb) cb(); return; }
  sGet([DATA_KEY(id), TIME_KEY(id)], data => {
    notepad.value = data[DATA_KEY(id)] || '';
    charCount.textContent = notepad.value.length;
    savedBadge.textContent = data[TIME_KEY(id)] ? 'Salvato alle ' + data[TIME_KEY(id)] : '';

    const cur = meta.notes.find(n => n.id === id);
    applyColor(cur && cur.color ? cur.color : DEFAULT_COLOR);
    if (cb) cb();
  });
}

function saveMeta(cb) { sSet({ [META_KEY]: meta }, cb); }


sGet([META_KEY], data => {
  if (data[META_KEY] && data[META_KEY].notes && data[META_KEY].notes.length) {
    meta = data[META_KEY];
  } else {
    const id = newId();
    meta = { current: id, notes: [{ id, name: 'Post-it 1', color: DEFAULT_COLOR }] };
    saveMeta();
  }
  rebuildSelect();
  loadCurrent();
});


noteSelect.addEventListener('change', () => {
  meta.current = noteSelect.value;
  saveMeta();
  loadCurrent();
});


notepad.addEventListener('input', () => { charCount.textContent = notepad.value.length; });


function saveNote() {
  const id   = meta.current;
  const time = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  sSet({ [DATA_KEY(id)]: notepad.value, [TIME_KEY(id)]: time }, () => {
    savedBadge.textContent = 'Salvato alle ' + time;
    showToast('Appunti salvati!');
  });
}


function clearNote() {
  if (!notepad.value.trim()) { showToast('Niente da cancellare'); return; }
  if (window.confirm('Cancellare il testo di questo Post-it?')) {
    const id = meta.current;
    sRemove([DATA_KEY(id), TIME_KEY(id)], () => {
      notepad.value = ''; charCount.textContent = '0'; savedBadge.textContent = '';
      showToast('Testo cancellato');
    });
  }
}


function exportTxt() {
  const cur  = meta.notes.find(n => n.id === meta.current);
  const name = cur ? cur.name : 'postit';
  const text = notepad.value;
  if (!text.trim()) { showToast('Nessun testo da esportare'); return; }
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = name.replace(/[^a-zA-Z0-9_\-]/g, '_') + '.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('File esportato: ' + a.download);
}


function newNote() {
  const name = window.prompt('Nome del nuovo Post-it:', 'Post-it ' + (meta.notes.length + 1));
  if (!name || !name.trim()) return;
  const id = newId();
  meta.notes.push({ id, name: name.trim(), color: DEFAULT_COLOR });
  meta.current = id;
  saveMeta(() => { rebuildSelect(); loadCurrent(); showToast('Nuovo Post-it creato!'); });
}


function renameNote() {
  const cur = meta.notes.find(n => n.id === meta.current);
  if (!cur) return;
  const name = window.prompt('Nuovo nome:', cur.name);
  if (!name || !name.trim()) return;
  cur.name = name.trim();
  saveMeta(() => { rebuildSelect(); showToast('Rinominato!'); });
}


function deleteNote() {
  if (meta.notes.length === 1) { showToast('Devi avere almeno un Post-it'); return; }
  const cur = meta.notes.find(n => n.id === meta.current);
  if (!window.confirm('Eliminare "' + cur.name + '"?')) return;
  const id = meta.current;
  sRemove([DATA_KEY(id), TIME_KEY(id)], () => {
    meta.notes  = meta.notes.filter(n => n.id !== id);
    meta.current = meta.notes[0].id;
    saveMeta(() => { rebuildSelect(); loadCurrent(); showToast('Post-it eliminato'); });
  });
}


swatches.forEach(s => {
  s.addEventListener('click', () => {
    const color = { bg: s.dataset.bg, hd: s.dataset.hd, bd: s.dataset.bd, tx: s.dataset.tx };
    const cur = meta.notes.find(n => n.id === meta.current);
    if (cur) cur.color = color;
    saveMeta();
    applyColor(color);
  });
});


btnSave.addEventListener('click',    saveNote);
btnClear.addEventListener('click',   clearNote);
btnExport.addEventListener('click',  exportTxt);
btnNew.addEventListener('click',     newNote);
btnRename.addEventListener('click',  renameNote);
btnDelNote.addEventListener('click', deleteNote);


function updateDatetime() {
  const now = new Date();
  document.getElementById('datetime').textContent =
    now.toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'long' }) +
    '  \u2022  ' +
    now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}
updateDatetime();
setInterval(updateDatetime, 10000);
notepad.focus();
