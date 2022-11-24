import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import socket from 'src/assets/js/MySocket';
import { KorisnikDb } from '../data/KorisnikDb';
import { Timer } from '../data/Timer';
import { Pitanja } from '../model/Pitanja';
import { KorisniciService } from '../services/korisnici/korisnici.service';
import { PitanjaService } from '../services/pitanja/pitanja.service';

@Component({
  selector: 'app-treca-igra',
  templateUrl: './treca-igra.component.html',
  styleUrls: ['./treca-igra.component.css']
})
export class TrecaIgraComponent implements OnInit {
//*** INPUT PODACI ***
  @Input() korisnik:KorisnikDb;
  @Input() room:string;

//*** IGRACI ***
  saigrac:KorisnikDb;

//*** TAJMER ***
  tajmer:Timer;

//*** PODACI ZA IGRU ***
  odgovor_treca_igra:string;
  odgovor_html:HTMLElement;
  broj_pitanja:number;
  broj_tacnih_odgovora:number;
  ukupna_suma:number;

//*** PITANJA ***
  pitanja:Array<Pitanja>
  trenutno_pitanje:Pitanja;


  sentReq:boolean = false;

  constructor(private router:Router, private korisniciServis:KorisniciService, private pitanjaServis:PitanjaService) { }

  ngOnInit(): void {
    this.pitanja = [] as Array<Pitanja>;
    this.trenutno_pitanje = {} as Pitanja;
    this.ukupna_suma = 0;
    this.broj_pitanja = 0;
    this.broj_tacnih_odgovora = 0;
    this.tajmer = new Timer(15,0);
    this.socketInit();
  }

  arrangeQuestions(array) {
    var currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

  socketInit(){
    socket.on('pocinje_treca_igra',({room, suma})=>{
      this.room = room;
      this.ukupna_suma = suma;
      this.pitanjaServis.dohvatiPitanjaPoTezini('3').subscribe((p:Pitanja[])=>{
        this.pitanja = p;
        //this.arrangeQuestions(this.pitanja);
        this.trenutno_pitanje = this.pitanja[this.broj_pitanja];
        this.postaviPitanje(this.trenutno_pitanje.tekst, this.broj_pitanja);
      })

      document.getElementById('postignut_broj_pitanja_treca_igra').innerHTML = this.broj_tacnih_odgovora + "";
      document.getElementById('ukupna_suma_treca_igra').innerHTML = "" + this.ukupna_suma;
      document.getElementById('ukupna_suma').innerHTML = "" + this.ukupna_suma + " RSD";
    })

    socket.on('dohvatiSaigraca',(saigrac:string)=>{
      this.korisniciServis.dohvatiKorisnikaPoKorImenu(saigrac).subscribe((k:KorisnikDb)=>{
        this.saigrac = k;
      })
    })
     
    socket.on('treca_igra_tajmer',(data:Timer)=>{
      document.getElementById('tajmer_treca_igra').innerHTML = data.sec + ":" + data.hun;
    })

    socket.on('treca_igra_isteklo_vreme',()=>{
      document.getElementById('treca_igra_rezultat_header').innerHTML = "Vreme je isteklo...";
      document.getElementById('tajmer_treca_igra').innerHTML = ""; 
      document.getElementById('zavrsena_treca_igra_poruka').innerHTML = "Odgovorili ste tačno na " + this.broj_tacnih_odgovora + " od postavljenih " + this.broj_pitanja + ". Sačekaćemo da vidimo koliko je tačnih odgovora dao tragač...";
      document.getElementById('treca_igra_u_toku').classList.add('hide');
      document.getElementById('treca_igra_zavrsena').classList.remove('hide');
  
      socket.emit('tragac_treca_igra_odgovori', this.room, this.broj_pitanja, this.broj_tacnih_odgovora, this.pitanja);    
    })

    socket.on('omoguci_odgovor', ()=>{
      document.getElementById('igrac_na_potezu_treca_igra').innerHTML = "" + this.korisnik.kor_ime + " odgovara...";
      
      document.getElementById('btn_javi_se_treca_igra').classList.add('hide');
      document.getElementById('btn_dalje_treca_igra').classList.remove('hide');
      document.getElementById('btn_potvrdi_treca_igra').classList.remove('hide');
    })

    socket.on('saigrac_se_prvi_javio',()=>{
      document.getElementById('igrac_na_potezu_treca_igra').innerHTML = "" + this.saigrac.kor_ime;
      document.getElementById('tacan_odgovor_treca_igra').classList.add('hide');
      document.getElementById('netacan_odgovor_treca_igra').classList.add('hide');
      document.getElementById('btn_javi_se_treca_igra').classList.add('hide');
    })

    socket.on('odgovor_treca_igra',(poruka:string)=>{
      this.broj_pitanja++;
      this.trenutno_pitanje = this.pitanja[this.broj_pitanja];
      
      this.odgovor_treca_igra = "";
      (<HTMLInputElement>document.getElementById('odgovor_treca_igra')).value = "";

      // *** EVIDENTIRATI ODGOVOR ZA EXPORT! ***
      if(poruka === 'ok'){
        this.broj_tacnih_odgovora++;
        document.getElementById('tacan_odgovor_treca_igra').classList.remove('hide');
        document.getElementById('postignut_broj_pitanja_treca_igra').innerHTML = "" + this.broj_tacnih_odgovora;  
      }else{
        // *** NAPISATI STA JE TACAN ODGOVOR ***
        document.getElementById('netacan_odgovor_treca_igra').classList.remove('hide');
        document.getElementById('netacan_odgovor_treca_igra_tekst').innerHTML = 'Netačno... Tačan odgovor je: ' + ' <b>' + poruka + '</b>';
      }

      this.postaviPitanje(this.trenutno_pitanje.tekst, this.broj_pitanja);
    })


    socket.on('dalje_treca_igra', ()=>{
      this.broj_pitanja++;
      this.trenutno_pitanje = this.pitanja[this.broj_pitanja];
      this.postaviPitanje(this.trenutno_pitanje.tekst, this.broj_pitanja);
      this.odgovor_treca_igra = "";
    })

    socket.on('tragac_rezultat_odgovora',({flag, broj_odg})=>{
      
      document.getElementById('zavrsena_treca_igra_poruka').innerHTML = "";
      document.getElementById('zavrsena_treca_igra_tajmer').innerHTML = "";
      if(!flag){
        document.getElementById('treca_igra_rezultat_header').innerHTML = "Čestitamo!";
        document.getElementById('zavrsena_treca_igra_poruka').innerHTML = "Pobedili ste tragača! Uspešno ste osvojili sumu od " + this.ukupna_suma + ". Tragač je odgovorio tačno na " + broj_odg + " pitanja od postavljenih " + this.broj_pitanja + ". ";
      }else{
        document.getElementById('treca_igra_rezultat_header').innerHTML = "Nažalost...";
        document.getElementById('zavrsena_treca_igra_poruka').innerHTML = "Tragač je dao više tačnih odgovora... Odgovorio je tačno na " + broj_odg + " pitanja od postavljenih " + this.broj_pitanja + ". ";
      }
      socket.emit('napusti_igru_tajmer',this.room);
    })

    document.getElementById('odgovor_treca_igra').addEventListener('keypress',()=>{
      document.getElementById('tacan_odgovor_treca_igra').classList.add('hide');
      document.getElementById('netacan_odgovor_treca_igra').classList.add('hide');
    })
  }

  postaviPitanje(tekst:string, broj:number){
    document.getElementById('igrac_na_potezu_treca_igra').innerHTML = "";
    document.getElementById('btn_javi_se_treca_igra').classList.remove('hide');
    document.getElementById('btn_dalje_treca_igra').classList.add('hide');
    document.getElementById('btn_potvrdi_treca_igra').classList.add('hide');
    document.getElementById('pitanje_treca_igra').innerHTML = tekst;
  }

  javiSe(){
    socket.emit('javi_se_treca_igra',this.saigrac.socket_id);
  }

  daljeTrecaIgra(){
    socket.emit('dalje_treca_igra_server',this.room);
    this.odgovor_treca_igra = "";
  }

  potvrdiOdgovorTrecaIgra(){
    document.getElementById('tacan_odgovor').classList.add('hide');
    document.getElementById('netacan_odgovor').classList.add('hide');
    
    socket.emit('odgovor_treca_igra_server',this.odgovor_treca_igra, this.room, this.trenutno_pitanje);
  }

}
