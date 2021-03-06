//Create an account on Firebase, and use the credentials they give you in place of the following
var config = {
  apiKey: "AIzaSyBO8NAENQy9l75ZOaThCbGAQNqVHFBN0WQ",
  authDomain: "video-chat-app-f8834.firebaseapp.com",
  projectId: "video-chat-app-f8834",
  storageBucket: "video-chat-app-f8834.appspot.com",
  messagingSenderId: "789365611767",
  appId: "1:789365611767:web:b0c626e4feb00b67af47f2",
  measurementId: "G-6J9RMBSR1V",
};
firebase.initializeApp(config);

var database = firebase.database().ref();
var yourVideo = document.getElementById("yourVideo");
var friendsVideo = document.getElementById("friendsVideo");
var yourId = Math.floor(Math.random() * 1000000000);
//Create an account on Viagenie (http://numb.viagenie.ca/), and replace {'urls': 'turn:numb.viagenie.ca','credential': 'websitebeaver','username': 'websitebeaver@email.com'} with the information from your account
var servers = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "numb.viagenie.ca",
      credential: "kashifsocial140@gmail.com",
      username: "social140",
    },
  ],
};
var pc = new RTCPeerConnection(servers);
pc.onicecandidate = (event) =>
  event.candidate
    ? sendMessage(yourId, JSON.stringify({ ice: event.candidate }))
    : console.log("Sent All Ice");
pc.onaddstream = (event) => (friendsVideo.srcObject = event.stream);

function sendMessage(senderId, data) {
  var msg = database.push({ sender: senderId, message: data });
  msg.remove();
}

function readMessage(data) {
  var msg = JSON.parse(data.val().message);
  var sender = data.val().sender;
  if (sender != yourId) {
    if (msg.ice != undefined) pc.addIceCandidate(new RTCIceCandidate(msg.ice));
    else if (msg.sdp.type == "offer")
      pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
        .then(() => pc.createAnswer())
        .then((answer) => pc.setLocalDescription(answer))
        .then(() =>
          sendMessage(yourId, JSON.stringify({ sdp: pc.localDescription }))
        );
    else if (msg.sdp.type == "answer")
      pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
  }
}

database.on("child_added", readMessage);

function showMyFace() {
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: true })
    .then((stream) => (yourVideo.srcObject = stream))
    .then((stream) => pc.addStream(stream));
}

function showFriendsFace() {
  pc.createOffer()
    .then((offer) => pc.setLocalDescription(offer))
    .then(() =>
      sendMessage(yourId, JSON.stringify({ sdp: pc.localDescription }))
    );
}
