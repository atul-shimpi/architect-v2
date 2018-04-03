import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from "vebto-client/auth/login/login.component";
import {GuestGuard} from "vebto-client/guards/guest-guard.service";

const routes: Routes = [
    {path: '', component: LoginComponent, canActivate: [GuestGuard]},
    {path: 'builder', loadChildren: 'app/html-builder/html-builder.module#HtmlBuilderModule'},
    {path: 'admin', loadChildren: 'app/admin/app-admin.module#AppAdminModule'},
    {path: 'billing', loadChildren: 'vebto-client/billing/billing.module#BillingModule'},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
