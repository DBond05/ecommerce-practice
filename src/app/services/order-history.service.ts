import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderHistory } from '../common/order-history';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  private orderUrl = environment.apiUrl + '/orders';


  constructor(private httpClient: HttpClient) {

   }

   getOrderHistory(theEmail: string): Observable <GetResponseOrderHistory>{
    // Builds URL sent to backend
    const orderHistoryUrl = `${this.orderUrl}/search/findByCustomerEmailOrderByDateCreatedDesc?email=${theEmail}`;

    return this.httpClient.get<GetResponseOrderHistory>(orderHistoryUrl);
    console.log(orderHistoryUrl);
    
   }
}

// backend responds with JSON 
//helper interface to unwrap data from JSON
interface GetResponseOrderHistory{
  _embedded:{
    orders: OrderHistory[];
  }
}
