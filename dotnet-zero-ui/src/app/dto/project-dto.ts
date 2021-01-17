import { ProjectType } from './project-type';
import { FileDto } from './file-dto';

export interface ProjectDto {
  id?: string;
  name: string;
  type: ProjectType;
  files?: FileDto[];
}
