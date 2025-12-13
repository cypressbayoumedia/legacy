import { Injectable, inject, NgZone } from '@angular/core';
import { Firestore, doc, onSnapshot, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})
export class FirestoreService {
    private firestore = inject(Firestore);
    private auth = inject(Auth);
    private zone = inject(NgZone);

    /**
     * Returns a real-time stream of the current user's document.
     */
    getUserProfile(): Observable<any> {
        const user = this.auth.currentUser;
        if (!user) {
            throw new Error('User must be logged in to get profile');
        }
        const userDocRef = doc(this.firestore, `users/${user.uid}`);

        return new Observable(observer => {
            const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
                this.zone.run(() => {
                    observer.next(snapshot.data());
                });
            }, (error) => {
                this.zone.run(() => {
                    observer.error(error);
                });
            });

            return () => unsubscribe();
        });
    }

    /**
     * Updates the user document with new data.
     */
    async updateUser(uid: string, data: any): Promise<void> {
        const userDocRef = doc(this.firestore, `users/${uid}`);
        return setDoc(userDocRef, data, { merge: true });
    }
}
