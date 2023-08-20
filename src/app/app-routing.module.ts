import { Injector, NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import {OktaAuthModule, OktaCallbackComponent, OKTA_CONFIG, OktaAuthGuard} from '@okta/okta-angular';
import { LoginComponent } from './components/login/login.component';
import { MembersPageComponent } from './components/members-page/members-page.component';
import { OktaAuth } from '@okta/okta-auth-js';
import { OrderHistoryComponent } from './components/order-history/order-history.component';



function sendToLoginPage(oktaAuth: OktaAuth, injector: Injector){
// Use the injector to access any service available (router in this case)
const router= injector.get(Router);
router.navigate(['/login']);

}

const routes: Routes = [
  {path: 'login/callback', component: OktaCallbackComponent},
  {path: 'login', component: LoginComponent},
  {path: 'category/:id/:name', component: ProductListComponent},
  {path: 'search/:keyword', component: ProductListComponent},
  {path: 'products/:id', component: ProductDetailsComponent},
  {path: 'cart-details', component: CartDetailsComponent},
  {path: 'category', component: ProductListComponent},
  {path: 'products', component: ProductListComponent},
  {path: 'checkout', component: CheckoutComponent},
  {path: 'members', component: MembersPageComponent, canActivate: [OktaAuthGuard],
                                                data: {onAuthRequired: sendToLoginPage}},
  {path: 'order-history', component: OrderHistoryComponent, canActivate: [OktaAuthGuard],
                                                data: {onAuthRequired: sendToLoginPage}},
  {path: '', redirectTo: '/products', pathMatch:'full'},
  {path: '**', redirectTo: '/products', pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
