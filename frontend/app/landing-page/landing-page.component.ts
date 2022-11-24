import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {enableProdMode} from '@angular/core';

enableProdMode();

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit(): void {
  }

  showLoginPage(){
    this.router.navigate(['user_login']);
  }

  showRegisterPage(){
    this.router.navigate(['user_register']);
  }

  returnTo(){
    this.router.navigate(['/']);
  }
}
