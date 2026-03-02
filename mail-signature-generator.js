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
  BERLIN: `Charlottenstraße 24<br />
    10117 Berlin`,
  KARLSRUHE: `Ludwig-Erhard-Allee 10<br />
    76131 Karlsruhe `,
  MÜNCHEN: `Landsberger Straße 302<br />
    80687 München`,
  KÖLN: `Im Mediapark 8<br />
    50670 Köln`,
  HANNOVER: `Bahnhofstraße 8<br />
    30159 Hannover `,
  STUTTGART: `Königstraße 10c<br />
    70173 Stuttgart`,
};

let masterData = [];

// Load and parse CSV file
async function loadMasterData() {
  try {
    const response = await fetch("./master-data.csv");
    const csv = await response.text();
    const lines = csv.trim().split("\n");
    if (lines.length < 2) return;

    // Parse CSV header
    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, ""));
    const firstNameIdx = headers.findIndex((h) =>
      h.toLowerCase().includes("first"),
    );
    const lastNameIdx = headers.findIndex((h) =>
      h.toLowerCase().includes("last"),
    );
    const jobTitleIdx = headers.findIndex((h) =>
      h.toLowerCase().includes("job"),
    );
    const locationIdx = headers.findIndex((h) =>
      h.toLowerCase().includes("location"),
    );
    const mobileIdx = headers.findIndex((h) =>
      h.toLowerCase().includes("mobile"),
    );
    const emailIdx = headers.findIndex((h) =>
      h.toLowerCase().includes("email"),
    );

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i]
        .split(",")
        .map((cell) => cell.trim().replace(/^"|"$/g, ""));
      if (row.length > 1) {
        masterData.push({
          firstName: row[firstNameIdx]?.trim() || "",
          lastName: row[lastNameIdx]?.trim() || "",
          jobTitle: row[jobTitleIdx]?.trim() || "",
          location: row[locationIdx]?.trim() || "",
          mobile: row[mobileIdx]?.trim() || "",
          email: row[emailIdx]?.trim() || "",
        });
      }
    }
    populateDataLists();
  } catch (e) {
    console.log("Error loading master data:", e);
  }
}

function populateDataLists() {
  const firstNameList = document.getElementById("firstNameList");
  const lastNameList = document.getElementById("lastNameList");

  if (firstNameList) {
    const uniqueFirstNames = [...new Set(masterData.map((d) => d.firstName))];
    firstNameList.innerHTML = uniqueFirstNames
      .map((name) => `<option value="${name}">`)
      .join("");
  }

  if (lastNameList) {
    const uniqueLastNames = [...new Set(masterData.map((d) => d.lastName))];
    lastNameList.innerHTML = uniqueLastNames
      .map((name) => `<option value="${name}">`)
      .join("");
  }
}

function findAndPrefillByName() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();

  if (!firstName || !lastName) return;

  const match = masterData.find(
    (d) =>
      d.firstName.toLowerCase() === firstName.toLowerCase() &&
      d.lastName.toLowerCase() === lastName.toLowerCase(),
  );

  if (match) {
    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v || "";
    };
    setVal("jobTitle", match.jobTitle);
    setVal("mobile", match.mobile);
    setVal("email", match.email);
    // Find location key by name
    const locKey = Object.keys(locations).find(
      (k) => k.toLowerCase() === match.location.toUpperCase(),
    );
    setVal("location", locKey || match.location);

    // Re-trigger update to render signature
    const user = getFormUser();
    renderSignature(user);
    saveLast(user);
  }
}

let signatureTemplate = null;
fetch("signature-template.html")
  .then((res) => res.text())
  .then((template) => {
    signatureTemplate = template;
    // initial render with defaults or saved last
    const defaults = {
      FIRST_NAME: "Max",
      LAST_NAME: "Mustermann",
      JOB_TITLE: "Consultant",
      LOCATION: locations.FRANKFURT,
      MOBILE: "+49 170 1234567",
      EMAIL: "max.mustermann@cofinpro.de",
    };
    const last = loadLast() || defaults;
    renderSignature(last);
    populateForm(last);
  });

// Load master data from CSV
loadMasterData();

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
  const val = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : "";
  };
  const rawLoc = val("location");
  const locationValue = locations[rawLoc] ? locations[rawLoc] : rawLoc;
  const first = val("firstName").trim();
  const last = val("lastName").trim();
  const sanitize = (s) =>
    s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ".")
      .replace(/[^a-z0-9._-]/g, "");
  let email = val("email").trim();
  if (!email && first && last) {
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
  if (!user) return;
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

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("copySignatureBtn");
  if (btn) btn.addEventListener("click", copySignature);

  // Add autocomplete listeners for name fields
  const firstNameEl = document.getElementById("firstName");
  const lastNameEl = document.getElementById("lastName");
  if (firstNameEl) {
    firstNameEl.addEventListener("change", findAndPrefillByName);
    firstNameEl.addEventListener("blur", findAndPrefillByName);
  }
  if (lastNameEl) {
    lastNameEl.addEventListener("change", findAndPrefillByName);
    lastNameEl.addEventListener("blur", findAndPrefillByName);
  }

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
    // if email input is empty but generated value exists, show it
    const emailEl = document.getElementById("email");
    if (emailEl && !emailEl.value && user.EMAIL) {
      emailEl.value = user.EMAIL;
    }
    renderSignature(user);
    saveLast(user);
  }, 250);
  inputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", update);
  });
});
