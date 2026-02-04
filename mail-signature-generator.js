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
      JOB_TITLE: "Gigachad",
      MOBILE: "+49 170 1234567",
      EMAIL: "test.testi@cofinpro.de",
    };

    let html = template;
    Object.entries(user).forEach(([key, value]) => {
      html = html.replaceAll(`{{${key}}}`, value);
    });

    document.getElementsByClassName("signature-container")[0].innerHTML = html;
  });
