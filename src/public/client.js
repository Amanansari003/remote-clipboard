const socket = io();
const form = document.querySelector('#pasteForm');
const textarea = document.getElementById('data');
const displayArea = document.getElementById('displayArea');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomIdInput = document.getElementById('roomIdInput');
const roomInfo = document.getElementById('roomInfo');

let roomId = null;

// Create a new room
createRoomBtn.addEventListener('click', () => {
  socket.emit('createRoom'); 
  socket.on('roomCreated', (id) => {
    roomId = id;
    roomInfo.classList.remove('d-none');
    roomInfo.textContent = `Room created! Share this ID with others to join: ${roomId}`;
  });
});
// Join an existing room
joinRoomBtn.addEventListener('click', () => {
  const enteredRoomId = roomIdInput.value.trim();
  if (enteredRoomId) {
    socket.emit('joinRoom', enteredRoomId);
    socket.on('roomJoined', (id) => {
      roomId = id;
      roomInfo.classList.remove('d-none');
      roomInfo.textContent = `Successfully joined room: ${roomId}`;
    });
    socket.on('error', (message) => {
      alert(message);
    });
  } else {
    alert('Please enter a valid Room ID');
  }
});

// Handle form submission
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = textarea.value;
  if (roomId) {
    socket.emit('paste', { roomId, data: text });
    textarea.value = '';
  } else {
    alert('You must join a room first!');
  }
});

// Display updates from the server
socket.on('update', (data) => {
  displayArea.innerHTML = data;
});