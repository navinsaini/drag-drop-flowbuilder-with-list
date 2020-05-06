import {
    Component, OnInit, AfterViewInit, Input, ElementRef, Output,
    EventEmitter, OnChanges, ChangeDetectorRef, Renderer2, SimpleChange
} from '@angular/core';

@Component({
    selector: 'app-node',
    templateUrl: './node.component.html',
    styleUrls: ['./node.component.scss']
})
export class NodeComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() scale: number = 1;
    @Input() rowTotal: number = 0;
    @Input() pIndex: number = 0;
    @Input() cIndex: number = 0;
    @Input() maxWidth: number = 0;
    @Input() prevHeight: number = 0;
    @Input() nodeProps: any;
    @Output() onHeight = new EventEmitter();
    @Output() onAddNew = new EventEmitter();
    @Output() onDeleteNode = new EventEmitter();

    constructor(private el: ElementRef,
        private cd: ChangeDetectorRef,
        private renderer: Renderer2) {

    }

    ngOnInit() {
        this.cd.detectChanges();

    }
    ngAfterViewInit() {
        this.cd.detectChanges();
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (changes['maxWidth'] && changes['maxWidth'].previousValue != changes['maxWidth'].currentValue) {
            this.updateNodeLayout();
        }
        this.cd.detectChanges();
    }

    getLeft() {
        const width = 300;
        const center = this.maxWidth / 2;
        const margin = 40;
        const half = width / 2;
        if (this.rowTotal === 1) {
            return center - half;
        } else {
            const count = this.rowTotal / 2;
            const left = (count - this.cIndex) * width;
            if (Number.isInteger(count)) {
                if (this.cIndex === count - 1) {
                    return center - width - margin / 2;
                } else if (this.cIndex === count) {
                    return center + margin / 2;
                } else if (this.cIndex < count) {
                    return center - left - ((count - this.cIndex) * margin) + margin / 2;
                } else if (this.cIndex > count) {
                    return center - left - ((count - this.cIndex) * margin) + margin / 2;
                } else {
                    return center - half;
                }
            } else {
                if (this.cIndex === Math.floor(count)) {
                    return center - half;
                } else {
                    return center - left - ((Math.floor(count) - this.cIndex) * margin);
                }
            }
        }
    }

    updateNodeLayout() {
        const nativeElement = this.el.nativeElement;
        const parentElement = this.el.nativeElement.parentElement;
        let { width, height } = nativeElement.getBoundingClientRect();
        height = (height / this.scale);
        width = (width / this.scale);
        const left = this.getLeft();
        const top = this.prevHeight + (100 * (this.pIndex + 1));
        if (this.cIndex + 1 == this.rowTotal) {
            this.prevHeight += height;
        }
        this.onHeight.emit({ prevHeight: this.prevHeight, maxHeight: (height + top + 100) });
        this.renderer.setAttribute(nativeElement, "data-left", `${left}px`);
        this.renderer.setAttribute(nativeElement, "data-top", `${top}px`);
        this.renderer.setStyle(parentElement, "width", `${width}px`);
        this.renderer.setStyle(parentElement, "height", `${height}px`);
        this.renderer.setStyle(parentElement, "left", `${left}px`);
        this.renderer.setStyle(parentElement, "top", `${top}px`);
    }

    addNewBlock() {
        this.onAddNew.emit(this.nodeProps.id);
    }

    deleteBlock() {
        this.onDeleteNode.emit(this.nodeProps.id);
    }

}