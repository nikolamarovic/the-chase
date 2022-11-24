
export class NewGameReponse{
    u1:string;
    u2:string;
    room:string;
    message:string;
    constructor(u1,u2,room,message){
        this.u1 = u1;
        this.u2 = u2;
        this.room = room;
        this.message = message;
    }
}