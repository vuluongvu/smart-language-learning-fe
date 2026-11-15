import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../features/auth/auth.service';
import { OqIconComponent, OqSidebarComponent } from '../../components';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, OqSidebarComponent, OqIconComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  host: {
    '(document:keydown.escape)': 'onEscapeKey()',
  },
})
export class AppShellComponent {
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
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
