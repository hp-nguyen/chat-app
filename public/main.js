const socket = io();
// let userName = prompt('Input your name to join room chat')
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const clientsTotal = document.getElementById('client-total');

const messageTone = new Audio('/message-tone.mp3');

// if (!userName.trim()) userName = prompt('Please input your name')

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
    // name: userName,
    message: messageInput.value,
    dateTime: new Date(),
  };
  socket.emit('send-message', data);
  addMessageToUI(true, data);
  messageInput.value = '';
}

socket.on('new-message', data => {
  messageTone.play()
  addMessageToUI(false, data);
});

function addMessageToUI(isOwnMessage, data) {
  clearTypingStatus();
  const element = `
      <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
          <p class="message">
            ${data.message}
            <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
          </p>
        </li>
        `;

  messageContainer.insertAdjacentHTML('beforeend', element);
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

messageInput.addEventListener('focus', e => {
  socket.emit('typing', {
    text: `✍️  is typing a message`,
  });
});

messageInput.addEventListener('keypress', e => {
  socket.emit('typing', {
    text: `✍️  is typing a message`,
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
          <p class="typing-text" id="typing-text">${data.text}</p>
        </li>
  `;
  messageContainer.insertAdjacentHTML('beforeend', element);
});

function clearTypingStatus() {
  const statusEl = document.getElementById('typing-status');
  if (statusEl) statusEl.remove();
}
