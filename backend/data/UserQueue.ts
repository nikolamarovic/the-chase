import { UserNewGame } from './UserNewGame'

export class UserQueue {
    store: UserNewGame[] = [] as UserNewGame[];
    push(val: UserNewGame) {
      this.store.push(val);
    }
    pop(): UserNewGame | undefined {
      return this.store.shift();
    }
    remove(username:string){
        var i = 0;
        while (i < this.store.length) {
            if (this.store[i].username == username) this.store.splice(i, 1);
            else ++i;
        }
    }
    find(username:string):UserNewGame{
      var i = 0;
        while (i < this.store.length) {
            if (this.store[i].username == username) return this.store[i];
            else ++i;
        }
      return null;
    }
    isAnybodyHere():boolean{
      if(this.store.length > 1) return false;
      else return true;
    }
}