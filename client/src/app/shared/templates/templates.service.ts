import {Injectable} from '@angular/core';
import {AppHttpClient} from "vebto-client/core/http/app-http-client.service";
import {Observable} from "rxjs/Observable";
import {PaginationResponse} from 'vebto-client/core/types/pagination-response';
import {BuilderTemplate} from '../builder-types';

@Injectable()
export class Templates {

    /**
     * Templates API service constructor.
     */
    constructor(private http: AppHttpClient) {}

    /**
     * Get all available templates.
     */
    public all(params: object = {}): Observable<PaginationResponse<BuilderTemplate>> {
        return this.http.get('templates', params);
    }

    /**
     * Get template by specified id.
     */
    public get(name: string): Observable<{template: BuilderTemplate}> {
        return this.http.get('templates/'+name);
    }

    /**
     * Create a new template.
     */
    public create(params: object): Observable<{template: BuilderTemplate}> {
        return this.http.post('templates', params);
    }

    /**
     * Update specified template.
     */
    public update(name: string, params: object): Observable<{template: BuilderTemplate}> {
        return this.http.put('templates/'+name, params);
    }

    /**
     * Delete specified templates.
     */
    public delete(names: string[]): Observable<any> {
        return this.http.delete('templates', {names});
    }
}
