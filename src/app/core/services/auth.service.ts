import { Injectable, inject } from '@angular/core';
import { Auth, signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult, User, authState, signOut } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth = inject(Auth);
    user$: Observable<User | null> = authState(this.auth);

    constructor() { }

    get currentUser(): User | null {
        return this.auth.currentUser;
    }

    // Phase 2: Phone Auth
    // We need to pass the HTML element ID for the recaptcha
    async signInWithPhone(phoneNumber: string, appVerifier: any): Promise<ConfirmationResult> {
        try {
            return await signInWithPhoneNumber(this.auth, phoneNumber, appVerifier);
        } catch (error) {
            console.error('Error sending SMS code:', error);
            throw error;
        }
    }

    async verifyOtp(confirmationResult: ConfirmationResult, otp: string): Promise<User | null> {
        try {
            const result = await confirmationResult.confirm(otp);
            return result.user;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        return signOut(this.auth);
    }
}
