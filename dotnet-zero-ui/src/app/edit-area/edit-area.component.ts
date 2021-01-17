import { Component, OnInit, Output, EventEmitter, NgZone } from '@angular/core';
import { FileDto } from '../dto/file-dto';
import { D0Service } from '../services/d0.service';
import { of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-edit-area',
  templateUrl: './edit-area.component.html',
  styleUrls: ['./edit-area.component.scss']
})
export class EditAreaComponent implements OnInit {
  @Output() editorInit = new EventEmitter<any>();

  editorOptions = {theme: 'vs-dark', language: 'csharp', automaticLayout: true, readOnly: true};
  currentFile: FileDto;
  code: string;
  editor: monaco.editor.IStandaloneCodeEditor;

  constructor(private d0: D0Service, private zone: NgZone) { }

  ngOnInit() {
    this.d0.onTabChanged.subscribe(() => {
      if (this.d0.state.files.currentFileIndex != null) {
        this.currentFile = this.d0.state.files.openedFiles[this.d0.state.files.currentFileIndex];
        this.code = this.currentFile.tempContent == null ? '' : this.currentFile.tempContent.toString();
      } else {
        this.currentFile = null;
        this.code = '';
      }
    });
  }

  onEditorFinishedLoading(event: any) {
    this.editor = event;
    this.editorInit.emit(event);
    this.editorOptions.readOnly = false;
    this.editor.updateOptions(this.editorOptions);
    // tslint:disable-next-line: no-string-literal
    const m: any = window['monaco'];
    m.languages.registerCompletionItemProvider('csharp', {
      provideCompletionItems: (model: monaco.editor.ITextModel, position: monaco.IPosition) => {
        const index = model.getOffsetAt(position);
        return new Promise<monaco.languages.CompletionList>((resolve, reject) => {
          this.d0.getCompletions(this.currentFile, index).subscribe(cl => {
            console.log(cl);
            resolve(cl);
          }, e => {
            reject(e);
          });
        });
      }});
    this.editor.onDidChangeModelContent(() => {
      if (this.currentFile == null) {
        return;
      }
      this.zone.run(() => {
        this.d0.updateFileTempContent(this.currentFile, this.code.toString());
      });
    });

    // tslint:disable-next-line: no-bitwise
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
      if (this.currentFile == null) {
        return;
      }
      this.zone.run(() => {
        this.d0.updateFileContent(this.currentFile);
        this.d0.updateFile(this.currentFile);
      });
    });
  }
}
