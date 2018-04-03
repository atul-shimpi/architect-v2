import {Component, ViewEncapsulation} from '@angular/core';
import {LivePreview} from "../../live-preview.service";
import {LayoutPanel} from "../layout-panel/layout-panel.service";
import {Inspector} from "../inspector.service";
import {UploadFileModalComponent} from "vebto-client/core/files/upload-file-modal/upload-file-modal.component";
import {Modal} from "vebto-client/core/ui/modal.service";
import {ActiveProject} from "../../projects/active-project";
import {LinkEditor} from "../../live-preview/link-editor/link-editor.service";
import {Elements} from "../../elements/elements.service";
import {SelectedElement} from "../../live-preview/selected-element.service";

@Component({
    selector: 'inspector-panel',
    templateUrl: './inspector-panel.component.html',
    styleUrls: ['./inspector-panel.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class InspectorPanelComponent {

    /**
     * InspectorPanelComponent Constructor.
     */
    constructor(
        public livePreview: LivePreview,
        public selected: SelectedElement,
        private layout: LayoutPanel,
        private inspector: Inspector,
        private modal: Modal,
        private activeProject: ActiveProject,
        private linkEditor: LinkEditor,
        private elements: Elements,
    ) {}

    /**
     * Check if specified property/style of this element can be modified.
     */
    public canModify(property: string) {
        return this.livePreview.selected.canModify(property);
    }

    /**
     * Open layout panel for currently selected element.
     */
    public openLayoutPanel() {
        this.layout.selectRowAndContainerUsing(this.livePreview.selected.node);
        this.inspector.openPanel('layout');
    }

    public openUploadImageModal() {
        const data = {uri: 'uploads/images', httpParams: {path: this.activeProject.getBaseUrl(true)+'images'}};
        this.modal.open(UploadFileModalComponent, data).afterClosed().subscribe(url => {
            if ( ! url) return;
            this.livePreview.selected.node['src'] = url;
        });
    }

    /**
     * Open link editor modal.
     */
    public openLinkEditorModal() {
        this.linkEditor.open(this.livePreview.selected.node as HTMLLinkElement);
    }

    /**
     * Check if currently selected node is column, row or container.
     */
    public selectedIsLayout(): boolean {
        return this.livePreview.selected.isLayout();
    }

    /**
     * Check if currently selected node is an image.
     */
    public selectedIsImage(): boolean {
        return this.livePreview.selected.isImage;
    }

    /**
     * Check if currently selected node is a link.
     */
    public selectedIsLink(): boolean {
        return this.elements.isLink(this.livePreview.selected.node);
    }
}
