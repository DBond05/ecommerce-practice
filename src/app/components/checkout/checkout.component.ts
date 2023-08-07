import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { start } from '@popperjs/core';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { CheckoutFormService } from 'src/app/services/checkout-form.service';

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
  countries: Country[] =[];
 shippingAddressStates: State[] = [];
 billingAddressStates: State[] = [];
  
  constructor(private formBuilder: FormBuilder, private formService: CheckoutFormService) {

  }
  //for more details on email regex pattern www.regextutorials.com
  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
        email:new FormControl('',
         [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9._]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group(
        {
          street: [''],
          city: [''],
          state: [''],
          country: [''],
          zipCode: ['']
        }
      ),
      billingAddress: this.formBuilder.group(
        {
          street: [''],
          city: [''],
          state: [''],
          country: [''],
          zipCode: ['']
        }
      ),
      creditCard: this.formBuilder.group(
        {
          cardType: [''],
          nameOnCard: [''],
          cardNumber: [''],
          securityCode: [''],
          expirationMonth: [''],
          expirationYear: ['']
        })
    });

    //populate credit card months field
    const startMonth: number = new Date().getMonth() + 1;
    //console.log("Start Month" + startMonth);

    this.formService.getMonths(startMonth).subscribe(
      data => {
       // console.log("retrieved credit card months: " + JSON.stringify(data));
        this.cardMonths = data;
      }
    )

    //populate credit card years field

    this.formService.getYears().subscribe(
      data=> {
        //console.log("retrieved credit card months: " + JSON.stringify(data));
        this.cardYears= data;
      }
    )

    //populate countries
    this.formService.getCountries().subscribe(
      data=> {
       // console.log("retrieved countries: "+ JSON.stringify(data));
        this.countries=data;
      }
    )
  }

get firstName(){return this.checkoutFormGroup.get('customer.firstName') ;}
get lastName(){ return this.checkoutFormGroup.get('customer.lastName') ;}
get email(){return this.checkoutFormGroup.get('customer.email');}



  copyAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
        this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates=[];
    }
  }
  onSubmit(){
    // Todo : look into validation rules @ https://angular.io/api/forms/Validators
    console.log("Data from onSubmit");
    console.log(this.checkoutFormGroup.get('customer')!.value)
   if (this.checkoutFormGroup.invalid){
    this.checkoutFormGroup.markAllAsTouched();
   }
  }
  handleMonthsAndYears(){
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);
    let startMonth:number;
    if (currentYear === selectedYear){
      startMonth = new Date().getMonth()+1;
    } else {
      startMonth = 1;
    }
    this.formService.getMonths(startMonth).subscribe(
      data => {
       // console.log("retrieved credit card months" + JSON.stringify(data));
        this.cardMonths= data;
      });

  }
  getStates(formGroupName: string){
    const formGroup= this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;
//console.log(`${formGroupName} country code: ${countryCode}`);
//console.log(`${formGroupName} country name: ${countryName}`);

this.formService.getStates(countryCode).subscribe(
data => {
 if (formGroupName === 'shippingAddress'){
  this.shippingAddressStates = data;
  //console.log("in shipping address states")
 } else{
   this.billingAddressStates= data;
   //console.log("in billing address states")
 }
 formGroup?.get('state')?.setValue(data[0]);
});
  }

}
