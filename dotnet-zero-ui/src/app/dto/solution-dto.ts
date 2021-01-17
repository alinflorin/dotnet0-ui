import { ProjectDto } from './project-dto';

export interface SolutionDto {
  id?: string;
  name: string;
  projects?: ProjectDto[];
}
