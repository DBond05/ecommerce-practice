import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import myAppConfig from 'src/app/config/my-app-config';
import OktaSignIn from '@okta/okta-signin-widget';
// research typescript declaration files at https://angular.io/guide/typescript-configuration
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  oktaSignin: any;
  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth){

    this.oktaSignin = new OktaSignIn({
      logo: 'assets/images/logo.png',
      baseUrl: myAppConfig.oidc.issuer.split('/oauth2')[0],
      clientId: myAppConfig.oidc.clientId,
      redirectUri: myAppConfig.oidc.redirectUri,
      authParams:{
        pkce:true, //proof key for code exchange
        issuer: myAppConfig.oidc.issuer,
        scopes: myAppConfig.oidc.scopes
      }
    });
  }

  ngOnInit(): void {
    this.oktaSignin.remove();
    this.oktaSignin.renderEl(
      {
        el:'#okta-sign-in-widget'// render the element with the given ID (Same as id in div in html)
      },
      (response:any) => { if(response.status=== 'SUCCESS') {
        this.oktaAuth.signInWithRedirect(); //if the response is successful redirect to redirectUri
      }},
      (error:any)=>{ throw error;}
    );
  }

}
