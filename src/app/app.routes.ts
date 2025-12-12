import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { AuthGuard, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
// Lazy load where possible, but for MVP importing directly is fine for now if strict lazy loading isn't required by constraint
// import { UploadComponent } from './features/upload/upload.component'; 

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/']);
const redirectLoggedInToUpload = () => redirectLoggedInTo(['/upload']);

export const routes: Routes = [
    {
        path: '',
        component: Login,
        canActivate: [AuthGuard],
        data: { authGuardPipe: redirectLoggedInToUpload }
    },
    {
        path: 'onboarding',
        loadComponent: () => import('./features/onboarding/onboarding').then(m => m.Onboarding),
        canActivate: [AuthGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin }
    },
    {
        path: 'upload',
        loadComponent: () => import('./features/upload/upload').then(m => m.Upload),
        canActivate: [AuthGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin }
    },
    {
        path: 'matches',
        loadComponent: () => import('./features/matches/matches').then(m => m.Matches),
        canActivate: [AuthGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin }
    },
    {
        path: 'chat/:id',
        loadComponent: () => import('./features/chat/chat').then(m => m.Chat),
        canActivate: [AuthGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin }
    },
    {
        path: 'privacy',
        loadComponent: () => import('./features/legal/privacy-policy').then(m => m.PrivacyPolicy)
    },
    {
        path: 'terms',
        loadComponent: () => import('./features/legal/terms-of-service').then(m => m.TermsOfService)
    },
    { path: '**', redirectTo: '' }
];
