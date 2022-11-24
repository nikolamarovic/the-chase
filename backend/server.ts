import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import establishConnection from './socket/socket_sync'


// *** CONFIG ***
const app = express();
const routes = require('./routes/routes');
const cookieParser = require('cookie-parser');
const corsOptions = {origin: "http://192.168.0.104:4200", methods: ["GET", "POST"], credentials: true}
app.use(cors(corsOptions));
app.use(bodyParser.json());

const server = app.listen(4000, () => console.log(`Express server running on port 4000`));

// *** SOCKET INIT & FUNCTIONS ***
establishConnection(server);

// *** DATABASE CONNECTION ***
mongoose.connect("mongodb://localhost:27017/potera", { useNewUrlParser: true });
const conn = mongoose.connection;
conn.once('open',()=>{
    console.log("Database connection established successfully.");
})

app.use(cookieParser());
app.use(routes);
