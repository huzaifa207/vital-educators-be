// generate 4 digit random number
// document.cookie = 'PHPSESSID=husnain';

// const generateRandomNumber = () => {
//   return Math.floor(Math.random() * 10000);
// };

// const socket = io('https://localhost:3001');

const socket = io('https://localhost:3001', {
  transports: ['websocket'],
  methods: ['GET', 'POST'],

  withCredentials: true,
});

const message = document.getElementById('msg').innerHTML;

const handleMessage = () => {
  console.log('message.value', message);
  // message to server
  socket.emit(
    'sendMsgFromStudent',
    {
      data: { msg: 'wow how are you', receiverId: 28 },
    },
    (resp) => {
      console.log('ACK', resp);
    },
  );
};
// socket.on('sent', (data) => {
//   console.log('data id', data);
// });

socket.on('reveiveMsg', (data) => {
  console.log('data', data);
  document.getElementById('receiveMsg').innerHTML = data.msg;
});
