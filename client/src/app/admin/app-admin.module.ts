import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ProjectsComponent} from './projects/projects.component';
import {CrupdateProjectModalComponent} from './projects/crupdate-project-modal/crupdate-project-modal.component';
import {AdminModule} from 'vebto-client/admin/admin.module';
import {BuilderSettingsComponent} from './settings/builder/builder-settings.component';
import {CrupdateTemplateModalComponent} from './templates/crupdate-template-modal/crupdate-template-modal.component';
import {TemplatesComponent} from './templates/templates.component';
import {AppAdminRoutingModule} from './app-admin-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AppAdminRoutingModule,
        AdminModule,
    ],
    declarations: [
        TemplatesComponent,
        CrupdateTemplateModalComponent,
        ProjectsComponent,
        CrupdateProjectModalComponent,
        BuilderSettingsComponent,
    ],
    entryComponents: [
        CrupdateTemplateModalComponent,
        CrupdateProjectModalComponent,
    ]
})
export class AppAdminModule {
}
