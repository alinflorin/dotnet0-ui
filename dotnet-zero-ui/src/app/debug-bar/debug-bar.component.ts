import { Component, OnInit } from '@angular/core';
import { D0Service } from '../services/d0.service';

@Component({
  selector: 'app-debug-bar',
  templateUrl: './debug-bar.component.html',
  styleUrls: ['./debug-bar.component.scss']
})
export class DebugBarComponent implements OnInit {

  constructor(public d0: D0Service) { }

  ngOnInit() {

  }

}
