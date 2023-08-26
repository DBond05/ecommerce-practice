import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { start } from '@popperjs/core';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutFormService } from 'src/app/services/checkout-form.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { FormValidators } from 'src/app/validators/form-validators';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup = this.formBuilder.group({});
  totalPrice: number = 0;
  totalQuantity: number = 0;
  cardYears: number[] = [];
  cardMonths: number[] = [];
  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage= sessionStorage;

  //initialize stripe API
  stripe = Stripe(environment.stripePublishableKey);
  paymentInfo: PaymentInfo= new PaymentInfo();
  cardElement: any;
  displayError: any = "";
  isDisabled: boolean =false;

  constructor(private formBuilder: FormBuilder,
    private formService: CheckoutFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router) {

  }
  //for more details on email regex pattern www.regextutorials.com
  ngOnInit(): void {
    this.setupStripePaymentForm();
    this.reviewCartDetails();

    //read email from browser storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);
    // validation
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required,
        Validators.minLength(2),
        FormValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required,
        Validators.minLength(2),
        FormValidators.notOnlyWhitespace]),
        email: new FormControl(theEmail, [Validators.required,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9._]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group(
        {
          street: new FormControl('', [Validators.required,
          Validators.minLength(2),
          FormValidators.notOnlyWhitespace]),
          city: new FormControl('', [Validators.required,
          Validators.minLength(2),
          FormValidators.notOnlyWhitespace]),
          state: new FormControl('', Validators.required),
          country: new FormControl('', Validators.required),
          zipCode: new FormControl('', [Validators.required,
          Validators.minLength(5),
          FormValidators.notOnlyWhitespace])
        }
      ),
      billingAddress: this.formBuilder.group(
        {
          street: new FormControl('', [Validators.required,
          Validators.minLength(2),
          FormValidators.notOnlyWhitespace]),
          city: new FormControl('', [Validators.required,
          Validators.minLength(2),
          FormValidators.notOnlyWhitespace]),
          state: new FormControl('', Validators.required),
          country: new FormControl('', Validators.required),
          zipCode: new FormControl('', [Validators.required,
          Validators.minLength(5),
          FormValidators.notOnlyWhitespace])
        }
      ),
      creditCard: this.formBuilder.group(
        { /*
          cardType: new FormControl('', Validators.required),
          nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), FormValidators.notOnlyWhitespace]),
          cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
          securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
          expirationMonth: [''],
          expirationYear: ['']
          */
        })
    });

    // //populate credit card months field
    // const startMonth: number = new Date().getMonth() + 1;
    // //console.log("Start Month" + startMonth);

    // this.formService.getMonths(startMonth).subscribe(
    //   data => {
    //     // console.log("retrieved credit card months: " + JSON.stringify(data));
    //     this.cardMonths = data;
    //   }
    // )

    // //populate credit card years field

    // this.formService.getYears().subscribe(
    //   data => {
    //     //console.log("retrieved credit card months: " + JSON.stringify(data));
    //     this.cardYears = data;
    //   }
    // )

    //populate countries
    this.formService.getCountries().subscribe(
      data => {
        // console.log("retrieved countries: "+ JSON.stringify(data));
        this.countries = data;
      }
    )
  }
  setupStripePaymentForm() {
   //get a handle to stripe element
  var elements = this.stripe.elements();

   //create a card element.. customized by adding JSON element to hide zipcode
    this.cardElement=elements.create('card', {hidePostalCode:true});

   //add an instance of the card UI component to the 'card-element'
    this.cardElement.mount('#card-element');

   //add event binding for the 'change' event on the card element
   //for validation/displaying error
   this.cardElement.on('change', (event:any) => {
    // get handle to card-errors element
    this.displayError=document.getElementById('card-errors');

    if(event.complete){
      this.displayError.textContent = "";
    } else if (event.error){
      //show validation error to customer
      this.displayError.textContent = event.error.message;
    }
   })
  }
  reviewCartDetails() {
    //subscribe to cartService.totalQuantity and cartService.totalPrice
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );
  }
  //form getters
  // customer
  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }
  //shipping address 
  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingAddressZipcode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  // billing address
  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingAddressZipcode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  //credit card
  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }



  copyAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }
  onSubmit() {
    // Todo : look into validation rules @ https://angular.io/api/forms/Validators
    //console.log("Data from onSubmit");
    //console.log(this.checkoutFormGroup.get('customer')!.value)
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    //setup order
    let order = new Order(this.totalQuantity, this.totalPrice);

    // get cart items
    const cartItems = this.cartService.cartItems;

    //create Order Items from cartItems
    let orderItems: OrderItem[] = cartItems.map(temp => new OrderItem(temp.imageUrl!, temp.unitPrice!, temp.quantity,temp.id!));

    //set up purchase
    let purchase = new Purchase();

    //populate purchase with:
    // customer, 
      purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // Addresses,
      purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
      const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
      const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
      purchase.shippingAddress.state = shippingState.name;
      purchase.shippingAddress.country = shippingCountry.name;

      purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
      const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
      const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
      purchase.billingAddress.state = billingState.name;
      purchase.billingAddress.country = billingCountry.name;

     // order and order Items
      purchase.order = order;
      purchase.orderItems = orderItems;

      //compute payment info for stripe
      this.paymentInfo.amount = Math.round(this.totalPrice*100);
      this.paymentInfo.currency= "USD";
      this.paymentInfo.receiptEmail = purchase.customer.email;

    // old way - call REST API via the checkout service
    // this.checkoutService.placeOrder(purchase).subscribe(
    //   {
    //     next: response => {
    //       alert(`Your order has been recieved. \n Tracking number: ${response.orderTrackingNumber}`);
    //       // reset cart
    //       this.resetCart();
    //     },
    //     error:err => {
    //       alert(`There was an error: ${err.message}`)
    //     }
    //   }
    // );


    //new way - Call REST API with stripe
    //if the form is valid 
    if (!this.checkoutFormGroup.invalid&& this.displayError.textContent==""){
      this.isDisabled=true;
      //-create a payment intent 
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
         // - confirm card payment
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
           {
            payment_method:{
              card: this.cardElement,
              billing_details:{
                email: purchase.customer.email,
                name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                address: {
                  line1: purchase.billingAddress.street,
                  city: purchase.billingAddress.city,
                  state: purchase.billingAddress.state,
                  postal_code: purchase.billingAddress.zipCode,
                  country: this.billingAddressCity.value.code
                }
              }
            }
           } , { handleActions:false})
           .then((result:any) => {
            if (result.error){
              //inform user of error
              alert(`There was an error: ${result.error.message}`);
              this.isDisabled = false;
            } else {//- place the order 
              //call REST API via Checkout service
              this.checkoutService.placeOrder(purchase).subscribe({
                next:(response:any) => {
                  alert(`Your order has been recieved.\nOrder tracking number: ${response.orderTrackingNumber}`);

                  //reset cart
                  this.resetCart();
                  this.isDisabled= false;
                }, 
                error:(err: any) =>{
                  alert(`there was an error: ${err.message}`);
                  this.isDisabled=false;
                }
              })
            }
           });
        }
      );
     } else {
      this.checkoutFormGroup.markAllAsTouched ();
      return;
     }
  }
  resetCart() {
    //reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();

    //reset form data
    this.checkoutFormGroup.reset();

    //navigate back to homepage
    this.router.navigateByUrl("/products");
  }
  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);
    let startMonth: number;
    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }
    this.formService.getMonths(startMonth).subscribe(
      data => {
        // console.log("retrieved credit card months" + JSON.stringify(data));
        this.cardMonths = data;
      });

  }
  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;
    //console.log(`${formGroupName} country code: ${countryCode}`);
    //console.log(`${formGroupName} country name: ${countryName}`);

    this.formService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
          //console.log("in shipping address states")
        } else {
          this.billingAddressStates = data;
          //console.log("in billing address states")
        }
        formGroup?.get('state')?.setValue(data[0]);
      });
  }

}
