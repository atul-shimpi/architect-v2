import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatPaginator, MatSort} from "@angular/material";
import {Modal} from "vebto-client/core/ui/modal.service";
import {AdminTableDataSource} from "vebto-client/admin/admin-table-data-source";
import {UrlAwarePaginator} from "vebto-client/admin/pagination/url-aware-paginator.service";
import {ConfirmModalComponent} from "vebto-client/core/ui/confirm-modal/confirm-modal.component";
import {CurrentUser} from "vebto-client/auth/current-user";
import {CrupdateTemplateModalComponent} from "./crupdate-template-modal/crupdate-template-modal.component";
import {BuilderTemplate} from '../../shared/builder-types';
import {Templates} from '../../shared/templates/templates.service';
import {Settings} from "vebto-client/core/services/settings.service";

@Component({
    selector: 'templates',
    templateUrl: './templates.component.html',
    styleUrls: ['./templates.component.scss'],
    providers: [UrlAwarePaginator],
    encapsulation: ViewEncapsulation.None
})
export class TemplatesComponent implements OnInit {
    @ViewChild(MatPaginator) matPaginator: MatPaginator;
    @ViewChild(MatSort) matSort: MatSort;

    public dataSource: AdminTableDataSource<BuilderTemplate>;

    /**
     * TemplatesComponent Constructor.
     */
    constructor(
        public paginator: UrlAwarePaginator,
        private templates: Templates,
        private modal: Modal,
        public currentUser: CurrentUser,
        private settings: Settings,
    ) {}

    ngOnInit() {
        this.dataSource = new AdminTableDataSource<BuilderTemplate>(
            'templates', this.paginator, this.matPaginator, this.matSort
        );
    }

    /**
     * Ask user to confirm deletion of selected templates
     * and delete selected templates if user confirms.
     */
    public maybeDeleteSelectedTemplates() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Templates',
            body:  'Are you sure you want to delete selected templates?',
            ok:    'Delete'
        }).afterClosed().subscribe(confirmed => {
            if ( ! confirmed) return;
            this.deleteSelectedTemplates();
        });
    }

    /**
     * Delete currently selected templates.
     */
    public deleteSelectedTemplates() {
        const ids = this.dataSource.selectedRows.selected.map(template => template.name);

        this.templates.delete(ids).subscribe(() => {
            this.paginator.refresh();
            this.dataSource.selectedRows.clear();
        });
    }

    /**
     * Show modal for editing template if template is specified
     * or for creating a new template otherwise.
     */
    public showCrupdateTemplateModal(template?: BuilderTemplate) {
        this.modal.show(CrupdateTemplateModalComponent, {template}).afterClosed().subscribe(data => {
            if ( ! data) return;
            this.paginator.refresh();
        });
    }

    /**
     * Get relative url for specified template's thumbnail.
     */
    public getTemplateThumbnail(template: BuilderTemplate) {
        return this.settings.getBaseUrl(true)+template.thumbnail;
    }
}
