import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})
export class FirestoreService {
    private firestore = inject(Firestore);
    private auth = inject(Auth);

    /**
     * Returns a real-time stream of the current user's document.
     */
    getUserProfile(): Observable<any> {
        const user = this.auth.currentUser;
        if (!user) {
            throw new Error('User must be logged in to get profile');
        }
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        return docData(userDocRef);
    }

    /**
     * Updates the user document with new data.
     */
    async updateUser(uid: string, data: any): Promise<void> {
        const userDocRef = doc(this.firestore, `users/${uid}`);
        // Import setDoc or updateDoc dynamically or just use set with merge
        const { setDoc } = await import('@angular/fire/firestore');
        return setDoc(userDocRef, data, { merge: true });
    }
}
