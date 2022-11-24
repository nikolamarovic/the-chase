import { FocusTrap } from '@angular/cdk/a11y';
import { Component, Input, OnInit } from '@angular/core';
import { NumberValueAccessor } from '@angular/forms';
import socket from 'src/assets/js/MySocket';
import { KorisnikDb } from '../data/KorisnikDb';
import { Timer } from '../data/Timer';
import { Pitanja } from '../model/Pitanja';
import { KorisniciService } from '../services/korisnici/korisnici.service';
import { PitanjaService } from '../services/pitanja/pitanja.service';

//name="fieldName" ngDefaultControl


@Component({
  selector: 'app-druga-igra',
  templateUrl: './druga-igra.component.html',
  styleUrls: ['./druga-igra.component.css']
})

export class DrugaIgraComponent implements OnInit {
//*** INPUT PODACI ***
  @Input() korisnik:KorisnikDb;
  @Input() room:string;

//*** IGRACI ***
  saigrac:KorisnikDb;
  igrac_na_potezu:KorisnikDb;
  igrac_na_potezu_kor_ime:string;
  broj_aktivnih_igraca:number;
  saigrac_odgovor:string;

//*** SUME ***
  veca_suma:number;
  manja_suma:number;
  srednja_suma:number;
  izabrana_suma:number;
  ukupna_suma:number;

//*** POZICIJE NA TABELI ***
  tragac_pozicija:number;
  igrac_pozicija:number;

//*** BOJE ***
  boja_tragac = 'bg-danger';
  boja_igrac = 'bg-primary';
  boja_izmedju = 'bg_color_table';

//*** PITANJA ***
  pitanja:Array<Pitanja>;
  trenutno_pitanje:Pitanja;
  pitanja_brojac:number;

//*** BROJAC RUNDI ***
  broj_runde:number;

  constructor(private korisniciServis:KorisniciService, private pitanjaServis:PitanjaService) { }

  ngOnInit(): void {
    // this.korisnik = {} as KorisnikDb;
    this.saigrac = {} as KorisnikDb;
    this.igrac_na_potezu = {} as KorisnikDb;
    this.saigrac_odgovor = "";
    this.pitanja_brojac = 0;
    this.broj_runde = 1;
    this.ukupna_suma = 0;
    this.broj_aktivnih_igraca = 0;
    this.pitanja = [] as Array<Pitanja>;
    this.trenutno_pitanje = {} as Pitanja;
    this.socketInit();
  }

  socketInit(){
    socket.on('pocinje_druga_igra', ({igrac_na_potezu, room, suma, broj_aktivnih,broj_runde, ukupna_suma})=>{
      this.room = room;
      this.ukupna_suma = ukupna_suma;
      this.srednja_suma = suma;
      this.broj_aktivnih_igraca = broj_aktivnih;
      this.igrac_na_potezu = igrac_na_potezu;
      this.pitanja_brojac = 0;
      this.broj_runde = broj_runde;
      // document.getElementById('srednja_suma_1').setAttribute('disabled','false');
      document.getElementById('ponuda_tragac_poruka').innerHTML = "";
      document.getElementById('prva_igra_komponenta').classList.add('hide');
      document.getElementById('saigrac_odgovor').classList.add('hide');
      document.getElementById('saigrac_pitanje').classList.remove('hide');
      document.getElementById('tragac_tabela_ponuda').classList.remove('hide');
      document.getElementById('tajmer_pred_pocetak_druge_igre').innerHTML = '';
      document.getElementById('odaberi_sumu').classList.remove('hide');
      document.getElementById('druga_igra_komponenta').classList.remove('hide');

      this.formirajSume();
      this.resetujTabelu();
      this.resetujTabeluPonuda();

      document.getElementById('veca_suma_1').innerHTML = this.veca_suma/1000 + " 000 RSD";
      document.getElementById('veca_suma_2').innerHTML = this.veca_suma/1000 + " 000 RSD";
      document.getElementById('srednja_suma_1').innerHTML = this.srednja_suma/1000 + " 000 RSD";
      document.getElementById('srednja_suma_2').innerHTML = this.srednja_suma/1000 + " 000 RSD";
      document.getElementById('manja_suma_1').innerHTML = this.manja_suma/1000 + " 000 RSD";
      document.getElementById('manja_suma_2').innerHTML = this.manja_suma/1000 + " 000 RSD";

      if(this.korisnik.kor_ime == this.igrac_na_potezu.kor_ime){
        this.omoguciOdgovore();
        document.getElementById('veca_suma_22').classList.add('hide');
        document.getElementById('srednja_suma_22').classList.add('hide');
        document.getElementById('manja_suma_22').classList.add('hide');
      }
      else{
        this.onemoguciOdgovoreSaigracu();
        document.getElementById('veca_suma_11').classList.add('hide');
        document.getElementById('srednja_suma_11').classList.add('hide');
        document.getElementById('manja_suma_11').classList.add('hide');
      } 
    })

    socket.on('dohvatiSaigraca',(saigrac:string)=>{
      this.korisniciServis.dohvatiKorisnikaPoKorImenu(saigrac).subscribe((k:KorisnikDb)=>{
        this.saigrac = k;
      })
    })

    socket.on('saigrac_suma_pitanje',()=>{
      document.getElementById('saigrac_pitanje').classList.add('hide');
      document.getElementById('saigrac_odgovor').classList.remove('hide');
      document.getElementById('saigrac_odgovor_tekst').innerHTML = "Saigrač Vas je pitao za savet pri odabiru sume. Napišite šta mislite.";
    })
    
    socket.on('saigrac_suma_odgovor',(poruka:string)=>{
      let p = this.saigrac.kor_ime + ": " + poruka;
      document.getElementById('saigrac_odgovor_prikaz').classList.add('hide');
      document.getElementById('saigrac_odgovor_tekst').innerHTML = p;
    });

    socket.on('izabrana_suma_od_strane_saigraca',(suma:number,tragac:number, igrac:number)=>{
      this.igrac_pozicija = igrac;
      this.tragac_pozicija = tragac;
      this.izabrana_suma = suma;

      this.sakrijSvePredPocetakDrugeIgre();
      this.onemoguciOdgovoreSaigracu();

      document.getElementById('saigrac_odgovor_tekst').innerHTML = this.saigrac.kor_ime + " je uspešno izabrao da se bori za sumu od " + suma + " dinara. Druga igra počinje za: ";
    })

    socket.on('tajmer_pred_pocetak_druge_igre',(data:Timer)=>{
      document.getElementById('tajmer_pred_pocetak_druge_igre').innerHTML = data.sec + "";
    }); 

    socket.on('tajmer_pred_pocetak_druge_igre_pocinje',()=>{
      document.getElementById('odaberi_sumu').classList.add('hide');
      document.getElementById('druga_igra').classList.remove('hide');

      this.dohvatiPitanja();
      this.obojiTabeluPredPocetak();
    })

    socket.on('saigrac_kuca2',()=>{
      (<HTMLInputElement>document.getElementById('saigrac_odgovor_prikaz')).value =  this.saigrac.kor_ime + " trenutno piše...";
    });

    socket.on('postavi_event_listener',()=>{
      document.getElementById('saigrac_odgovor_prikaz').addEventListener('keypress',()=>{
        socket.emit('is_typing2', this.saigrac.socket_id);
      })
    })

    socket.on('potvrdi_odgovor',(id:string)=>{
      let s = 'odgovor_' + id;
      let odgovor_html:HTMLInputElement = <HTMLInputElement>document.getElementById(s);
      let odgovor_tekst:string = odgovor_html.value;

      document.getElementById('rezultat_odgovora_div').classList.remove('hide');
      let poruka = ""
      if(this.igrac_na_potezu.kor_ime == this.korisnik.kor_ime) poruka = 'Vaš odgovor je ...';
      else poruka = "Odgovor saigrača je ...";
      document.getElementById('rezultat_odgovora').innerHTML = poruka;

      odgovor_html.classList.remove('bg_color_button');
      odgovor_html.classList.add('bg_color_button_primary');

      socket.emit('proveri_odgovor_igrac_druga_igra_server',odgovor_tekst,this.trenutno_pitanje, this.room);
      //provera odgovora i pokretanje tajmera
    })

    socket.on('rezultat_odgovora_igrac_druga_igra',(flag:boolean, tmp:string)=>{
      let poruka = "";
      
      if(flag){
        if(this.igrac_na_potezu.kor_ime == this.korisnik.kor_ime) poruka = 'Vaš odgovor je tačan!';
        else poruka = "Odgovor saigrača je tačan!";
        
        document.getElementById('rezultat_odgovora').innerHTML = poruka;
        document.getElementById('rezultat_odgovora_div').classList.add('bg-success');
        this.igrac_pozicija++;
        this.obojiPoljeIgrac();
      }else{
        if(this.igrac_na_potezu.kor_ime == this.korisnik.kor_ime) poruka = 'Vaš odgovor je netačan!';
        else poruka = "Odgovor saigrača je netačan!";

        document.getElementById('rezultat_odgovora').innerHTML = poruka;
        document.getElementById('rezultat_odgovora_div').classList.add(this.boja_tragac);
      }

      document.getElementById('rezultat_odgovora_tragac_div').classList.remove('hide');
      document.getElementById('rezultat_odgovora_tragac_tekst').innerHTML = "Tragač je odgovorio ...";
      socket.emit('proveri_odgovor_tragac_druga_igra_server','',this.trenutno_pitanje, this.room);
    })

    socket.on('rezultat_odgovora_tragac_druga_igra',(flag:boolean, odgovor:string)=>{
      if(flag){
        document.getElementById('rezultat_odgovora_tragac_tekst').innerHTML = 'Tragač je odgovorio tačno!';
        document.getElementById('rezultat_odgovora_tragac_div').classList.add('bg-success');
        this.tragac_pozicija++;
        this.obojiPoljeTragac();
      }else{
        document.getElementById('rezultat_odgovora_tragac_tekst').innerHTML = 'Tragač je odgovorio ... ' + odgovor;
        document.getElementById('rezultat_odgovora_tragac_div').classList.add(this.boja_tragac);
      }
      socket.emit('tajmer_izmedju_pitanja_druga_igra', this.room);
    })

    socket.on('sledece_pitanje_druga_igra',()=>{
      this.sledecePitanje();
    })

    socket.on('druga_igra_zavrsena',(flag:number,broj_aktivnih:number)=>{
      this.broj_aktivnih_igraca = broj_aktivnih;
      document.getElementById('druga_igra').classList.add('hide');
      document.getElementById('druga_igra_kraj').classList.remove('hide');
      if(flag==1){
        //sustigao ga tragac
        this.izabrana_suma = 0;
        document.getElementById('zavrsena_druga_igra_poruka_header').innerHTML = 'Žao nam je...';
        if(this.igrac_na_potezu.kor_ime == this.korisnik.kor_ime){
          document.getElementById('zavrsena_druga_igra_poruka').innerHTML = 'Nažalost, niste uspeli da pobegnete tragaču... Nadamo se da ćemo se videti opet.';
          document.getElementById('zapocni_prvu_igru_saigrac_btn').classList.add('hide');
          this.broj_aktivnih_igraca --;
          socket.emit('napusti_igru_tajmer',this.room);
        }else{
          this.broj_aktivnih_igraca --;
          document.getElementById('zavrsena_druga_igra_poruka').innerHTML = 'Nažalost, Vaš saigrač nije uspeo da pobegne tragaču... Dalje nastavljate sami. Kada budete spremni možemo početi prvu igru.';
          document.getElementById('zapocni_prvu_igru_saigrac_btn').classList.remove('hide');
        }
      }else{
        //pobegao od tragaca
        document.getElementById('zavrsena_druga_igra_poruka_header').innerHTML = 'Čestitamo!';
        if(this.igrac_na_potezu.kor_ime == this.korisnik.kor_ime){
          if(this.broj_runde == 2) {
            document.getElementById('zavrsena_druga_igra_poruka').innerHTML = 'Uspeli ste! Bili ste bolji od tragača. Uspešno ste sačuvali sumu od ' + this.izabrana_suma/1000 + ' 000 RSD. Treća igra počinje za ...';
            document.getElementById('zapocni_prvu_igru_saigrac_btn').classList.add('hide');
            socket.emit('tajmer_pocetak_trece_igre', this.room);
          }
          else document.getElementById('zavrsena_druga_igra_poruka').innerHTML = 'Uspeli ste! Bili ste bolji od tragača. Uspešno ste sačuvali sumu od ' + this.izabrana_suma/1000 + ' 000 RSD. Sada je na redu Vaš saigrač.' ;
        }else{
          
          if(this.broj_runde < 2){
            document.getElementById('zavrsena_druga_igra_poruka').innerHTML = 'Vaš saigrač je bio bolji od tragača. Uspešno je sačuvao sumu od ' + this.izabrana_suma/1000 + ' 000 RSD. Sada je red na Vas. Kada budete spremni možemo započeti prvu igru.'
            document.getElementById('zapocni_prvu_igru_saigrac_btn').classList.remove('hide');
          }else{
            document.getElementById('zavrsena_druga_igra_poruka').innerHTML = 'Vaš saigrač je bio bolji od tragača. Uspešno je sačuvao sumu od ' + this.izabrana_suma/1000 + ' 000 RSD. Treća igra počinje za ...'
            document.getElementById('zapocni_prvu_igru_saigrac_btn').classList.add('hide');
          }
        }
      }
    })

    socket.on('tajmer_pred_pocetak_trece_igre',(data:Timer)=>{
      document.getElementById('tajmer_pred_trecu_igru').innerHTML = "" + data.sec;
    })

    socket.on('tajmer_pred_pocetak_trece_igre_pocinje',()=>{
      document.getElementById('druga_igra_komponenta').classList.add('hide');
      document.getElementById('treca_igra_komponenta').classList.remove('hide');
      socket.emit('treca_igra_server', this.room, this.izabrana_suma+this.ukupna_suma);
    })
  }

  resetujTabeluPonuda(){
    let s = 'veca_suma_';
    for(let i=1;i<=2;i++){
      document.getElementById(s+i).classList.remove('hide');
      document.getElementById(s+i+i).classList.remove('hide');
    }
    s = 'srednja_suma_';
    for(let i=1;i<=2;i++){
      document.getElementById(s+i).classList.remove('hide'); 
      document.getElementById(s+i+i).classList.remove('hide');
    }
    s = 'manja_suma_';
    for(let i=1;i<=2;i++){
      document.getElementById(s+i).classList.remove('hide');
      document.getElementById(s+i+i).classList.remove('hide');
    }
  }

  resetujTabelu(){
    let s = 'tabela_tr_';
    for(let i=1;i<=8;i++){
      document.getElementById(s+i).classList.remove(this.boja_igrac);
      document.getElementById(s+i).classList.remove(this.boja_tragac);
      document.getElementById(s+i).classList.add(this.boja_izmedju);
      document.getElementById(s+i+'_text').innerHTML = "";
    }
  }

  formirajSume(){
    this.veca_suma = this.srednja_suma * 8;
    this.manja_suma = this.srednja_suma / 2;
    
    if(this.igrac_na_potezu.kor_ime == this.korisnik.kor_ime){
      if(this.broj_aktivnih_igraca == 2) document.getElementById('ponuda_tragac_poruka').innerHTML = "Za jedno pomeranje dalje od tragača, tragač Vam nudi " + this.manja_suma + " dinara, a za jedan korak bliže nudi " + this.veca_suma + " dinara. Možete se konsultovati sa saigračem u odabiru sume, ako to želite."
      else {
        document.getElementById('ponuda_tragac_poruka').innerHTML = "Za jedno pomeranje dalje od tragača, tragač Vam nudi " + this.manja_suma + " dinara, a za jedan korak bliže nudi " + this.veca_suma + " dinara."
        document.getElementById('saigrac_pitanje_dugme').classList.add('hide');
      }
    }else{
      document.getElementById('ponuda_tragac_poruka').innerHTML = "Za jedno pomeranje dalje od tragača, tragač je ponudio " + this.manja_suma + " dinara, a za jedan korak bliže nudi " + this.veca_suma + " dinara.";
      document.getElementById('saigrac_pitanje_dugme').classList.add('hide');
    }
  }

  sledecePitanje(){
    document.getElementById('rezultat_odgovora_tragac_tekst').innerHTML = "";
    document.getElementById('rezultat_odgovora_tragac_div').classList.remove('bg-success');
    document.getElementById('rezultat_odgovora_tragac_div').classList.remove(this.boja_tragac);
    document.getElementById('rezultat_odgovora_tragac_div').classList.add('hide');
    
    document.getElementById('rezultat_odgovora').innerHTML = "";
    document.getElementById('rezultat_odgovora_div').classList.remove('bg-success');
    document.getElementById('rezultat_odgovora_div').classList.remove(this.boja_tragac);
    document.getElementById('rezultat_odgovora_div').classList.add('hide');
    

    this.pitanja_brojac++;
    this.trenutno_pitanje = this.pitanja[this.pitanja_brojac];

    this.postaviTrenutnoPitanje();
    this.resetujBojeNaOdgovorima();
    if(this.korisnik.kor_ime == this.igrac_na_potezu.kor_ime) this.omoguciOdgovore();
    else this.onemoguciOdgovoreSaigracu();
  }

  resetujBojeNaOdgovorima(){
    for(let i=1;i<=3;i++){
      let s = 'odgovor_'+i;
      document.getElementById(s).classList.add('bg_color_button');
      document.getElementById(s).classList.remove('bg_color_button_primary');
    }
  }

  onemoguciOdgovoreSaigracu(){
    for(let i=1;i<=3;i++){
      let s = 'odgovor_'+i;
      (<HTMLInputElement>document.getElementById(s)).disabled = true;
    }
  }

  omoguciOdgovore(){
    for(let i=1;i<=3;i++){
      let s = 'odgovor_'+i;
      (<HTMLInputElement>document.getElementById(s)).disabled = false;
    }
  }

  obojiTabeluPredPocetak(){
    document.getElementById('izabrana_suma').innerHTML = "" + this.izabrana_suma/1000 + " 000 RSD";

    let s = 'tabela_tr_';
    
    for(let i=1;i<=this.tragac_pozicija;i++){
      document.getElementById(s + i).classList.remove(this.boja_izmedju);
      document.getElementById(s + i).classList.add(this.boja_tragac);
    } 

    for(let i=8;i>=this.igrac_pozicija;i--){
      document.getElementById(s + i).classList.remove(this.boja_izmedju);
      document.getElementById(s + i).classList.add(this.boja_igrac);
    }

    s += this.igrac_pozicija + '_text';
    document.getElementById(s).innerHTML = this.igrac_na_potezu.kor_ime;
    
    s = 'tabela_tr_' + this.tragac_pozicija + '_text';
    document.getElementById(s).innerHTML = "TRAGAČ";
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

  dohvatiPitanja(){
    this.pitanjaServis.dohvatiPitanjaPoTezini('2').subscribe((p:Array<Pitanja>)=>{
      this.pitanja = p;
      //this.arrangeQuestions(this.pitanja);
      this.trenutno_pitanje = p[0];
      this.postaviTrenutnoPitanje();
    })
  }

  postaviTrenutnoPitanje(){
    document.getElementById('trenutno_pitanje').innerHTML = this.trenutno_pitanje.tekst;
    (<HTMLInputElement>document.getElementById('odgovor_1')).value = this.trenutno_pitanje.odgovori[0];
    (<HTMLInputElement>document.getElementById('odgovor_2')).value = this.trenutno_pitanje.odgovori[1];
    (<HTMLInputElement>document.getElementById('odgovor_3')).value = this.trenutno_pitanje.odgovori[2];
  }

  obojiPoljeTragac(){
    if(this.igrac_pozicija == this.tragac_pozicija) {
      this.broj_aktivnih_igraca--;
      socket.emit('sustigao_tragac', this.room, this.broj_aktivnih_igraca);
    }
    else{
      let prev_pos:number = this.tragac_pozicija - 1;
      let s:string = 'tabela_tr_';

      document.getElementById(s + prev_pos + '_text').innerHTML = "";
      document.getElementById(s + this.tragac_pozicija + '_text').innerHTML = "TRAGAČ";

      document.getElementById(s + this.tragac_pozicija).classList.remove(this.boja_izmedju);
      document.getElementById(s + this.tragac_pozicija).classList.add(this.boja_tragac); 
    }
  }

  obojiPoljeIgrac(){
    if(this.igrac_pozicija == 9) socket.emit('pobegao_od_tragaca', this.room);
    else{
      let prev_pos:number = this.igrac_pozicija - 1;
      let s:string = 'tabela_tr_';

      document.getElementById(s + prev_pos + '_text').innerHTML = "";
      document.getElementById(s + prev_pos).classList.remove(this.boja_igrac);
      document.getElementById(s + prev_pos).classList.add(this.boja_izmedju);

      document.getElementById(s + this.igrac_pozicija + '_text').innerHTML = this.igrac_na_potezu.kor_ime;
    }
  }

  potvrdiOdgovor(id:string){
    for(let i=1;i<=3;i++){
      let s = 'odgovor_'+i;
      (<HTMLInputElement>document.getElementById(s)).disabled = true;
    }
    socket.emit('potvrdi_odgovor_server',id, this.room);
  }

  sakrijSvePredPocetakDrugeIgre(){
    document.getElementById('saigrac_pitanje').classList.add('hide');
    document.getElementById('saigrac_odgovor').classList.remove('hide');
    document.getElementById('saigrac_odgovor_prikaz').classList.add('hide');
    document.getElementById('tragac_tabela_ponuda').classList.add('hide');
    document.getElementById('saigrac_odgovor_dugme').classList.add('hide');
  }

  pitajSaigraca(){
    this.veca_suma = 500000;
    this.manja_suma = 50000;
    socket.emit('postavi_event_listener_server',this.saigrac.socket_id);
    document.getElementById('saigrac_pitanje').classList.add('hide');
    document.getElementById('saigrac_odgovor').classList.remove('hide');
    document.getElementById('saigrac_odgovor_dugme').classList.add('hide');
    document.getElementById('saigrac_odgovor_tekst').innerHTML = "Čekamo da saigrač odgovori...";
    socket.emit('pitaj_saigraca_server',this.saigrac.socket_id);
  }

  posaljiMisljenje(){
    socket.emit('odgovor_saigrac_server',this.saigrac.socket_id, this.saigrac_odgovor);
    document.getElementById('saigrac_odgovor_prikaz').classList.add('hide');
    document.getElementById('saigrac_odgovor_dugme').classList.add('hide');
    document.getElementById('saigrac_odgovor_tekst').innerHTML = 'Hvala Vam! Uspešno ste poslali odgovor. Sačekaćemo da ' + this.saigrac.kor_ime + " odluči...";
  }

  manjaSuma(){
    this.sakrijSvePredPocetakDrugeIgre();

    document.getElementById('saigrac_odgovor_tekst').innerHTML = "Uspešno ste izabrali manju sumu. Želimo Vam puno sreće u borbi protiv tragača. Druga igra počinje za: ";
    
    this.tragac_pozicija = 1;
    this.igrac_pozicija = 5;
    
    this.izabrana_suma = this.manja_suma;

    socket.emit('izabrana_suma_server',this.saigrac.socket_id,this.izabrana_suma,this.tragac_pozicija, this.igrac_pozicija);
    socket.emit('zapocni_tajmer_druga_igra_priprema', this.room)
  }

  vecaSuma(){
    this.sakrijSvePredPocetakDrugeIgre();

    document.getElementById('saigrac_odgovor_tekst').innerHTML = "Uspešno ste izabrali veću sumu. Želimo Vam puno sreće u borbi protiv tragača. Druga igra počinje za: ";
    
    this.tragac_pozicija = 1;
    this.igrac_pozicija = 3;

    this.izabrana_suma = this.veca_suma;
    
    socket.emit('izabrana_suma_server',this.saigrac.socket_id,this.izabrana_suma,this.tragac_pozicija, this.igrac_pozicija);
    socket.emit('zapocni_tajmer_druga_igra_priprema', this.room)
  }

  srednjaSuma(){
    this.sakrijSvePredPocetakDrugeIgre();

    document.getElementById('saigrac_odgovor_tekst').innerHTML = "Uspešno ste izabrali srednju sumu. Želimo Vam puno sreće u borbi protiv tragača. Druga igra počinje za: ";
    
    this.tragac_pozicija = 1;
    this.igrac_pozicija = 4;

    this.izabrana_suma = this.srednja_suma;

    socket.emit('izabrana_suma_server',this.saigrac.socket_id,this.izabrana_suma,this.tragac_pozicija, this.igrac_pozicija);
    socket.emit('zapocni_tajmer_druga_igra_priprema', this.room);
  }

  zapocniPrvuIgruSaigrac(){
    document.getElementById('prva_igra_u_toku').classList.remove('hide');
    let tajmer = new Timer(15,0);
    socket.emit('prva_igra_odbrojavanje',{'sec':tajmer.sec,'hun':tajmer.hun}, this.room);
    socket.emit('pocinje_prva_igra_saigrac', this.room, this.izabrana_suma); 
  }
}
