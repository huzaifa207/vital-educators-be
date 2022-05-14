// generate 4 digit random number
document.cookie = 'jwt=alsdkjaljsdlajsdlj';

const generateRandomNumber = () => {
  return Math.floor(Math.random() * 10000);
};
const socket = io('https://localhost:3001', {
  extraHeaders: {
    Authorization: `Bearer ${generateRandomNumber()}`,
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
  let reveiverId = document.getElementById('reveiverId');
  console.log('reveiverId', reveiverId.value);
  socket.emit('createChat', {
    data: { msg: 'hello', to: `${reveiverId.value}`, from: 'ahmad' },
  });
};

socket.on('reveiveMsg', (data) => {
  console.log('data', data);
  document.getElementById('receiveMsg').innerHTML = data.msg;
});
