import { FormControl, ValidationErrors } from "@angular/forms";

export class FormValidators {
    //whitespace validator 

    static notOnlyWhitespace(control: FormControl): ValidationErrors{
        //check to see if the input only contains whitespace
        if((control.value != null) && (control.value.trim().lenth <= 1)){
           
            return{'notOnlyWhitespace': true};
        } else {
            return null;
        }
        
    }
}
