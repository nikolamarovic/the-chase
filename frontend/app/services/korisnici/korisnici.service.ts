import { HttpClient, HttpClientXsrfModule, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Korisnik } from 'src/app/model/Korisnik';

@Injectable({
  providedIn: 'root'
})
export class KorisniciService {
  uri = "http://192.168.0.104:4000";
  constructor(private httpClient:HttpClient) { }

  napraviKorisnika(k:Korisnik){
    return this.httpClient.post(`${this.uri}/registracija`,{
      "kor_ime":k.kor_ime,
      "lozinka":k.lozinka,
      "mejl":k.mejl
    },{ withCredentials: true});
  }

  prijaviKorisnika(kor_ime:string, lozinka:string){
    return this.httpClient.post(`${this.uri}/prijava`,{'kor_ime':kor_ime, 'lozinka':lozinka},{withCredentials: true});
  }

  dohvatiKorisnikaPoIdu(id:string){
    return this.httpClient.post(`${this.uri}/dohvatiKorisnikaPoIdu`,{'_id':id},{withCredentials: true});
  }

  dohvatiKorisnikaPoKorImenu(kor_ime:string){
    return this.httpClient.post(`${this.uri}/dohvatiKorisnikaPoKorImenu`,{'kor_ime':kor_ime},{withCredentials: true});
  }

  odjava(kor_ime:string){
    return this.httpClient.post(`${this.uri}/odjava`,{'kor_ime':kor_ime},{withCredentials: true});
  }
}
