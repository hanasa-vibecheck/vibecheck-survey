// Shared header, footer and language switch (English · کوردی · العربية).
(() => {
  "use strict";
  const LANGS = { en: "English", ckb: "کوردی", ar: "العربية" };
  const T = {
    plans: { en: "Golden & Diamond", ckb: "گۆڵدن و دایمەند", ar: "الذهبي والماسي" },
    venues: { en: "For venues", ckb: "بۆ شوێنەکان", ar: "للأماكن" },
    support: { en: "Support", ckb: "یارمەتی", ar: "الدعم" },
    privacy: { en: "Privacy", ckb: "تایبەتمەندی", ar: "الخصوصية" },
    terms: { en: "Terms", ckb: "مەرجەکان", ar: "الشروط" },
    del: { en: "Delete account", ckb: "سڕینەوەی هەژمار", ar: "حذف الحساب" },
    menu: { en: "Menu", ckb: "لیست", ar: "القائمة" },
    made: { en: "Made in Sulaymaniyah", ckb: "دروستکراوە لە سلێمانی", ar: "صُنع في السليمانية" },
  };
  const qs = new URLSearchParams(location.search).get("lang");
  let lang = LANGS[qs] ? qs : null;
  if (!lang) { try { lang = localStorage.getItem("vc_lang"); } catch {} }
  if (!LANGS[lang]) lang = "en";

  const here = location.pathname.split("/").pop() || "index.html";
  const link = (href, key) => `<a href="${href}"${here === href ? ' aria-current="page"' : ""} data-k="${key}"></a>`;
  const mark = '<svg width="26" height="26" viewBox="0 0 100 100" aria-hidden="true"><path d="M18 50 40 72 68 36" fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><circle cx="80" cy="22" r="11" fill="#E2573B"/></svg>';

  const top = document.getElementById("top");
  if (top) top.outerHTML = `<header class="top"><div class="wrap">
    <a class="brand" href="index.html" aria-label="VibeCheck">${mark}<span>Vibe<b>Check</b></span></a>
    <button class="menu-btn" type="button" aria-expanded="false" data-k="menu"></button>
    <nav class="nav" id="nav">${link("plans.html", "plans")}${link("index.html#venues", "venues")}${link("support.html", "support")}
      <div class="langs" role="group">${Object.entries(LANGS).map(([k, v]) => `<button type="button" data-lang="${k}" lang="${k}">${v}</button>`).join("")}</div>
    </nav></div></header>`;
  const foot = document.getElementById("foot");
  if (foot) foot.outerHTML = `<footer><div class="wrap">
    <a class="brand" href="index.html" aria-label="VibeCheck">${mark}<span>Vibe<b>Check</b></span></a>
    <nav>${link("support.html", "support")}${link("privacy.html", "privacy")}${link("terms.html", "terms")}${link("delete-account.html", "del")}</nav>
    <span style="margin-inline-start:auto">© 2026 VibeCheck · <span data-k="made"></span></span></div></footer>`;

  function apply() {
    const el = document.documentElement;
    el.lang = lang; el.dir = lang === "en" ? "ltr" : "rtl"; el.dataset.lang = lang;
    document.querySelectorAll("[data-k]").forEach(e => { const v = T[e.dataset.k]; if (v) e.textContent = v[lang]; });
    document.querySelectorAll(".langs button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    const tt = document.querySelector(`meta[name="title-${lang}"]`); if (tt) document.title = tt.content;
    // keep the language when moving between pages
    document.querySelectorAll('a[href*=".html"]').forEach(a => {
      const u = new URL(a.getAttribute("href"), location.href);
      if (u.origin !== location.origin) return;
      u.searchParams.set("lang", lang); a.href = u.pathname.split("/").pop() + u.search + u.hash;
    });
  }
  document.addEventListener("click", e => {
    const b = e.target.closest(".langs button");
    if (b) { lang = b.dataset.lang; try { localStorage.setItem("vc_lang", lang); } catch {} apply(); history.replaceState(null, "", "?lang=" + lang + location.hash); }
    const m = e.target.closest(".menu-btn");
    if (m) { const n = document.getElementById("nav"); n.classList.toggle("open"); m.setAttribute("aria-expanded", String(n.classList.contains("open"))); }
  });
  apply();
})();
