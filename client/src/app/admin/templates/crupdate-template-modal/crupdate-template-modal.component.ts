import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {Toast} from "vebto-client/core/ui/toast.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {CrupdateUserModalComponent} from "vebto-client/admin/users/crupdate-user-modal/crupdate-user-modal.component";
import {Templates} from '../../../shared/templates/templates.service';
import {TemplateColors} from '../../../shared/templates/template-colors';
import {Theme} from '../../../shared/themes/Theme';
import {BuilderTemplate} from '../../../shared/builder-types';
import {Themes} from '../../../shared/themes/themes.service';
import {Settings} from "vebto-client/core/services/settings.service";

@Component({
    selector: 'crupdate-template-modal',
    templateUrl: './crupdate-template-modal.component.html',
    styleUrls: ['./crupdate-template-modal.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CrupdateTemplateModalComponent implements OnInit {

    /**
     * List of all available template categories.
     */
    public allCategories: string[] = [];

    public colors = TemplateColors;

    /**
     * List of existing themes.
     */
    public themes: Theme[] = [];

    /**
     * Whether template is currently being saved.
     */
    public loading: boolean = false;

    /**
     * Template model.
     */
    public model: {
        display_name?: string,
        color: string,
        category: string,
        theme?: string,
        framework: string
    };

    /**
     * Template file input value.
     */
    public files: {thumbnail?: File, template?: File} = {};

    /**
     * If we are updating existing template or creating a new one.
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
        private dialogRef: MatDialogRef<CrupdateUserModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {template?: BuilderTemplate},
        public templates: Templates,
        private toast: Toast,
        private themesApi: Themes,
        private settings: Settings,
    ) {
        this.allCategories = this.settings.getJson('builder.template_categories', []);
        this.resetState();
    }

    ngOnInit() {
        this.resetState();
        this.getThemes();

        if (this.data.template) {
            this.updating = true;
            this.hydrateModel(this.data.template);
        } else {
            this.updating = false;
        }
    }

    /**
     * Create a new template or update existing one.
     */
    public confirm() {
        this.loading = true;
        let request, payload = this.getPayload();

        if (this.updating) {
            request = this.templates.update(this.data.template.name, payload);
        } else {
            request = this.templates.create(payload);
        }

        request.subscribe(response => {
            this.close(response.template);
            let action = this.updating ? 'updated' : 'created';
            this.toast.open('Template has been '+action);
            this.loading = false;
        }, response => {
            this.errors = response.messages;
            this.loading = false;
        });
    }

    /**
     * Get payload for updating or creating a template.
     */
    private getPayload() {
        const data = new FormData();

        //append template and thumbnail files
        if (this.files.template) data.append('template', this.files.template);
        if (this.files.thumbnail) data.append('thumbnail', this.files.thumbnail);

        //append model values
        for (let name in this.model) {
            data.append(name, this.model[name]);
        }

        return data;
    }

    /**
     * Close the modal.
     */
    public close(data?: any) {
        this.resetState();
        this.dialogRef.close(data);
    }

    /**
     * Populate template model with given data.
     */
    private hydrateModel(template: BuilderTemplate) {
        this.model.display_name = template.config.display_name || template.config.name;
        this.model.color = template.config.color.toLowerCase();
        this.model.category = template.config.category;
        this.model.framework = template.config.framework;
        this.model.theme = template.config.theme;
    }

    /**
     * Reset all modal state to default.
     */
    private resetState() {
        this.model = {color: 'black', category: this.allCategories[0], framework: '', theme: ''};
        this.errors = {};
    }

    /**
     * Set template file and clear errors.
     */
    public setFile(type: 'template'|'thumbnail', files: FileList) {
        this.files[type] = files.item(0);
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
