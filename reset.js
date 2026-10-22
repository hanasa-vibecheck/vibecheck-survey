// "Forgot password?" for the survey and admin pages (team logins only).
// Load BEFORE the page's main script, so a reset link is noticed before the URL is cleaned up.
// Needs Supabase → Authentication → URL Configuration → Redirect URLs:
//   https://hanasa-vibecheck.github.io/vibecheck-survey/**
(() => {
  "use strict";
  const fromResetLink = /type=recovery/.test(location.hash);
  const R = {
    forgot: ["وشەی نهێنیت لەبیرچووە؟", "Forgot password?"],
    needEmail: ["سەرەتا ئیمەیڵەکەت لە سەرەوە بنووسە، پاشان دووبارە دابگرە.", "Type your email above first, then tap again."],
    sent: ["ئەگەر ئەم ئیمەیڵە هەژماری هەبێت، بەستەرێکی گۆڕینی وشەی نهێنیمان بۆ ناردووە. ئیمەیڵەکەت بپشکنە (Spam ـیش).", "If this email has a login, we've sent a link to set a new password. Check your inbox (and Spam)."],
    tooMany: ["زۆر داواکاری نێردرا. تکایە کەمێک چاوەڕێ بکە و دووبارە هەوڵ بدەرەوە.", "Too many requests. Please wait a little and try again."],
    title: ["وشەی نهێنیی نوێ", "Set a new password"],
    hint: ["لانیکەم 8 پیت یان ژمارە.", "At least 8 letters or numbers."],
    pass1: ["وشەی نهێنیی نوێ", "New password"],
    pass2: ["دووبارە بینووسەوە", "Type it again"],
    short: ["وشەی نهێنی کورتە (لانیکەم 8).", "Too short (at least 8)."],
    differ: ["هەردووکیان وەک یەک نین.", "The two passwords are not the same."],
    save: ["پاشەکەوتکردن", "Save password"],
    done: ["وشەی نهێنی گۆڕدرا. ئێستا چوویتە ژوورەوە.", "Password changed. You are signed in."],
    failed: ["سەرکەوتوو نەبوو. بەستەرەکە لەوانەیە بەسەرچووبێت؛ داوای بەستەرێکی نوێ بکە.", "That didn't work. The link may have expired; ask for a new one."],
  };
  const tr = k => R[k][typeof lang !== "undefined" && lang !== "ckb" ? 1 : 0];
  const msg = (el, text, kind) => { el.innerHTML = ""; if (!text) return; const d = document.createElement("div"); d.className = "msg " + kind; d.textContent = text; el.appendChild(d); };

  function setup() {
    const form = document.getElementById("loginForm");
    if (!form || typeof sb === "undefined" || !sb) return;

    // Link under the sign-in button
    const box = document.createElement("div");
    box.innerHTML = '<button type="button" class="ghost small" id="forgotBtn" style="width:100%;margin-top:10px;border:0"></button><div id="forgotMsg"></div>';
    form.after(box);
    const btn = box.querySelector("#forgotBtn"), out = box.querySelector("#forgotMsg");
    btn.onclick = async () => {
      const email = (document.getElementById("email").value || "").trim();
      if (!email) return msg(out, tr("needEmail"), "err");
      btn.disabled = true;
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
      btn.disabled = false;
      msg(out, error && /rate|too many|seconds/i.test(error.message) ? tr("tooMany") : tr("sent"), error && /rate|too many|seconds/i.test(error.message) ? "err" : "ok");
    };

    // New-password screen, shown after opening the link from the email
    const ov = document.createElement("div");
    ov.hidden = true;
    ov.style.cssText = "position:fixed;inset:0;z-index:60;background:var(--bg);overflow:auto;padding:24px 16px";
    ov.innerHTML = `<div class="card" style="max-width:460px;margin:40px auto">
      <h2 id="rsTitle"></h2><p class="hint" id="rsHint"></p>
      <label for="rsP1" id="rsL1"></label><input id="rsP1" type="password" class="ltr" autocomplete="new-password">
      <label for="rsP2" id="rsL2"></label><input id="rsP2" type="password" class="ltr" autocomplete="new-password">
      <div id="rsMsg"></div>
      <button type="button" class="primary" id="rsSave" style="width:100%;margin-top:14px"></button></div>`;
    document.body.appendChild(ov);
    const $o = id => ov.querySelector(id);
    const texts = () => {
      btn.textContent = tr("forgot");
      $o("#rsTitle").textContent = tr("title"); $o("#rsHint").textContent = tr("hint");
      $o("#rsL1").textContent = tr("pass1"); $o("#rsL2").textContent = tr("pass2"); $o("#rsSave").textContent = tr("save");
    };
    texts();
    document.getElementById("langBtn")?.addEventListener("click", () => setTimeout(texts, 0));
    const open = () => { ov.hidden = false; setTimeout(() => $o("#rsP1").focus(), 50); };
    $o("#rsSave").onclick = async () => {
      const p1 = $o("#rsP1").value, p2 = $o("#rsP2").value, m = $o("#rsMsg");
      if (p1.length < 8) return msg(m, tr("short"), "err");
      if (p1 !== p2) return msg(m, tr("differ"), "err");
      $o("#rsSave").disabled = true;
      const { error } = await sb.auth.updateUser({ password: p1 });
      $o("#rsSave").disabled = false;
      if (error) return msg(m, tr("failed"), "err");
      msg(m, tr("done"), "ok");
      setTimeout(() => { ov.hidden = true; location.replace(location.pathname); }, 1500);
    };
    sb.auth.onAuthStateChange(ev => { if (ev === "PASSWORD_RECOVERY") open(); });
    if (fromResetLink) open();
  }
  // Runs after the page's own script has created the Supabase client.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup);
  else setTimeout(setup, 0);
})();
