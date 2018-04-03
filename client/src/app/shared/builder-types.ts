import {Project} from './projects/Project';
export type BuilderPage = {name: string, html: string};

export type BuilderProject = {
    model: Project,
    pages: BuilderPage[],
    css: string,
    js: string,
    template: BuilderTemplate,
};

export class BuilderTemplate {
    name: string;
    js: string;
    css: string;
    thumbnail: string;
    pages: BuilderPage[];
    config: {
        libraries: string[],
        name: string,
        display_name?: string,
        color: string,
        category: string,
        theme: string,
        framework: string,
    };

    constructor(params: Object = {}) {
        for (let name in params) {
            this[name] = params[name];
        }
    }
}

export interface FtpDetails {
    host?: string,
    username?: string,
    password?: string,
    directory?: string,
    port?: number,
    ssl?: boolean,
}
