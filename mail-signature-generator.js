// data needed:
// jobtitle
// location
// first name
// last name
// mobile phone
// mail

const locations = {
  FRANKFURT: `Hanauer Landstraße 211<br />
    60314 Frankfurt am Main`,
  BERLIN: `Alexanderplatz 1<br />
    10178 Berlin`,
  MUNICH: `Marienplatz 1<br />
    80331 München`,
  HAMBURG: `Mönckebergstraße 1<br />
    20095 Hamburg`,
};

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
      LOCATION: locations.FRANKFURT,
      MOBILE: "+49 170 1234567",
      EMAIL: "test.testi@cofinpro.de",
    let lastDerivedEmail = "";

    function deriveEmailFromNames(first, last) {
      const sanitize = (s) =>
        s
          .toLowerCase()
          .trim()
          .replace(/\s+/g, ".")
          .replace(/[^a-z0-9._-]/g, "");
      if (!first || !last) return "";
      return `${sanitize(first)}.${sanitize(last)}@cofinpro.de`;
    }
    };
    const last = loadLast() || defaults;
    renderSignature(last);
    populateForm(last);
  });

function renderSignature(user) {
  if (!signatureTemplate) return;
      return {
        FIRST_NAME: val("firstName").trim(),
        LAST_NAME: val("lastName").trim(),
        JOB_TITLE: val("jobTitle"),
        LOCATION: locationValue,
        MOBILE: val("mobile"),
        EMAIL: val("email"),
      };
      .replace(/[^a-z0-9._-]/g, "");
  let email = val("email").trim();
  if (first && last) {
    const local = `${sanitize(first)}.${sanitize(last)}`;
    email = `${local}@cofinpro.de`;
  }
  return {
    FIRST_NAME: first,
    LAST_NAME: last,
    JOB_TITLE: val("jobTitle"),
    LOCATION: locationValue,
    MOBILE: val("mobile"),
    EMAIL: email,
  };
}

function populateForm(user) {
      setVal("email", user.EMAIL);
      // determine whether the saved email matches a derived value
      const derived = deriveEmailFromNames(user.FIRST_NAME, user.LAST_NAME);
      lastDerivedEmail = derived && derived === (user.EMAIL || "") ? derived : "";
  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v || "";
  };
  setVal("firstName", user.FIRST_NAME);
  setVal("lastName", user.LAST_NAME);
  setVal("jobTitle", user.JOB_TITLE);
  // If the saved LOCATION matches one of our location values, set the select to the key.
  const locKey = Object.keys(locations).find(
    (k) => locations[k] === user.LOCATION,
  );
  setVal("location", locKey || user.LOCATION);
  setVal("mobile", user.MOBILE);
  setVal("email", user.EMAIL);
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
        const first = (document.getElementById("firstName")?.value || "").trim();
        const last = (document.getElementById("lastName")?.value || "").trim();
        const emailEl = document.getElementById("email");
        const derived = deriveEmailFromNames(first, last);
        if (emailEl) {
          // only overwrite when empty or previously matched the derived value
          if (emailEl.value === "" || emailEl.value === lastDerivedEmail) {
            emailEl.value = derived;
            lastDerivedEmail = derived;
          }
        }
        const user = getFormUser();
        renderSignature(user);
        saveLast(user);
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
});
