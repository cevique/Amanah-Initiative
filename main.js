const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.textContent = open ? 'x' : '☰';
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
  });
});

document.getElementById('year').textContent = new Date().getFullYear();

document.getElementById('pledgeForm').addEventListener('submit', async e => {
  e.preventDefault();

  const form = e.currentTarget;
  const input = document.getElementById('commitment');
  const result = document.getElementById('pledgeResult');
  const submitButton = form.querySelector('[type="submit"]');
  const text = input.value.trim();

  if (!text) return;

  result.textContent = 'Sending your commitment...';
  result.classList.add('show');
  submitButton.disabled = true;

  try {
    const response = await fetch('/api/pledge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: text })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Could not submit your commitment.');
    }

    // Add the pledge to this visitor's page after the API succeeds.
    // This is a local preview, not a persistent shared community wall.
    const card = document.createElement('article');
    card.className = 'suggestion-card';

    const tag = document.createElement('span');
    tag.className = 'suggestion-tag';
    tag.textContent = 'New';

    const paragraph = document.createElement('p');
    paragraph.textContent = text;

    const small = document.createElement('small');
    small.textContent = 'Anonymous · Just now';

    card.append(tag, paragraph, small);

    const grid = document.getElementById('suggestionGrid');
    grid.prepend(card);

    input.value = '';
    result.textContent =
      'Thank you for making a commitment. Your submission was sent to the campaign team.';
  } catch (error) {
    result.textContent =
      error.message || 'Something went wrong. Please try again.';
  } finally {
    submitButton.disabled = false;
  }
});