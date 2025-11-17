const header = document.getElementById('header');
const menuBubble = document.getElementById('menuBubble');
const menuDropdown = document.getElementById('menuDropdown');

let lastScrollTop = 0;

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop && scrollTop > 100) {
    // Scroll vers le bas : cache header, affiche bulle
    header.classList.add('hidden');
    menuBubble.classList.add('visible');
  } else {
    // Scroll vers le haut : affiche header
    header.classList.remove('hidden');
    // Ne pas cacher la bulle si menu ouvert
    if (!menuDropdown.classList.contains('show')) {
      menuBubble.classList.remove('visible');
    }
    // On ne ferme plus le menu automatiquement
    // menuDropdown.classList.remove('show');
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// Clique sur la bulle pour afficher/masquer le menu
menuBubble.addEventListener('click', () => {
  menuDropdown.classList.toggle('show');
  // Si le menu s'affiche, on garde la bulle visible
  if (menuDropdown.classList.contains('show')) {
    menuBubble.classList.add('visible');
  } else {
    // Si le header est visible, on peut cacher la bulle
    if (!header.classList.contains('hidden')) {
      menuBubble.classList.remove('visible');
    }
  }
});
