const socket = io();

const queryParams = new URLSearchParams(window.location.search);
const username = queryParams.get('username');
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const clientsTotal = document.getElementById('client-total');

const messageTone = new Audio('/message-tone.mp3');

messageForm.addEventListener('submit', e => {
  e.preventDefault();
  sendMessage();
});

socket.on('clients-total', data => {
  clientsTotal.innerText = `Total Clients: ${data}`;
});

function sendMessage() {
  if (messageInput.value === '') return;
  const data = {
    name: username,
    message: messageInput.value,
    dateTime: new Date(),
  };
  socket.emit('send-message', data);
  addMessageToUI(true, data);
  messageInput.value = '';
}

socket.on('new-message', data => {
  messageTone.play();
  addMessageToUI(false, data);
});

function addMessageToUI(isOwnMessage, data) {
  clearTypingStatus();
  const element = `
      <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
          <p class="message">
            ${data.message}
            <span>${data.name} ● ${moment(data.dateTime).format('DD MMM h:mm a')}</span>
          </p>
        </li>
        `;

  messageContainer.insertAdjacentHTML('beforeend', element);
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}


messageInput.addEventListener('keypress', e => {
  socket.emit('typing', {
    text: `${username} is typing a message <i class="far fa-comment-dots"></i>`,
  });
});
messageInput.addEventListener('blur', e => {
  socket.emit('typing', {
    text: '',
  });
});

socket.on('typing', data => {
  clearTypingStatus();
  const element = `
        <li id="typing-status">
          <p id="typing-text">${data.text}</p>
        </li>
  `;
  messageContainer.insertAdjacentHTML('beforeend', element);
});

function clearTypingStatus() {
  const statusEl = document.getElementById('typing-status');
  if (statusEl) statusEl.remove();
}
