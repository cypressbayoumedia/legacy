import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-terms-of-service',
    standalone: true,
    imports: [RouterModule],
    template: `
    <div class="min-h-screen bg-black text-gray-300 font-sans selection:bg-rose-500 selection:text-white">
      <!-- Nav -->
      <nav class="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div class="max-w-4xl mx-auto px-6 h-20 flex justify-between items-center">
            <a routerLink="/" class="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500">Legacy</a>
            <a routerLink="/" class="text-sm text-gray-400 hover:text-white">Back to Home</a>
        </div>
      </nav>

      <main class="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <h1 class="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <div class="space-y-6 leading-relaxed">
            <p><strong>Last Updated:</strong> December 2025</p>
            
            <section>
                <h2 class="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                <p>By accessing and using Legacy, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
                <p>Legacy provides a data-driven matching service that analyzes uploaded social media history to connect users based on psychographic compatibility.</p>
            </section>

             <section>
                <h2 class="text-2xl font-semibold text-white mb-4">3. User Conduct</h2>
                <p>You agree to upload only your own data. Uploading data belonging to others without their explicit consent is strictly prohibited and will result in immediate account termination.</p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-white mb-4">4. Beta Disclaimer</h2>
                <p>Legacy is currently in Beta. The service is provided "as is" without warranty of any kind. We reserve the right to modify or discontinue the service at any time.</p>
            </section>

             <section>
                <h2 class="text-2xl font-semibold text-white mb-4">5. Governing Law</h2>
                <p>These terms shall be governed by the laws of the United States.</p>
            </section>
        </div>
      </main>
    </div>
  `
})
export class TermsOfService { }
