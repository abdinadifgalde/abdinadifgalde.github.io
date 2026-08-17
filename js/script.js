(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasHover = window.matchMedia("(hover: hover)").matches;

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- theme toggle ---------- */
  var root = document.documentElement;
  var themeBtn = document.querySelector(".theme-toggle");
  var savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    root.setAttribute("data-theme", "light");
    if (themeBtn) themeBtn.textContent = "◑";
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var isLight = root.getAttribute("data-theme") === "light";
      if (isLight) {
        root.removeAttribute("data-theme");
        localStorage.setItem("theme", "dark");
        themeBtn.textContent = "◐";
      } else {
        root.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
        themeBtn.textContent = "◑";
      }
    });
  }

  /* ---------- mobile nav ---------- */
  var menuBtn = document.getElementById("menuToggle");
  var navLinks = document.getElementById("navLinks");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.textContent = open ? "✕" : "☰";
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.textContent = "☰";
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- typed rotating headline word ---------- */
  var typedEl = document.getElementById("typedWord");
  if (typedEl && !reduceMotion) {
    var words = ["layer by layer.", "with intention.", "one commit at a time."];
    var wIndex = 0, charIndex = words[0].length, deleting = false;
    typedEl.textContent = words[0];
    typedEl.classList.add("typing");

    function tick() {
      var current = words[wIndex];
      if (!deleting) {
        charIndex++;
        if (charIndex > current.length) {
          deleting = true;
          setTimeout(tick, 1600);
          return;
        }
      } else {
        charIndex--;
        if (charIndex < 0) {
          deleting = false;
          wIndex = (wIndex + 1) % words.length;
          charIndex = 0;
        }
      }
      typedEl.textContent = words[wIndex].slice(0, charIndex);
      setTimeout(tick, deleting ? 35 : 55);
    }
    setTimeout(tick, 1600);
  } else if (typedEl) {
    typedEl.textContent = "layer by layer.";
  }

  /* ---------- skills accordion ---------- */
  var skillItems = document.querySelectorAll(".skill-item");
  skillItems.forEach(function (item) {
    var head = item.querySelector(".skill-item-head");
    if (!head) return;
    head.addEventListener("click", function () {
      var wasOpen = item.classList.contains("open");
      skillItems.forEach(function (i) { i.classList.remove("open"); });
      if (!wasOpen) item.classList.add("open");
    });
  });

  /* ---------- language bar fill on reveal ---------- */
  var bars = document.querySelectorAll(".bar-fill");
  if (bars.length) {
    if ("IntersectionObserver" in window) {
      var barIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("filled");
            barIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      bars.forEach(function (b) { barIo.observe(b); });
    } else {
      bars.forEach(function (b) { b.classList.add("filled"); });
    }
  }

  /* ---------- highlight carousel dots ---------- */
  var track = document.getElementById("highlightTrack");
  var dotsWrap = document.getElementById("highlightDots");
  if (track && dotsWrap) {
    var cards = track.querySelectorAll(".highlight-card");
    cards.forEach(function (_, i) {
      var dot = document.createElement("span");
      dot.className = "dot" + (i === 0 ? " active" : "");
      dot.addEventListener("click", function () {
        cards[i].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", inline: "start", block: "nearest" });
      });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll(".dot");
    var scrollTimeout;
    track.addEventListener("scroll", function () {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function () {
        var trackRect = track.getBoundingClientRect();
        var closest = 0, closestDist = Infinity;
        cards.forEach(function (card, i) {
          var rect = card.getBoundingClientRect();
          var dist = Math.abs(rect.left - trackRect.left);
          if (dist < closestDist) { closestDist = dist; closest = i; }
        });
        dots.forEach(function (d, i) { d.classList.toggle("active", i === closest); });
      }, 80);
    });
  }

  /* ---------- contact: copy to clipboard ---------- */
  document.querySelectorAll(".contact-link[data-copy]").forEach(function (btn) {
    var actionEl = btn.querySelector(".contact-link-action");
    var defaultLabel = actionEl ? actionEl.textContent : "copy";
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var done = function () {
        btn.classList.add("copied");
        if (actionEl) actionEl.textContent = "copied";
        setTimeout(function () {
          btn.classList.remove("copied");
          if (actionEl) actionEl.textContent = defaultLabel;
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done).catch(done);
      } else {
        done();
      }
    });
  });

  /* ---------- active nav link on scroll ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var navAnchors = document.querySelectorAll(".nav-links a[data-nav]");
  if (sections.length && navAnchors.length && "IntersectionObserver" in window) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute("id");
          navAnchors.forEach(function (a) {
            a.classList.toggle("active-link", a.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { navIo.observe(s); });
  }

  /* ---------- scroll-up button ---------- */
  var scrollUpBtn = document.getElementById("scrollUp");
  if (scrollUpBtn) {
    window.addEventListener("scroll", function () {
      scrollUpBtn.classList.toggle("show", window.scrollY > 480);
    });
    scrollUpBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
})();
