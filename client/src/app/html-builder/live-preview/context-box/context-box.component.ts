import {Component, ElementRef, HostBinding, Input, ViewEncapsulation} from '@angular/core';
import {UploadFileModalComponent} from "vebto-client/core/files/upload-file-modal/upload-file-modal.component";
import {ContextBoxes} from "../context-boxes.service";
import {SelectedElement} from "../selected-element.service";
import {BuilderDocumentActions} from "../../builder-document-actions.service";
import {InlineTextEditor} from "../inline-text-editor/inline-text-editor.service";
import {Modal} from "vebto-client/core/ui/modal.service";
import {Inspector} from "../../inspector/inspector.service";
import {ActiveProject} from "../../projects/active-project";
import {LivePreview} from "../../live-preview.service";
import {Elements} from "../../elements/elements.service";
import {LinkEditor} from "../link-editor/link-editor.service";

@Component({
    selector: 'context-box',
    templateUrl: './context-box.component.html',
    styleUrls: ['./context-box.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ContextBoxComponent {

    @Input('type') type: 'selected'|'hover';

    @HostBinding('class.selected-box') get c1() {
        return this.type === 'selected';
    }

    @HostBinding('class.hover-box') get c2() {
        return this.type === 'hover';
    }

    /**
     * ContextBoxComponent Constructor.
     */
    constructor(
        public livePreview: LivePreview,
        private builderActions: BuilderDocumentActions,
        private selectedElement: SelectedElement,
        private inspector: Inspector,
        private modal: Modal,
        private activeProject: ActiveProject,
        private contextBoxes: ContextBoxes,
        private inlineTextEditor: InlineTextEditor,
        public el: ElementRef,
        private elements: Elements,
        private linkEditor: LinkEditor,
    ) {}

    /**
     * Get display name of specified node.
     */
    public getDisplayName() {
        const el = this.livePreview[this.type];
        return this.livePreview.getElementDisplayName(el.element, el.node);
    }

    /**
     * Delete node of specified type.
     */
    public deleteNode() {
        this.builderActions.removeNode(this.livePreview[this.type].node);
    }

    /**
     * Edit node of specified type.
     */
    public editNode() {
        const node = this.livePreview[this.type].node;

        if (this.elements.isLayout(node)) {
            this.inspector.openPanel('layout');
        } else if (this.elements.isImage(node)) {
            this.openUploadImageModal();
        } else if (this.elements.isLink(node)) {
            this.linkEditor.open(node as HTMLLinkElement);
        } else {
            if (this.elements.canModifyText(this.elements.match(node))) {
                this.contextBoxes.hideBoxes();
                this.inlineTextEditor.open(node);
            }
        }
    }

    private openUploadImageModal() {
        const data = {uri: 'uploads/images', httpParams: {path: this.activeProject.getBaseUrl(true)+'images'}};
        this.modal.open(UploadFileModalComponent, data).afterClosed().subscribe(url => {
            if ( ! url) return;
            this.livePreview[this.type].node['src'] = url;
        });
    }
}
