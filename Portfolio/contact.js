document.querySelector('#contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const field = document.querySelector('#message');
  const message = field.value.trim();
  field.setCustomValidity(message ? '' : 'Please enter a message.');
  if (!field.reportValidity()) return;
  window.location.href = 'mailto:koutilya.karamala2024@bitsdesign.edu.in?subject='
    + encodeURIComponent('Portfolio enquiry') + '&body=' + encodeURIComponent(message);
});
document.querySelector('#message').addEventListener('input', (event) => {
  event.target.setCustomValidity('');
});
