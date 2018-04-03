import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Toast} from "vebto-client/core/ui/toast.service";
import {utils} from "vebto-client/core/services/utils";
import {Theme} from '../../../shared/themes/Theme';
import {Themes} from '../../../shared/themes/themes.service';
import {Project} from '../../../shared/projects/Project';
import {Projects} from '../../../shared/projects/projects.service';

@Component({
    selector: 'crupdate-project-modal',
    templateUrl: './crupdate-project-modal.component.html',
    styleUrls: ['./crupdate-project-modal.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CrupdateProjectModalComponent implements OnInit {

    /**
     * List of existing themes.
     */
    public themes: Theme[] = [];

    /**
     * Whether project is currently being saved.
     */
    public loading: boolean = false;

    /**
     * Project model.
     */
    public model: Project;

    /**
     * If we are updating existing project or creating a new one.
     */
    public updating: boolean = false;

    /**
     * Errors returned from backend.
     */
    public errors: any = {};

    /**
     * CrupdateUserModalComponent Constructor.
     */
    constructor(
        private dialogRef: MatDialogRef<CrupdateProjectModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {project?: Project},
        public projects: Projects,
        private toast: Toast,
        private themesApi: Themes,
    ) {
        this.resetState();
    }

    ngOnInit() {
        this.resetState();
        this.getThemes();

        if (this.data.project) {
            this.updating = true;
            this.hydrateModel(this.data.project);
        } else {
            this.updating = false;
        }
    }

    /**
     * Create a new project or update existing one.
     */
    public confirm() {
        this.loading = true;
        let request;

        if (this.updating) {
            request = this.projects.update(this.data.project.id, this.model);
        } else {
            const model = Object.assign({}, this.model, {uuid: utils.randomString(36)});
            request = this.projects.create(model);
        }

        request.subscribe(response => {
            this.close(response.project);
            let action = this.updating ? 'updated' : 'created';
            this.toast.open('Project has been '+action);
            this.loading = false;
        }, response => {
            this.errors = response.messages;
            this.loading = false;
        });
    }

    /**
     * Close the modal.
     */
    public close(data?: any) {
        this.resetState();
        this.dialogRef.close(data);
    }

    /**
     * Populate project model with given data.
     */
    private hydrateModel(project: Project) {
        this.model.name = project.name;
        this.model.framework = project.framework;
        this.model.theme = project.theme;
    }

    /**
     * Reset all modal state to default.
     */
    private resetState() {
        this.model = new Project();
        this.errors = {};
    }

    /**
     * Get all existing bootstrap themes.
     */
    private getThemes() {
        this.themesApi.all().subscribe(response => {
            this.themes = response.themes;
        });
    }
}
