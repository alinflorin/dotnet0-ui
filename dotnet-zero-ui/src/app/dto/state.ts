import { SolutionDto } from './solution-dto';
import { FileDto } from './file-dto';
import { SolutionItem } from './solution-item';

export interface FilesState {
  currentFileIndex?: number;
  openedFiles: FileDto[];
}

export interface DebugState {
  isBuilt: boolean;
  isRunning: boolean;
}

export interface D0State {
  isEditorLoaded: boolean;
  isDotnetLoaded: boolean;
  isConsoleVisible: boolean;
  isSidebarVisible: boolean;
  solution?: SolutionDto;
  files: FilesState;
  explorerModel?: SolutionItem<any>[];
  debug: DebugState;
}
