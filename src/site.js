// niletherapy.org: phone menu, quick booking, booking form (sends to the Nile Therapy portal), click tracking.
(() => {
  const menu = document.querySelector('.menu'), nav = document.getElementById('nav');
  if (menu && nav) {
    menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', open); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.focus(); } });
  }

  // Analytics: which buttons lead to bookings (no personal data is sent).
  const track = (name, params) => { try { if (window.gtag) gtag('event', name, params); } catch { /* blocked */ } };
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-track]'); if (!a) return;
    const [kind, where] = a.dataset.track.split(':');
    track(kind === 'book' ? 'book_click' : kind === 'whatsapp' ? 'whatsapp_click' : 'call_click', { location: where });
  });

  // Hero quick booking: carries name/phone/governorate to the booking page in this tab only (sessionStorage, never the URL).
  const quick = document.getElementById('quick');
  if (quick) quick.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(quick).entries());
    try { sessionStorage.setItem('nt_quick', JSON.stringify(d)); } catch { /* private mode: they retype */ }
    track('form_start', { method: 'hero_quick' });
    location.href = quick.dataset.book;
  });

  const form = document.getElementById('booking');
  if (!form) return;
  const ENDPOINT = 'https://oppjpgaoucigbukvqoqa.supabase.co/functions/v1/submit-booking';
  const ar = form.dataset.lang === 'ar';
  const msg = ar ? {
    name: 'اكتب الاسم بالكامل.', phone: 'اكتب رقم موبايل مصري صحيح، مثال 01012345678.', governorate: 'اختر المحافظة.', address: 'اكتب العنوان أو المنطقة.',
    date: 'اختر يوماً من اليوم فصاعداً.', consent: 'يجب الموافقة لنتمكن من التواصل معك.', map: 'رابط الموقع يجب أن يبدأ بـ https://',
    network: 'تعذّر الإرسال. تأكد من الاتصال بالإنترنت وحاول مرة أخرى، أو راسلنا على واتساب.', busy: 'جاري الإرسال…', locating: 'جاري تحديد موقعك…', located: '✓ تم تحديد موقعك', locFail: 'تعذّر تحديد الموقع. يمكنك لصق رابط خرائط جوجل.',
  } : {
    name: 'Enter your full name.', phone: 'Enter a valid Egyptian mobile number, e.g. 01012345678.', governorate: 'Choose your governorate.', address: 'Enter your address or area.',
    date: 'Choose today or a later day.', consent: 'Please agree so we can contact you.', map: 'The map link must start with https://',
    network: "Couldn't send. Check your connection and try again, or message us on WhatsApp.", busy: 'Sending…', locating: 'Finding your location…', located: '✓ Location added', locFail: "Couldn't get your location. You can paste a Google Maps link instead.",
  };
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  form.date.min = today; if (!form.date.value) form.date.value = today;
  const svc = new URLSearchParams(location.search).get('service');
  if (svc && [...form.service.options].some(o => o.value === svc)) form.service.value = svc;
  try { // values typed in the home page's quick form
    const q = JSON.parse(sessionStorage.getItem('nt_quick') || 'null');
    if (q) { for (const k of ['name', 'phone', 'governorate']) if (q[k] && !form[k].value) form[k].value = q[k]; sessionStorage.removeItem('nt_quick'); (form.address || form.name).focus(); }
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

  const phoneOk = v => /^(\+?20|0)?1[0125]\d{8}$/.test(v.replace(/[\s-]/g, ''));
  const check = () => {
    const bad = [];
    const mark = (el, ok, m) => { el.setAttribute('aria-invalid', !ok); if (!ok) { bad.push([el, m]); el.setAttribute('aria-describedby', 'booking-err'); } };
    mark(form.name, form.name.value.trim().length >= 2, msg.name);
    mark(form.phone, phoneOk(form.phone.value), msg.phone);
    mark(form.governorate, !!form.governorate.value, msg.governorate);
    mark(form.address, form.address.value.trim().length >= 3, msg.address);
    mark(form.date, form.date.value >= today, msg.date);
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
    showErr(''); sending = true; btn.disabled = true; btn.textContent = msg.busy;
    const d = Object.fromEntries(new FormData(form).entries());
    try {
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...d, consent: !!form.consent.checked, lang: ar ? 'ar' : 'en', page: location.pathname }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || msg.network);
      form.hidden = true;
      const done = document.getElementById('booking-done'); done.hidden = false; done.focus();
      track('generate_lead', { method: 'booking_form', service: d.service || 'none', has_location: !!d.lat });
    } catch (x) { showErr(x.message && !/fetch|network/i.test(x.message) ? x.message : msg.network); }
    sending = false; btn.disabled = false; btn.textContent = btnText;
  });
})();
