import 'zone.js';  // <--- 必须加在最前面！
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // 关键：这里要引用 AppComponent，文件路径是 ./app/app

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));