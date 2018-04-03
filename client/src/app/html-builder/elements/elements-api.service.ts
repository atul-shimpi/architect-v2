import {Injectable} from '@angular/core';
import {AppHttpClient} from 'vebto-client/core/http/app-http-client.service';

@Injectable()
export class ElementsApi {

    /**
     * ElementsApi Constructor.
     */
    constructor(private http: AppHttpClient) {}

    /**
     * Get all custom elements.
     */
    public getCustom() {
        return this.http.get('elements/custom');
    }
}
