/* =====================================================
   EDIT THESE THREE LINES WITH YOUR REAL DETAILS
   ===================================================== */
const CONFIG = {
  email: "yourname@gmail.com",   // <- your email (contact form sends here)
  whatsapp: "910000000000"       // <- country code + number, no + or spaces (e.g. 919876543210)
};
/* ===================================================== */

(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- Letter-by-letter splitting ---------- */
  function split(el) {
    const html = el.innerHTML.split(/<br\s*\/?>/i);
    let i = 0;
    el.innerHTML = html.map(line => {
      const words = line.trim().split(/\s+/).map(word => {
        const chars = [...word].map(ch => `<span class="c" style="--i:${i++}" aria-hidden="true">${ch}</span>`).join("");
        return `<span class="w">${chars}</span>`;
      }).join(" ");
      return words;
    }).join("<br>");
  }
  $$("[data-split]").forEach(el => {
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    split(el);
  });

  /* ---------- Intro ---------- */
  const intro = $("#intro");
  const introName = $(".intro-name");
  requestAnimationFrame(() => setTimeout(() => introName.classList.add("in"), 150));
  function startSite() {
    if (document.body.classList.contains("ready")) return;
    intro.classList.add("done");
    document.body.classList.remove("loading");
    document.body.classList.add("ready");
    setTimeout(() => $(".hero-name").classList.add("in"), 350);
    setTimeout(() => (intro.style.display = "none"), 1400);
  }
  setTimeout(startSite, reduce ? 300 : 2300);

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal, [data-split]:not([data-split='hero']):not([data-split='intro'])").forEach(el => io.observe(el));

  /* ---------- Counters ---------- */
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || "";
      const t0 = performance.now(), dur = 1400;
      (function tick(t) {
        const p = clamp((t - t0) / dur, 0, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * eased) + (p === 1 ? suf : "");
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach(el => cio.observe(el));

  /* ---------- Build 3D shapes ---------- */
  const faces = { cube: 6, pyramid: 4, gyro: 3 };
  $$(".shape").forEach(sh => {
    const type = sh.dataset.type, size = +sh.dataset.size;
    const f = document.createElement("div");
    f.className = "float";
    const obj = document.createElement("div");
    obj.className = ({ pyramid: "pyr" }[type]) || type;
    obj.style.setProperty("--s", size + "px");
    if (faces[type]) obj.innerHTML = "<i></i>".repeat(faces[type]);
    if (type === "cube") obj.style.animationDuration = (16 + size % 9) + "s";
    f.appendChild(obj);
    sh.appendChild(f);
  });

  /* ---------- Hero parallax (mouse + scroll) ---------- */
  const hero = $("#hero");
  let tmx = 0, tmy = 0, cmx = 0, cmy = 0, sy = 0;
  addEventListener("pointermove", e => {
    tmx = (e.clientX / innerWidth - .5) * 2;
    tmy = (e.clientY / innerHeight - .5) * 2;
  }, { passive: true });
  addEventListener("scroll", () => {
    sy = scrollY;
    $("#progress").style.transform = `scaleX(${clamp(scrollY / (document.documentElement.scrollHeight - innerHeight), 0, 1)})`;
  }, { passive: true });

  /* ---------- Portrait: halftone + reveal ---------- */
  const portrait = $("#portrait"), photo = $("#photo"), cv = $("#halftone");
  let reveal = { r: 0, tr: 0, x: .5, y: .4, tx: .5, ty: .4, over: false };
  function drawHalftone() {
    try {
      const rect = portrait.getBoundingClientRect();
      if (!rect.width) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = rect.width * dpr; cv.height = rect.height * dpr;
      const ctx = cv.getContext("2d");
      const cell = Math.max(5, Math.round(rect.width / 95)) * dpr;
      const cols = Math.floor(cv.width / cell), rows = Math.floor(cv.height / cell);
      const sm = document.createElement("canvas"); sm.width = cols; sm.height = rows;
      const sctx = sm.getContext("2d", { willReadFrequently: true });
      sctx.drawImage(photo, 0, 0, cols, rows);
      const data = sctx.getImageData(0, 0, cols, rows).data;
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4, a = data[i + 3] / 255;
        if (a < .35) continue;
        const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
        const rad = cell * .5 * (.28 + .78 * Math.pow(lum, .8));
        ctx.fillStyle = lum > .45 ? `rgba(232,235,240,${.55 + lum * .45})` : "rgba(255,31,61,.95)";
        ctx.beginPath();
        ctx.arc(x * cell + cell / 2, y * cell + cell / 2, rad, 0, 7);
        ctx.fill();
      }
      portrait.classList.remove("nojs");
    } catch (err) {
      // opened from file:// (canvas blocked) -> just show the plain photo
      portrait.classList.add("nojs");
      cv.style.display = "none";
    }
  }
  function initPortrait() { drawHalftone(); }
  if (photo.complete) initPortrait(); else photo.addEventListener("load", initPortrait);
  let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(drawHalftone, 200); });

  portrait.addEventListener("pointermove", e => {
    const b = portrait.getBoundingClientRect();
    reveal.tx = (e.clientX - b.left) / b.width;
    reveal.ty = (e.clientY - b.top) / b.height;
    reveal.over = true;
  });
  portrait.addEventListener("pointerleave", () => (reveal.over = false));

  /* ---------- Main animation loop ---------- */
  function loop(t) {
    cmx += (tmx - cmx) * .06; cmy += (tmy - cmy) * .06;
    hero.style.setProperty("--mx", cmx.toFixed(3));
    hero.style.setProperty("--my", cmy.toFixed(3));
    hero.style.setProperty("--sy", sy.toFixed(0));
    const contact = $("#contact");
    contact.style.setProperty("--mx", (cmx * .6).toFixed(3));
    contact.style.setProperty("--my", (cmy * .6).toFixed(3));
    contact.style.setProperty("--sy", clamp(sy - contact.offsetTop + innerHeight, -400, 1400).toFixed(0));

    // portrait reveal radius
    const w = portrait.clientWidth || 600;
    if (!finePointer && !reveal.over) {
      // touch / no-hover: wander automatically
      reveal.tx = .5 + Math.sin(t / 1700) * .22;
      reveal.ty = .38 + Math.cos(t / 1300) * .16;
      reveal.tr = w * .42;
    } else reveal.tr = reveal.over ? w * .36 : 0;
    reveal.r += (reveal.tr - reveal.r) * .1;
    reveal.x += (reveal.tx - reveal.x) * .2; reveal.y += (reveal.ty - reveal.y) * .2;
    portrait.style.setProperty("--r", reveal.r.toFixed(1) + "px");
    portrait.style.setProperty("--px", (reveal.x * 100).toFixed(1) + "%");
    portrait.style.setProperty("--py", (reveal.y * 100).toFixed(1) + "%");

    // custom cursor
    if (finePointer) {
      curX += (mx - curX) * .22; curY += (my - curY) * .22;
      cursor.style.transform = `translate(${curX}px,${curY}px)`;
    }
    requestAnimationFrame(loop);
  }
  const cursor = $("#cursor");
  let mx = 0, my = 0, curX = 0, curY = 0;
  addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; cursor.classList.add("on"); }, { passive: true });
  document.addEventListener("pointerleave", () => cursor.classList.remove("on"));
  if (!reduce) requestAnimationFrame(loop);
  $$("a, button, .chips span, .svc").forEach(el => {
    el.addEventListener("pointerenter", () => cursor.classList.add("big"));
    el.addEventListener("pointerleave", () => cursor.classList.remove("big"));
  });

  /* ---------- Tilt cards ---------- */
  $$(".tilt").forEach(wrap => {
    const card = $(".card", wrap);
    wrap.addEventListener("pointermove", e => {
      if (e.pointerType === "touch") return;
      const b = wrap.getBoundingClientRect();
      const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
      card.style.setProperty("--ry", ((px - .5) * 20).toFixed(2) + "deg");
      card.style.setProperty("--rx", ((.5 - py) * 20).toFixed(2) + "deg");
      card.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
      card.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
      wrap.classList.add("hovering");
    });
    wrap.addEventListener("pointerleave", () => {
      wrap.classList.remove("hovering");
      card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg");
    });
  });

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduce) $$("[data-mag]").forEach(b => {
    b.addEventListener("pointermove", e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });

  /* ---------- Terminal typing ---------- */
  const term = $("#term");
  const script = [
    ["$ ", "whoami"], ["", "koushik — web dev + cyber security student"],
    ["$ ", "audit ./your-website"],
    ["", "[✓] HTTPS & secure hosting checked", "ok"],
    ["", "[✓] Forms validated & sanitised", "ok"],
    ["", "[✓] No sensitive data exposed in code", "ok"],
    ["", "[✓] Fast, responsive, mobile-first", "ok"],
    ["$ ", "deploy --price 4000 --vibe immaculate"],
    ["", "Site is live. Welcome to the future.", "ok"]
  ];
  function runTerm() {
    if (reduce) {
      term.innerHTML = script.map(([p, t, k]) => `<span class="p">${p}</span><span class="${k || ""}">${t}</span>`).join("\n");
      return;
    }
    let line = 0, ch = 0, html = "";
    (function step() {
      if (line >= script.length) { term.innerHTML = html + '<span class="p">$ </span><span class="caret"></span>'; return; }
      const [p, text, k] = script[line];
      const isCmd = p !== "";
      if (isCmd) {
        ch++;
        term.innerHTML = html + `<span class="p">${p}</span>${text.slice(0, ch)}<span class="caret"></span>`;
        if (ch >= text.length) { html += `<span class="p">${p}</span>${text}\n`; line++; ch = 0; setTimeout(step, 380); }
        else setTimeout(step, 55 + Math.random() * 50);
      } else {
        html += `<span class="${k || ""}">${text}</span>\n`; term.innerHTML = html; line++; setTimeout(step, 320);
      }
    })();
  }
  new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { runTerm(); o.disconnect(); } }, { threshold: .4 }).observe(term);

  /* ---------- Contact ---------- */
  const wa = $("#wa");
  wa.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hi Koushik, I saw your portfolio and I want a website.")}`;
  $("#form").addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const body = `Name: ${f.get("name")}\nContact: ${f.get("contact")}\n\n${f.get("msg")}`;
    location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Website enquiry from " + f.get("name"))}&body=${encodeURIComponent(body)}`;
  });
})();
