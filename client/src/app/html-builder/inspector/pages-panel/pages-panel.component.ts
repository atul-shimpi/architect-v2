import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActiveProject} from "../../projects/active-project";
import {Page} from "vebto-client/core/types/models/Page";
import {Toast} from "vebto-client/core/ui/toast.service";
import {BuilderDocument} from "../../builder-document.service";
import {Projects} from '../../../shared/projects/projects.service';
import {BuilderPage} from '../../../shared/builder-types';
import {PageDocument} from '../../../shared/page-document';

@Component({
    selector: 'pages-panel',
    templateUrl: './pages-panel.component.html',
    styleUrls: ['./pages-panel.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PagesPanelComponent implements OnInit {

    /**
     * Whether something is being saved to backend.
     */
    public loading = false;

    /**
     * Currently selected page.
     */
    public selectedPage: BuilderPage;

    /**
     * Model for binding page update inputs.
     */
    public updateModel: {
        name?: string,
        title?: string,
        description?: string,
        keywords?: string,
    } = {};

    /**
     * Errors returned from the backend.
     */
    public errors: {name?: string, title?: string, keywords?: string, description?: string} = {};

    /**
     * PagesPanelComponent Constructor.
     */
    constructor(
        public activeProject: ActiveProject,
        private projects: Projects,
        private toast: Toast,
        private builderDocument: BuilderDocument,
    ) {}

    ngOnInit() {
        this.selectedPage = this.activeProject.getPages()[0];

        this.builderDocument.loaded.subscribe(() => {
            this.hydrateUpdateModel();
        });
    }

    /**
     * Create a new page.
     */
    public createNewPage() {
        this.loading = true;

        let name = 'Page '+(this.activeProject.getPages().length + 1);

        //make sure we don't duplicate page names
        if (this.activeProject.getPages().find(page => page.name === name)) {
            name += ' Copy';
        }

        const html = new PageDocument()
            .setBaseUrl(this.activeProject.getBaseUrl())
            .generate('', null, this.activeProject.get().model.framework)
            .getOuterHtml();

        this.selectedPage = this.activeProject.addPage({name: name, html: html});

        console.log(this.activeProject.getPages());

        this.activeProject.save().subscribe(() => {
            this.loading = false;
            this.toast.open('Page created');
        });
    }

    /**
     * Check if selected page can be deleted.
     */
    public canDeleteSelectedPage() {
        return this.selectedPage && this.activeProject.getPages().length > 1;
    }

    /**
     * Called when selected page changes.
     */
    public onPageSelected() {
        this.hydrateUpdateModel();
        this.activeProject.setActivePage(this.selectedPage);
    }

    public updateSelectedPage() {
        this.loading = true;

        this.builderDocument.setMetaTagValue('keywords', this.updateModel.keywords);
        this.builderDocument.setTitleValue(this.updateModel.title);
        this.builderDocument.setMetaTagValue('description', this.updateModel.description);
        this.builderDocument.contentChanged.next('builder');

        const page = {name: this.updateModel.name, html: this.builderDocument.getOuterHtml()};

        this.activeProject.updatePage(page).save({thumbnail: false}).subscribe(() => {
            this.loading = false;
            this.toast.open('Page updated');
        });
    }

    /**
     * Delete currently selected page.
     */
    public deleteSelectedPage() {
        this.loading = true;

        this.activeProject.removePage(this.selectedPage.name);
        this.selectedPage = this.activeProject.getActivePage();

        this.activeProject.save({thumbnail: false}).subscribe(() => {
            this.loading = false;
            this.toast.open('Page deleted');
        });
    }

    /**
     * Duplicate selected page.
     */
    public duplicateSelectedPage() {
        this.loading = true;

        this.activeProject.addPage({
            name: this.selectedPage.name + ' Copy',
            html: this.selectedPage.html,
        });

        this.selectedPage = this.activeProject.getActivePage();

        this.activeProject.save({thumbnail: false}).subscribe(() => {
            this.loading = false;
            this.toast.open('Page duplicated');
        });
    }

    private hydrateUpdateModel() {
        this.updateModel = {
            name: this.selectedPage.name,
            title: this.builderDocument.getTitleValue(),
            description: this.builderDocument.getMetaTagValue('description'),
            keywords: this.builderDocument.getMetaTagValue('keywords'),
        };
    }
}
