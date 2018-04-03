import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {utils} from "vebto-client/core/services/utils";
import {Projects} from '../../../shared/projects/projects.service';
import {ProjectUrl} from '../../../shared/projects/project-url.service';
import {BuilderTemplate} from '../../../shared/builder-types';
import {PageDocument} from '../../../shared/page-document';
import {Templates} from "../../../shared/templates/templates.service";

@Component({
    selector: 'new-project-modal',
    templateUrl: './new-project-modal.component.html',
    styleUrls: ['./new-project-modal.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NewProjectModalComponent {

    /**
     * New project model.
     */
    public newProject: {name?: string, uuid?: string} = {};

    /**
     * Errors from backend.
     */
    public errors: {name?: string} = {};

    private pageDocument = new PageDocument();

    /**
     * Whether backend request is currently in progress.
     */
    public loading = false;

    /**
     * NewProjectModalComponent Constructor.
     */
    constructor(
        private dialogRef: MatDialogRef<NewProjectModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {templateName?: string},
        private projects: Projects,
        private templates: Templates,
        private projectUrl: ProjectUrl,
    ) {
        this.newProject.uuid = utils.randomString(36);
        this.pageDocument.setBaseUrl(this.projectUrl.getBaseUrl((this.newProject) as any));
    }

    /**
     * Create a new project.
     */
    public async confirm() {
        this.loading = true;

        let params;

        if (this.data.templateName) {
            params = await this.createProjectFromTemplate();
        } else {
            params = this.createBlankProject();
        }

        this.projects.create(params).subscribe(response => {
            this.loading = false;
            this.dialogRef.close(response.project);
        }, response => {
            this.loading = false;
            this.errors = response.messages;
        });
    }

    /**
     * Close the modal.
     */
    public close() {
        this.dialogRef.close();
    }

    /**
     * Get payload for new project created from a template.
     */
    private createProjectFromTemplate(): Promise<any> {
        return new Promise(resolve => {
            const params = this.getBasePayload();

            this.templates.get(this.data.templateName).subscribe(response => {
                params.template = response.template;
                params.framework = response.template.config.framework;
                params.pages = this.transformTemplatePages(response.template);
                resolve(params);
            });
        });
    }

    /**
     * Get payload for new project without a template.
     */
    private createBlankProject() {
        const params = this.getBasePayload();

        params.pages.push({
            name: 'index',
            html: this.pageDocument.generate().getOuterHtml()
        });

        return params;
    }

    /**
     * Transform template pages into project pages.
     */
    private transformTemplatePages(template: BuilderTemplate) {
        return template.pages.map(page => {
            return {
                name: page.name,
                html: this.pageDocument.generate(page.html, template).getOuterHtml(),
            }
        });
    }

    /**
     * Get base payload for creating new project.
     */
    private getBasePayload() {
        return {
            name: this.newProject.name,
            uuid: this.newProject.uuid,
            pages: [],
            framework: 'bootstrap-3',
            template: null,
        };
    }
}
