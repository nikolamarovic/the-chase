import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IgraService {
  uri = "http://192.168.0.104:4000";
  constructor(private httpClient:HttpClient) { }
  getRoom(room:string){
    return this.httpClient.post(`${this.uri}/getRoom`,{'room':room});
  }

  dohvatiIgre(){
    return this.httpClient.get(`${this.uri}/dohvatiIgre`);
  }
}
