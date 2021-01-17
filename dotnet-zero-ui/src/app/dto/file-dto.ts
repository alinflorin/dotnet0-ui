import { FileType } from './file-type';

export interface FileDto {
  id?: string;
  projectId: string;
  path: string;
  type: FileType;
  content?: string;
  tempContent?: string;
  hasBeenLoaded?: boolean;
}
