const io = require("socket.io-client");
const socket = io("http://192.168.0.104:4000");
export default socket;
