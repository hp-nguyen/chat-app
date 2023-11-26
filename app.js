const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Server listen on port ${PORT}`));

const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));

let socketsConected = new Set();

io.on('connection', onConnected);

function onConnected(socket) {
  console.log('Socket connected', socket.id);
  socketsConected.add(socket.id);
  io.emit('clients-total', socketsConected.size);

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id);
    socketsConected.delete(socket.id);
    io.emit('clients-total', socketsConected.size);
  });

  socket.on('send-message', data => {
    socket.broadcast.emit('new-message', data);
  });

  socket.on('typing', data => {
    socket.broadcast.emit('typing', data);
  });
}
