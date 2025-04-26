const socket = io();
const form = document.querySelector('form');
const textarea = document.getElementById('data');
const displayArea = document.getElementById('displayArea');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = textarea.value;
  socket.emit('paste', text);
  textarea.value = '';
});

socket.on('update', (data) => {
  displayArea.innerHTML = data;
});