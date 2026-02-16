// data needed:
// jobtitle
// location
// first name
// last name
// mobile phone
// mail

fetch("signature-template.html")
  .then((res) => res.text())
  .then((template) => {
    const user = {
      FIRST_NAME: "Max",
      LAST_NAME: "Mustermann",
      JOB_TITLE: "Vorstand",
      MOBILE: "+49 170 1234567",
      EMAIL: "test.testi@cofinpro.de",
    };

    let html = template;
    Object.entries(user).forEach(([key, value]) => {
      html = html.replaceAll(`{{${key}}}`, value);
    });

    document.getElementsByClassName("signature-container")[0].innerHTML = html;
  });

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
});
