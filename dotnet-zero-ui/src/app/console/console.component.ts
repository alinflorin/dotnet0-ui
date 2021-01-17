import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { D0Service } from '../services/d0.service';
import { ConsoleMessageDto, ConsoleMessageType } from '../dto/console-message-dto';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent implements OnInit {
  @ViewChild('content', {static: true, read: ElementRef}) content: ElementRef<HTMLDivElement>;
  messages: ConsoleMessageDto[] = [];
  ConsoleMessageTypes = ConsoleMessageType;

  constructor(public d0: D0Service) { }

  ngOnInit() {
    this.d0.consoleStream.subscribe(m => {
      this.messages.push(m);
      setTimeout(() => {
        this.content.nativeElement.scrollTo({
          top: this.content.nativeElement.scrollHeight
        });
      });
    });
  }

  openFileByPath(path: string) {
    this.d0.openTabByFilePath(path);
  }
}
