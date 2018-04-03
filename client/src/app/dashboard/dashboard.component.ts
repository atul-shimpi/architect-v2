import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Settings} from "vebto-client/core/services/settings.service";
import {CurrentUser} from "vebto-client/auth/current-user";
import {Toast} from "vebto-client/core/ui/toast.service";
import {Modal} from "vebto-client/core/ui/modal.service";
import {ConfirmModalComponent} from "vebto-client/core/ui/confirm-modal/confirm-modal.component";
import {VebtoConfig} from "vebto-client/core/vebto-config.service";
import {FormControl, FormGroup} from "@angular/forms";
import {UrlAwarePaginator} from "vebto-client/admin/pagination/url-aware-paginator.service";
import {debounceTime} from "rxjs/operators/debounceTime";
import {distinctUntilChanged} from "rxjs/operators/distinctUntilChanged";
import {Project} from '../shared/projects/Project';
import {Projects} from '../shared/projects/projects.service';
import {ProjectUrl} from '../shared/projects/project-url.service';
import {PublishProjectModalComponent} from '../shared/projects/publish-project-modal/publish-project-modal.component';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    providers: [UrlAwarePaginator],
    encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {

    public projects: Project[] = [];

    public models = new FormGroup({
        query:  new FormControl(''),
        order: new FormControl('created_at|desc'),
        published: new FormControl('all')
    });

    /**
     * DashboardComponent Constructor.
     */
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public settings: Settings,
        public currentUser: CurrentUser,
        private projectsApi: Projects,
        private toast: Toast,
        private modal: Modal,
        private projectUrl: ProjectUrl,
        public siteConfig: VebtoConfig,
        private paginator: UrlAwarePaginator,
    ) {}

    ngOnInit() {
        this.route.data.subscribe(data => {
            this.projects = data.projects.data;
        });

        this.bindToProjectFilters();
    }

    /**
     * Open specified project in the builder.
     */
    public openBuilder(project: Project) {
        this.router.navigate(['/builder', project.id]);
    }

    /**
     * Get absolute url for specified project's thumbnail image.
     */
    public getProjectImage(project: Project) {
        return this.projectUrl.getBaseUrl(project)+'thumbnail.png';
    }

    /**
     * Get absolute url for specified project site.
     */
    public getProjectUrl(project: Project) {
        return this.projectUrl.getSiteUrl(project);
    }

    /**
     * Open modal for publish specified project.
     */
    public openPublishProjectModal(project: Project) {
        this.modal.open(PublishProjectModalComponent, {project}).afterClosed().subscribe(project => {
            if ( ! project || ! project.model) return;
            const i = this.projects.findIndex(curr => curr.id === project.model.id);
            this.projects[i] = project.model;
        });
    }

    /**
     * Delete specified project, if user confirms it.
     */
    public deleteProjectWithConfirmation(project: Project) {
        this.modal.open(ConfirmModalComponent, {
            title: 'Delete Project',
            body: 'Are you sure you want to delete this project?',
            ok: 'Delete',
        }).afterClosed().subscribe(confirmed => {
            if ( ! confirmed) return;

            this.projectsApi.delete({ids: [project.id]}).subscribe(() => {
                this.toast.open('Project deleted');
                this.projects.splice(this.projects.indexOf(project), 1);
            });
        });
    }

    /**
     * Bind to page header filters and refresh projects on change.
     */
    private bindToProjectFilters() {
        this.models.valueChanges.pipe(debounceTime(250), distinctUntilChanged())
            .subscribe((params: ProjectFilters) => {
                const merged = Object.assign({user_id: this.currentUser.get('id'), per_page: 20}, params);

                this.paginator.paginate('projects', merged).subscribe(response => {
                    this.projects = response.data;
                });
            });
    }
}

declare interface ProjectFilters {
    order: string,
    status: string,
    query: string;
}
