import {Injectable} from "@angular/core";
import {Settings} from "vebto-client/core/services/settings.service";
import {BuilderDocument} from "../builder-document.service";
import {Observable} from "rxjs/Observable";
import * as html2canvas from "html2canvas";
import {Toast} from "vebto-client/core/ui/toast.service";
import {Subject} from "rxjs/Subject";
import {LocalStorage} from "vebto-client/core/services/local-storage.service";
import {debounceTime} from "rxjs/operators/debounceTime";
import {share} from "rxjs/operators/share";
import {ProjectUrl} from '../../shared/projects/project-url.service';
import {Projects} from '../../shared/projects/projects.service';
import {Theme} from '../../shared/themes/Theme';
import {BuilderPage, BuilderProject, BuilderTemplate} from '../../shared/builder-types';
import {PageDocument} from '../../shared/page-document';
import {Templates} from "../../shared/templates/templates.service";

@Injectable()
export class ActiveProject {

    /**
     * Template applied to the project.
     */
    private activeTemplate: BuilderTemplate;

    /**
     * Pages of the project.
     */
    private pages: BuilderPage[] = [];

    /**
     * Index of currently active page.
     */
    private activePage = 0;

    /**
     * Project model.
     */
    private project: BuilderProject;

    /**
     * Whether project is being saved currently.
     */
    public saving = false;

    /**
     * ActiveProject Constructor.
     */
    constructor(
        private settings: Settings,
        private builderDocument: BuilderDocument,
        private projectUrl: ProjectUrl,
        private projects: Projects,
        private templates: Templates,
        private toast: Toast,
        private localStorage: LocalStorage,
    ) {
        this.bindToBuilderDocumentChangeEvent();
    }

    /**
     * Get project model.
     */
    public get(): BuilderProject {
        return this.project;
    }

    /**
     * Get all project pages.
     */
    public getPages() {
        return this.pages;
    }

    /**
     * Find a page by specified name.
     */
    public getPage(name: string): BuilderPage {
        return this.pages.find(page => page.name.toLowerCase() === name.toLowerCase());
    }

    /**
     * Get active project page.
     */
    public getActivePage(): BuilderPage {
        return this.pages[this.activePage];
    }

    /**
     * Save project to the backend.
     */
    public save(options: {thumbnail?: boolean, params?: object} = {thumbnail: true}): Observable<{project: BuilderProject}> {
        this.saving = true;

        if (options.thumbnail) {
            html2canvas(this.builderDocument.getBody(), {svgRendering: true, height: 1000}).then(canvas => {
                this.projects.generateThumbnail(this.project.model.id, canvas.toDataURL('image/png')).subscribe();
            });
        }

        if ( ! options.params) options.params = {};

        //update html of active page, so it's synced with the builder
        this.pages[this.activePage].html = this.builderDocument.getOuterHtml();

        const payload = Object.assign({}, options.params, {
            name: this.project.model.name,
            css: this.project.css,
            js: this.project.js,
            theme: this.project.model.theme,
            template: this.project.model.template,
            framework: this.project.model.framework,
            pages: this.pages.map(page => {
                return {name: page.name, html: page.html}
            })
        });

        const request = this.projects.update(this.project.model.id, payload).pipe(share());

        request.subscribe(response => {
            this.project = response.project;
            this.saving = false;
        }, () => {
            this.saving = false;
            this.toast.open('Could not save project');
        });

        return request;
    }

    /**
     * Add specified page to pages array.
     */
    public addPage(page: BuilderPage) {
        this.pages.push(page);
        this.activePage = this.pages.length - 1;
        this.updateBuilderDocument();
        return page;
    }

    /**
     * Update specified page.
     */
    public updatePage(updatedPage: BuilderPage): ActiveProject {
        const i = this.pages.findIndex(page => page.name === updatedPage.name);
        this.pages[i] = updatedPage;
        return this;
    }

    /**
     * Set specified page as active.
     */
    public setActivePage(page: BuilderPage) {
        this.activePage = this.pages.findIndex(curr => curr.name === page.name);
        this.updateBuilderDocument();
    }

    /**
     * Remove specified page from pages array.
     */
    public removePage(name: string) {
        const i = this.pages.findIndex(page => page.name === name);
        this.pages.splice(i, 1);
        this.activePage = i - 1;

        this.updateBuilderDocument();
    }

    public setProject(project: BuilderProject) {
        this.project = project;
        this.activePage = 0;
        this.pages = project.pages;
        this.activeTemplate = project.template;
        this.builderDocument.setTemplate(this.activeTemplate);
        this.builderDocument.setFramework(project.model.framework);
    }

    public applyTemplate(name: string) {
        const completed = new Subject();
        this.project.model.template = name;

        this.templates.get(name).subscribe(response => {
            this.activeTemplate = response.template;
            this.pages = response.template.pages.map(page => {
                return {
                    name: page.name,
                    html: (new PageDocument(this.getBaseUrl())).generate(page.html, this.activeTemplate).getOuterHtml(),
                }
            });

            this.save({thumbnail: true}).subscribe(() => {
                this.activePage = 0;
                this.updateBuilderDocument().then(() => {
                    completed.next() && completed.complete();
                });
            });
        });

        return completed;
    }

    /**
     * Change project's css framework.
     */
    public changeFramework(name: string) {
        this.project.model.framework = name;

        return new Promise(resolve => {
            this.save({thumbnail: false}).subscribe(() => {
                this.updateBuilderDocument().then(() => resolve());
            });
        });
    }

    public applyTheme(theme?: Theme) {
        this.project.model.theme = theme ? theme.name : null;

        return new Promise(resolve => {
            this.save({thumbnail: false}).subscribe(() => {
                this.updateBuilderDocument().then(() => resolve());
            });
        });
    }

    /**
     * Get project's base static files url.
     */
    public getBaseUrl(relative: boolean = false) {
        return this.projectUrl.getBaseUrl(this.project.model, relative);
    }

    /**
     * Get project's site pretty url that is routed via architect.
     */
    public getSiteUrl() {
        return this.settings.getBaseUrl(true) + 'sites/' + this.project.model.name;
    }

    private updateBuilderDocument() {
        return this.builderDocument.update({
            html: this.getActivePage().html,
            template: this.activeTemplate,
            source: 'activeProject',
            framework: this.project.model.framework,
            theme: this.project.model.theme,
        });
    }

    /**
     * Get a template used by current project.
     */
    public getTemplate(): BuilderTemplate {
        return this.activeTemplate;
    }

    /**
     * Check if current project is using a template.
     */
    public hasTemplate(): boolean {
        return this.activeTemplate !== undefined;
    }

    /**
     * Auto save and update project pages on builder document change event.
     */
    private bindToBuilderDocumentChangeEvent() {
        this.builderDocument.contentChanged.pipe(debounceTime(1000)).subscribe(source => {
            if (source === 'activeProject') return;

            this.pages[this.activePage].html = this.builderDocument.getOuterHtml();

            if (this.localStorage.get('settings.autoSave')) {
                this.save({thumbnail: false});
            }
        });
    }
}
