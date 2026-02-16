// data needed:
// jobtitle
// location
// first name
// last name
// mobile phone
// mail

let signatureTemplate = null;
fetch("signature-template.html")
  .then((res) => res.text())
  .then((template) => {
    signatureTemplate = template;
    // initial render with defaults or saved last
    const defaults = {
      FIRST_NAME: "Max",
      LAST_NAME: "Mustermann",
      JOB_TITLE: "Vorstand",
      LOCATION: "Frankfurt",
      MOBILE: "+49 170 1234567",
      EMAIL: "test.testi@cofinpro.de",
    };
    const last = loadLast() || defaults;
    renderSignature(last);
    populateForm(last);
    populatePresetSelect();
  });

function renderSignature(user) {
  if (!signatureTemplate) return;
  let html = signatureTemplate;
  Object.entries(user).forEach(([key, value]) => {
    html = html.replaceAll(`{{${key}}}`, value || "");
  });
  const container = document.getElementsByClassName("signature-container")[0];
  if (container) container.innerHTML = html;
}

function getFormUser() {
  return {
    FIRST_NAME: document.getElementById("firstName").value || "",
    LAST_NAME: document.getElementById("lastName").value || "",
    JOB_TITLE: document.getElementById("jobTitle").value || "",
    LOCATION: document.getElementById("location").value || "",
    MOBILE: document.getElementById("mobile").value || "",
    EMAIL: document.getElementById("email").value || "",
  };
}

function populateForm(user) {
  if (!user) return;
  document.getElementById("firstName").value = user.FIRST_NAME || "";
  document.getElementById("lastName").value = user.LAST_NAME || "";
  document.getElementById("jobTitle").value = user.JOB_TITLE || "";
  document.getElementById("location").value = user.LOCATION || "";
  document.getElementById("mobile").value = user.MOBILE || "";
  document.getElementById("email").value = user.EMAIL || "";
}

function debounce(fn, wait) {
  let t = null;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function saveLast(user) {
  try {
    localStorage.setItem("sig_last", JSON.stringify(user));
  } catch (e) {}
}

function loadLast() {
  try {
    const raw = localStorage.getItem("sig_last");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function loadPresets() {
  try {
    const raw = localStorage.getItem("sig_presets");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function savePreset(name, user) {
  if (!name) return;
  const presets = loadPresets();
  presets[name] = user;
  localStorage.setItem("sig_presets", JSON.stringify(presets));
  populatePresetSelect();
}

function deletePreset(name) {
  if (!name) return;
  const presets = loadPresets();
  delete presets[name];
  localStorage.setItem("sig_presets", JSON.stringify(presets));
  populatePresetSelect();
}

function populatePresetSelect() {
  const sel = document.getElementById("presetSelect");
  if (!sel) return;
  const presets = loadPresets();
  // clear options except first
  sel.innerHTML = '<option value="">--Presets--</option>';
  Object.keys(presets).forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });
}

async function copySignature() {
  const container = document.getElementsByClassName("signature-container")[0];
  if (!container) return;
  const html = container.innerHTML;
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const blobHtml = new Blob([html], { type: "text/html" });
      const blobText = new Blob([container.innerText], { type: "text/plain" });
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": blobHtml, "text/plain": blobText }),
      ]);
      alert("Signature copied to clipboard");
      return;
    }
  } catch (err) {
    // fall through to legacy fallback
  }

  // Fallback: use a temporary contentEditable element and execCommand
  const fallbackEl = document.createElement("div");
  fallbackEl.contentEditable = "true";
  fallbackEl.style.position = "fixed";
  fallbackEl.style.left = "-9999px";
  fallbackEl.innerHTML = html;
  document.body.appendChild(fallbackEl);
  const range = document.createRange();
  range.selectNodeContents(fallbackEl);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  try {
    document.execCommand("copy");
    alert("Signature copied to clipboard");
  } catch (e) {
    alert("Copy failed");
  }
  sel.removeAllRanges();
  document.body.removeChild(fallbackEl);
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("copySignatureBtn");
  if (btn) btn.addEventListener("click", copySignature);
  // wire form inputs to live preview
  const inputs = [
    "firstName",
    "lastName",
    "jobTitle",
    "location",
    "mobile",
    "email",
  ];
  const update = debounce(() => {
    const user = getFormUser();
    renderSignature(user);
    saveLast(user);
  }, 250);
  inputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", update);
  });

  // preset buttons
  const saveBtn = document.getElementById("savePresetBtn");
  const loadBtn = document.getElementById("loadPresetBtn");
  const delBtn = document.getElementById("deletePresetBtn");
  const sel = document.getElementById("presetSelect");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const name = prompt("Preset name:");
      if (!name) return;
      savePreset(name, getFormUser());
    });
  }
  if (loadBtn) {
    loadBtn.addEventListener("click", () => {
      const name = sel.value;
      if (!name) return;
      const presets = loadPresets();
      const user = presets[name];
      if (user) {
        populateForm(user);
        renderSignature(user);
        saveLast(user);
      }
    });
  }
  if (delBtn) {
    delBtn.addEventListener("click", () => {
      const name = sel.value;
      if (!name) return;
      if (confirm(`Delete preset "${name}"?`)) {
        deletePreset(name);
      }
    });
  }
});
