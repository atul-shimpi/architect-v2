import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {CoreModule} from 'vebto-client/core/core.module';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {AuthModule} from 'vebto-client/auth/auth.module';
import {AccountSettingsModule} from 'vebto-client/account-settings/account-settings.module';
import {SharedModule} from './shared/shared.module';
import {DashboardModule} from './dashboard/dashboard.module';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {WildcardRoutingModule} from "vebto-client/core/wildcard-routing.module";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CoreModule.forRoot(),
        AppRoutingModule,
        AuthModule,
        DashboardModule,
        AccountSettingsModule,
        SharedModule,
        WildcardRoutingModule,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
