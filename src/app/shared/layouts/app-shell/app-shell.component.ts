import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../features/auth/auth.service';
import { FloatingAiTutorComponent } from '../../../features/ai-tutor/floating-ai-tutor.component';
import { OqIconComponent } from '../../components/icon/icon.component';
import { OqSidebarComponent } from '../../components/sidebar/sidebar.component';
import { I18nService, TranslatePipe } from '../../i18n';
import { LearningLanguageService } from '../../services/learning-language.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    OqSidebarComponent,
    FloatingAiTutorComponent,
    OqIconComponent,
    TranslatePipe,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  host: {
    '(document:keydown.escape)': 'onEscapeKey()',
  },
})
export class AppShellComponent {
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  protected readonly i18n = inject(I18nService);
  protected readonly learningLang = inject(LearningLanguageService);
  private readonly router = inject(Router);

  protected readonly drawerOpen = signal(false);

  onEscapeKey(): void {
    if (this.drawerOpen()) {
      this.closeDrawer();
    }
  }

  toggleDrawer(): void {
    this.drawerOpen.update((v) => !v);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.closeDrawer();
      void this.router.navigate(['/login']);
    });
  }
}
