import {DomHelpers} from "./dom-helpers.service";
import {utils} from "vebto-client/core/services/utils";
import {BuilderTemplate} from "./builder-types";

export class PageDocument {

    /**
     * Page document object.
     */
    protected pageDocument: Document;

    /**
     * Url for "base" tag of the document.
     */
    protected baseUrl: string;

    /**
     * PageDocument Constructor.
     */
    constructor(baseUrl: string = null) {
        this.baseUrl = baseUrl;
    }

    /**
     * Ids of dom elements that are created by the builder and are not part of the project.
     */
    protected internalIds = [
        '#base', '#jquery', '#custom-css', '#custom-js', '#template-js', '[id^=library]', '#theme-css',
        '#template-css', '#framework-css', '#framework-js', '#preview-css', '#font-awesome', '#custom-elements-css'
    ];

    public getOuterHtml(): string {
        return '<!DOCTYPE html>' + this.pageDocument.documentElement.outerHTML;
    }

    public getInnerHtml(): string {
        return this.pageDocument.documentElement.innerHTML;
    }

    /**
     * Set url for document "base" tag.
     */
    public setBaseUrl(url: string): PageDocument {
        this.baseUrl = url;
        return this;
    }

    /**
     * Generate page document from specified markup.
     */
    public generate(html: string = '', template?: BuilderTemplate, framework?: string): PageDocument {
        this.pageDocument = new DOMParser().parseFromString(this.trim(html), 'text/html');

        //remove old link/script nodes to frameworks, icons, templates etc.
        this.internalIds.forEach(id => {
            const els = this.pageDocument.querySelectorAll(id);
            for (let i = 0; i < els.length; i++) {
                els[i].parentNode.removeChild(els[i]);
            }
        });

        this.addBaseElement();
        this.useFramework(framework || (template && template.config.framework));
        this.addIconsLink();

        //theme
        this.createLink('link', 'css/theme.css', 'theme-css');

        //custom elements css
        this.createLink('link', 'css/custom_elements.css', 'custom-elements-css');

        if (template) {
            this.addTemplate(template);
        }

        this.createLink('link', 'css/styles.css', 'custom-css');
        this.createLink('script', 'js/scripts.js', 'custom-js');

        return this;
    }

    /**
     * Add specified template to page.
     */
    private addTemplate(template: BuilderTemplate) {
        //legacy libraries
        if (template.config.libraries) {
            template.config.libraries.forEach(library => {
                this.createLink('script', `js/${library}.js`, `library-${library}`);
            });
        }

        this.createLink('link', 'css/template.css', 'template-css');
        this.createLink('script', 'js/template.js', 'template-js');
    }

    /**
     * Create a stylesheet or scripts link from specified uri.
     */
    private createLink(type: 'link'|'script', uri: string, id: string) {
        const query  = utils.randomString(8),
              parent = type === 'link' ? this.pageDocument.head : this.pageDocument.body;

        type = utils.ucFirst(type);
        const link = DomHelpers['create'+type](this.baseUrl+uri+'?='+query, id);

        parent.appendChild(link);
    }

    /**
     * Add base html element to document.
     */
    protected addBaseElement() {
        let base = this.pageDocument.createElement('base') as HTMLBaseElement;
        base.id = 'base';
        base.href = this.baseUrl;
        this.pageDocument.head.insertBefore(base, this.pageDocument.head.firstChild);
    }

    /**
     * Add needed links and scripts of specified css framework to document.
     */
    protected useFramework(name: string) {
        if ( ! name || name === 'none') return;
        this.createLink('link', 'css/framework.css', 'framework-css');
        this.createLink('script', 'js/jquery.min.js', 'jquery');
        this.createLink('script', 'js/framework.js', 'framework-js');
    }

    /**
     * Add font awesome icons link to the document.
     */
    protected addIconsLink() {
        const link = DomHelpers.createLink('https://maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css', 'font-awesome');
        this.pageDocument.head.appendChild(link);
    }

    /**
     * Trim whitespace from specified markup string.
     */
    protected trim(string: string) {
        return (string || '').trim();
    }
}
