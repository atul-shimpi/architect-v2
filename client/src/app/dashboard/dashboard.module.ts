import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UiModule} from 'vebto-client/core/ui/ui.module';
import {MaterialModule} from '../material.module';
import {DashboardRoutingModule} from './dashboard-routing.module';
import {SharedModule} from '../shared/shared.module';
import {DashboardComponent} from './dashboard.component';
import {NewProjectPageComponent} from './new-project-page/new-project-page.component';
import {NewProjectModalComponent} from './new-project-page/new-project-modal/new-project-modal.component';
import {ProjectsResolver} from './projects-resolver.service';
import {TemplatesResolver} from './new-project-page/templates-resolver.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        UiModule,
        DashboardRoutingModule,
        SharedModule,
    ],
    declarations: [
        DashboardComponent,
        NewProjectPageComponent,
        NewProjectModalComponent,
    ],
    entryComponents: [
        NewProjectModalComponent,
    ],
    providers: [
        ProjectsResolver,
        TemplatesResolver,
    ],
})
export class DashboardModule {
}
