(function () {
  var TO = "keiohigh2nd@gmail.com";

  function buildBody(form) {
    var data = new FormData(form);
    var lines = [];
    data.forEach(function (value, key) {
      if (key.charAt(0) === "_") return;
      var text = String(value || "").trim();
      if (!text) return;
      lines.push(key + ": " + text);
    });
    return lines.join("\n");
  }

  document.querySelectorAll("form.js-contact-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var subject = String(data.get("_subject") || "Website inquiry");
      var body = buildBody(form);
      var mailto =
        "mailto:" +
        TO +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      var next = form.getAttribute("data-next") || "thanks.html";
      window.location.href = mailto;
      window.setTimeout(function () {
        window.location.href = next;
      }, 600);
    });
  });
})();
