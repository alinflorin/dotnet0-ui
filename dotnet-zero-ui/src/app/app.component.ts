import { Component, OnInit } from '@angular/core';
import { DotnetService } from './services/dotnet.service';
import { D0Service } from './services/d0.service';
import { MediaObserver } from '@angular/flex-layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  sidebarMode = 'side';

  constructor(public d0: D0Service, private dotnetService: DotnetService, private mo: MediaObserver) {
  }

  ngOnInit(): void {
    this.dotnetService.initialize().subscribe(() => {
      this.d0.dotnetFinishedLoading();
    });

    this.mo.asObservable().subscribe(mc => {
      if (mc[0].mqAlias === 'xs' || mc[0].mqAlias === 'sm') {
        this.sidebarMode = 'over';
      } else {
        this.sidebarMode = 'side';
      }
    });
  }

  onEditorInit() {
    this.d0.editorFinishedLoading();
  }
}
