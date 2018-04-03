import {Injectable} from '@angular/core';
import {AppHttpClient} from "vebto-client/core/http/app-http-client.service";
import {Observable} from "rxjs/Observable";
import {BuilderProject, FtpDetails} from '../builder-types';
import {PaginationResponse} from "vebto-client/core/types/pagination-response";
import {Project} from './Project';

@Injectable()
export class Projects {

    /**
     * Projects API service constructor.
     */
    constructor(private http: AppHttpClient) {}

    /**
     * Get all available projects.
     */
    public all(params?: {user_id?: number, per_page?: number}): Observable<PaginationResponse<Project>> {
        return this.http.get('projects', params);
    }

    /**
     * Get project matching specified id.
     */
    public get(id: number): Observable<{project: BuilderProject}> {
        return this.http.get('projects/'+id);
    }

    /**
     * Create a new project.
     */
    public create(params: object): Observable<{project: BuilderProject}> {
        return this.http.post('projects', params);
    }

    /**
     * Update project matching specified id.
     */
    public update(id: number, params: object): Observable<{project: BuilderProject}> {
        return this.http.put('projects/'+id, params);
    }

    /**
     * Delete project matching specified id.
     */
    public delete(params: {ids: number[]}): Observable<any> {
        return this.http.delete('projects', params);
    }

    /**
     * Create or update specified project's thumbnail image.
     */
    public generateThumbnail(projectId: number, dataUrl: string): Observable<any> {
        return this.http.post('projects/'+projectId+'/generate-thumbnail', {dataUrl});
    }

    /**
     * Publish specified project to FTP.
     */
    public publish(projectId: number, params: FtpDetails): Observable<{project: Project}> {
        return this.http.post('projects/'+projectId+'/publish', params);
    }
}
