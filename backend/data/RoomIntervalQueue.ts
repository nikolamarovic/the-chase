import { RoomIntervalPair } from './RoomIntervalPair'

export class RoomIntervalQueue {
    store: RoomIntervalPair[] = [] as RoomIntervalPair[];
    push(val: RoomIntervalPair) {
      this.store.push(val);
    }
    pop(): RoomIntervalPair | undefined {
      return this.store.shift();
    }
    remove(room:string){
        var i = 0;
        while (i < this.store.length) {
            if (this.store[i].room == room) this.store.splice(i, 1);
            else ++i;
        }
    }
    find(room:string):RoomIntervalPair{
        var i = 0;
        while (i < this.store.length) {
            if (this.store[i].room == room) return this.store[i];
            else ++i;
        }
      return null;
    }
    findIntervalId(room:string):any{
        var i = 0;
        while (i < this.store.length) {
            if (this.store[i].room == room) return this.store[i].intervalId;
            else ++i;
        }
        return null;
    }
}