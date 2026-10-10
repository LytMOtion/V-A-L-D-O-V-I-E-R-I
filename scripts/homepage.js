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

// Static composition gate first. Motion is integrated after rendered review.
