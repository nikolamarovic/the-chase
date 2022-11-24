import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KorisnikDb } from '../data/KorisnikDb';
import { Igra } from '../model/Igra';
import { KorisniciService } from '../services/korisnici/korisnici.service';
import { ProveraService } from '../services/provera_ruta/provera.service';
import {AfterViewInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { IgraService } from '../services/igra/igra.service';

@Component({
  selector: 'app-rang-list',
  templateUrl: './rang-list.component.html',
  styleUrls: ['./rang-list.component.css']
})
export class RangListComponent implements OnInit {
  korisnik:KorisnikDb;
  cookie_id:string;
  igre:Igra[];
  displayedColumns: string[] = ['u1', 'u2', 'sum'];
  dataSource: MatTableDataSource<Igra>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private igraServis:IgraService, private proveraServis:ProveraService, private route:ActivatedRoute, private router:Router, private korisniciServis:KorisniciService) { }

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

    this.igraServis.dohvatiIgre().subscribe((i:Igra[])=>{
      this.igre = i;
      this.igre.sort((a,b)=>{
        if(a.suma > b.suma) return 1;
        if(a.suma == b.suma) return 0;
        if(a.suma < b.suma) return -1;
      })
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  proveraStranice(res:Object, cookie_id:string){
    if(res['response']['poruka'].length > 0) this.router.navigate(['/']);
    else{
      this.postaviActive('rang_list');
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
