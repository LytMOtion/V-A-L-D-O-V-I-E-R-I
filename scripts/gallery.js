(function () {
  'use strict';
  var trigger = document.getElementById('openDetail');
  var dialog = document.getElementById('detailDialog');
  if (!trigger || !dialog || typeof dialog.showModal !== 'function') return;
  var close = document.getElementById('closeDetail');
  var viewport = document.getElementById('zoomViewport');
  trigger.hidden = false;
  trigger.addEventListener('click', function () {
    dialog.showModal();
    var image = document.getElementById('zoomDetailImage');
    var mark = image.querySelector('.garment-mark');
    viewport.scrollLeft = image.clientWidth * parseFloat(mark.style.getPropertyValue('--mark-x')) / 100 - viewport.clientWidth / 2;
    viewport.scrollTop = image.clientHeight * parseFloat(mark.style.getPropertyValue('--mark-y')) / 100 - viewport.clientHeight / 2;
    close.focus({ preventScroll: true });
  });
  close.addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('close', function () { trigger.focus({ preventScroll: true }); });
})();
