(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  var menuBtn = document.querySelector(".menu-toggle");
  var navLinks = document.querySelector(".nav-links");
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

  /* ---------- 3D hero stack: pointer-driven tilt ----------
     Only listens while the pointer is inside the stage, and only
     schedules one transform update per animation frame — cheap,
     GPU-composited, no continuous render loop. */
  var stage = document.querySelector(".stack-stage");
  var stack = document.getElementById("stack3d");
  if (stage && stack && !reduceMotion && matchMedia("(hover: hover)").matches) {
    var baseX = 52, baseZ = -38;
    var rafPending = false;
    var lastX = 0.5, lastY = 0.5;

    function applyTilt() {
      rafPending = false;
      var rx = baseX - (lastY - 0.5) * 22;
      var rz = baseZ + (lastX - 0.5) * 26;
      stack.style.transform = "rotateX(" + rx.toFixed(2) + "deg) rotateZ(" + rz.toFixed(2) + "deg)";
    }

    stage.addEventListener("pointermove", function (e) {
      var rect = stage.getBoundingClientRect();
      lastX = (e.clientX - rect.left) / rect.width;
      lastY = (e.clientY - rect.top) / rect.height;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(applyTilt);
      }
    });

    stage.addEventListener("pointerleave", function () {
      stack.style.transform = "rotateX(" + baseX + "deg) rotateZ(" + baseZ + "deg)";
    });
  }

  /* ---------- project card tilt ---------- */
  if (!reduceMotion && matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      var inner = card.querySelector(".tilt-inner");
      if (!inner) return;
      var raf = false, px = 0.5, py = 0.5;

      function apply() {
        raf = false;
        var rx = (py - 0.5) * -8;
        var ry = (px - 0.5) * 10;
        inner.style.transform = "rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
      }

      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        px = (e.clientX - rect.left) / rect.width;
        py = (e.clientY - rect.top) / rect.height;
        if (!raf) { raf = true; requestAnimationFrame(apply); }
      });
      card.addEventListener("pointerleave", function () {
        inner.style.transform = "rotateX(0deg) rotateY(0deg)";
      });
    });
  }
})();
