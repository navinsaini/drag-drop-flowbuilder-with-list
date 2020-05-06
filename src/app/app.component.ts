import {
  Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, Renderer2,
  ViewChildren, QueryList
} from '@angular/core';
import { moveItemInArray, CdkDragDrop, CdkDragEnter, CdkDragEnd, CdkDragMove, CdkDragExit } from '@angular/cdk/drag-drop';

enum mouseButtons {
  none = 0,
  left = 1,
  right = 2
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  isGraphStable = false;
  transformInteractiveZoneClassName = "transform-interactive-zone";
  transformParams: any = {
    scale: 1,
    dx: 0,
    dy: 0,
    isTranslating: false
  }
  translateStartX: any = 0;
  translateStartY: any = 0;
  transformScale: any = 0;

  maxWidth: number = 0;
  maxHeight: number = 0;
  prevHeight: number = 0;

  records: any = [];
  displayRecords: any = [];

  @ViewChild('transformableElm', { static: false }) transformableViewRef: ElementRef;
  @ViewChild('rootElm', { static: false }) viewRootElement: ElementRef;
  @ViewChild('boundryElm', { static: false }) contentBoundaryElement: ElementRef;
  @ViewChild('targetElm', { static: false }) transformTargetElement: ElementRef;
  @ViewChild('boundryCornerElm', { static: false }) boundryCornerElement: ElementRef;
  @ViewChildren('allNodes') allNodes: QueryList<any>;

  svgElements: any;
  constructor(
    private cd: ChangeDetectorRef,
    private renderer: Renderer2
  ) {

  }

  ngOnInit() {

  }

  initData() {
    // this.addNewRecord(null);
    this.records = [{ "id": 1588143084383, "connectedTo": null, "title": "Record 1", "width": "300px", "height": "100px" }, { "id": 1588143089397, "connectedTo": 1588143084383, "title": "Record 2", "width": "300px", "height": "100px" }, { "id": 1588143090119, "connectedTo": 1588143084383, "title": "Record 3", "width": "300px", "height": "100px" }, { "id": 1588143090864, "connectedTo": 1588143084383, "title": "Record 4", "width": "300px", "height": "100px" }, { "id": 1588143092580, "connectedTo": 1588143090864, "title": "Record 5", "width": "300px", "height": "100px" }, { "id": 1588143093317, "connectedTo": 1588143090119, "title": "Record 6", "width": "300px", "height": "100px" }, { "id": 1588143094234, "connectedTo": 1588143089397, "title": "Record 7", "width": "300px", "height": "100px" }, { "id": 1588143098712, "connectedTo": 1588143092580, "title": "Record 8", "width": "300px", "height": "100px" }, { "id": 1588143099662, "connectedTo": 1588143093317, "title": "Record 9", "width": "300px", "height": "100px" }, { "id": 1588143102046, "connectedTo": 1588143094234, "title": "Record 10", "width": "300px", "height": "100px" }];
    this.onDisplayRecords();
  }

  addNewRecord(connectedTo) {
    let height = 100;// Math.floor(Math.random() * (300 - 150 + 1) + 150);
    this.records.push({
      id: new Date().getTime(),
      connectedTo: connectedTo,
      title: "Record " + (this.records.length + 1),
      width: '300px',
      height: `${height}px`
    })
    this.onDisplayRecords();
  }

  onAddNew(id) {
    this.addNewRecord(id);
  }

  onDeleteNode(id) {
    let index = -1;
    for (var i = 0; i < this.records.length; i++) {
      if (this.records[i].id === id) {
        index = i;
        break;
      }
    }
    if (index >= 0) {
      //attach connected records to parent record of deleted record
      let record = this.records[index];
      let pIndex = this.records.findIndex(item => item.id == record.connectedTo);
      let records = this.records.filter(item => item.connectedTo === record.id);
      records.forEach(item => {
        item.connectedTo = this.records[pIndex].id;
      });

      //remove record from array
      for (var i = 0; i < records.length; i++) {
        let _index = this.records.findIndex(item => item.id === records[i].id);
        this.records.splice(_index, 1);
      }
      this.records.splice(index, 1, ...records);
      this.onDisplayRecords();
    }
  }

  onDisplayRecords() {
    this.prevHeight = 0;
    this.maxHeight = 0;
    this.maxWidth = 0;
    let displayRecords = [];
    this.cd.detectChanges();
    let { scrollLeft, scrollTop } = this.viewRootElement.nativeElement;

    var recordsObj = {};
    const defaultKey = "initial";
    this.records.forEach(record => {
      let connectedTo = record.connectedTo === null ? defaultKey : record.connectedTo;
      if (recordsObj.hasOwnProperty(connectedTo)) {
        recordsObj[connectedTo].push(record);
      } else {
        recordsObj[connectedTo] = [record];
      }
    })

    displayRecords.push(recordsObj[defaultKey]);
    for (var i = 0; i < displayRecords.length; i++) {
      for (var j = 0; j < displayRecords[i].length; j++) {
        var record = displayRecords[i][j];
        let _records = recordsObj[record.id];
        if (_records && _records.length) {
          const next = i + 1;
          if (displayRecords[next]) {
            displayRecords[next] = [...displayRecords[next], ..._records];
          } else {
            displayRecords.push(_records);
          }
        }
      }
    }
    this.displayRecords = displayRecords;

    this.cd.detectChanges();
    this.viewRootElement.nativeElement.scrollLeft = scrollLeft;
    this.viewRootElement.nativeElement.scrollTop = scrollTop;
    this.cd.detectChanges();
    this.renderNodes();
    this.fnRenderEdges();
  }

  onDragMove(event: CdkDragMove<any>) {
    const scale = this.transformParams.scale;
    const prevElms = document.getElementsByClassName("cdk-drag-preview");
    event.source.element.nativeElement.style.transform = `scale(${scale})`;
    if (prevElms.length) {
      const prevElm = prevElms.item(0) as HTMLElement;
      const prevNode = prevElm.children.item(0) as HTMLElement
      const left = (parseInt(prevNode.style.width) / 2) * (scale - 1);
      const top = (parseInt(prevNode.style.height) / 2) * (scale - 1);
      prevNode.style.transform = `translate3d(${left}px,${top}px,0px) scale(${scale})`;
    }
  }

  onDragEnter(event: CdkDragEnter<any>) {
    setTimeout(function () {
      const IoffsetLeft = parseInt(event.item.element.nativeElement.getAttribute("data-left"));
      const IoffsetTop = parseInt(event.item.element.nativeElement.getAttribute("data-top"));
      const CoffsetLeft = parseInt(event.container.element.nativeElement.style.left);
      const CoffsetTop = parseInt(event.container.element.nativeElement.style.top);
      const left = IoffsetLeft - CoffsetLeft;
      const top = IoffsetTop - CoffsetTop;
      const childrens = event.container.element.nativeElement.children;
      for (var i = 0; i < childrens.length; i++) {
        const node = childrens[i] as HTMLElement;
        node.style.transform = `translate3d(${left}px,${top}px,0px)`;
      }
    })
  }

  onDrop(event: CdkDragDrop<any[]>, item) {
    if (event.container.id === event.previousContainer.id || !event.isPointerOverContainer)
      return;
    let data = event.item.data;
    this.moveElementsInArray(data, item);
  }

  moveElementsInArray(dragItem, dropItem) {
    let dragIndex = this.records.findIndex(item => item.id === dragItem.id);
    let dropIndex = this.records.findIndex(item => item.id === dropItem.id);
    this.records.splice(dragIndex, 1, { ...dropItem, connectedTo: dragItem.connectedTo });
    this.records.splice(dropIndex, 1, { ...dragItem, connectedTo: dropItem.connectedTo });
    this.records.forEach(record => {
      if (record.connectedTo === dragItem.id) {
        record.connectedTo = dropItem.id;
      }
      else if (record.connectedTo === dropItem.id) {
        record.connectedTo = dragItem.id;
      }
    })
    this.onDisplayRecords();
  }

  ngAfterViewInit() {
    this.allNodes.changes.subscribe(() => {
      this.fnRenderEdges();
    })
    this.initData();
    this.onPageLoad();
  }

  edgeTimer: any;
  fnRenderEdges() {
    let component = this;
    if (this.svgElements) {
      this.renderer.removeChild(this.transformTargetElement.nativeElement, this.svgElements);
      this.svgElements = null;
    }
    clearTimeout(component.edgeTimer);
    this.edgeTimer = setTimeout(function () {
      component.renderEdges();
    }, 0)
  }

  renderEdges() {
    let { scrollLeft, scrollTop } = this.viewRootElement.nativeElement;
    this.svgElements = this.renderer.createElement("div");
    this.renderer.appendChild(this.transformTargetElement.nativeElement, this.svgElements);
    var nodes = this.allNodes.toArray();
    for (var i = 0; i < nodes.length; i++) {
      const sPosition = this.getEdgeStartPosition(nodes, i);
      const ePosition = this.getEdgeEndPosition(nodes, i);
      const sx = (scrollLeft + sPosition.left + (sPosition.width / 2)) / this.transformParams.scale;
      const sy = (scrollTop + sPosition.top + sPosition.height) / this.transformParams.scale;
      if (ePosition) {
        const ex = (scrollLeft + ePosition.left + (ePosition.width / 2)) / this.transformParams.scale;
        const ey = (scrollTop + ePosition.top) / this.transformParams.scale;

        if (sx === ex) {
          this.renderStraightLine(sx, sy, ex, ey);
        } else {
          this.renderCurveLine(sx, sy, ex, ey);
        }
      }
    }
  }

  getEdgeStartPosition(nodes, index) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[index].nodeProps.connectedTo == nodes[i].nodeProps.id) {
        return nodes[i].el.nativeElement.getBoundingClientRect();
      }
    }
    return nodes[index].el.nativeElement.getBoundingClientRect();
  }

  getEdgeEndPosition(nodes, index) {
    if (nodes[index].nodeProps.connectedTo != null) {
      return nodes[index].el.nativeElement.getBoundingClientRect();
    }
  }

  renderStraightLine(sx, sy, ex, ey) {
    var path = `M${sx},${sy} L${ex},${ey}`;
    this.renderPath(path)
  }

  renderCurveLine(sx, sy, ex, ey) {
    var cy = sy + (ey - sy) / 2;
    var path = `M${sx},${sy} C${sx},${cy} ${ex},${cy} ${ex},${ey}`;
    this.renderPath(path)
  }

  renderPath(path) {
    const svg = this.renderer.createElement("svg", "svg");
    this.renderer.setAttribute(svg, "class", "paths");
    this.renderer.setAttribute(svg, "xmlns", "http://www.w3.org/2000/svg");
    const svgPath = this.renderer.createElement('path', 'svg');
    this.renderer.setAttribute(svgPath, "class", `path`);
    this.renderer.setAttribute(svgPath, "d", path);
    this.renderer.appendChild(svg, svgPath);
    this.renderer.appendChild(this.svgElements, svg);
    this.cd.detectChanges();
  }

  onHeight(event) {
    this.prevHeight = event.prevHeight;
    this.maxHeight = event.maxHeight;
    this.renderBoundaryCorner();
    this.cd.detectChanges();
  }

  renderNodes() {
    this.cd.detectChanges();
    let maxWidth = this.viewRootElement.nativeElement.clientWidth - 1;
    for (var i = 0; i < this.displayRecords.length; i++) {
      const item = this.displayRecords[i];
      let _width = (item.length * 300) + (item.length * 40);
      if (maxWidth < _width) {
        maxWidth = _width;
      }
    }
    this.prevHeight = 0;
    this.maxHeight = 0;
    this.maxWidth = maxWidth;
  }

  renderBoundaryCorner() {
    const nativeElement = this.boundryCornerElement.nativeElement;
    this.renderer.setStyle(nativeElement, "left", `${this.maxWidth}px`);
    this.renderer.setStyle(nativeElement, "top", `${this.maxHeight}px`);
    this.cd.detectChanges();
    this.updateView();
  }

  onPageLoad() {
    this.updateView();
    this.debouncedUpdate();
  }

  handleButtonAction(type) {
    switch (type) {
      case 'ZOOMIN':
        this.handleZoomIn();
        break;
      case 'RECENTER':
        this.handleZoomPanReset();
        break;
      case 'ZOOMOUT':
        this.handleZoomOut();
        break;
    }
  }

  handleZoomIn() {
    this.updateScale(.1);
  }

  handleZoomOut() {
    this.updateScale(-.1);
  }

  handleZoomPanReset() {
    this.resetPanAndZoom();
  }

  handleMouseDown(e) {
    this.translateStartX = e.clientX;
    this.translateStartY = e.clientY;

    if (this.canTranslateTarget(e)) {
      this.translateStartX = e.clientX;
      this.translateStartY = e.clientY
      this.setTranslationState(true);
    }
  }

  handleMouseMove(e) {
    if (this.transformParams.isTranslating) {
      if (e.buttons === mouseButtons.left) {
        e.preventDefault();
        this.transformParams.dx = this.translateStartX - e.clientX;
        this.transformParams.dy = this.translateStartY - e.clientY;
        this.translateStartX = e.clientX;
        this.translateStartY = e.clientY;
        this.updateView();
      } else {
        this.setTranslationState(false)
      }
    }
  }

  handleMouseUp(e) {
    this.setTranslationState(false);
  }

  handleMouseWheel(e) {
    if (e.ctrlKey) {
      e.preventDefault()
      this.updateScale(e.deltaY > 0 ? -.1 : .1);
    }
  }

  initTransformParams() {
    this.transformParams = {
      scale: 1,
      dx: 0,
      dy: 0,
      isTranslating: false
    }
    this.translateStartX = 0;
    this.translateStartY = 0;
    this.onScaleChanged(1)
  }

  updateScale(scale) {
    var _scale = this.transformParams.scale + scale;
    if (_scale >= .2 && _scale <= 3) {
      this.transformParams.scale = _scale;
      this.updateView();
      this.onScaleChanged(_scale);
    }
  }

  resetPanAndZoom() {
    this.initTransformParams();
    this.updateView();
  }

  onScaleChanged(scale) {
    this.transformScale = scale;
  }

  canTranslateTarget = function (e) {
    let component = this;
    var t = e.target,
      n = [];
    return "string" == typeof t.className && (n = t.className.split(" ")), n.some((function (e) {
      return e === component.transformInteractiveZoneClassName;
    }))
  }

  setTranslationState(isTranslating) {
    this.transformParams.dx = 0;
    this.transformParams.dy = 0;
    this.transformParams.isTranslating = isTranslating;
    if (isTranslating) {
      this.viewRootElement.nativeElement.classList.add("transform-translating");
    } else {
      this.viewRootElement.nativeElement.classList.remove("transform-translating");
    }
  }

  updateView() {
    this.updateTransformTarget();
    this.updateContentBoundary();
    this.updateViewRoot();
  }

  updateTransformTarget() {
    this.transformTargetElement.nativeElement.style.transformOrigin = "left top";
    this.transformTargetElement.nativeElement.style.transform = "scale(" + this.transformParams.scale + ")";
    this.cd.detectChanges();
  }

  updateContentBoundary() {
    this.contentBoundaryElement.nativeElement.style.width = this.transformTargetElement.nativeElement.scrollWidth * this.transformParams.scale + "px";
    this.contentBoundaryElement.nativeElement.style.height = this.transformTargetElement.nativeElement.scrollHeight * this.transformParams.scale + "px";
    this.cd.detectChanges();
  }

  updateViewRoot() {
    this.viewRootElement.nativeElement.scrollLeft += this.transformParams.dx;
    this.viewRootElement.nativeElement.scrollTop += this.transformParams.dy;
    this.cd.detectChanges();
  }


  debouncedUpdate() {
    this.isGraphStable = true;
    this.cd.detectChanges();
  }

  getSortedIncomingEdgeIds(id) {
    return [];
  }
}
