import {NgModule} from '@angular/core';
import {Templates} from './templates/templates.service';
import {Themes} from './themes/themes.service';
import {ProjectUrl} from './projects/project-url.service';
import {PublishProjectModalComponent} from './projects/publish-project-modal/publish-project-modal.component';
import {MaterialModule} from '../material.module';
import {CommonModule} from '@angular/common';
import {UiModule} from 'vebto-client/core/ui/ui.module';
import {FormsModule} from '@angular/forms';
import {DomHelpers} from './dom-helpers.service';
import {Projects} from "./projects/projects.service";

@NgModule({
    imports: [
        CommonModule,
        UiModule,
        FormsModule,
        MaterialModule,
    ],
    declarations: [
        PublishProjectModalComponent,
    ],
    entryComponents: [
        PublishProjectModalComponent,
    ],
    providers: [
        Templates,
        Themes,
        ProjectUrl,
        DomHelpers,
        Projects,
    ],
})
export class SharedModule {
}
