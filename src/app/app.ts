import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './shared/i18n';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Ensure ThemeService and I18nService initialize on app bootstrap
  protected readonly _theme = inject(ThemeService);
  protected readonly _i18n = inject(I18nService);
}
