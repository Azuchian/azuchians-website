/* ============================================================
   GOOGLE ADS CONVERSION TRACKING
   ============================================================
   This tells Google when an ad click turns into a real lead
   (a phone call or a text), so Google can optimize your $100
   toward people who actually contact you.

   ─── HOW TO TURN IT ON (one time, after you create the ad) ───
   1. In Google Ads:  Goals ▸ Conversions ▸ + New conversion action
      ▸ "Website".  Create TWO actions, for example:
         • "Phone Call"   (category: Contact / Phone call lead)
         • "Text Lead"    (category: Submit lead form)
   2. Google shows a snippet for each that looks like:
         gtag('event','conversion',{'send_to':'AW-1234567890/AbC-dEfGhIj'})
      The part before the "/"  is your ACCOUNT ID  -> goes in GADS_ID
      The part after  the "/"  is the LABEL        -> goes in CONV_CALL / CONV_TEXT
   3. Fill in the three values below, save, and run build.bat.
      That's it — tracking goes live automatically.

   Until you fill these in, nothing loads and nothing breaks.
   ============================================================ */

var GADS_ID   = 'AW-18170397231';        // Google Ads account ID
var CONV_CALL = '4O8yCNXNmbocEK-EqdhD';  // "Trailer – Phone Call" conversion label
var CONV_TEXT = 'M2QiCNjNmbocEK-EqdhD';  // "Trailer – Text Lead" conversion label

/* ---- Your own call log (Supabase) ----------------------------------------
   Records each call-button tap as its own row so the admin dashboard can show
   WHEN a call happened, from WHICH page, and HOW the visitor arrived
   (Google ad vs organic search vs Facebook vs direct). Fire-and-forget: it
   never blocks the phone dialer, and it never logs the owner's own taps.
   This is the SAME public key already used elsewhere on the site. */
var SUPA_URL = 'https://ljybisjhefbmjvyxjypz.supabase.co';
var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWJpc2poZWZibWp2eXhqeXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwODI1NzQsImV4cCI6MjA5NTY1ODU3NH0.dUS4VTPVBp0hULzEiWIppfJSvF0ezXgsYCAkqfjwCqU';

// Figure out how this visitor arrived — captured once and kept for the session,
// so it's still known by the time they tap Call several pages later.
(function () {
  try {
    if (sessionStorage.getItem('att_src')) return;
    var q = new URLSearchParams(location.search);
    var src;
    if (q.get('gclid'))           src = 'Google Ad';                 // a paid ad click carries a gclid
    else if (q.get('utm_source')) src = 'utm: ' + q.get('utm_source');
    else if (document.referrer)   src = document.referrer;           // e.g. google.com (organic), facebook.com
    else                          src = 'Direct / typed in';
    sessionStorage.setItem('att_src', src);
  } catch (e) {}
})();

// Log one call-button tap. Safe to call anytime; silent if anything fails.
function logCall(context) {
  try {
    if (localStorage.getItem('att_owner') === '1') return;   // skip the owner's own taps
    var src = '';
    try { src = sessionStorage.getItem('att_src') || ''; } catch (e) {}
    fetch(SUPA_URL + '/rest/v1/call_events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        context:    context || 'call',
        source:     src,
        page:       location.pathname,
        referrer:   document.referrer || '',
        user_agent: navigator.userAgent || ''
      })
    }).catch(function () {});
  } catch (e) {}
}

(function () {
  // Don't load Google's tag until a real ID is entered (avoids errors before launch).
  // Placeholder = a run of X's (e.g. AW-XXXXXXXXXX); a real ID/label may contain a
  // single stray "X", so only treat 3+ in a row as "not filled in yet".
  if (!GADS_ID || GADS_ID.indexOf('AW-') !== 0 || /XXX/.test(GADS_ID)) return;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GADS_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GADS_ID);
})();

/* Fire a Google Ads conversion. type = 'call' or 'text'.
   Safe to call anytime — does nothing until the values above are set. */
function adsConversion(type) {
  // Log the call to your own tracker FIRST, so it happens even if Google's tag
  // is blocked (ad blockers) or hasn't finished loading.
  if (type === 'call') { try { logCall('call'); } catch (e) {} }
  try {
    if (typeof gtag !== 'function') return;
    var label = (type === 'call') ? CONV_CALL : (type === 'text') ? CONV_TEXT : '';
    if (!label || /XXX/.test(label)) return;   // only bail on an unfilled placeholder, not a real label that happens to contain "X"
    gtag('event', 'conversion', { send_to: GADS_ID + '/' + label });
  } catch (e) {}
}
