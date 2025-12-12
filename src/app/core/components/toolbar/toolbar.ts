import { Component, QueryList, ViewChildren, AfterViewInit, HostListener, ChangeDetectionStrategy, ElementRef, inject, Directive } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { FocusKeyManager, FocusableOption } from '@angular/cdk/a11y'; // ListKeyManager or FocusKeyManager
// FocusKeyManager is for managing focus directly.

@Directive({
    selector: '[appFocusable]',
    standalone: true
})
export class FocusableDirective implements FocusableOption {
    private element = inject(ElementRef);

    focus(): void {
        this.element.nativeElement.focus();
    }
}

@Component({
    selector: 'app-toolbar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, FocusableDirective],
    template: `
    <div class="toolbar" role="toolbar" aria-label="Main Navigation">
      <div class="logo">Legacy</div>
      
      @if (auth.currentUser) {
          <div class="nav-items">
            <!-- We use template variables and ViewChildren to track these items -->
            <a routerLink="/upload" routerLinkActive="active" 
               appFocusable tabindex="0" (keydown)="onKeydown($event)">
               Upload
            </a>
            <a routerLink="/matches" routerLinkActive="active" 
               appFocusable tabindex="-1" (keydown)="onKeydown($event)">
               Matches
            </a>
            <button class="sign-out-btn" (click)="signOut()" 
               appFocusable tabindex="-1" (keydown)="onKeydown($event)">
               Sign Out
            </button>
          </div>
      }
    </div>
  `,
    styles: [`
    :host { display: block; }
    .toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 2rem; background: #fff; border-bottom: 1px solid #eee;
    }
    .logo { font-weight: 700; font-size: 1.25rem; }
    .nav-items { display: flex; gap: 1rem; align-items: center; }
    a, button.sign-out-btn {
      text-decoration: none; color: #555; padding: 0.5rem 1rem; border-radius: 4px;
      transition: all 0.2s; outline: none; border: none; background: transparent; font-size: 1rem; font-family: inherit; cursor: pointer;
    }
    a:hover, button.sign-out-btn:hover { background: #f8f9fa; color: #000; }
    a.active { font-weight: 600; color: #007bff; background: #e3f2fd; }
    
    /* Focus styles for accessibility */
    a:focus-visible, button:focus-visible {
        box-shadow: 0 0 0 3px rgba(0,123,255,0.4);
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Toolbar implements AfterViewInit {
    @ViewChildren(FocusableDirective) items!: QueryList<FocusableDirective>;
    private keyManager!: FocusKeyManager<FocusableDirective>;
    protected auth = inject(Auth);
    private router = inject(Router);

    ngAfterViewInit() {
        // FocusKeyManager handles roving tabindex and focus management
        this.keyManager = new FocusKeyManager(this.items)
            .withHorizontalOrientation('ltr')
            .withWrap();

        // Optionally set active item based on route? 
        // For now, simpler: user tabs in, then uses arrows.
        // Ideally update active item to match router but roving tabindex works best within the toolbar interaction.
    }

    onKeydown(event: KeyboardEvent) {
        this.keyManager.onKeydown(event);
    }

    async signOut() {
        await this.auth.signOut();
        this.router.navigate(['/']);
    }
}
