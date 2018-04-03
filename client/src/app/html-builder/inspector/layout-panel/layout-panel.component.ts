import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {LayoutPanel} from "./layout-panel.service";
import {Container} from "./layout-panel-types";
import {Inspector} from "../inspector.service";
import {SelectedElement} from "../../live-preview/selected-element.service";
import {ContextBoxes} from "../../live-preview/context-boxes.service";
import {BuilderDocument} from "../../builder-document.service";

@Component({
    selector: 'layout-panel',
    templateUrl: './layout-panel.component.html',
    styleUrls: ['./layout-panel.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class LayoutPanelComponent implements OnInit {

    /**
     * LayoutPanelComponent Constructor.
     */
    constructor(
        private builderDocument: BuilderDocument,
        private selectedElement: SelectedElement,
        private contextBoxes: ContextBoxes,
        public layoutPanel: LayoutPanel,
        private inspector: Inspector
    ) {}

    ngOnInit() {
        this.builderDocument.contentChanged.subscribe(e => {
            if ( ! this.inspector.activePanelIs('layout')) return;
            this.layoutPanel.loadContainers();
        });

        //reload container once layout panel is opened
        this.inspector.panelChanged.subscribe(name => {
            if (name !== 'layout') return;
            this.layoutPanel.loadContainers();
        });
    }

    public openInspectorPanel(node: HTMLElement) {
        this.selectedElement.selectNode(node);
        this.inspector.togglePanel('inspector');
    }

    public cloneContainer(container: Container) {
        const cloned = this.builderDocument.actions.cloneNode(container.node);
        this.layoutPanel.selectContainer(cloned);
    }

    public cloneRow(row: HTMLElement) {
        const cloned = this.builderDocument.actions.cloneNode(row);
        this.layoutPanel.selectRow(cloned, true);
    }

    public removeItem(node: HTMLElement) {
        this.builderDocument.actions.removeNode(node);
    }

    public repositionHoverBox(node: HTMLElement) {
        this.contextBoxes.repositionBox('hover', node);
    }

    public hideHoverBox() {
        this.contextBoxes.hideBox('hover');
    }

    public containerIsSelected(container: Container): boolean {
        if ( ! this.layoutPanel.selectedContainer) return false;
        return this.layoutPanel.selectedContainer.node === container.node;
    }

    /**
     * Called when container panel is opened.
     */
    public onPanelOpen(container: Container) {
        this.layoutPanel.selectedContainer = container;

        if (container.rows.length) {
            this.layoutPanel.selectRow(container.rows[0]);
        }
    }

    /**
     * Check if specified node is selected in live preview.
     */
    public isSelected(node: HTMLElement) {
        return this.selectedElement.node === node;
    }

    /**
     * Get width percentage from specified column span.
     */
    public widthFromSpan(span: number): string {
        return ((span * 100) / 12) + '%';
    }
}
