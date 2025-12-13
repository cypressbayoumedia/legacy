import { Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';
import { FirestoreService } from '../../core/services/firestore.service';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upload',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-black text-white selection:bg-rose-500 selection:text-white font-sans overflow-x-hidden">
      
      <!-- Nav -->
      <nav class="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div class="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div class="text-xl font-bold tracking-tighter flex items-center gap-2">
                <span class="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500">Legacy</span>
            </div>
            <div class="flex items-center gap-4">
               <button (click)="logout()" class="text-sm text-gray-400 hover:text-white transition-colors">Sign Out</button>
            </div>
        </div>
      </nav>

      <main class="relative pt-32 pb-20 px-6 min-h-screen flex flex-col items-center">
         
         <!-- Background FX -->
         <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute top-20 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen opacity-30"></div>
            <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[100px] mix-blend-screen opacity-20"></div>
         </div>

         <div class="relative z-10 max-w-3xl w-full">
            
            <!-- Header -->
            <div class="text-center mb-12">
               <h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Upload Your Archive</h1>
               <p class="text-gray-400 text-lg">Donate your digital history to find your psychographic match.</p>
            </div>

            <!-- Upload Card -->
            @if (processingStatus() === 'idle' || processingStatus() === 'uploading') {
                <div 
                  class="group relative w-full h-64 sm:h-80 rounded-3xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 bg-white/5 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                  (dragover)="onDragOver($event)"
                  (dragleave)="onDragLeave($event)"
                  (drop)="onDrop($event)"
                  (click)="fileInput.click()">
                  
                  <input #fileInput type="file" accept=".zip" class="hidden" (change)="onFileSelected($event)">
                  
                  <div class="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div class="relative z-10 flex flex-col items-center transition-transform duration-300 group-hover:scale-105">
                     <div class="w-16 h-16 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-3xl mb-4 group-hover:border-indigo-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] transition-all">
                        📄
                     </div>
                     <p class="text-lg font-medium mb-2">Click or Drag JSON zip here</p>
                     <p class="text-sm text-gray-500">Instagram Archive (.zip)</p>
                  </div>
                </div>

          
          <div class="mt-8">
            <a routerLink="/onboarding" [queryParams]="{step: 3}" class="text-sm text-gray-500 hover:text-white underline transition-colors">
                Need help exporting your data?
            </a>
          </div>

          @if (uploadProgress() > 0 && uploadProgress() < 100) {                 <div class="mt-8 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div class="bg-gradient-to-r from-indigo-500 to-fuchsia-500 h-full transition-all duration-300" 
                             [style.width.%]="uploadProgress()"></div>
                    </div>
                    <p class="text-center text-sm text-gray-400 mt-2">Uploading... {{ uploadProgress() | number:'1.0-0' }}%</p>
                }
            }

            <!-- Processing State -->
            @if (processingStatus() === 'processing') {
                <div class="w-full p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center animate-pulse-slow">
                     <div class="w-20 h-20 mb-6 rounded-full border-2 border-t-transparent border-indigo-500 animate-spin"></div>
                     <h3 class="text-2xl font-bold mb-2">Analyzing your psyche...</h3>
                     <p class="text-gray-400 max-w-md">{{ processingMessage() || 'Deciphering your communication patterns and values.' }}</p>
                </div>
            }

            <!-- Success/Completed State -->
            @if (processingStatus() === 'completed') {
                <div class="w-full p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-black border border-indigo-500/30 text-center relative overflow-hidden">
                     <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500"></div>
                     
                     <div class="text-6xl mb-6">✨</div>
                     <h3 class="text-3xl font-bold mb-4">Profile Generated</h3>
                     <p class="text-indigo-200 mb-8 max-w-xl mx-auto">
                        "{{ aiProfile()?.generatedBio }}"
                     </p>

                     <div class="flex flex-wrap gap-2 justify-center mb-8">
                        @for (trait of aiProfile()?.keyTraits; track trait) {
                            <span class="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm text-indigo-300">
                                {{ trait }}
                            </span>
                        }
                     </div>

                     <button (click)="viewMatches()" class="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-indigo-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        View Your Matches →
                     </button>
                </div>
            }

             <!-- Error State -->
            @if (processingStatus() === 'rejected' || processingStatus() === 'failed' || error()) {
                 <div class="w-full p-8 rounded-3xl bg-red-900/10 border border-red-500/20 text-center">
                    <div class="text-4xl mb-4">⚠️</div>
                    <h3 class="text-xl font-bold text-red-400 mb-2">Upload Issue</h3>
                    <p class="text-red-300/80 mb-6">{{ processingMessage() || error() || 'Something went wrong.' }}</p>
                    <button (click)="reset()" class="px-6 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                        Try Again
                    </button>
                 </div>
            }

         </div>
      </main>
    </div>
  `,
  styles: [`
    .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  `]
})
export class Upload {
  private router = inject(Router);
  private auth = inject(Auth);
  private storageService = inject(StorageService);
  private firestoreService = inject(FirestoreService);

  // Derive reactive state from user profile
  private userProfile = toSignal(this.firestoreService.getUserProfile());

  uploadProgress = signal(0);
  private uploadStartTime = signal<number | null>(null);

  // Computed state from profile data
  processingStatus = computed<'idle' | 'uploading' | 'processing' | 'completed' | 'rejected' | 'failed'>(() => {
    const profile = this.userProfile();
    const status = profile?.processingStatus;

    // 1. Uploading state (local)
    if (this.uploadProgress() > 0 && this.uploadProgress() < 100) return 'uploading';

    // 2. Waiting for Backend state (gap between upload done and backend start)
    // If we started an upload recently, and the profile hasn't been updated since then,
    // we show 'processing' to avoid showing the old 'completed' state.
    if (this.uploadStartTime() && profile?.lastUpdated) {
      const lastUpdatedMs = profile.lastUpdated?.toMillis ? profile.lastUpdated.toMillis() : 0;
      if (lastUpdatedMs < this.uploadStartTime()!) {
        return 'processing';
      }
    } else if (this.uploadStartTime() && !profile) {
      // First time upload, no profile yet
      return 'processing';
    }

    return status || 'idle';
  });

  processingMessage = computed(() => this.userProfile()?.processingMessage || '');
  aiProfile = computed(() => this.userProfile()?.aiProfile || null);

  error = signal('');

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  handleFile(file: File) {
    if (!file.name.endsWith('.zip')) {
      this.error.set("Please upload a .zip file");
      return;
    }

    this.error.set('');
    // Note: status is computed, but we can set progress to trigger 'uploading' derived state
    this.uploadProgress.set(1);
    this.uploadStartTime.set(Date.now());

    this.storageService.uploadFile(file).subscribe({
      next: (data) => {
        this.uploadProgress.set(data.progress || 0);
      },
      error: (err) => {
        console.error(err);
        this.error.set("Upload failed.");
        this.uploadProgress.set(0);
      }
    });
  }

  viewMatches() {
    this.router.navigate(['/matches']);
  }

  reset() {
    this.error.set('');
    this.uploadProgress.set(0);
  }

  async logout() {
    await this.auth.signOut();
    this.router.navigate(['/']);
  }
}
