import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KorisnikDb } from '../data/KorisnikDb';
import { KorisniciService } from '../services/korisnici/korisnici.service';
import { ProveraService } from '../services/provera_ruta/provera.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

  korisnik:KorisnikDb;
  cookie_id:string;
  constructor(private proveraServis:ProveraService, private route:ActivatedRoute, private router:Router, private korisniciServis:KorisniciService) { }

  ngOnInit(): void {
    this.korisnik = {} as KorisnikDb;

    this.cookie_id = "";
    this.route.params.subscribe(params=>{
      this.cookie_id = params["cookie_id"];
      let token = localStorage.getItem(this.cookie_id);
      this.proveraServis.proveri(token).subscribe((res:Object)=>{
        this.proveraStranice(res, this.cookie_id);
      })
    })
  }

  proveraStranice(res:Object, cookie_id:string){
    if(res['response']['poruka'].length > 0) this.router.navigate(['/']);
    else{
      this.postaviActive('my_profile');
      this.korisniciServis.dohvatiKorisnikaPoIdu(res['response']['id']).subscribe((k:KorisnikDb)=>{
        this.korisnik = k;
        this.korisnik.cookie_id = cookie_id;
      })
    }
  }

  removeActiveTag(){
    document.getElementById('home_page').classList.remove('active');
    document.getElementById('rang_list').classList.remove('active');
    document.getElementById('my_profile').classList.remove('active');
  }

  postaviActive(id:string){
    this.removeActiveTag();
    document.getElementById(id).classList.add('active');
  }

  preusmeri(s:string){
    this.postaviActive(s);
    this.router.navigate([s,this.cookie_id]);
  }

  odjaviMe(){
    this.korisniciServis.odjava(this.korisnik.kor_ime).subscribe(()=>{
      localStorage.removeItem(this.cookie_id);
      this.router.navigate(['/']);
    })
  }

  vratiNaPocetnu(){
    this.router.navigate(['home_page',this.korisnik.cookie_id]);
  }

}
