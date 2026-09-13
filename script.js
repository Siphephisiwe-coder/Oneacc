document.addEventListener("DOMContentLoaded", function () {
  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 60, 360) + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- Lead forms ---------- */
  document.querySelectorAll("form.lead-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var card = form.closest(".form-card");
      var status = form.querySelector(".form-status");
      var submitBtn = form.querySelector("button[type='submit']");
      var endpoint = form.getAttribute("action");

      if (!endpoint || endpoint.indexOf("YOUR_FORM_ID") !== -1) {
        status.textContent = "This form isn't connected to a backend yet — see the note in the code comments for how to wire it up.";
        status.className = "form-status show error";
        return;
      }

      submitBtn.disabled = true;
      var originalLabel = submitBtn.textContent;
      submitBtn.textContent = "Sending…";

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          if (response.ok) {
            if (card) {
              var successHTML =
                '<div class="success-block">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>' +
                "<h4>Received</h4>" +
                "<p>Thank you. I'll personally review your enquiry and be in touch shortly. A confirmation is on its way to your inbox.</p>" +
                "</div>";
              form.outerHTML = successHTML;
            }
          } else {
            return response.json().then(function (data) {
              throw new Error(
                data && data.errors ? data.errors.map(function (e) { return e.message; }).join(", ") : "Something went wrong. Please try again."
              );
            });
          }
        })
        .catch(function (err) {
          status.textContent = err.message || "Something went wrong. Please try again.";
          status.className = "form-status show error";
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        });
    });
  });

  /* ---------- Draggable chatbot ---------- */
  var chatToggle = document.getElementById("chat-toggle");
  var chatPanel = document.getElementById("chat-panel");
  var chatClose = document.getElementById("chat-close");
  var chatBody = document.getElementById("chat-body");
  var chatInput = document.getElementById("chat-input");
  var chatSend = document.getElementById("chat-send");

  if (chatToggle) {
    // Fixed position (see .chat-toggle / .chat-panel in styles.css) — stacked
    // directly under the WhatsApp button, right-aligned, no dragging.
    function togglePanel() {
      if (!chatPanel) return;
      chatPanel.classList.toggle("open");
    }

    chatToggle.addEventListener("click", togglePanel);
    if (chatClose) chatClose.addEventListener("click", togglePanel);

    var FAQ = [
      { k: ["vat"], a: "VAT registration, calculations, and VAT201 submissions are all handled end-to-end. Once you're registered, filings are typically monthly or bi-monthly depending on your category." },
      { k: ["paye", "payroll", "employee"], a: "Employees' Tax covers PAYE, UIF and SDL — monthly EMP201 submissions and bi-annual EMP501 reconciliations, plus IRP5/IT3(a) certificates." },
      { k: ["document", "documents", "need"], a: "It depends on the service, but common documents are your SARS eFiling login, ID/company registration docs, bank statements, and prior assessments. I can confirm exactly what's needed for your situation in a consultation." },
      { k: ["deadline", "sars deadline", "due"], a: "SARS deadlines vary by tax type — provisional tax, VAT201s, and EMP501 reconciliations all run on different cycles. I keep every client's deadlines tracked directly, so nothing slips." },
      { k: ["dispute", "objection", "penalty"], a: "Tax disputes are handled with formal objections and appeals (RFR, NOO, NOA), and I can also request penalty or interest remission where it's warranted." },
      { k: ["price", "cost", "fee", "quote"], a: "Pricing depends on the scope of work, so I don't quote generic figures here — the fastest way to get a real number is to request a quote and I'll come back with something tailored." },
      { k: ["accounting", "bookkeeping", "advisory"], a: "Accounting & Advisory covers monthly bookkeeping, annual financial statements, management reporting, and general business advisory — the backbone behind accurate tax filings." },
    ];

    function botReply(text) {
      var lower = text.toLowerCase();
      var match = FAQ.find(function (item) {
        return item.k.some(function (kw) { return lower.indexOf(kw) !== -1; });
      });
      return match
        ? match.a + " For anything specific to your situation, it's best to book a free consultation."
        : "Good question — for anything specific to your situation, the most useful next step is to book a free consultation so we can go through your details directly.";
    }

    function addMsg(text, who) {
      var div = document.createElement("div");
      div.className = "chat-msg " + who;
      div.textContent = text;
      chatBody.appendChild(div);
      chatBody.scrollTop = chatBody.scrollHeight;
      return div;
    }

    function sendMessage() {
      var text = chatInput.value.trim();
      if (!text) return;
      addMsg(text, "user");
      chatInput.value = "";
      var typing = addMsg("typing…", "bot typing");
      setTimeout(function () {
        typing.remove();
        addMsg(botReply(text), "bot");
      }, 550);
    }

    if (chatSend) chatSend.addEventListener("click", sendMessage);
    if (chatInput) {
      chatInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") sendMessage();
      });
    }
  }
});
