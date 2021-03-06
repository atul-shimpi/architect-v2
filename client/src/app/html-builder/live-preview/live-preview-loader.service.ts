import {ElementRef, Injectable} from '@angular/core';

@Injectable()
export class LivePreviewLoader {
    private loader: ElementRef;
    private visible: boolean;

    constructor() {
    }

    public isVisible(): boolean {
        return this.visible;
    }

    public show() {
        this.visible = true;
    }

    public hide() {
        this.visible = false;
    }

    public setLoader(loader: ElementRef) {
        this.loader = loader;
    }

}
