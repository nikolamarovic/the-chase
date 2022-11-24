import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProveraService {
  uri = "http://192.168.0.104:4000";
  constructor(private httpClient:HttpClient) { }

  proveri(token:string){
    return this.httpClient.post(`${this.uri}/provera`,{'token':token},{ withCredentials: true});
  }
}
