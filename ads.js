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
  try {
    if (typeof gtag !== 'function') return;
    var label = (type === 'call') ? CONV_CALL : (type === 'text') ? CONV_TEXT : '';
    if (!label || /XXX/.test(label)) return;   // only bail on an unfilled placeholder, not a real label that happens to contain "X"
    gtag('event', 'conversion', { send_to: GADS_ID + '/' + label });
  } catch (e) {}
}
