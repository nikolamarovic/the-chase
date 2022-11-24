import { componentFactoryName } from '@angular/compiler';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { RangListComponent } from './rang-list/rang-list.component';
import { RegisterPageComponent } from './register-page/register-page.component';

const routes: Routes = [
  // {path:"",component:ProbaComponent},
  {path:"", component:LandingPageComponent},
  {path:"user_login", component:LoginPageComponent},
  {path:"user_register", component:RegisterPageComponent},
  {path:"home_page/:cookie_id",component:HomePageComponent},
  {path:"rang_list/:cookie_id",component:RangListComponent},
  {path:"my_profile/:cookie_id",component:MyProfileComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
