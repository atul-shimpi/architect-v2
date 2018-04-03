import {Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {Inspector} from "./inspector.service";
import {UndoManager} from "../undo-manager/undo-manager.service";
import {CodeEditor} from "../live-preview/code-editor/code-editor.service";
import {ActiveProject} from "../projects/active-project";
import {Toast} from "vebto-client/core/ui/toast.service";
import {Settings} from "vebto-client/core/services/settings.service";
import {DeviceSwitcherComponent} from "./device-switcher/device-switcher.component";
import {ContextBoxes} from "../live-preview/context-boxes.service";
import {Modal} from "vebto-client/core/ui/modal.service";
import {Projects} from '../../shared/projects/projects.service';
import {CurrentUser} from 'vebto-client/auth/current-user';
import {PublishProjectModalComponent} from '../../shared/projects/publish-project-modal/publish-project-modal.component';

@Component({
    selector: 'inspector',
    templateUrl: './inspector.component.html',
    styleUrls: ['./inspector.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class InspectorComponent implements OnInit {
    @ViewChild('deviceSwitcher') private deviceSwitcher: DeviceSwitcherComponent;

    /**
     * InspectorComponent Constructor.
     */
    constructor(
        public inspector: Inspector,
        public undoManager: UndoManager,
        private codeEditor: CodeEditor,
        private projects: Projects,
        public activeProject: ActiveProject,
        private toast: Toast,
        private el: ElementRef,
        private settings: Settings,
        private contextBoxes: ContextBoxes,
        private modal: Modal,
        public currentUser: CurrentUser,
    ) {}

    ngOnInit() {
        this.codeEditor.setOrigin(this.el);
        this.inspector.elementRef = this.el;

        this.el.nativeElement.addEventListener('mouseenter', (e) => {
            this.contextBoxes.hideBox('hover');
        });
    }

    /**
     * Toggle code editor visibility.
     */
    public toggleCodeEditor() {
        this.codeEditor.toggle();
    }

    /**
     * Save project on the server.
     */
    public saveProject() {
        this.activeProject.save().subscribe(() => {
            this.toast.open('Project saved');
        });
    }

    /**
     * Open modal for publishing currently active project.
     */
    public openPublishProjectModal() {
        this.modal.open(PublishProjectModalComponent, {project: this.activeProject.get().model});
    }

    /**
     * Open active project preview in new window.
     */
    public openPreview() {
        this.activeProject.save().subscribe(() => {
            window.open(this.activeProject.getSiteUrl(), '_blank');
        });
    }

    /**
     * Toggle visibility of device switcher panel.
     */
    public toggleDeviceSwitcher() {
        this.deviceSwitcher.toggleVisibility();
    }

    /**
     * Initiate download of currently active project.
     */
    public downloadProject() {
        this.activeProject.save({thumbnail: false}).subscribe(() => {
            window.open(this.settings.getBaseUrl(true)+'secure/projects/'+this.activeProject.get().model.id+'/download', '_blank');
        });
    }
}
