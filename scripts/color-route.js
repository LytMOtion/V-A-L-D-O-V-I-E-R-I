(function () {
  'use strict';
  var config = document.getElementById('colorRoutes');
  if (!config) return;
  var routes = JSON.parse(config.textContent);
  var url = new URL(window.location.href);
  var requested = url.searchParams.get('color');
  if (!requested) return;
  var selected = requested.trim().toLowerCase().replace(/[ _]+/g, '-');
  var aliases = { navy: 'midnight-navy', gray: 'soft-gray', grey: 'soft-gray', 'soft-grey': 'soft-gray', softgray: 'soft-gray' };
  selected = aliases[selected] || selected;
  if (!Object.prototype.hasOwnProperty.call(routes, selected)) return;
  var target = routes[selected];
  if (url.pathname.replace(/\/?$/, '/') === target) return;
  url.pathname = target;
  url.searchParams.set('color', selected);
  window.location.replace(url.pathname + url.search + url.hash);
})();
