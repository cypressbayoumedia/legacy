import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { FirestoreService } from '../../core/services/firestore.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-onboarding',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="min-h-screen bg-black text-white font-sans selection:bg-rose-500 selection:text-white flex flex-col items-center justify-center p-6">
      
      <!-- Progress -->
      <div class="w-full max-w-md mb-8 flex gap-2">
         <div class="h-1 flex-1 rounded-full transition-colors duration-300" [class.bg-rose-500]="step() >= 1" [class.bg-white/10]="step() < 1"></div>
         <div class="h-1 flex-1 rounded-full transition-colors duration-300" [class.bg-rose-500]="step() >= 2" [class.bg-white/10]="step() < 2"></div>
         <div class="h-1 flex-1 rounded-full transition-colors duration-300" [class.bg-rose-500]="step() >= 3" [class.bg-white/10]="step() < 3"></div>
      </div>

      <div class="w-full max-w-md">
      
         <!-- Step 1: Basics -->
         @if (step() === 1) {
            <h1 class="text-3xl font-bold mb-2 animate-fade-in-up">The Basics</h1>
            <p class="text-gray-400 mb-8 animate-fade-in-up delay-100">Help us find your people.</p>
            
            <div class="space-y-6 animate-fade-in-up delay-200">
                <div>
                    <label class="block text-sm text-gray-500 mb-2">My Gender</label>
                    <div class="grid grid-cols-3 gap-3">
                        <button (click)="gender.set('Male')" [class]="getBtnClass(gender() === 'Male')" class="py-3 rounded-xl border transition-all">Male</button>
                        <button (click)="gender.set('Female')" [class]="getBtnClass(gender() === 'Female')" class="py-3 rounded-xl border transition-all">Female</button>
                        <button (click)="gender.set('Non-binary')" [class]="getBtnClass(gender() === 'Non-binary')" class="py-3 rounded-xl border transition-all">Other</button>
                    </div>
                </div>

                <div>
                     <label class="block text-sm text-gray-500 mb-2">Date of Birth</label>
                     <input type="date" [(ngModel)]="dob" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-colors">
                </div>

                <div class="pt-4">
                    <button (click)="nextStep()" [disabled]="!isValidStep1()" class="w-full py-4 rounded-full bg-white text-black font-bold text-lg disabled:opacity-50 hover:bg-rose-50 transition-all">
                        Continue
                    </button>
                </div>
            </div>
         }

         <!-- Step 2: Preferences -->
         @if (step() === 2) {
            <h1 class="text-3xl font-bold mb-2 animate-fade-in-up">Who are you looking for?</h1>
            <p class="text-gray-400 mb-8 animate-fade-in-up delay-100">This helps our matching engine.</p>

            <div class="space-y-4 animate-fade-in-up delay-200">
                <button (click)="toggleInterest('Female')" [class]="getBtnClass(interestedIn().includes('Female'))" class="w-full py-4 rounded-xl border flex justify-between px-6 items-center group transition-all">
                    <span>Women</span>
                    <span *ngIf="interestedIn().includes('Female')" class="text-rose-500">✓</span>
                </button>

                <button (click)="toggleInterest('Male')" [class]="getBtnClass(interestedIn().includes('Male'))" class="w-full py-4 rounded-xl border flex justify-between px-6 items-center group transition-all">
                    <span>Men</span>
                    <span *ngIf="interestedIn().includes('Male')" class="text-rose-500">✓</span>
                </button>

                <button (click)="toggleInterest('Everyone')" [class]="getBtnClass(interestedIn().includes('Everyone'))" class="w-full py-4 rounded-xl border flex justify-between px-6 items-center group transition-all">
                    <span>Everyone</span>
                    <span *ngIf="interestedIn().includes('Everyone')" class="text-rose-500">✓</span>
                </button>

                 <div class="pt-8">
                    <button (click)="nextStep()" [disabled]="interestedIn().length === 0" class="w-full py-4 rounded-full bg-white text-black font-bold text-lg disabled:opacity-50 hover:bg-rose-50 transition-all">
                        Next
                    </button>
                    <button (click)="step.set(1)" class="w-full mt-4 py-2 text-gray-500 hover:text-white transition-colors">Back</button>
                </div>
            </div>
         }

         <!-- Step 3: Export Guide -->
         @if (step() === 3) {
             <h1 class="text-3xl font-bold mb-2 animate-fade-in-up">Get Your Data</h1>
             <p class="text-gray-400 mb-6 animate-fade-in-up delay-100">You need to request your archive from Instagram. It usually takes 10 minutes.</p>

             <div class="space-y-4 animate-fade-in-up delay-200 overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin scrollbar-thumb-white/20">
                <!-- IG Guide -->
                <div class="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <h3 class="font-bold flex items-center gap-2 mb-3">
                        <span class="text-fuchsia-500">📸</span> Instagram
                    </h3>
                    <ol class="list-decimal pl-5 space-y-2 text-sm text-gray-300">
                        <li>Open Instagram Settings.</li>
                        <li>Go to <strong>Your Activity</strong> > <strong>Download your information</strong>.</li>
                        <li>Tap <strong>Request a download</strong>.</li>
                        <li>Select <strong>Complete copy</strong> or select specific date ranges.</li>
                        <li>Format: <strong>JSON</strong> (Important!).</li>
                        <li>Wait for the email, download the .zip.</li>
                    </ol>
                </div>

                <!-- FB Guide -->
                 <div class="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <h3 class="font-bold flex items-center gap-2 mb-3">
                        <span class="text-blue-500">📘</span> Facebook
                    </h3>
                    <ol class="list-decimal pl-5 space-y-2 text-sm text-gray-300">
                        <li>Go to Settings & Privacy.</li>
                        <li>Select <strong>Download Your Information</strong>.</li>
                        <li>Choose Format: <strong>JSON</strong>.</li>
                        <li>Request download.</li>
                    </ol>
                </div>
             </div>

             <div class="pt-8 animate-fade-in-up delay-300">
                <button (click)="finishOnboarding()" class="w-full py-4 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 font-bold text-lg hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all">
                    I'm Ready to Upload
                </button>
             </div>
         }

      </div>
    </div>
  `,
    styles: [`
    .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; transform: translateY(10px); }
    .delay-100 { animation-delay: 0.1s; }
    .delay-200 { animation-delay: 0.2s; }
    @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
  `]
})
export class Onboarding implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private auth = inject(Auth);
    private firestore = inject(FirestoreService);

    step = signal(1);
    gender = signal('');
    dob = '';
    interestedIn = signal<string[]>([]);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['step']) {
                this.step.set(Number(params['step']));
            }
        });
    }

    getBtnClass(active: boolean) {
        return active
            ? 'bg-white text-black border-transparent font-bold'
            : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50 hover:text-white';
    }

    toggleInterest(val: string) {
        if (val === 'Everyone') {
            this.interestedIn.set(['Everyone']);
            return;
        }

        let current = this.interestedIn().filter(x => x !== 'Everyone');
        if (current.includes(val)) {
            current = current.filter(x => x !== val);
        } else {
            current.push(val);
        }
        this.interestedIn.set(current);
    }

    calculateAge(dobString: string): number {
        const today = new Date();
        const birthDate = new Date(dobString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    isValidStep1() {
        // Only check for presence, not age, so we can handle the "under 18" case on click
        return !!this.gender() && !!this.dob;
    }

    async nextStep() {
        if (this.step() === 1) {
            const age = this.calculateAge(this.dob);
            if (age < 18) {
                await this.disableAccount();
                return;
            }
        }
        this.step.update(s => s + 1);
    }

    async disableAccount() {
        const user = this.auth.currentUser;
        if (user) {
            try {
                await this.firestore.updateUser(user.uid, {
                    isDisabled: true,
                    disableReason: 'Underage',
                    dob: this.dob // Save DOB purely for record
                });
                alert("You must be 18 or older to use this application. Your account has been disabled.");
                // Sign out or redirect
                await this.auth.signOut();
                this.router.navigate(['/']);
            } catch (e) {
                console.error("Error disabling account", e);
            }
        }
    }

    async finishOnboarding() {
        // Save data to Firestore
        const user = this.auth.currentUser;
        if (user) {
            try {
                await this.firestore.updateUser(user.uid, {
                    gender: this.gender(),
                    dob: this.dob,
                    interestedIn: this.interestedIn(),
                    onboardingCompleted: true
                });
                this.router.navigate(['/upload']);
            } catch (e) {
                console.error("Error saving onboarding", e);
                // Allow proceed even if save fails for beta
                this.router.navigate(['/upload']);
            }
        }
    }
}
