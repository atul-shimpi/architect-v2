import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {HttpCacheClient} from "vebto-client/core/http/http-cache-client";
import {Theme} from './Theme';

@Injectable()
export class Themes {

    /**
     * Themes API service constructor.
     */
    constructor(private http: HttpCacheClient) {}

    /**
     * Get all available themes.
     */
    public all(): Observable<{themes: Theme[]}> {
        return this.http.get('themes');
    }
}
