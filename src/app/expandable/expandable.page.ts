
import { Component, AfterViewInit, Input, ViewChild,  ElementRef, Renderer2 } from "@angular/core";

@Component({
  selector: 'app-expandable',
  templateUrl: './expandable.page.html',
  styleUrls: ['./expandable.page.scss'],
})
export class ExpandablePage  implements AfterViewInit {
  @ViewChild("expandWrapper", { read: ElementRef, static: false }) expandWrapper: ElementRef;
  @Input("expanded") expanded: boolean = false;
  // @Input("expandHeight") expandHeight: string = "500px";

  constructor(public renderer: Renderer2) {}

  ngAfterViewInit() {
    // this.renderer.setStyle(this.expandWrapper.nativeElement, "max-height", this.expandHeight);
  }
}