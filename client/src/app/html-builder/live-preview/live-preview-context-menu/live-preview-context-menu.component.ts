import {Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatMenuTrigger} from "@angular/material";
import {UndoManager} from "../../undo-manager/undo-manager.service";
import {SelectedElement} from "../selected-element.service";
import {BuilderDocument} from "../../builder-document.service";
import {CodeEditor} from "../code-editor/code-editor.service";

@Component({
    selector: 'live-preview-context-menu',
    templateUrl: './live-preview-context-menu.component.html',
    styleUrls: ['./live-preview-context-menu.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class LivePreviewContextMenuComponent {
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
    @ViewChild('contextMenu') contextMenu;

    /**
     * LivePreviewContextMenuComponent Constructor.
     */
    constructor(
        public undoManager: UndoManager,
        private codeEditor: CodeEditor,
        private builderDocument: BuilderDocument,
        public selected: SelectedElement,
    ) {}

    public remove() {
        this.builderDocument.actions.removeNode(this.selected.node);
    }

    public undo() {
        this.undoManager.undo();
    }

    public redo() {
        this.undoManager.redo();
    }

    public copy() {
        this.builderDocument.actions.copyNode(this.selected.node);
    }

    public cut() {
        this.builderDocument.actions.cutNode(this.selected.node);
    }

    public paste() {
        this.builderDocument.actions.pasteNode(this.selected.node);
    }

    public canPaste() {
        return this.builderDocument.actions.copiedNode;
    }

    public duplicate() {
        this.builderDocument.actions.duplicateNode(this.selected.node);
    }

    public selectParent() {
        this.selected.selectParent();
    }

    public canSelectParent() {
        return this.selected.canSelectParent();
    }

    public canSelectChild() {
        return this.selected.canSelectChild();
    }

    public selectChild() {
        this.selected.selectFirstChild();
    }

    public viewSourceCode() {
        this.codeEditor.open().subscribe(editor => {
            editor.selectNodeSource(this.selected.node);
        });
    }

    public move(direction: 'up'|'down') {
        this.builderDocument.actions.moveSelected(direction);
    }
}
