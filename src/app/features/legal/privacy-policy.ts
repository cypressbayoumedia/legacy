import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-privacy-policy',
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
        <h1 class="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div class="space-y-6 leading-relaxed">
            <p><strong>Last Updated:</strong> December 2025</p>
            
            <section>
                <h2 class="text-2xl font-semibold text-white mb-4">1. Data Ownership</h2>
                <p>You retain full ownership of any data you upload to Legacy. We do not sell your personal data to third parties. Your data is used solely for the purpose of generating your service profile and providing matching compatibility.</p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-white mb-4">2. The Information We Collect</h2>
                <p>We collect information you voluntarily provide, including your social media archive files (JSON format) containing captions, bios, and timestamps. We also collect basic account information via Google Sign-In.</p>
            </section>

             <section>
                <h2 class="text-2xl font-semibold text-white mb-4">3. How We Use Your Data</h2>
                <p>We use advanced processing algorithms to analyze the text within your uploaded archives. This allows us to:</p>
                <ul class="list-disc pl-5 mt-2 space-y-2">
                    <li>Generate a psychographic bio that reflects your personality.</li>
                    <li>Create mathematical embeddings (vectors) to facilitate compatibility matching.</li>
                    <li>Identify communication styles and key personality traits.</li>
                </ul>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
                <p>Your data is encrypted at rest and in transit. We use industry-standard cloud storage and authentication providers to ensure your information remains secure.</p>
            </section>

             <section>
                <h2 class="text-2xl font-semibold text-white mb-4">5. Deletion</h2>
                <p>You may request the deletion of your account and all associated data at any time by contacting support. Upon deletion, your vectors and files are permanently removed from our systems.</p>
            </section>
        </div>
      </main>
    </div>
  `
})
export class PrivacyPolicy { }
