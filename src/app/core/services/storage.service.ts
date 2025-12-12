import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, percentage } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private storage = inject(Storage);
    private auth = inject(Auth);

    uploadFile(file: File): Observable<{ progress: number; snapshot: any }> {
        const user = this.auth.currentUser;
        if (!user) throw new Error('User must be logged in to upload');

        const filePath = `uploads/${user.uid}/${Date.now()}_${file.name}`;
        const storageRef = ref(this.storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Observable(observer => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    observer.next({ progress, snapshot });
                },
                (error) => observer.error(error),
                () => observer.complete()
            );
        });
    }
}
