import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KorisniciService } from '../services/korisnici/korisnici.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  kor_ime:string;
  lozinka:string;
  greska:string;
  constructor(private router:Router, private korisniciServis:KorisniciService) { }

  ngOnInit(): void {
    this.kor_ime = "";
    this.lozinka = "";
    this.greska = "";
  }

  loginUser(){
    this.greska = "";
    this.korisniciServis.prijaviKorisnika(this.kor_ime,this.lozinka).subscribe((res:Object)=>{
      if(res['response']['greska'].length > 0){
        this.greska = res['response']['greska'];
      }else{
        let key = res['response']['cookie_id'];
        key = key.substring(1);
        let value = res['response']['token'];
        localStorage.setItem(key, value);
        this.router.navigate(['home_page', key]);
      }
    })
  }

  returnTo(){
    this.router.navigate(['/']);
  }
}
