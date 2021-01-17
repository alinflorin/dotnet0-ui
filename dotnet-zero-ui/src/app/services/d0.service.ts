import { Injectable } from '@angular/core';
import { DotnetService } from './dotnet.service';
import { FileDto } from '../dto/file-dto';
import { D0State } from '../dto/state';
import { SolutionDto } from '../dto/solution-dto';
import { SolutionItem, SolutionItemType } from '../dto/solution-item';
import { ProjectDto } from '../dto/project-dto';
import { of, Subject, throwError } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { ConsoleMessageDto, ConsoleMessageType } from '../dto/console-message-dto';
import { ConfigDto } from '../dto/config-dto';
import { ResultDto } from '../dto/result-dto';

@Injectable({
  providedIn: 'root'
})
export class D0Service {

  private onTabChangedSubject = new Subject<number>();
  private onSolutionOpenedSubject = new Subject<SolutionDto>();
  private consoleStreamSubject = new Subject<ConsoleMessageDto>();

  private stateObj: D0State = {
    isDotnetLoaded: false,
    isEditorLoaded: false,
    isSidebarVisible: true,
    isConsoleVisible: true,
    files: {
      openedFiles: []
    },
    debug: {
      isBuilt: false,
      isRunning: false
    }
  };

  constructor(private dotnetService: DotnetService) {

  }

  get state() {
    return this.stateObj;
  }

  get onTabChanged() {
    return this.onTabChangedSubject.asObservable();
  }

  get onSolutionOpened() {
    return this.onSolutionOpenedSubject.asObservable();
  }

  get consoleStream() {
    return this.consoleStreamSubject.asObservable();
  }

  toggleSidebar() {
    this.stateObj.isSidebarVisible = !this.stateObj.isSidebarVisible;
  }

  dotnetFinishedLoading() {
    this.stateObj.isDotnetLoaded = true;
  }

  editorFinishedLoading() {
    this.stateObj.isEditorLoaded = true;
  }

  openTabByFilePath(path: string) {
    this.openTab(this.findFileByPath(path));
  }

  openTab(file: FileDto) {
    this.loadFileContent(file).subscribe(f => {
      if (f.content != null) {
        f.tempContent = f.content.toString();
      } else {
        f.tempContent = null;
      }
      this.stateObj.files.openedFiles.push(f);
      this.stateObj.files.openedFiles = this.stateObj.files.openedFiles.filter((value, index, self) =>
        self.findIndex(x => x.id === value.id) === index);
      this.stateObj.files.currentFileIndex = this.stateObj.files.openedFiles.findIndex(x => x.id === f.id);
      this.onTabChangedSubject.next(this.stateObj.files.currentFileIndex);
    });
  }

  closeTab(i: number) {
    const theFile = this.stateObj.files.openedFiles[i];
    this.unselectFile(theFile);
    this.stateObj.files.openedFiles.splice(i, 1);
    let newIndex: number = null;
    if (this.stateObj.files.openedFiles.length > 0) {
      if (this.stateObj.files.openedFiles[i] != null) {
        newIndex = i;
      } else {
        newIndex = i - 1;
      }
    }
    this.stateObj.files.currentFileIndex = newIndex;
    this.onTabChangedSubject.next(this.stateObj.files.currentFileIndex);
  }

  changeTab(i: number) {
    this.stateObj.files.currentFileIndex = i;
    this.onTabChangedSubject.next(this.stateObj.files.currentFileIndex);
  }

  newSolution(config: ConfigDto) {
    this.dotnetService.invoke<SolutionDto>('InitSolution', config).subscribe(s => {
      this.stateObj.solution = s;
      this.stateObj.explorerModel = [this.buildExplorerModel(s)];
      this.onSolutionOpenedSubject.next(s);
    });
  }

  loadFileContent(file: FileDto) {
    if (file.hasBeenLoaded) {
      return of(file);
    }
    return this.dotnetService.invoke<FileDto>('GetFileContent', file.projectId, file.id).pipe(map(f => {
      file.hasBeenLoaded = true;
      file.content = f.content;
      if (file.content != null) {
        file.tempContent = file.content.toString();
      }
      return file;
    }));
  }

  updateFile(file: FileDto) {
    this.dotnetService.invoke<FileDto>('UpdateFile', file).subscribe(nf => {
      file.id = nf.id;
    });
  }

  updateFileTempContent(file: FileDto, newCode: string) {
    file.tempContent = newCode;
  }

  updateFileContent(file: FileDto) {
    file.content = file.tempContent;
  }

  unselectAllFiles() {
    this.stateObj.explorerModel.forEach(s => {
      this.unselectNode(s);
    });
  }

  unselectFile(file: FileDto) {
    const foundNode = this.findSolutionItemByFile(file);
    if (foundNode != null) {
      foundNode.isSelected = false;
    }
  }

  buildAndRun() {
    this.build(() => {
      this.run();
    });
  }

  build(successCb: () => void = null) {
    this.dotnetService.invoke<ResultDto>('Build').subscribe(r => {
      if (r.success) {
        this.stateObj.debug.isBuilt = true;
        this.consoleStreamSubject.next({
          message: 'Build successful',
          type: ConsoleMessageType.Info
        });
        successCb();
      } else {
        this.consoleStreamSubject.next({
          message: 'Build failed',
          type: ConsoleMessageType.Error
        });
      }
      if (r.consoleMessages != null) {
        r.consoleMessages.forEach(err => {
          this.consoleStreamSubject.next(err);
        });
      }
    }, e => {
      this.stateObj.debug.isBuilt = false;
      this.consoleStreamSubject.next({
        message: 'Build failed',
        type: ConsoleMessageType.Error
      });
      this.consoleStreamSubject.next({
        message: e.toString(),
        type: ConsoleMessageType.Error
      });
    });
  }

  run() {
    this.stateObj.debug.isRunning = true;
    this.dotnetService.invoke<ResultDto>('Run').subscribe(r => {
      this.stateObj.debug.isRunning = false;
      if (r.success) {
        this.consoleStreamSubject.next({
          message: 'Ran successfully',
          type: ConsoleMessageType.Info
        });
      } else {
        this.consoleStreamSubject.next({
          message: 'Run failed',
          type: ConsoleMessageType.Error
        });
      }
      if (r.consoleMessages != null) {
        r.consoleMessages.forEach(err => {
          this.consoleStreamSubject.next(err);
        });
      }
    }, e => {
      this.stateObj.debug.isRunning = false;
      this.consoleStreamSubject.next({
        message: 'Run failed',
        type: ConsoleMessageType.Error
      });
      this.consoleStreamSubject.next({
        message: e.toString(),
        type: ConsoleMessageType.Error
      });
    });
  }

  closeConsole() {
    this.stateObj.isConsoleVisible = false;
  }

  openConsole() {
    this.stateObj.isConsoleVisible = true;
  }

  getCompletions(file: FileDto, index: number) {
    return this.dotnetService.invoke<monaco.languages.CompletionList>('GetCompletions', file.projectId, file.id, index,
      file.tempContent == null || file.tempContent.length === 0 ? file.content : file.tempContent);
  }

  private unselectNode(node: SolutionItem<any>) {
    node.isSelected = false;
    if (node.children != null) {
      node.children.forEach(c => {
        this.unselectNode(c);
      });
    }
  }

  private buildExplorerModel(s: SolutionDto): SolutionItem<SolutionDto> {
    const result = {
      data: s,
      children: [],
      name: s.name,
      type: SolutionItemType.Solution
    };

    if (s.projects != null) {
      for (const p of s.projects) {
        const proj = {
          data: p,
          parent: result,
          name: p.name,
          type: SolutionItemType.Project,
          children: null
        } as SolutionItem<ProjectDto>;

        if (p.files != null) {
          proj.children = this.generateFoldersAndFiles(p.files, proj);
        }

        result.children.push(proj);
      }
    }

    return result;
  }

  private generateFoldersAndFiles(files: FileDto[], root: SolutionItem<ProjectDto>): SolutionItem<any>[] {
    let result: SolutionItem<any>[] = [];
    for (const f of files) {
      const splitPath = f.path.split('/');
      const fileItem = {
        data: f,
        name: splitPath[splitPath.length - 1],
        children: null,
        type: SolutionItemType.File
      } as SolutionItem<FileDto>;
      if (splitPath.length > 1) {
        let parent: SolutionItem<any> = null;
        for (let i = 0; i < splitPath.length - 1; i++) {
          const pathPart = splitPath[i];
          const newFolder = {
            data: null,
            children: [],
            name: pathPart,
            type: SolutionItemType.Folder
          } as SolutionItem<any>;

          if (parent == null) {
            const foundParent = result.find(x => x.type === SolutionItemType.Folder && x.name === pathPart);
            if (foundParent != null) {
              parent = foundParent;
            } else {
              parent = newFolder;
              parent.parent = root;
              result.push(parent);
              result = this.sortSolutionItems(result);
            }
            continue;
          }
          const found = parent.children.find(x => x.type === SolutionItemType.Folder && x.name === pathPart);
          if (found != null) {
            parent = found;
            continue;
          }
          newFolder.parent = parent;
          parent.children.push(newFolder);
          parent.children = this.sortSolutionItems(parent.children);
          parent = newFolder;
        }
        fileItem.parent = parent;
        parent.children.push(fileItem);
      } else {
        fileItem.parent = root;
        result.push(fileItem);
        result = this.sortSolutionItems(result);
      }
    }
    return result;
  }

  private sortSolutionItems(items: SolutionItem<any>[]) {
    return items.sort((a, b) => {
      if (a == null && b == null) {
        return 0;
      }
      if (a == null && b != null) {
        return -1;
      }
      if (a != null && b == null) {
        return 1;
      }
      if (a.type > b.type) {
        return -1;
      }
      if (a.type < b.type) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  private findSolutionItemByFile(file: FileDto) {
    return this.findSolutionItemByFileRec(this.stateObj.explorerModel[0], file);
  }

  private findSolutionItemByFileRec(node: SolutionItem<any>, file: FileDto): SolutionItem<FileDto> {
    if (node.data != null && node.data === file) {
      return node;
    }
    if (node.children != null) {
      for (const c of node.children) {
        const found = this.findSolutionItemByFileRec(c, file);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  }

  private findFileByPath(path: string): FileDto {
    return this.stateObj.solution.projects[0].files.find(x => x.path === path);
  }
}
