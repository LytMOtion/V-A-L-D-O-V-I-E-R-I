const menu = document.getElementById('menuDialog');
const open = document.getElementById('openMenu');
const close = document.getElementById('closeMenu');
let returnFocus = open;
if (menu && open && close && typeof menu.showModal === 'function') {
  open.hidden = false;
  document.body.classList.add('has-home-menu');
  open.addEventListener('click', () => {
    returnFocus = open;
    menu.showModal();
    open.setAttribute('aria-expanded', 'true');
    close.focus();
  });
  close.addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => {
    open.setAttribute('aria-expanded', 'false');
    returnFocus.focus({preventScroll:true});
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    if (link.getAttribute('href') === '#access') {
      returnFocus = document.getElementById('access');
      returnFocus.tabIndex = -1;
    }
    menu.close();
  }));
  menu.addEventListener('click', event => {
    const box = menu.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) menu.close();
  });
}

// The photograph and all content render before this optional enhancement.
const surface = document.getElementById('atmosphereSurface');
if (surface) {
  const still = document.getElementById('textileStill');
  const canvas = document.getElementById('textileCanvas');
  const toggle = document.getElementById('motionToggle');
  const motionPreference = new URLSearchParams(location.search).get('motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const enhance = async () => {
    if (reduced.matches || navigator.connection?.saveData || motionPreference === 'off') {
      surface.dataset.motion = reduced.matches ? 'reduced-motion' : 'requested-static';
      return;
    }
    try {
      const {startTextileMotion} = await import('./textile-motion.js');
      await startTextileMotion({surface,still,canvas,toggle,unavailable:motionPreference === 'test-no-webgl'});
    } catch {
      canvas.hidden = true;
      toggle.hidden = true;
      surface.dataset.motion = 'unavailable-static';
    }
  };
  const schedule = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(enhance,{timeout:1500});
    else setTimeout(enhance,600);
  };
  if (document.readyState === 'complete') schedule();
  else addEventListener('load',schedule,{once:true});
}
