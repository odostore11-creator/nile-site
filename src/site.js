// niletherapy.org: phone menu, quick booking, booking form (sends to the Nile Therapy portal), click tracking.
(() => {
  const menu = document.querySelector('.menu'), nav = document.getElementById('nav');
  if (menu && nav) {
    menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', open); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.focus(); } });
  }

  // Dropdown menus. Desktop: open on hover (CSS) or focus; the chevron button and touch taps open/close them.
  // Phones: the chevron opens a group inside the ☰ menu. A dropdown that would run off the screen is nudged back in.
  const items = [...document.querySelectorAll('[data-drop]')];
  const wide = matchMedia('(min-width: 981px)'), touch = matchMedia('(hover: none)');
  const setOpen = (it, open) => { it.classList.toggle('open', open); it.querySelector('.drop-btn').setAttribute('aria-expanded', open); if (open) fit(it); };
  const closeAll = except => items.forEach(it => { if (it !== except) setOpen(it, false); });
  const fit = it => {
    const d = it.querySelector('.drop'); if (!wide.matches) { d.style.marginLeft = ''; return; }
    d.style.marginLeft = '0px';
    const r = d.getBoundingClientRect(), pad = 12;
    const shift = r.right > innerWidth - pad ? innerWidth - pad - r.right : r.left < pad ? pad - r.left : 0;
    d.style.marginLeft = shift + 'px';
  };
  items.forEach(it => {
    it.querySelector('.drop-btn').addEventListener('click', e => { e.preventDefault(); const open = !it.classList.contains('open'); closeAll(it); setOpen(it, open); });
    it.addEventListener('mouseenter', () => fit(it));
    it.addEventListener('focusin', () => fit(it));
    // A tablet with a wide screen has no hover: the first tap on "Services" opens its list, the second follows the link.
    it.querySelector('.nav-top').addEventListener('click', e => {
      if (wide.matches && touch.matches && !it.classList.contains('open')) { e.preventDefault(); closeAll(it); setOpen(it, true); }
    });
  });
  document.addEventListener('click', e => { if (!e.target.closest('[data-drop]')) closeAll(); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const it = items.find(x => x.classList.contains('open') || x.contains(document.activeElement));
    if (it) { setOpen(it, false); it.querySelector('.nav-top').focus(); }
  });
  addEventListener('resize', () => items.forEach(it => it.classList.contains('open') && fit(it)));

  // Header gets a soft shadow once the page scrolls.
  const top = document.querySelector('.top');
  if (top) { const onScroll = () => top.classList.toggle('scrolled', scrollY > 8); addEventListener('scroll', onScroll, { passive: true }); onScroll(); }

  // FAQ answers slide open and closed instead of jumping.
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.faq details').forEach(d => {
    const s = d.querySelector('summary'), a = d.querySelector('.faq-a'); if (!s || !a) return;
    s.addEventListener('click', e => {
      if (still.matches || !a.animate) return;
      e.preventDefault();
      if (d.open) {
        a.animate([{ height: a.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 220, easing: 'ease' }).onfinish = () => { d.open = false; };
      } else {
        d.open = true;
        a.animate([{ height: '0px', opacity: 0 }, { height: a.offsetHeight + 'px', opacity: 1 }], { duration: 260, easing: 'ease' });
      }
    });
  });

  // Finder: which problem people pick (no personal data).
  document.querySelectorAll('.finder-chips input').forEach(i => i.addEventListener('change', () => {
    try { window.gtag && gtag('event', 'finder_pick', { need: i.value }); } catch { /* blocked */ }
    // Phones: the answer sits under the choices. If it starts low on the screen, bring it up to mid-screen
    // so the pick visibly does something, while the lower choices stay in view above it.
    if (!matchMedia('(max-width: 900px)').matches) return;
    const panel = document.querySelector(`.finder-panel[data-for="${i.value}"]`);
    if (!panel) return;
    const top = panel.getBoundingClientRect().top;
    if (top > innerHeight * .6) scrollBy({ top: top - innerHeight * .4, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }));

  // WhatsApp bubble steps aside while the booking band or the footer (both have their own WhatsApp link) is visible.
  const waFloat = document.querySelector('.wa-float');
  if (waFloat && 'IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)); waFloat.classList.toggle('away', seen.size > 0); });
    document.querySelectorAll('.band, .foot').forEach(el => io.observe(el));
  }

  // Analytics: which buttons lead to bookings (no personal data is sent).
  const track = (name, params) => { try { if (window.gtag) gtag('event', name, params); } catch { /* blocked */ } };
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-track]'); if (!a) return;
    const [kind, where] = a.dataset.track.split(':');
    track(kind === 'book' ? 'book_click' : kind === 'whatsapp' ? 'whatsapp_click' : 'call_click', { location: where });
  });

  // Phone numbers: accept Arabic-Indic (٠-٩) and Persian (۰-۹) digits, spaces, dashes and +20 / 0020, and turn them
  // into the plain 01xxxxxxxxx form the portal expects (the server only reads Western digits).
  const plainDigits = v => v.replace(/[٠-٩]/g, c => c.charCodeAt(0) - 0x660).replace(/[۰-۹]/g, c => c.charCodeAt(0) - 0x6F0);
  const cleanPhone = v => {
    let d = plainDigits(v).replace(/[\s\-().]/g, '').replace(/^\+/, '');
    if (d.startsWith('0020')) d = d.slice(4); else if (d.startsWith('20')) d = d.slice(2);
    if (/^1[0125]\d{8}$/.test(d)) d = '0' + d;
    return /^01[0125]\d{8}$/.test(d) ? d : '';
  };

  // "Who is this for?": booking for a relative relabels the fields (patient's name, your number) and shows the
  // optional "your name and relationship" field on the booking page.
  const forFamily = f => f.querySelector('input[name="for"]:checked')?.value === 'family';
  const applyFor = f => {
    const fam = f.querySelector('input[name="for"]:checked')?.value === 'family';
    f.querySelectorAll('[data-self]').forEach(el => { el.textContent = fam ? el.dataset.family : el.dataset.self; });
    f.querySelectorAll('[data-family-only]').forEach(el => { el.hidden = !fam; });
  };
  document.querySelectorAll('form').forEach(f => {
    if (!f.querySelector('input[name="for"]')) return;
    f.addEventListener('change', e => { if (e.target.name === 'for') applyFor(f); });
    applyFor(f); // the browser may restore a choice on Back
  });

  // Hero quick booking: carries name/phone/governorate to the booking page in this tab only (sessionStorage, never the URL).
  // Each field shows its own message under it; nothing moves on until all three are filled in.
  const quick = document.getElementById('quick');
  if (quick) {
    const qar = quick.dataset.lang === 'ar';
    const qmsg = qar ? { name: 'اكتب الاسم.', patient: 'اكتب اسم المريض.', phone: 'اكتب رقم موبايل مصري صحيح: 11 رقماً يبدأ بـ 01.', governorate: 'اختر المحافظة.' }
      : { name: 'Enter your name.', patient: "Enter the patient's name.", phone: 'Enter a valid Egyptian mobile number: 11 digits starting with 01.', governorate: 'Choose your governorate.' };
    const setErr = (el, text) => {
      const out = document.getElementById(`qe-${el.name}`);
      if (text) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
      if (out) { out.textContent = text; out.hidden = !text; }
    };
    quick.addEventListener('input', e => { if (e.target.getAttribute('aria-invalid') === 'true') setErr(e.target, ''); });
    quick.addEventListener('change', e => { if (e.target.getAttribute('aria-invalid') === 'true') setErr(e.target, ''); });
    quick.phone.addEventListener('blur', () => { const c = cleanPhone(quick.phone.value); if (c) quick.phone.value = c; });
    quick.addEventListener('submit', e => {
      e.preventDefault();
      const phone = cleanPhone(quick.phone.value);
      if (phone) quick.phone.value = phone;
      const bad = [[quick.name, quick.name.value.trim().length >= 2], [quick.phone, !!phone], [quick.governorate, !!quick.governorate.value]]
        .filter(([el, ok]) => { setErr(el, ok ? '' : (el.name === 'name' && forFamily(quick) ? qmsg.patient : qmsg[el.name])); return !ok; });
      const status = document.getElementById('q-status');
      if (status) status.textContent = bad.length ? (qar ? `راجع ${bad.length === 1 ? 'خانة واحدة' : bad.length === 2 ? 'خانتين' : `${bad.length} خانات`}: ${document.getElementById(`qe-${bad[0][0].name}`).textContent}` : `${bad.length} field${bad.length > 1 ? 's need' : ' needs'} attention:${document.getElementById(`qe-${bad[0][0].name}`).textContent}`) : '';
      if (bad.length) { bad[0][0].focus(); return; }
      goQuick();
    });
  }
  function goQuick() {
    const d = Object.fromEntries(new FormData(quick).entries());
    try { sessionStorage.setItem('nt_quick', JSON.stringify(d)); } catch { /* private mode: they retype */ }
    track('form_start', { method: 'hero_quick' });
    location.href = quick.dataset.book;
  }

  const form = document.getElementById('booking');
  if (!form) return;
  const ENDPOINT = 'https://oppjpgaoucigbukvqoqa.supabase.co/functions/v1/submit-booking';
  const ar = form.dataset.lang === 'ar';
  const msg = ar ? {
    name: 'اكتب الاسم بالكامل.', patient: 'اكتب اسم المريض بالكامل.', phone: 'اكتب رقم موبايل مصري صحيح: 11 رقماً يبدأ بـ 01.', governorate: 'اختر المحافظة.', address: 'اكتب العنوان أو المنطقة.',
    date: 'اختر يوماً من اليوم فصاعداً.', consent: 'يجب الموافقة لنتمكن من التواصل معك.', email: 'البريد الإلكتروني غير صحيح، صححه أو اتركه فارغاً.', map: 'رابط الموقع يجب أن يبدأ بـ https://',
    network: 'تعذّر الإرسال. تأكد من الاتصال بالإنترنت وحاول مرة أخرى، أو راسلنا على واتساب.', busy: 'جاري الإرسال…', locating: 'جاري تحديد موقعك…', located: '✓ تم تحديد موقعك', locFail: 'تعذّر تحديد الموقع. يمكنك لصق رابط خرائط جوجل.', bot: 'انتظر لحظة حتى يكتمل التحقق الأمني، ثم أرسل مرة أخرى.',
  } : {
    name: 'Enter your full name.', patient: "Enter the patient's full name.", phone: 'Enter a valid Egyptian mobile number: 11 digits starting with 01.', governorate: 'Choose your governorate.', address: 'Enter your address or area.',
    date: 'Choose today or a later day.', consent: 'Please agree so we can contact you.', email: 'That email does not look right. Fix it or leave it empty.', map: 'The map link must start with https://',
    network: "Couldn't send. Check your connection and try again, or message us on WhatsApp.", busy: 'Sending…', locating: 'Finding your location…', located: '✓ Location added', locFail: "Couldn't get your location. You can paste a Google Maps link instead.", bot: "Please wait a moment for the security check to finish, then send again.",
  };
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  form.date.min = today; if (!form.date.value) form.date.value = today;
  const svc = new URLSearchParams(location.search).get('service');
  if (svc && [...form.service.options].some(o => o.value === svc)) form.service.value = svc;
  try { // values typed in the home page's quick form
    const q = JSON.parse(sessionStorage.getItem('nt_quick') || 'null');
    if (q) {
      for (const k of ['name', 'phone', 'governorate']) if (q[k] && !form[k].value) form[k].value = q[k];
      const who = form.querySelector(`input[name="for"][value="${q.for === 'family' ? 'family' : 'self'}"]`); if (who) { who.checked = true; applyFor(form); }
      sessionStorage.removeItem('nt_quick'); (form.address || form.name).focus();
    }
  } catch { /* fine */ }
  const err = form.querySelector('.form-error');
  const showErr = t => { err.textContent = t; err.hidden = !t; if (t) err.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  let started = false;
  form.addEventListener('input', () => { if (!started) { started = true; track('form_start', { method: 'booking_page' }); } }, { once: false });

  // "Use my current location": fills the hidden lat/lng (and a readable maps link).
  const here = form.querySelector('[data-here]'), label = here.innerHTML;
  if (!navigator.geolocation) here.hidden = true;
  here.addEventListener('click', () => {
    here.disabled = true; here.textContent = msg.locating;
    navigator.geolocation.getCurrentPosition(p => {
      form.lat.value = p.coords.latitude.toFixed(6); form.lng.value = p.coords.longitude.toFixed(6);
      form.map_link.value = `https://www.google.com/maps?q=${form.lat.value},${form.lng.value}`;
      here.disabled = false; here.textContent = msg.located;
    }, () => { here.disabled = false; here.innerHTML = label; showErr(msg.locFail); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  });
  form.map_link.addEventListener('input', () => { form.lat.value = ''; form.lng.value = ''; });

  form.phone.addEventListener('blur', () => { const c = cleanPhone(form.phone.value); if (c) form.phone.value = c; });
  const phoneOk = v => !!cleanPhone(v);
  const check = () => {
    const c = cleanPhone(form.phone.value); if (c) form.phone.value = c; // so the plain number is what gets sent
    const bad = [];
    const mark = (el, ok, m) => { el.setAttribute('aria-invalid', !ok); if (!ok) { bad.push([el, m]); el.setAttribute('aria-describedby', 'booking-err'); } };
    mark(form.name, form.name.value.trim().length >= 2, forFamily(form) ? msg.patient : msg.name);
    mark(form.phone, phoneOk(form.phone.value), msg.phone);
    mark(form.governorate, !!form.governorate.value, msg.governorate);
    mark(form.address, form.address.value.trim().length >= 3, msg.address);
    mark(form.date, form.date.value >= today, msg.date);
    const mail = form.email.value.trim(); mark(form.email, !mail || /^[^@\s<>,;"]+@[^@\s]+\.[a-z]{2,24}$/i.test(mail), msg.email);
    const link = form.map_link.value.trim(); mark(form.map_link, !link || /^https:\/\/\S+$/i.test(link), msg.map);
    if (!form.consent.checked) bad.push([form.consent, msg.consent]);
    return bad;
  };
  form.addEventListener('input', e => { if (e.target.getAttribute('aria-invalid') === 'true') { e.target.removeAttribute('aria-invalid'); showErr(''); } });

  let sending = false;
  const btn = form.querySelector('button[type=submit]'), btnText = btn.textContent;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending) return;
    const bad = check();
    if (bad.length) { showErr(bad[0][1]); bad[0][0].focus(); return; }
    // Cloudflare Turnstile (only when the site key is set): the widget puts its token in cf-turnstile-response.
    const d = Object.fromEntries(new FormData(form).entries());
    // The portal has no "booked by" column: a relative's booking is noted at the top of the complaint the founders read.
    if (d.for === 'family') {
      const by = (d.booker || '').trim();
      const head = ar ? `الحجز بواسطة أحد أفراد الأسرة${by ? `: ${by}` : ''}.` : `Booked by a family member${by ? `: ${by}` : ''}.`;
      d.complaint = `${head}\n${d.complaint || ''}`.trim().slice(0, 1000);
    }
    delete d.for; delete d.booker;
    const turnstile = d['cf-turnstile-response'] || ''; delete d['cf-turnstile-response'];
    if (form.querySelector('.cf-turnstile') && !turnstile) { showErr(msg.bot); return; }
    showErr(''); sending = true; btn.disabled = true; btn.textContent = msg.busy;
    try {
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...d, turnstile, consent: !!form.consent.checked, lang: ar ? 'ar' : 'en', page: location.pathname }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || msg.network);
      form.hidden = true;
      const done = document.getElementById('booking-done'); done.hidden = false; done.focus();
      track('generate_lead', { method: 'booking_form', service: d.service || 'none', has_location: !!d.lat });
    } catch (x) {
      showErr(x.message && !/fetch|network/i.test(x.message) ? x.message : msg.network);
      try { window.turnstile?.reset(); } catch { /* no widget */ } // a token works once: get a fresh one for the retry
    }
    sending = false; btn.disabled = false; btn.textContent = btnText;
  });
})();
