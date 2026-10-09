(function () {
  'use strict';
  var form = document.getElementById('suForm');
  var status = document.getElementById('suOk');
  var button = form.querySelector('button');
  var busy = false;
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    if (form.dataset.preview === 'true') {
      var piece = document.getElementById('inquiryPiece');
      var color = document.getElementById('inquiryColor');
      var context = piece && color ? ' for ' + piece.value + ' / ' + color.value : '';
      status.textContent = 'Preview complete' + context + '. No request has been sent.';
      return;
    }
    busy = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending your request…';
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 12000);
    try {
      var response = await fetch('https://formspree.io/f/xlgyeaaz', {
        method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Request failed');
      form.reset();
      status.textContent = 'Received. Thank you for your interest.';
    } catch (_) {
      status.textContent = 'Your request could not be sent. Please try again or email inquiries@valdovieri.com.';
    } finally {
      clearTimeout(timeout);
      busy = false;
      button.disabled = false;
      button.textContent = 'Request access';
      form.removeAttribute('aria-busy');
    }
  });
})();
