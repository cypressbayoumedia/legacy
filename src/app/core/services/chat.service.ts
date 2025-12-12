import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, collectionData, Timestamp, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, map, switchMap, of } from 'rxjs';

export interface Message {
    id?: string;
    senderId: string;
    text: string;
    createdAt: Timestamp;
}

export interface Chat {
    id: string;
    userIds: string[];
    lastMessage?: string;
    lastMessageTime?: Timestamp;
    // We can store participant info here for easy listing
    participants?: { [uid: string]: { displayName: string, photoUrl?: string } };
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private firestore = inject(Firestore);
    private auth = inject(Auth);

    /**
     * Creates or retrieves an existing chat between current user and target user.
     */
    async createChat(targetUserId: string, targetUserProfile: { aiProfile?: { generatedBio?: string }, profilePictureUrl?: string }): Promise<string> {
        const currentUser = this.auth.currentUser;
        if (!currentUser) throw new Error('Must be logged in');

        // Check if chat already exists
        // Note: Quering array-contains is tricky for "both", usually we need a composite ID or separate index.
        // For MVP, simple composite ID sorted by UID is easiest to ensure uniqueness: "uid1_uid2"
        const ids = [currentUser.uid, targetUserId].sort();
        const chatId = ids.join('_');

        const chatDocRef = doc(this.firestore, `chats/${chatId}`);
        const chatDoc = await getDoc(chatDocRef);

        if (!chatDoc.exists()) {
            // Create new chat
            await setDoc(chatDocRef, {
                id: chatId,
                userIds: ids,
                createdAt: Timestamp.now(),
                participants: {
                    [currentUser.uid]: { displayName: 'You', photoUrl: currentUser.photoURL }, // Profile handling could be better
                    [targetUserId]: {
                        displayName: targetUserProfile.aiProfile?.generatedBio?.substring(0, 10) + '...' || 'Match',
                        photoUrl: targetUserProfile.profilePictureUrl
                    }
                }
            });
        }

        return chatId;
    }

    getMessages(chatId: string): Observable<Message[]> {
        const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
        const q = query(messagesRef, orderBy('createdAt', 'asc'));
        return collectionData(q, { idField: 'id' }) as Observable<Message[]>;
    }

    async sendMessage(chatId: string, text: string) {
        const currentUser = this.auth.currentUser;
        if (!currentUser) throw new Error('Must be logged in');

        const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
        await addDoc(messagesRef, {
            senderId: currentUser.uid,
            text,
            createdAt: Timestamp.now()
        });

        // Update last message in chat doc
        const chatDocRef = doc(this.firestore, `chats/${chatId}`);
        await setDoc(chatDocRef, {
            lastMessage: text,
            lastMessageTime: Timestamp.now()
        }, { merge: true });
    }
}
