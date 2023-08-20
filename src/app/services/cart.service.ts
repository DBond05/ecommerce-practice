import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {


  cartItems: CartItem[] = [];
  //Subject sends updates as they happen
  // BehaviorSubject sends the latest update 
  //ReplaySubject sends all updates that have happened
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  // read data from session storage
  //reference to the web browser session storage
  //storage: Storage = sessionStorage;

  //using local storage
  // stores data locally on EU PC
  storage: Storage = localStorage;

  constructor() {
    //read the data from session storage and convert to an object
    let data = JSON.parse(this.storage.getItem('cartItems')!);

    if (data != null) {
      this.cartItems = data;
      //computer totals based on teh data that is read from storage

      this.computeCartTotals();
    }
  }

  addToCart(theCartItem: CartItem) {
    //check to see if we already have item in cart
    let alreadyExistsInCart: boolean = false;
    //let existingCartItem: CartItem = undefined;
    console.log("in cartService");

    if (this.cartItems.length > 0) {
      //find the item in the cart based on item id
      for (let tempCartItem of this.cartItems) {
        if (tempCartItem.id === theCartItem.id) {
          //existingCartItem = tempCartItem;
          alreadyExistsInCart = true;
          tempCartItem.quantity++;
          //console.log("temp "+tempCartItem.quantity);
          break;
        }
      }

    }
    if (!alreadyExistsInCart) {
      this.cartItems.push(theCartItem);
    }
    this.computeCartTotals();

  }
  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;
    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice!;
      totalQuantityValue += currentCartItem.quantity;
    }
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);
    this.logCartData(totalPriceValue, totalQuantityValue);
    this.persistCartItems();
  }

  persistCartItems() {
    //cartItems = keys , this.cartItems = values
    // Stringify converts to string 
    // session keys/values can only be stored as strings.
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }
  //for debugging
  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('content of cart');

    for (let tempCartItem of this.cartItems) {
      let subtotal: number = tempCartItem.unitPrice * tempCartItem.quantity;
      console.log(`Name = ${tempCartItem.name} 
                  Quantity =${tempCartItem.quantity} 
                  Price = ${tempCartItem.unitPrice}
                  Subtotal = ${subtotal}`);
    }
    // toFixed(2) only show 2 digits after the decimal
    console.log(`Total: ${totalPriceValue.toFixed(2)}`);
    console.log(`Quantity: ${totalQuantityValue}`)
    console.log("------------------------------------------------------------")
  }
  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;
    if (theCartItem.quantity === 0) {
      this.remove(theCartItem);
    } else {
      this.computeCartTotals();
    }
  }
  remove(theCartItem: CartItem) {
    //get index of item in the array
    const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id === theCartItem.id);
    //if found, remove the item from the array at given index
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotals();
    }
  }
}




