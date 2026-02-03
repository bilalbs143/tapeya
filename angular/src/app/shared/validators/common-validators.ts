import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export function isValidJson(control: FormControl): { [p: string]: any } | null {
  try {
    JSON.parse(control.value);
    return null;
  } catch (_) {
    return { invalidJSON: true };
  }
}

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Valid if the field is empty
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(value)) {
      return { uppercaseRequired: true };
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(value)) {
      return { lowercaseRequired: true };
    }

    // Check for at least one digit
    if (!/\d/.test(value)) {
      return { digitRequired: true };
    }

    // Check for at least one symbol
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return { symbolRequired: true };
    }

    return null; // Valid password
  };
}

export function onlyNumbers(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;

    if (Validators.required(control)) {
      return null;
    }

    // Update regular expression to match numbers with commas
    const valid = /^(\d+|\d{1,3}(,\d{3})*)(\.\d+)?$/.test(value);

    return valid ? null : { onlyNumbers: true }; // Return an error if the value is not a valid number with commas
  };
}

export function commaNumbers(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;

    // Skip validation if the control is empty or not touched
    if (!value) {
      return null;
    }

    // Regular expression to match numbers with optional commas and decimal points
    // Ensures there are no non-numeric characters
    const valid = /^[0-9]+(,[0-9]{3})*(\.[0-9]+)?$/.test(value);

    return valid ? null : { onlyNumbers: true }; // Return an error if the value is not valid
  };
}

export function commaNumbersWithNegatives(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;

    // Skip validation if the control is empty or not touched
    if (!value) {
      return null;
    }

    // Allow "-" as a valid intermediate state while user is typing
    if (value === '-') {
      return null;
    }

    // Regular expression to match negative or positive numbers with optional commas and decimal points
    // Allows negative sign at the beginning, numbers with commas, and decimal points
    const valid = /^-?[0-9]+(,[0-9]{3})*(\.[0-9]+)?$/.test(value);

    return valid ? null : { onlyNumbers: true }; // Return an error if the value is not valid
  };
}

export function matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
  return (group: FormGroup): { [key: string]: any } | null => {
    const password = group.controls[passwordKey];
    const confirmPassword = group.controls[confirmPasswordKey];

    if (password.value !== confirmPassword.value) {
      return {
        mismatchedPasswords: true,
      };
    } else {
      return null;
    }
  };
}

export function noSpaceAllowed(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value as string;

    if (value && /\s/.test(value)) {
      return { noSpace: true }; // Validation error if space is found
    }

    return null; // No validation error
  };
}

export function phoneNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Valid if the field is empty
    }

    // Check if the value contains only numeric characters
    const valid = /^[0-9]+$/.test(value);

    return valid ? null : { phoneNumberInvalid: true }; // Return error if non-numeric characters found
  };
}

export function usernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value as string;

    if (!value) {
      return null; // Valid if the field is empty (required validator will handle this)
    }

    // If username contains "----", allow it (no regex validation)
    if (value.includes('----')) {
      return null;
    }

    // Otherwise, validate against regex pattern /^[a-z0-9]+$/
    const valid = /^[a-z0-9]+$/.test(value);

    return valid ? null : { usernameInvalid: true }; // Return error if pattern doesn't match
  };
}
