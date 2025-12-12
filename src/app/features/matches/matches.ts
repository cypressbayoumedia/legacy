import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../core/services/firestore.service';
import { MatchService } from '../../core/services/match.service';
import { ChatService } from '../../core/services/chat.service';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
   selector: 'app-matches',
   standalone: true,
   imports: [CommonModule],
   changeDetection: ChangeDetectionStrategy.OnPush,
   template: `
    <div class="min-h-screen bg-black text-white selection:bg-rose-500 selection:text-white font-sans overflow-x-hidden">
      
      <!-- Nav -->
      <nav class="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div class="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div class="text-xl font-bold tracking-tighter flex items-center gap-2 cursor-pointer" (click)="router.navigate(['/upload'])">
                <span class="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500">Legacy</span>
            </div>
             <div class="flex items-center gap-4">
               <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                  {{ auth.currentUser?.email?.substring(0,2)?.toUpperCase() }}
               </div>
            </div>
        </div>
      </nav>

      <main class="relative pt-32 pb-20 px-6 max-w-7xl mx-auto">
      
         <header class="text-center mb-16">
            <h2 class="text-4xl sm:text-5xl font-bold mb-4">Your Crowd</h2>
            <p class="text-gray-400">People who vibrate on your frequency.</p>
         </header>

         @if (loading()) {
            <div class="flex flex-col items-center justify-center py-20">
               <div class="w-16 h-16 border-2 border-t-rose-500 border-r-transparent border-b-indigo-500 border-l-transparent rounded-full animate-spin mb-6"></div>
               <p class="text-gray-500 animate-pulse">Scanning the vector space...</p>
            </div>
         }

         @if (error()) {
            <div class="text-center py-20">
               <p class="text-red-400 mb-4">{{ error() }}</p>
               <button (click)="findMatches()" class="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors">Retry</button>
            </div>
         }

         @if (!loading() && !matches().length && !error()) {
             <div class="text-center py-20">
                <p class="text-gray-500 mb-6">No matches visible yet.</p>
                <button class="px-8 py-3 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 font-bold hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all" (click)="findMatches()">
                    Find Matches
                </button>
             </div>
         }

         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (match of matches(); track match.userId || $index) {
                <div class="group relative bg-white/5 border border-white/5 rounded-3xl p-6 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-900/20 flex flex-col">
                   
                   <!-- Header -->
                   <div class="flex justify-between items-start mb-6">
                      <div class="flex items-center gap-4">
                         <div class="w-14 h-14 rounded-full bg-black border border-white/10 overflow-hidden relative">
                            @if (match.profilePictureUrl) {
                                <img [src]="match.profilePictureUrl" class="w-full h-full object-cover">
                            } @else {
                                <div class="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                    {{ match.userId.substring(0,2).toUpperCase() }}
                                </div>
                            }
                         </div>
                         <div>
                            <div class="font-bold text-lg">Match</div>
                            <div class="text-xs text-indigo-400">Highly Compatible</div>
                         </div>
                      </div>
                      <div class="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold text-sm">
                         {{ getMatchScore(match._distance || 0) }}%
                      </div>
                   </div>

                   <!-- Bio -->
                   <div class="mb-6 relative">
                      <div class="absolute -left-2 -top-2 text-4xl text-white/5 font-serif">"</div>
                      <p class="text-gray-300 italic leading-relaxed relative z-10 pl-2">
                        {{ match.aiProfile.generatedBio || 'No bio available' }}
                      </p>
                   </div>

                   <!-- Why Card -->
                   <div class="bg-gradient-to-br from-rose-900/20 to-transparent border border-rose-500/10 rounded-xl p-4 mb-6">
                      <div class="flex items-center gap-2 mb-2">
                         <span class="text-lg">✨</span>
                         <span class="text-xs font-bold text-rose-300 uppercase tracking-wider">Why you matched</span>
                      </div>
                      <p class="text-sm text-rose-100/80 leading-relaxed">
                         {{ generateWhyReason(match) }}
                      </p>
                   </div>

                   <!-- Traits -->
                   <div class="flex flex-wrap gap-2 mb-8">
                      @for (trait of match.aiProfile.keyTraits; track trait) {
                         <span class="px-3 py-1 rounded-full bg-black/40 border border-white/5 text-xs text-gray-400">
                            {{ trait }}
                         </span>
                      }
                   </div>

                   <!-- Action -->
                   <div class="mt-auto">
                      <button (click)="startChat(match)" class="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-indigo-50 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2">
                         <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                         Message
                      </button>
                   </div>

                </div>
            }
         </div>
      </main>
    </div>
  `
})
export class Matches implements OnInit {
   searchParams = signal<{ vector: number[], preferredGenders?: string[] } | undefined>(undefined);

   public firestoreService = inject(FirestoreService);
   public matchService = inject(MatchService);
   public chatService = inject(ChatService);
   public auth = inject(Auth);
   public router = inject(Router);

   // Establish the resource
   matchResource = this.matchService.getMatchesResource(this.searchParams);

   // Computed signals for template - with fallbacks
   loading = computed(() => this.matchResource.isLoading());
   error = computed(() => this.matchResource.error() ? 'Failed to find matches. Please try again.' : '');
   matches = computed(() => this.matchResource.value()?.matches || []);

   currentUserProfile: any = null;
   private currentUserVector: number[] = [];

   ngOnInit() {
      if (this.auth.currentUser) {
         this.firestoreService.getUserProfile().subscribe({
            next: (profile) => {
               if (profile) {
                  this.currentUserProfile = profile;
                  this.currentUserVector = profile.embedding_vector || [];

                  // Initial search if we don't have matches yet
                  if (this.matches().length === 0) {
                     this.findMatches();
                  }
               }
            },
            error: (err) => console.error("Could not fetch profile", err)
         });
      }
   }

   findMatches() {
      const preferredGenders = this.currentUserProfile?.interestedIn || [];
      // Trigger the resource by updating the signal
      this.searchParams.set({
         vector: this.currentUserVector,
         preferredGenders
      });
   }

   getMatchScore(distance: number): number {
      const similarity = Math.max(0, 1 - distance);
      return Math.round(similarity * 100);
   }

   generateWhyReason(match: any): string {
      if (!this.currentUserProfile?.aiProfile?.keyTraits) return "You have a high compatibility score.";
      const myTraits = new Set(this.currentUserProfile.aiProfile.keyTraits.map((t: string) => t.toLowerCase()));
      const theirTraits = match.aiProfile?.keyTraits || [];
      const common = theirTraits.filter((t: string) => myTraits.has(t.toLowerCase()));
      if (common.length > 0) {
         return `You both share the trait${common.length > 1 ? 's' : ''} "${common[0]}"${common.length > 1 ? ' and others' : ''}.`;
      }
      return "Your communication vectors are aligned.";
   }

   async startChat(match: any) {
      try {
         const chatId = await this.chatService.createChat(match.userId, match);
         this.router.navigate(['/chat', chatId]);
      } catch (e) {
         console.error("Failed to start chat", e);
      }
   }
}
