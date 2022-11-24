import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { FooterComponent } from './footer/footer.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HomePageComponent } from './home-page/home-page.component';
import { RangListComponent } from './rang-list/rang-list.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { PrvaIgraComponent } from './prva-igra/prva-igra.component';
import { DrugaIgraComponent } from './druga-igra/druga-igra.component';
import { TrecaIgraComponent } from './treca-igra/treca-igra.component';


@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    FooterComponent,
    LoginPageComponent,
    RegisterPageComponent,
    HomePageComponent,
    RangListComponent,
    MyProfileComponent,
    PrvaIgraComponent,
    DrugaIgraComponent,
    TrecaIgraComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    MatGridListModule,
    MatDividerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
