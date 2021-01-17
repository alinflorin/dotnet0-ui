import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FlexLayoutModule} from '@angular/flex-layout';
import { EditAreaComponent } from './edit-area/edit-area.component';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { D0UiModule } from './d0-ui/d0-ui.module';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from './loading/loading.component';
import { SolutionComponent } from './solution/solution.component';
import { DependenciesComponent } from './dependencies/dependencies.component';
import { AngularSplitModule } from 'angular-split';
import { DebugBarComponent } from './debug-bar/debug-bar.component';
import { ConsoleComponent } from './console/console.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    EditAreaComponent,
    ToolbarComponent,
    SidebarComponent,
    FooterComponent,
    LoadingComponent,
    SolutionComponent,
    DependenciesComponent,
    DebugBarComponent,
    ConsoleComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MonacoEditorModule.forRoot(),
    AngularSplitModule.forRoot(),
    D0UiModule,
    FormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
