import { Injectable, Signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatchResponse } from '../models/match.model';

@Injectable({
    providedIn: 'root'
})
export class MatchService {
    private apiUrl = environment.firebase.apiUrl;

    getMatchesResource(requestSignal: Signal<{ vector: number[], preferredGenders?: string[] } | undefined>) {
        return httpResource<MatchResponse>(() => {
            const params = requestSignal();
            if (!params) {
                return undefined;
            }
            return {
                url: this.apiUrl,
                method: 'POST',
                body: { vector: params.vector, preferred_genders: params.preferredGenders }
            };
        });
    }
}
