(function () {
  var ACCESS_KEY = "bd36b481-7015-40ca-8d48-b9ec804ae6b6";
  var ENDPOINT = "https://api.web3forms.com/submit";

  document.querySelectorAll("form.js-contact-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      var button = form.querySelector('[type="submit"]');
      if (button) button.disabled = true;

      var data = new FormData(form);
      var subject = String(data.get("subject") || data.get("_subject") || "Website inquiry");
      data.delete("_subject");
      data.set("access_key", ACCESS_KEY);
      data.set("subject", subject);

      var fromName = data.get("name") || data.get("Name") || "";
      if (fromName) data.set("from_name", String(fromName));

      fetch(ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          return response.json().then(function (payload) {
            return { ok: response.ok, payload: payload };
          });
        })
        .then(function (result) {
          if (!result.ok || !result.payload || !result.payload.success) {
            var message =
              (result.payload && result.payload.message) || "send failed";
            throw new Error(message);
          }
          window.location.href = form.getAttribute("data-next") || "thanks.html";
        })
        .catch(function () {
          if (button) button.disabled = false;
          window.alert(
            "送信に失敗しました。LinkedIn か Facebook から連絡してください。"
          );
        });
    });
  });
})();
