export interface SolutionItem<T> {
  data?: T;
  name: string;
  type: SolutionItemType;
  children: SolutionItem<any>[];
  parent?: SolutionItem<any>;
  isSelected?: boolean;
}

export enum SolutionItemType {
  File = 0,
  Folder = 1,
  Project = 2,
  Solution = 3
}
