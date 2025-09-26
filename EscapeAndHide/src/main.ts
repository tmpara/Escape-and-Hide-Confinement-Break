import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { GameComponent } from './app/app.component';

bootstrapApplication(GameComponent, appConfig)
  .catch((err) => console.error(err));
