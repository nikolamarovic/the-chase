import { Socket } from "socket.io";

export class UserNewGame{
    username:string;
    intervalId:any;
    socket:Socket;
    constructor(u:string, i:any,s:Socket){
        this.username = u;
        this.intervalId = i;
        this.socket = s;
    }
}
