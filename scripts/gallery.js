(function () {
  'use strict';
  var dialog = document.getElementById('imageDialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  var close = document.getElementById('closeImage');
  var image = document.getElementById('zoomImage');
  var title = document.getElementById('zoomTitle');
  var lastTrigger;
  document.querySelectorAll('.image-open').forEach(function (trigger) {
    trigger.hidden = false;
    trigger.addEventListener('click', function () {
      lastTrigger = trigger;
      image.src = trigger.dataset.imageSrc;
      image.alt = trigger.dataset.imageTitle;
      title.textContent = trigger.dataset.imageTitle;
      dialog.showModal();
      close.focus({ preventScroll: true });
    });
  });
  close.addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('close', function () {
    image.removeAttribute('src');
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  });
})();
