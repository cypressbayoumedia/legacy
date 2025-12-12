import { Component, inject, signal, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ChatService, Message } from '../../core/services/chat.service';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="h-screen bg-black text-white font-sans flex flex-col selection:bg-rose-500 selection:text-white">
      
      <!-- Chat Header -->
      <div class="h-16 px-6 border-b border-white/10 flex items-center gap-4 bg-black/80 backdrop-blur-xl z-20">
         <button (click)="router.navigate(['/matches'])" class="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
         </button>
         <h3 class="font-bold text-lg tracking-tight">Conversation</h3>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" #scrollContainer>
         @for (msg of messages$ | async; track msg.id) {
             <div class="flex" [class.justify-end]="isMine(msg)">
                <div [class]="getBubbleClass(isMine(msg))">
                    {{ msg.text }}
                </div>
             </div>
         } @empty {
            <div class="flex h-full items-center justify-center text-gray-600">
                <p>Start the conversation...</p>
            </div>
         }
      </div>

      <!-- Input Area -->
      <div class="p-4 border-t border-white/10 bg-black z-20">
         <div class="max-w-4xl mx-auto flex gap-3">
            <input 
              [(ngModel)]="newMessage" 
              (keyup.enter)="sendMessage()" 
              placeholder="Type a message..."
              [disabled]="sending()"
              class="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-600 text-white"
            >
            <button 
                (click)="sendMessage()" 
                [disabled]="!newMessage.trim() || sending()"
                class="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 hover:scale-105 transition-all"
            >
                <svg class="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            </button>
         </div>
      </div>

    </div>
  `
})
export class Chat implements OnInit, AfterViewChecked {
    private route = inject(ActivatedRoute);
    private chatService = inject(ChatService);
    private auth = inject(Auth);
    router = inject(Router);

    chatId = '';
    messages$: Observable<Message[]> | null = null;
    newMessage = '';
    sending = signal(false);

    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.chatId = params.get('id') || '';
            if (this.chatId) {
                this.messages$ = this.chatService.getMessages(this.chatId);
            }
        });
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    isMine(msg: Message): boolean {
        return msg.senderId === this.auth.currentUser?.uid;
    }

    getBubbleClass(mine: boolean): string {
        const base = "max-w-[80%] px-5 py-3 text-sm md:text-base shadow-sm break-words relative ";
        if (mine) {
            return base + "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl rounded-tr-sm";
        } else {
            return base + "bg-white/10 text-gray-200 rounded-2xl rounded-tl-sm border border-white/5";
        }
    }

    async sendMessage() {
        if (!this.newMessage.trim() || this.sending()) return;

        this.sending.set(true);
        try {
            await this.chatService.sendMessage(this.chatId, this.newMessage);
            this.newMessage = '';
        } catch (err) {
            console.error('Send error', err);
        } finally {
            this.sending.set(false);
        }
    }
}
