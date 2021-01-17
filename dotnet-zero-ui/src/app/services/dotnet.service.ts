import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { LoaderService } from './loader.service';
import { v4 as uuid } from 'uuid';
import { tap, catchError } from 'rxjs/operators';

declare var DotNet: any;

@Injectable({
  providedIn: 'root'
})
export class DotnetService {
  private dotnet: any;

  constructor(private loaderService: LoaderService) {
    this.dotnet = DotNet;
  }

  invoke<T>(methodName: string, ...params: any[]): Observable<T> {
    const guid = uuid();
    this.loaderService.addCall(guid);
    const subject = new Subject<T>();
    let p = 'params';
    if (params != null && params.length > 0) {
      const x: string[] = [];
      for (let i = 0; i < params.length; i++) {
        x.push(`params[${i}]`);
      }
      p = x.join(', ');
    }
    // tslint:disable-next-line: no-eval, max-line-length
    eval(`this.dotnet.invokeMethodAsync("DotnetZeroEngine", methodName, ${p}).then(x => { subject.next(x); subject.complete(); }).catch(e => { subject.error(e); })`);
    return subject.asObservable().pipe(
      tap(() => {
        this.loaderService.callFinished(guid);
      }),
      catchError(e => {
        if (methodName !== 'Healthcheck') {
          console.error(e);
        }
        this.loaderService.callFinished(guid);
        return throwError(e);
      })
    );
  }

  initialize(): Observable<any> {
    const guid = uuid();
    this.loaderService.addCall(guid);
    const subj = new Subject<any>();
    this.tryLoadDotnetRecursive(() => {
      subj.next(this.dotnet);
      subj.complete();
    });
    return subj.asObservable().pipe(
      tap(() => {
        this.loaderService.callFinished(guid);
      }),
      catchError(e => {
        this.loaderService.callFinished(guid);
        return throwError(e);
      })
    );
  }

  private tryLoadDotnetRecursive(cb: () => void) {
    try {
      this.invoke<any>('Healthcheck').subscribe(() => {
        cb();
      }, () => {
        setTimeout(() => {
          this.tryLoadDotnetRecursive(cb);
        }, 100);
      });
    } catch (err) {
      setTimeout(() => {
        this.tryLoadDotnetRecursive(cb);
      }, 100);
    }
  }
}
