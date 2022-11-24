import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PitanjaService {
  uri = "http://192.168.0.104:4000";
  
  constructor(private httpClient:HttpClient) { }
  
  dohvatiPitanjaPoKategoriji(kategorija:string){
    return this.httpClient.post(`${this.uri}/dohvatiPitanjaPoKategoriji`,{'kategorija':kategorija});
  }

  dohvatiPitanjaPoTezini(tezina:string){
    return this.httpClient.post(`${this.uri}/dohvatiPitanjaPoTezini`,{'tezina':tezina});
  }
}
