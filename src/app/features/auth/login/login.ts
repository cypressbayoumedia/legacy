import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  imports: [RouterModule],
  template: `
    <div class="min-h-screen bg-black text-white selection:bg-rose-500 selection:text-white font-sans overflow-x-hidden">
      
      <!-- Navigation -->
      <nav class="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-xl bg-black/80 border-b border-white/5">
        <div class="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div class="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500">
              Legacy
            </span>
            <span class="text-xs font-mono px-2 py-0.5 rounded-full border border-white/20 text-white/50 uppercase tracking-widest">
              Beta
            </span>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <main class="relative pt-32 pb-20 sm:pt-48 sm:pb-32 flex flex-col items-center justify-center min-h-screen">
        
        <!-- Abstract Background -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-[100%] blur-[120px] mix-blend-screen opacity-30 animate-pulse-slow"></div>
            <div class="absolute bottom-0 left-0 w-[800px] h-[600px] bg-rose-600/10 rounded-[100%] blur-[100px] mix-blend-screen opacity-20"></div>
            <!-- Grid Pattern -->
            <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div class="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]"></div>
        </div>

        <div class="relative z-10 max-w-5xl mx-auto px-6 text-center">
          
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 animate-fade-in-up">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span class="text-sm font-medium text-rose-200">The Future of High-Intent Dating</span>
          </div>

          <h1 class="text-6xl sm:text-8xl font-bold tracking-tight mb-8 leading-tight">
            Love, <br class="block sm:hidden" />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500">
              Decoded.
            </span>
          </h1>
          
          <p class="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-400 font-light leading-relaxed mb-12">
            Stop swiping on faces. Start matching on minds. 
            <br class="hidden sm:block">We analyze your digital history to find your psychographic soulmate.
          </p>

          <div class="flex flex-col sm:flex-row gap-6 justify-center items-center w-full max-w-md mx-auto">
            <button (click)="signInWithGoogle()" 
              class="w-full group relative flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-full backdrop-blur-md overflow-hidden">
              <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-rose-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span class="relative flex items-center gap-3">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                Sign in with Google
              </span>
            </button>
          </div>
          
          <p class="mt-6 text-xs uppercase tracking-widest text-gray-600">
            Private • Encrypted • Data Owned By You
          </p>

          @if (error()) {
            <div class="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm max-w-md mx-auto">
              {{ error() }}
            </div>
          }
        </div>
      </main>

      <!-- How It Works Section -->
      <section class="py-32 relative border-t border-white/5">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-20">
            <h2 class="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p class="text-gray-400">From archive to connection in three steps.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Step 1 -->
            <div class="group relative p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-rose-500/30 transition-all duration-500 hover:-translate-y-2">
              <div class="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
              <div class="relative z-10">
                <div class="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-3xl mb-6 shadow-xl shadow-rose-900/10 group-hover:scale-110 transition-transform duration-300">
                  📂
                </div>
                <h3 class="text-xl font-semibold mb-3">1. Upload History</h3>
                <p class="text-gray-400 text-sm leading-relaxed">
                  Export your Instagram data. Our system ingests your captions, bios, and text to understand who you really are.
                </p>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="group relative p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-fuchsia-500/30 transition-all duration-500 hover:-translate-y-2">
              <div class="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
              <div class="relative z-10">
                <div class="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-3xl mb-6 shadow-xl shadow-fuchsia-900/10 group-hover:scale-110 transition-transform duration-300">
                  🧠
                </div>
                <h3 class="text-xl font-semibold mb-3">2. Deep Understanding</h3>
                <p class="text-gray-400 text-sm leading-relaxed">
                  We analyze your communication style and values from your history to understand the real you.
                </p>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="group relative p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all duration-500 hover:-translate-y-2">
              <div class="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
              <div class="relative z-10">
                <div class="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-3xl mb-6 shadow-xl shadow-indigo-900/10 group-hover:scale-110 transition-transform duration-300">
                  ✨
                </div>
                <h3 class="text-xl font-semibold mb-3">3. True Connection</h3>
                <p class="text-gray-400 text-sm leading-relaxed">
                  Connect with people who resonate with your mind, identifying compatibility that goes beyond the surface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-12 border-t border-white/5 text-center text-gray-600 text-sm">
        <div class="flex justify-center gap-6 mb-4">
             <a routerLink="/privacy" class="hover:text-white transition-colors cursor-pointer">Privacy</a>
             <a routerLink="/terms" class="hover:text-white transition-colors cursor-pointer">Terms</a>
             <a href="mailto:support@legacy.app" class="hover:text-white transition-colors">Contact</a>
        </div>
        <p>&copy; {{ year }} Legacy Inc. Built for the long term.</p>
      </footer>
    </div>
  `,
  styles: [`
    .bg-grid-white {
        background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E");
    }
    
    .animate-pulse-slow {
        animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.15; }
    }

    .animate-fade-in-up {
        animation: fadeInUp 1s ease-out forwards;
    }

    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);
  error = signal('');
  year = new Date().getFullYear();

  async signInWithGoogle() {
    this.error.set('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);

      // Check if user has completed onboarding
      // We can do a one-time fetch or just default to onboarding for now
      // ideally we check firestore
      this.router.navigate(['/onboarding']);

    } catch (err: unknown) {
      console.error('Login error', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      this.error.set('Failed to sign in: ' + errorMessage);
    }
  }
}
