import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {AuthGuard} from "vebto-client/guards/auth-guard.service";
import {CheckPermissionsGuard} from "vebto-client/guards/check-permissions-guard.service";
import {AdminComponent} from "vebto-client/admin/admin.component";
import {SettingsComponent} from "vebto-client/admin/settings/settings.component";
import {SettingsResolve} from "vebto-client/admin/settings/settings-resolve.service";
import {vebtoSettingsRoutes} from "vebto-client/admin/settings/settings-routing.module";
import {vebtoAdminRoutes} from "vebto-client/admin/admin-routing.module";
import {TemplatesComponent} from './templates/templates.component';
import {ProjectsComponent} from './projects/projects.component';
import {BuilderSettingsComponent} from './settings/builder/builder-settings.component';

const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        canActivate: [AuthGuard, CheckPermissionsGuard],
        canActivateChild: [AuthGuard, CheckPermissionsGuard],
        data: {permissions: ['admin.access']},
        children: [
            {
                path: 'templates',
                component: TemplatesComponent,
                data: {permissions: ['templates.view']}
            },
            {
                path: 'projects',
                component: ProjectsComponent,
                data: {permissions: ['projects.view']}
            },
            {
                path: 'settings',
                component: SettingsComponent,
                resolve: {settings: SettingsResolve},
                data: {permissions: ['settings.view']},
                children: [
                    {
                        path: 'builder',
                        component: BuilderSettingsComponent,
                    },
                    ...vebtoSettingsRoutes,
                ],
            },
            ...vebtoAdminRoutes,
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppAdminRoutingModule {
}
