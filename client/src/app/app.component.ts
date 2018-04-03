import {Component, ElementRef, NgZone, OnInit, ViewChild, ViewContainerRef, ViewEncapsulation} from '@angular/core';
import {ContextMenu} from "vebto-client/core/ui/context-menu/context-menu.service";
import {Settings} from "vebto-client/core/services/settings.service";
import {AppHttpClient} from "vebto-client/core/http/app-http-client.service";
import {CustomHomepage} from "vebto-client/core/services/custom-homepage.service";
import {VebtoConfig} from "vebto-client/core/vebto-config.service";
import {NavigationEnd, Router} from "@angular/router";
import {appConfig} from "./app-config";
import * as svg4everybody from 'svg4everybody';
import {filter} from "rxjs/operators/filter";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
    @ViewChild('contextMenuViewRef', {read: ViewContainerRef}) contextMenuViewRef;
    @ViewChild('contextMenuOrigin') contextMenuOrigin: ElementRef;

    constructor(
        private contextMenu: ContextMenu,
        private customHomepage: CustomHomepage,
        private settings: Settings,
        private httpClient: AppHttpClient,
        private vebtoConfig: VebtoConfig,
        private router: Router,
        private zone: NgZone,
    ) {}

    ngOnInit() {
        this.contextMenu.registerViewContainerRef(this.contextMenuViewRef, this.contextMenuOrigin);
        this.customHomepage.select();
        this.settings.setHttpClient(this.httpClient);

        this.vebtoConfig.merge(appConfig);

        this.setInjectorOnAppearanceEditorIframe();

        //svg icons polyfill
        svg4everybody();

        //google analytics
        if (this.settings.get('analytics.tracking_code')) {
            this.triggerAnalyticsPageView();
        }
    }

    private setInjectorOnAppearanceEditorIframe() {
        if (window.location.search.indexOf('token='+this.settings.csrfToken) > -1) {
            window['previewAngular'] = {settings: this.settings, router: this.router, zone: this.zone};
        }
    }

    private triggerAnalyticsPageView() {
        this.router.events
            .pipe(filter(e => e instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if ( ! window['ga']) return;
                window['ga']('set', 'page', event.urlAfterRedirects);
                window['ga']('send', 'pageview');
            });
    }
}
