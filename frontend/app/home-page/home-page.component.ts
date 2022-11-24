import { Component, HostListener, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KorisnikDb } from '../data/KorisnikDb';
import { Timer } from '../data/Timer';
import socket from '../../assets/js/MySocket';
import { KorisniciService } from '../services/korisnici/korisnici.service';
import { ProveraService } from '../services/provera_ruta/provera.service';

//name="fieldName" ngDefaultControl
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  // *** PODACI ***
  korisnik:KorisnikDb;
  saigrac:KorisnikDb;
  room:string;
  igrac_na_potezu:string;
  cookie_id:string;

  // *** TAJMERI ***
  tajmer_zapocni_igru:Timer;
  tajmer_prva_igra:Timer;
  

  // *** PRIKAZ FLEGOVI
  dobrodoslica_prikaz:boolean;
  zapocni_trazenje_saigraca:boolean;
  pronadjen_saigrac_prikaz:boolean;

  constructor(private ngZone: NgZone, private route:ActivatedRoute, private router:Router, private proveraServis:ProveraService, private korisniciServis:KorisniciService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params=>{
      this.cookie_id = params["cookie_id"];
      let token = localStorage.getItem(this.cookie_id);
      this.proveraServis.proveri(token).subscribe((res:Object)=>{
        this.proveraStranice(res, this.cookie_id);
      })
    })

    this.tajmer_zapocni_igru = new Timer(5,0);
    this.tajmer_prva_igra = new Timer(15,0);
    
    this.korisnik = {} as KorisnikDb;
    this.saigrac = {} as KorisnikDb;
    this.igrac_na_potezu = "";

    this.postaviPrikaze();
    this.socketInit();
  }

  socketInit(){
    socket.on('pronadjen_saigrac', ({saigrac, na_potezu, room})=>{
      
      this.korisniciServis.dohvatiKorisnikaPoKorImenu(saigrac).subscribe((k:KorisnikDb)=>{
        this.saigrac = k;
        socket.emit('prikazi_saigraca', this.saigrac.kor_ime);
        this.room = room;
        this.igrac_na_potezu = na_potezu;
        document.getElementById('pronadjen_saigrac').classList.remove('hide');

        if(na_potezu == this.korisnik.kor_ime){
          document.getElementById('pocetak_prve_runde_text').innerHTML = "Pripremite se za igru. Vi ste prvi na potezu. Kada budete spremni možete započeti prvu rundu.";
          document.getElementById('pocetak_prve_runde_btn').classList.remove('hide');
        }else{
          document.getElementById('pocetak_prve_runde_text').innerHTML = "Pripremite se za igru. Vaš saigrač je prvi na potezu. Kada on bude spreman počeće prva runda.";
        }
        document.getElementById('zapocni_trazenje_saigraca').classList.add('hide');
        document.getElementById('saigrac_ime').innerHTML = 'Vaš saigrač je ' + this.saigrac.kor_ime + ".";
      })
    })

    socket.on('timer_trazenje_saigraca',(data:Timer)=>{
      document.getElementById('tajmer_trazenje_igraca').innerHTML = "Preostalo vreme: " + data.sec + " sekundi." 
    })

    socket.on('isteklo_vreme_trazenje_saigraca', ()=>{
      document.getElementById('tajmer_trazenje_igraca_iznad').innerHTML="";
      document.getElementById('tajmer_trazenje_igraca').innerHTML = 'Nažalost, niko se nije javio... Žao nam je, pokušajte kasnije.'
      document.getElementById('zapocni_igru_ponovo').classList.remove('hide');
    })
    
    socket.on('napusti_igru',()=>{
      location.reload();
    })

  }

  proveraStranice(res:Object, cookie_id:string){
    if(res['response']['poruka'].length > 0) this.router.navigate(['/']);
    else{
      this.postaviActive('home_page');
      this.korisniciServis.dohvatiKorisnikaPoIdu(res['response']['id']).subscribe((k:KorisnikDb)=>{
        this.korisnik = k;
      })
    }
  }

  postaviPrikaze(){
    this.dobrodoslica_prikaz = true;
    this.zapocni_trazenje_saigraca = false;
    this.pronadjen_saigrac_prikaz = false;
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
    //this.router.navigate(['home_page',this.korisnik.cookie_id]);
  }

  zapocniTrazenjeSaigraca(){
    this.dobrodoslica_prikaz = false;
    this.zapocni_trazenje_saigraca = true;
    if(document.getElementById('tajmer_trazenje_igraca') != null) document.getElementById('tajmer_trazenje_igraca').innerHTML = "";
    if(document.getElementById('zapocni_igru_ponovo') != null) document.getElementById('zapocni_igru_ponovo').classList.add('hide');
    socket.emit('zapocni_trazenje',{'sec':this.tajmer_zapocni_igru.sec,'hun':this.tajmer_zapocni_igru.hun},this.korisnik.kor_ime);
  }

  zapocniPrvuIgru(){
    // socket.emit('treca_igra_server', this.room);
    // document.getElementById('zapocinjanje_igre').classList.add('hide');
    // document.getElementById('treca_igra_komponenta').classList.remove('hide');
    socket.emit('pocinje_prva_igra_svi',this.room,this.igrac_na_potezu);
    socket.emit('prva_igra_odbrojavanje',{'sec':this.tajmer_prva_igra.sec,'hun':this.tajmer_prva_igra.hun}, this.room);
  }  
}
