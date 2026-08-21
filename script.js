(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Theme: dark / light, persisted, respects system preference on first visit
     --------------------------------------------------------------------- */
  var root = document.documentElement;
  var toggleBtn = document.getElementById("theme-toggle");
  var modeLabel = toggleBtn ? toggleBtn.querySelector("[data-mode-label]") : null;
  var STORAGE_KEY = "kt-portfolio-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (modeLabel) modeLabel.textContent = theme === "light" ? "LIGHT" : "DARK";
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
      toggleBtn.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
    }
  }

  function getInitialTheme() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch (e) { /* storage unavailable, fall through */ }
    var prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    return prefersLight ? "light" : "dark";
  }

  applyTheme(getInitialTheme());

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
    });
  }

  /* ---------------------------------------------------------------------
     Hero timecode ticker (decorative, mimics a rolling record indicator)
     --------------------------------------------------------------------- */
  var tcEl = document.getElementById("hero-timecode");
  if (tcEl && !reduceMotion) {
    var frame = 0;
    function pad(n) { return String(n).padStart(2, "0"); }
    function tick() {
      frame++;
      var fps = 24;
      var totalSeconds = Math.floor(frame / fps);
      var h = Math.floor(totalSeconds / 3600);
      var m = Math.floor((totalSeconds % 3600) / 60);
      var s = totalSeconds % 60;
      var f = frame % fps;
      tcEl.textContent = pad(h) + ":" + pad(m) + ":" + pad(s) + ":" + pad(f);
    }
    setInterval(tick, 1000 / 24);
  }

  /* ---------------------------------------------------------------------
     Ruler ticks — generate a timecode ruler across the hero divider
     --------------------------------------------------------------------- */
  var rulerTrack = document.getElementById("ruler-track");
  if (rulerTrack) {
    var tickCount = 40;
    var html = "";
    for (var i = 0; i < tickCount; i++) {
      var isMajor = i % 5 === 0;
      var label = isMajor ? "00:0" + (i / 5) + ":00" : "";
      html += '<span class="' + (isMajor ? "tick-major" : "") + '">' + label + "</span>";
    }
    rulerTrack.innerHTML = html;
  }

  /* ---------------------------------------------------------------------
     Reel grid — 15 vertical (9:16) clips, watermarked with your name.

     TO ADD YOUR VIDEOS: put files in /assets/reels/ named clip-01.mp4
     through clip-15.mp4 (or edit the "src" values below to match your own
     filenames). Optional poster thumbnails go in /assets/reels/ too —
     if you skip them, the color-bar placeholder is used automatically.
     Edit CLIENT_NAME or any "title" below to relabel a card.
     --------------------------------------------------------------------- */
  var CLIENT_NAME = "KIRK TOLENTINO";
  var CLIP_COUNT = 15;
  var clips = [];
  for (var c = 1; c <= CLIP_COUNT; c++) {
    var idx = String(c).padStart(2, "0");
    clips.push({
      title: "Clip " + idx,
      src: "assets/reels/clip-" + idx + ".mp4",
      poster: "assets/poster-vertical.svg"
    });
  }

  var reelGrid = document.getElementById("reel-grid");

  if (reelGrid) {
    clips.forEach(function (clip, i) {
      var idx = String(i + 1).padStart(2, "0");

      var card = document.createElement("button");
      card.type = "button";
      card.className = "reel-card";
      card.setAttribute("aria-label", "Play " + clip.title);
      card.dataset.index = i;

      var vid = document.createElement("video");
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.preload = "none";
      vid.poster = clip.poster;
      var source = document.createElement("source");
      source.src = clip.src;
      source.type = "video/mp4";
      vid.appendChild(source);
      card.appendChild(vid);

      var noSig = document.createElement("div");
      noSig.className = "reel-nosignal hidden";
      noSig.innerHTML =
        '<div class="bars bars-v" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>' +
        '<p class="ns-title">EMPTY SLOT</p><p class="ns-sub">' + clip.src + "</p>";
      card.appendChild(noSig);

      var overlay = document.createElement("div");
      overlay.className = "reel-card-overlay";
      overlay.innerHTML =
        '<span class="reel-index">' + idx + " / " + CLIP_COUNT + "</span>" +
        '<span class="reel-watermark">' + CLIENT_NAME + "</span>";
      card.appendChild(overlay);

      var playIcon = document.createElement("span");
      playIcon.className = "reel-play";
      playIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      card.appendChild(playIcon);

      vid.addEventListener("error", function () {
        noSig.classList.remove("hidden");
        vid.style.display = "none";
      });
      setTimeout(function () {
        if (vid.networkState === 3 /* NETWORK_NO_SOURCE */) {
          noSig.classList.remove("hidden");
          vid.style.display = "none";
        }
      }, 1500);

      if (!reduceMotion) {
        card.addEventListener("mouseenter", function () {
          vid.preload = "metadata";
          var p = vid.play();
          if (p && p.catch) p.catch(function () {});
        });
        card.addEventListener("mouseleave", function () {
          vid.pause();
          vid.currentTime = 0;
        });
      }

      card.addEventListener("click", function () {
        openLightbox(i);
      });

      reelGrid.appendChild(card);
    });
  }

  /* ---------------------------------------------------------------------
     Lightbox player with prev / next through all 15 clips
     --------------------------------------------------------------------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxVideo = document.getElementById("lightbox-video");
  var lightboxNoSignal = document.getElementById("lightbox-nosignal");
  var lightboxNoSignalPath = document.getElementById("lightbox-nosignal-path");
  var lightboxCount = document.getElementById("lightbox-count");
  var lightboxClose = document.getElementById("lightbox-close");
  var lightboxBackdrop = document.getElementById("lightbox-backdrop");
  var lightboxPrev = document.getElementById("lightbox-prev");
  var lightboxNext = document.getElementById("lightbox-next");
  var currentClipIndex = 0;

  function openLightbox(index) {
    if (!lightbox) return;
    currentClipIndex = index;
    loadLightboxClip(index);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lightboxVideo) lightboxVideo.pause();
  }

  function loadLightboxClip(index) {
    var clip = clips[index];
    if (!clip || !lightboxVideo) return;

    lightboxVideo.style.display = "";
    if (lightboxNoSignal) lightboxNoSignal.classList.add("hidden");
    lightboxVideo.pause();
    lightboxVideo.src = clip.src;
    lightboxVideo.poster = clip.poster;
    lightboxVideo.load();
    var playPromise = lightboxVideo.play();
    if (playPromise && playPromise.catch) playPromise.catch(function () {});

    if (lightboxCount) lightboxCount.textContent = String(index + 1).padStart(2, "0") + " / " + CLIP_COUNT;
    if (lightboxNoSignalPath) lightboxNoSignalPath.textContent = clip.src;
    if (lightboxPrev) lightboxPrev.disabled = index === 0;
    if (lightboxNext) lightboxNext.disabled = index === clips.length - 1;
  }

  if (lightboxVideo) {
    lightboxVideo.addEventListener("error", function () {
      if (lightboxNoSignal) lightboxNoSignal.classList.remove("hidden");
      lightboxVideo.style.display = "none";
    });
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener("click", closeLightbox);

  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", function () {
      if (currentClipIndex > 0) { currentClipIndex--; loadLightboxClip(currentClipIndex); }
    });
  }
  if (lightboxNext) {
    lightboxNext.addEventListener("click", function () {
      if (currentClipIndex < clips.length - 1) { currentClipIndex++; loadLightboxClip(currentClipIndex); }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (!lightbox || !lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft" && lightboxPrev && !lightboxPrev.disabled) lightboxPrev.click();
    if (e.key === "ArrowRight" && lightboxNext && !lightboxNext.disabled) lightboxNext.click();
  });

  /* ---------------------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------------------- */
  var revealTargets = document.querySelectorAll(".monitor, .clip, .about-col");
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in"); });
  }
})();
