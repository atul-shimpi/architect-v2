import {Component, EventEmitter, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {LivePreview} from "../../../../live-preview.service";
import {Modal} from "vebto-client/core/ui/modal.service";
import {UploadFileModalComponent} from "vebto-client/core/files/upload-file-modal/upload-file-modal.component";
import {Settings} from "vebto-client/core/services/settings.service";
import {ActiveProject} from "../../../../projects/active-project";
import {BuilderDocumentActions} from "../../../../builder-document-actions.service";

@Component({
    selector: 'image-background-panel',
    templateUrl: './image-background-panel.component.html',
    styleUrls: ['./image-background-panel.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ImageBackgroundPanelComponent implements OnInit {

    /**
     * List for rendering textures panel.
     */
    public textures = new Array(28);

    /**
     * Model for "repeat" radio group.
     */
    public backgroundRepeat = 'no-repeat';

    /**
     * Model for "position" buttons.
     */
    public backgroundPosition = 'top left';

    /**
     * ImageBackgroundPanelComponent Constructor.
     */
    constructor(
        private livePreview: LivePreview,
        private modal: Modal,
        private settings: Settings,
        private activeProject: ActiveProject,
        private builderActions: BuilderDocumentActions,
    ) {}

    /**
     * Fired when gradient is selected.
     */
    @Output() public selected = new EventEmitter();

    /**
     * Fired when close button is clicked.
     */
    @Output() public closed = new EventEmitter();

    /**
     * Emit selected event.
     */
    public emitSelectedEvent(url: string) {
        this.selected.emit(url);
    }

    /**
     * Emit closed event.
     */
    public emitClosedEvent() {
        this.closed.emit();
    }

    ngOnInit() {
        this.backgroundRepeat = this.livePreview.selected.getStyle('backgroundRepeat');
        this.backgroundPosition = this.livePreview.selected.getStyle('backgroundPosition');
    }

    /**
     * Get absolute url for specified texture image.
     */
    public getTextureUrl(index: number): string {
        return this.settings.getAssetUrl()+'images/textures/'+index+'.png';
    }

    /**
     * Apply specified style to selected element.
     */
    public applyStyle(name: string, value: string) {
        this[name] = value;
        this.builderActions.applyStyle(this.livePreview.selected.node, name, value);
    }

    public uploadImage() {
        const data =  {uri: 'uploads/images', httpParams: {path: this.activeProject.getBaseUrl(true)+'images'}};
        this.modal.open(UploadFileModalComponent, data).afterClosed().subscribe(url => {
            this.emitSelectedEvent(url);
        });
    }
}
