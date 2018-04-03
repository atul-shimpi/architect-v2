import {Injectable} from '@angular/core';
import {Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, Router} from '@angular/router';
import {Projects} from '../shared/projects/projects.service';
import {BuilderProject} from '../shared/builder-types';
import {CurrentUser} from "vebto-client/auth/current-user";

@Injectable()
export class ProjectResolver implements Resolve<BuilderProject> {

    constructor(
        private router: Router,
        private projects: Projects,
        private currentUser: CurrentUser,
    ) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<BuilderProject> {
        return this.projects.get(route.params.id).toPromise().then(response => {
            //prevent user from opening project in builder if needed
            if ( ! this.userCanOpenProjectInBuilder(response.project)) {
                throw(403);
            }

            return response.project;
        }).catch(() => {
            this.router.navigate(['dashboard']);
        }) as Promise<BuilderProject>;
    }

    private userCanOpenProjectInBuilder(project: BuilderProject): boolean {
        return project.model.users.find(user => user.id === this.currentUser.get('id')) !== undefined;
    }
}