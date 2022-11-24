import { UserNewGame } from "./UserNewGame";

export class NewGameResponse{
    u1:UserNewGame;
    u2:UserNewGame;
    room:string;
    message:string;
    constructor(u1:UserNewGame,u2:UserNewGame,room:string,message:string){
        this.u1 = u1;
        this.u2 = u2;
        this.message = message;
        this.room = room;
    }
}