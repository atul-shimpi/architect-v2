import {Injectable} from '@angular/core';
import {Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, Router} from '@angular/router';
import {BuilderTemplate} from '../../shared/builder-types';
import {Templates} from "../../shared/templates/templates.service";

@Injectable()
export class TemplatesResolver implements Resolve<BuilderTemplate[]> {

    constructor(
        private router: Router,
        private templates: Templates,
    ) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<BuilderTemplate[]> {
        return this.templates.all({per_page: 50}).toPromise().then(response => {
            return response.data;
        }).catch(() => {
            this.router.navigate(['/dashboard']);
            return null;
        });
    }
}