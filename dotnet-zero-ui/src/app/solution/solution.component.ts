import { Component, OnInit } from '@angular/core';
import { SolutionDto } from '../dto/solution-dto';
import { SolutionItem, SolutionItemType } from '../dto/solution-item';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { D0Service } from '../services/d0.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss']
})
export class SolutionComponent implements OnInit {
  explorerModel: SolutionItem<SolutionDto>[];
  treeControl = new NestedTreeControl<SolutionItem<any>>(node => node.children);
  dataSource = new MatTreeNestedDataSource<SolutionItem<any>>();
  private nodesExpanded = false;

  constructor(private d0: D0Service) { }

  ngOnInit() {
    this.d0.onSolutionOpened.subscribe(() => {
      this.explorerModel = this.d0.state.explorerModel;
      this.dataSource.data = this.explorerModel;
      if (!this.nodesExpanded) {
        this.nodesExpanded = true;
        setTimeout(() => {
          this.expandSolutionAndProjects();
        });
      }
    });
  }

  initSolution() {
    this.d0.newSolution({
      baseUrl: window.location.origin
    });
  }

  hasChild = (_: number, node: SolutionItem<any>) => !!node.children && node.children.length > 0;

  getNodeIcon(type: SolutionItemType): string {
    switch (type) {
      case SolutionItemType.Solution:
        return 'work';
      case SolutionItemType.Project:
        return 'web';
      case SolutionItemType.Folder:
        return 'folder';
      case SolutionItemType.File:
        return 'insert_drive_file';
      default:
        return 'priority_high';
    }
  }

  getNodeColor(type: SolutionItemType): string {
    switch (type) {
      case SolutionItemType.Solution:
        return '#ab9fed';
      case SolutionItemType.Project:
        return '#bff2d6';
      case SolutionItemType.Folder:
        return '#f2e9bf';
      case SolutionItemType.File:
        return '#bfe0f2';
      default:
        return 'white';
    }
  }

  onItemNodeClick(node: SolutionItem<any>, event: MouseEvent): void {
    if (node.type !== SolutionItemType.Project && node.type !== SolutionItemType.Solution) {
      this.d0.unselectAllFiles();
      node.isSelected = true;
    }
    if (node.type === SolutionItemType.Folder || node.type === SolutionItemType.Project || node.type === SolutionItemType.Solution) {
      this.treeControl.toggle(node);
      return;
    }
    event.preventDefault();
    this.d0.openTab(node.data);
    this.d0.unselectAllFiles();
    node.isSelected = true;
  }

  private expandSolutionAndProjects() {
    this.treeControl.expand(this.explorerModel[0]);
    if (this.explorerModel[0].children != null) {
      this.explorerModel[0].children.forEach(p => {
        this.treeControl.expand(p);
      });
    }
  }
}
