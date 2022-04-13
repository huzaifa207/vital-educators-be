const socket = io('http://localhost:3000');

const message = document.getElementById('msg').innerHTML;

const handleMessage = () => {
  console.log('message.value', message);
  // message to server
  socket.emit('createChat', {
    data: { message, to: 'husnain', from: 'ahmad' },
  });
};

socket.on('msToClient', (data) => {
  console.log('msgToClient', data);
});
