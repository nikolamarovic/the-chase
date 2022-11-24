import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Korisnik } from '../model/Korisnik';
import { KorisniciService } from '../services/korisnici/korisnici.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})

export class RegisterPageComponent implements OnInit {
  greske:string;
  novi_korisnik:Korisnik;
  ponovljena_lozinka:string;
  nastavi:boolean;
  constructor(private router:Router, private korisniciServis:KorisniciService) { }

  ngOnInit(): void {
    this.novi_korisnik = {} as Korisnik;
    this.ponovljena_lozinka = "";
    this.greske = "";
    this.nastavi = false;
  }

  registerUser(){
    this.greske = "";
    if(this.ponovljena_lozinka != this.novi_korisnik.lozinka)
      this.greske = "Lozinke se ne poklapaju.";
    else{
      this.korisniciServis.napraviKorisnika(this.novi_korisnik).subscribe((res:Object)=>{
        console.log(res);
        if(res['response']['_id']=="")
          this.greske = res['response']['kor_ime'] + ' ' + res['response']['mejl'] + ' ' + res['response']['lozinka'];
        else{
          console.log('korisnik _id: ' + res['response']['_id']);
          this.nastavi = true;
        } 
      })
    }
  }

  redirectToLoginPage(){
    this.router.navigate(['user_login']);
  }

  returnTo(){
    this.router.navigate(['/']);
  }
}
