import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Elements} from "../../elements/elements.service";

@Component({
    selector: 'elements-panel',
    templateUrl: './elements-panel.component.html',
    styleUrls: ['./elements-panel.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ElementsPanelComponent implements OnInit {

    public categories = ['components', 'layout', 'media', 'typography', 'buttons', 'forms'];

    constructor(private elements: Elements) {}

    ngOnInit() {

    }

    public getElementsForCategory(name: string) {
        return this.elements.getAll().filter(el => el.category === name);
    }

}
