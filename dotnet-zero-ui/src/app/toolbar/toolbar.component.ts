import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { D0Service } from '../services/d0.service';
import { FileDto } from '../dto/file-dto';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  currentFile: FileDto = null;

  constructor(public d0: D0Service, public loaderService: LoaderService) { }

  ngOnInit() {

  }

  toggleDrawer() {
    this.d0.toggleSidebar();
  }

  getFileName(name: string): string {
    if (name == null) {
      return name;
    }
    const split = name.split('/');
    return split[split.length - 1];
  }

  switchTab(i: number) {
    if (i == null) {
      return;
    }
    this.d0.changeTab(i);
  }

  closeTab(i: number, event: MouseEvent) {
    // tslint:disable-next-line: deprecation
    if (!event || event.which === 2) {
      this.d0.closeTab(i);
      if (event) {
        event.preventDefault();
      }
    }
  }

  navigateToHome() {
    window.location.href = '/';
  }
}
