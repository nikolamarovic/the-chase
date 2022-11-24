import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import socket from 'src/assets/js/MySocket';
import { KorisnikDb } from '../data/KorisnikDb';
import { Timer } from '../data/Timer';
import { Pitanja } from '../model/Pitanja';
import { KorisniciService } from '../services/korisnici/korisnici.service';
import { PitanjaService } from '../services/pitanja/pitanja.service';

@Component({
  selector: 'app-prva-igra',
  templateUrl: './prva-igra.component.html',
  styleUrls: ['./prva-igra.component.css']
})
export class PrvaIgraComponent implements OnInit {
//*** INPUT PODACI ***
  @Input() korisnik:KorisnikDb;
  @Input() room:string;

//*** IGRACI ***
  saigrac:KorisnikDb;
  igrac_na_potezu:KorisnikDb;
  igrac_na_potezu_kor_ime:string;

//*** TAJMER ***  
  tajmer:Timer;

//*** PODACI ZA IGRU ***
  odgovor:string;
  odgovor_html:HTMLElement;
  broj_pitanja:number;
  broj_tacnih_odgovora:number;
  osvojena_suma:number;
  ukupna_suma:number;
  broj_aktivnih_igraca:number;
  broj_runde:number;

// *** PITANJA ***
  pitanja:Array<Pitanja>;
  trenutno_pitanje:Pitanja;

  constructor(private router:Router, private korisniciServis:KorisniciService, private pitanjaServis:PitanjaService) { }

  ngOnInit(): void {
    this.pitanja = [] as Array<Pitanja>;
    this.trenutno_pitanje = {} as Pitanja;
    this.osvojena_suma = 0;
    this.ukupna_suma = 0;
    this.broj_pitanja = 0;
    this.broj_runde = 1;
    this.broj_aktivnih_igraca = 0;
    this.broj_tacnih_odgovora = 0;
    this.odgovor = "";
    this.tajmer = new Timer(8,0);
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

    socket.on('pocinje_prva_igra',({igrac_na_potezu, room})=>{
      this.broj_aktivnih_igraca = 2;
      this.room = room;
      this.igrac_na_potezu_kor_ime = igrac_na_potezu; 
      this.korisniciServis.dohvatiKorisnikaPoKorImenu(this.igrac_na_potezu_kor_ime).subscribe((k:KorisnikDb)=>{
        this.igrac_na_potezu = k;
      });

      this.pitanjaServis.dohvatiPitanjaPoTezini('1').subscribe((p:Pitanja[])=>{
        this.pitanja = p;
        this.arrangeQuestions(this.pitanja);
        this.trenutno_pitanje = this.pitanja[this.broj_pitanja];
        this.postaviPitanje(this.trenutno_pitanje.tekst, this.broj_pitanja);
      })

      document.getElementById('ukupna_suma').innerHTML = "" + this.ukupna_suma + " RSD";
      document.getElementById('zapocinjanje_igre').classList.add('hide');
      document.getElementById('prva_igra_komponenta').classList.remove('hide');
      document.getElementById('igrac_na_potezu').innerHTML = this.igrac_na_potezu_kor_ime + ", je na potezu.";
      if(this.igrac_na_potezu_kor_ime != this.korisnik.kor_ime){
        document.getElementById('odgovor').setAttribute('disabled','true');
        document.getElementById('btn_potvrdi').classList.add('hide');
        document.getElementById('btn_dalje').classList.add('hide');
      }
    })

    socket.on('pocinje_prva_igra_ponovo',(suma:number)=>{
      this.ukupna_suma += suma;
      this.broj_runde++;

      if(this.igrac_na_potezu.kor_ime == this.korisnik.kor_ime) this.igrac_na_potezu = this.saigrac;
      else this.igrac_na_potezu = this.korisnik;

      this.osvojena_suma = 0;
      this.broj_pitanja = 0;
      this.broj_tacnih_odgovora = 0;
      this.odgovor = "";
      document.getElementById('odgovor').setAttribute('placeholder', "");
      (<HTMLInputElement>document.getElementById('odgovor')).value = "";

      this.igrac_na_potezu_kor_ime = this.igrac_na_potezu.kor_ime;
      this.pitanjaServis.dohvatiPitanjaPoTezini('1').subscribe((p:Pitanja[])=>{
        this.pitanja = p;
        //this.arrangeQuestions(this.pitanja);
        this.trenutno_pitanje = this.pitanja[this.broj_pitanja];
        this.postaviPitanje(this.trenutno_pitanje.tekst, this.broj_pitanja);
      })
      
      document.getElementById('druga_igra_kraj').classList.add('hide');
      document.getElementById('prva_igra_komponenta').classList.remove('hide');
      document.getElementById('prva_igra_u_toku').classList.remove('hide');
      document.getElementById('prva_igra_zavrsena').classList.add('hide');
      
      document.getElementById('tajmer_prva_igra').classList.remove('hide');
      document.getElementById('tajmer_prva_igra').classList.remove('red');
      document.getElementById('tajmer_prva_igra').classList.add('not_red');
      
      document.getElementById('tacan_odgovor').classList.add('hide');
      document.getElementById('netacan_odgovor').classList.add('hide');
      document.getElementById('ukupna_suma').innerHTML = "" + this.ukupna_suma + " RSD";
      document.getElementById('postignuta_suma').innerHTML = "";
      document.getElementById('igrac_na_potezu').innerHTML = this.igrac_na_potezu_kor_ime + ", je na potezu.";

      if(this.igrac_na_potezu.kor_ime != this.korisnik.kor_ime){
        document.getElementById('odgovor').setAttribute('disabled','true');
        document.getElementById('btn_potvrdi').classList.add('hide');
        document.getElementById('btn_dalje').classList.add('hide');
      }else{
        document.getElementById('odgovor').removeAttribute('disabled');
        document.getElementById('btn_potvrdi').classList.remove('hide');
        document.getElementById('btn_dalje').classList.remove('hide');
      }
    })

    socket.on('dohvatiSaigraca',(saigrac:string)=>{
      this.korisniciServis.dohvatiKorisnikaPoKorImenu(saigrac).subscribe((k:KorisnikDb)=>{
        this.saigrac = k;
      })
    })

    socket.on('saigrac_kuca',()=>{
      document.getElementById('odgovor').setAttribute('placeholder', this.saigrac.kor_ime + " trenutno odgovara...");
      document.getElementById('tacan_odgovor').classList.add('hide');
      document.getElementById('netacan_odgovor').classList.add('hide');
    });
  
    socket.on('saigrac_ne_kuca',()=>{
      document.getElementById('odgovor').setAttribute('placeholder', "");
      document.getElementById('tacan_odgovor').classList.add('hide');
      document.getElementById('netacan_odgovor').classList.add('hide');
    });

    socket.on('prva_igra_tajmer',(data:Timer)=>{
      if(data.sec < 10){
         document.getElementById('tajmer_prva_igra').classList.remove('not_red');
         document.getElementById('tajmer_prva_igra').classList.add('red');
      }
      document.getElementById('tajmer_prva_igra').innerHTML = "" + (data.sec<10?"0":"") + data.sec + ":" + (data.hun<10?"0":"") + data.hun;
    });

    socket.on('prva_igra_isteklo_vreme',()=>{
      document.getElementById('tajmer_prva_igra').innerHTML = ""; 
      document.getElementById('postignuta_suma').innerHTML = ""; 
      document.getElementById('prva_igra_u_toku').classList.add('hide');
      document.getElementById('prva_igra_zavrsena').classList.remove('hide');
      if(this.igrac_na_potezu.kor_ime == this.korisnik.kor_ime){
        if(this.broj_tacnih_odgovora == 0){
          document.getElementById('zavrsena_prva_igra_poruka').innerHTML = "Nažalost niste odgovorili ni na jedno pitanje tačno... Nadamo se da ćete sledeći put biti uspešniji.";
          document.getElementById('zapocni_prvu_igru_ponovo_saigrac').classList.add('hide');
          document.getElementById('zapocni_drugu_igru_btn').classList.add('hide');
          this.broj_aktivnih_igraca--;
          socket.emit('napusti_igru_tajmer',this.room);
        }else{
          document.getElementById('zavrsena_prva_igra_poruka').innerHTML = "Osvojili ste " + this.osvojena_suma + " dinara. Odgovorili ste tačno na " + this.broj_tacnih_odgovora + " od " + this.broj_pitanja + " postavljenih pitanja. Kada budete spremni možemo započeti borbu protiv tragača.";
          document.getElementById('zapocni_prvu_igru_ponovo_saigrac').classList.add('hide');
          document.getElementById('zapocni_drugu_igru_btn').classList.remove('hide');
        }
      }else{
        if(this.broj_tacnih_odgovora == 0){
          document.getElementById('zapocni_drugu_igru_btn').classList.add('hide');
          document.getElementById('zavrsena_prva_igra_poruka').innerHTML = "Vaš saigrač nije odgovorio ni na jedno pitanje tačno... Dalje nastavljate sami. Kada budete spremni možemo početi."
          this.broj_aktivnih_igraca--;
        }else{
          document.getElementById('zapocni_drugu_igru_btn').classList.add('hide');
          document.getElementById('zapocni_prvu_igru_ponovo_saigrac').classList.add('hide');
          document.getElementById('zavrsena_prva_igra_poruka').innerHTML = "Vaš saigrač je osvojio " + this.osvojena_suma + " dinara. Odgovorio je tačno na " + this.broj_tacnih_odgovora +" od " + this.broj_pitanja + " postavljenih pitanja. Kada Vaš saigrač bude spreman prelazimo na borbu protiv tragača."
        }
      }
    })

    socket.on('odgovor_prva_igra',(poruka:string)=>{
      this.broj_pitanja++;
      this.trenutno_pitanje = this.pitanja[this.broj_pitanja];
      
      this.odgovor = "";
      (<HTMLInputElement>document.getElementById('odgovor')).value = "";

      // *** EVIDENTIRATI ODGOVOR ZA EXPORT! ***
      if(poruka === 'ok'){
        this.osvojena_suma = this.osvojena_suma + 10000;
        this.broj_tacnih_odgovora++;
      
        document.getElementById('tacan_odgovor').classList.remove('hide');
        document.getElementById('postignuta_suma').innerHTML = "" + (this.osvojena_suma / 10000) + "0 000 RSD";  
      }else{
        // *** NAPISATI STA JE TACAN ODGOVOR ***
        document.getElementById('netacan_odgovor').classList.remove('hide');
        document.getElementById('netacan_odgovor_tekst').innerHTML = 'Netačno... Tačan odgovor je: ' + ' <b>' + poruka + '</b>';
      }

      this.postaviPitanje(this.trenutno_pitanje.tekst, this.broj_pitanja);
    })

    socket.on('dalje_prva_igra',()=>{
      this.broj_pitanja++;
      this.trenutno_pitanje = this.pitanja[this.broj_pitanja];
      this.postaviPitanje(this.trenutno_pitanje.tekst, this.broj_pitanja);
      this.odgovor = "";
    })

    document.getElementById('odgovor').addEventListener('keypress',()=>{
      if(this.igrac_na_potezu.kor_ime == this.korisnik.kor_ime) socket.emit('is_typing', this.saigrac.socket_id);
      else socket.emit('is_typing', this.korisnik.socket_id);

      document.getElementById('tacan_odgovor').classList.add('hide');
      document.getElementById('netacan_odgovor').classList.add('hide');
    })
  }

  postaviPitanje(tekst:string, broj:number){
    document.getElementById('pitanje').innerHTML = tekst;
    document.getElementById('broj_pitanja').innerHTML = (this.broj_pitanja+1) + ". pitanje";
  }

  potvrdiOdgovor(){
    document.getElementById('tacan_odgovor').classList.add('hide');
    document.getElementById('netacan_odgovor').classList.add('hide');

    if(this.igrac_na_potezu.kor_ime == this.korisnik.kor_ime) socket.emit('is_not_typing', this.saigrac.socket_id);
    else socket.emit('is_not_typing', this.korisnik.socket_id);
    
    socket.emit('odgovor_prva_igra_server',this.odgovor, this.room, this.trenutno_pitanje);
  }

  dalje(){
    socket.emit('dalje_prva_igra_server',this.room);

    if(this.igrac_na_potezu.kor_ime == this.korisnik.kor_ime) socket.emit('is_not_typing', this.saigrac.socket_id);
    else socket.emit('is_not_typing', this.korisnik.socket_id);
    this.odgovor = "";
  }
  
  zapocniDruguIgru(){
    socket.emit('pocinje_druga_igra_svi', this.room, this.igrac_na_potezu, this.osvojena_suma, this.broj_aktivnih_igraca, this.broj_runde, this.ukupna_suma);
  }

  zapocniPrvuIgruPonovo(){
    document.getElementById('prva_igra_u_toku').classList.remove('hide');
    let tajmer = new Timer(15,0);
    socket.emit('prva_igra_odbrojavanje',{'sec':tajmer.sec,'hun':tajmer.hun}, this.room);
    socket.emit('pocinje_prva_igra_saigrac', this.room, 0); 
  }
}
