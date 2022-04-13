const socket = io('http://localhost:3000', {
  extraHeaders: {
    Authorization: 'Bearer asldlajsdlkaj190elaskjd12dasl',
  },
});

// const socket = io('https://vital-educator.herokuapp.com/', {
//   extraHeaders: {
//     Authorization: 'Bearer asldlajsdlkaj190elaskjd12dasl',
//   },
// });

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
