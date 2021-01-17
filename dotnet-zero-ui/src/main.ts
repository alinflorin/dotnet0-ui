import 'hammerjs';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { hmrBootstrap } from './hmr';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
} else {
  console.clear();
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

/*if (!environment.production) {
  // tslint:disable-next-line: no-string-literal
  if (module[ 'hot' ]) {
    hmrBootstrap(module, bootstrap);
    console.clear();
  } else {
    console.error('HMR is not enabled for webpack-dev-server!');
    console.log('Are you using the --hmr flag for ng serve?');
  }
} else {*/
bootstrap().catch(err => console.log(err));
//}
