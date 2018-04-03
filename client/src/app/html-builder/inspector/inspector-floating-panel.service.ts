import {ElementRef, Injectable} from '@angular/core';
import {Overlay, OverlayRef} from "@angular/cdk/overlay";
import {ComponentPortal, ComponentType} from "@angular/cdk/portal";
import {Observable} from "rxjs/Observable";

@Injectable()
export class InspectorFloatingPanel {

    /**
     * Overlay reference of currently open panel.
     */
    public overlayRef: OverlayRef;

    /**
     * Component reference of currently open panel.
     */
    private componentRef: any;

    /**
     * InspectorFloatingPanel Constructor.
     */
    constructor(private overlay: Overlay) {}

    public open<T>(component: ComponentType<T>, origin: ElementRef, config = {}): {selected: Observable<any>, closed: Observable<any>} {
        config = Object.assign({}, this.getDefaultConfig(), config);
        this.close();

        const strategy = this.overlay.position().connectedTo(
            origin,
            {originX: 'end', originY: 'center'},
            {overlayX: 'start', overlayY: 'center'}
        ).withFallbackPosition(
            {originX: 'end', originY: 'center'},
            {overlayX: 'start', overlayY: 'top'}
        ).withOffsetX(35);

        this.overlayRef = this.overlay.create({positionStrategy: strategy, hasBackdrop: true});

        this.overlayRef.backdropClick().subscribe(() => this.close());

        this.componentRef = this.overlayRef.attach(new ComponentPortal(component));

        this.componentRef.instance.closed.subscribe(() => {
            this.close();
        });

        this.componentRef.instance.selected.subscribe(()=> {
            if (config['closeOnSelected']) this.close();
        });

        return this.componentRef.instance;
    }

    public close() {
        this.overlayRef && this.overlayRef.dispose();

        if ( ! this.componentRef) return;

        if (this.componentRef.instance.closed) {
            this.componentRef.instance.closed.observers.forEach(observer => {
                observer.unsubscribe();
            });
        }

        if (this.componentRef.instance.selected) {
            this.componentRef.instance.selected.observers.forEach(observer => {
                observer.unsubscribe();
            });
        }
    }

    private getDefaultConfig() {
        return {
            closeOnSelected: true,
        }
    }
}
