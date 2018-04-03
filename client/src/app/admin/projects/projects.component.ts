import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {UrlAwarePaginator} from "vebto-client/admin/pagination/url-aware-paginator.service";
import {AdminTableDataSource} from "vebto-client/admin/admin-table-data-source";
import {Modal} from "vebto-client/core/ui/modal.service";
import {CurrentUser} from "vebto-client/auth/current-user";
import {ConfirmModalComponent} from "vebto-client/core/ui/confirm-modal/confirm-modal.component";
import {MatPaginator, MatSort} from "@angular/material";
import {CrupdateProjectModalComponent} from "./crupdate-project-modal/crupdate-project-modal.component";
import {Projects} from '../../shared/projects/projects.service';
import {Project} from '../../shared/projects/Project';
import {ProjectUrl} from '../../shared/projects/project-url.service';

@Component({
    selector: 'projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.scss'],
    providers: [UrlAwarePaginator],
    encapsulation: ViewEncapsulation.None
})
export class ProjectsComponent implements OnInit {
    @ViewChild(MatPaginator) matPaginator: MatPaginator;
    @ViewChild(MatSort) matSort: MatSort;

    public dataSource: AdminTableDataSource<Project>;

    /**
     * ProjectsComponent Constructor.
     */
    constructor(
        public paginator: UrlAwarePaginator,
        private projects: Projects,
        private modal: Modal,
        private projectUrl: ProjectUrl,
        public currentUser: CurrentUser,
    ) {}

    ngOnInit() {
        this.dataSource = new AdminTableDataSource<Project>(
            'projects', this.paginator, this.matPaginator, this.matSort
        );
    }

    /**
     * Ask user to confirm deletion of selected projects
     * and delete selected projects if user confirms.
     */
    public maybeDeleteSelectedProjects() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Projects',
            body:  'Are you sure you want to delete selected projects?',
            ok:    'Delete'
        }).afterClosed().subscribe(confirmed => {
            if ( ! confirmed) return;
            this.deleteSelectedProjects();
        });
    }

    /**
     * Delete currently selected projects.
     */
    public deleteSelectedProjects() {
        const ids = this.dataSource.selectedRows.selected.map(project => project.id);

        this.projects.delete({ids}).subscribe(() => {
            this.paginator.refresh();
            this.dataSource.selectedRows.clear();
        });
    }

    /**
     * Show modal for editing project if project is specified
     * or for creating a new project otherwise.
     */
    public showCrupdateProjectModal(project?: Project) {
        this.modal.show(CrupdateProjectModalComponent, {project}).afterClosed().subscribe(data => {
            if ( ! data) return;
            this.paginator.refresh();
        });
    }

    /**
     * Get relative url for specified project's thumbnail.
     */
    public getProjectThumbnail(project: Project) {
        return this.projectUrl.getBaseUrl(project)+'thumbnail.png';
    }
}
