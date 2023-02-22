const socket = io('https://localhost:3001', {
  transports: ['websocket'],
  methods: ['GET', 'POST'],

  withCredentials: true,
});

function msgFromStudent() {
  const msg = document.getElementById('sendMsgFromStudent').value;
  handleMessage({ event: 'sendMsgFromStudent', msg, id: 33 });
}

function msgFromTutor() {
  const msg = document.getElementById('sendMsgFromTutor').value;
  handleMessage({ event: 'sendMsgFromTutor', msg, id: 31 });
}

const handleMessage = ({ event, msg, id }) => {
  // message to server
  socket.emit(
    event,
    {
      data: { msg, receiverId: id },
    },
    (resp) => {
      // console.log('ACK', resp);
    },
  );
};

socket.on('reveiveMsgFromTutor', (data) => {
  const { msg } = data;
  const receiveMsgFromTutor = document.getElementById('receiveMsgFromTutor');
  receiveMsgFromTutor.innerHTML = `<p>${msg}</p>`;
});

socket.on('reveiveMsgFromStudent', (data) => {
  const { msg } = data;
  const receiveMsgFromStudent = document.getElementById('receiveMsgFromStudent');
  receiveMsgFromStudent.innerHTML = `<p>${msg}</p>`;
});

socket.on('receiveAllMsg', (data) => console.log('data', data));

// const socket = io('https://localhost:3001', {
//   transports: ['websocket'],
//   methods: ['GET', 'POST'],

//   withCredentials: true,
// });

// // const message = document.getElementById('msg').innerHTML;

// const handleMessage = () => {
//   console.log('message.value', message);
//   // message to server
//   socket.emit(
//     'sendMsgFromStudent',
//     {
//       data: { msg: 'wow how are you', receiverId: 28 },
//     },
//     (resp) => {
//       console.log('ACK', resp);
//     },
//   );
// };
// // socket.on('sent', (data) => {
// //   console.log('data id', data);
// // });

// socket.on('reveiveMsg', (data) => {
//   console.log('data', data);
//   // document.getElementById('receiveMsg').innerHTML = data.msg;
// });
