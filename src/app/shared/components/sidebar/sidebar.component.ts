import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppTheme } from '../../services/theme.service';
import { UserProfile } from '../../types/auth.types';
import { OqIconComponent, OqIconName } from '../icon/icon.component';

interface NavGroup {
  label: string;
  items: { label: string; route: string; icon: OqIconName }[];
}

@Component({
  selector: 'oq-sidebar',
  imports: [RouterLink, RouterLinkActive, OqIconComponent],
  template: `
    <aside id="app-sidebar-nav" class="shell__sidebar" [class.shell__sidebar--open]="drawerOpen()">
      <div class="shell__sidebar-header">
        <a class="shell__brand" routerLink="/dashboard" (click)="closeDrawer.emit()">
          <svg
            class="shell__logo"
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
          >
            <rect width="28" height="28" rx="8" fill="var(--oq-accent)" />
            <circle cx="13.5" cy="13.5" r="5.25" stroke="#fff" stroke-width="2.2" />
            <path d="M17.5 17.5 21 21" stroke="#fff" stroke-width="2.2" stroke-linecap="round" />
          </svg>
          <span class="shell__brand-name">OpenQuiz</span>
        </a>
        <button
          type="button"
          class="shell__close-btn"
          aria-label="Close navigation menu"
          (click)="closeDrawer.emit()"
        >
          <oq-icon name="x" [size]="18" />
        </button>
      </div>

      <nav class="shell__nav" aria-label="Main navigation">
        @for (group of navGroups; track group.label) {
          <div class="shell__nav-group">
            <span class="shell__nav-heading">{{ group.label }}</span>
            @for (item of group.items; track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="shell__nav-link--active"
                ariaCurrentWhenActive="page"
                class="shell__nav-link"
                (click)="closeDrawer.emit()"
              >
                <oq-icon [name]="item.icon" [size]="17" />
                <span>{{ item.label }}</span>
              </a>
            }
          </div>
        }
      </nav>

      <div class="shell__sidebar-footer">
        <a
          routerLink="/settings"
          routerLinkActive="shell__nav-link--active"
          ariaCurrentWhenActive="page"
          class="shell__nav-link"
          (click)="closeDrawer.emit()"
        >
          <oq-icon name="settings" [size]="17" />
          <span>Settings &amp; Profile</span>
        </a>

        <button
          type="button"
          class="shell__nav-link shell__nav-action"
          (click)="toggleTheme.emit()"
          [attr.aria-label]="'Switch to ' + (theme() === 'light' ? 'dark' : 'light') + ' theme'"
        >
          <oq-icon [name]="theme() === 'light' ? 'moon' : 'sun'" [size]="17" />
          <span>{{ theme() === 'light' ? 'Dark mode' : 'Light mode' }}</span>
        </button>

        @if (user(); as profile) {
          <div class="shell__account">
            <div class="shell__avatar" aria-hidden="true">
              {{ initialOf(profile.displayName) }}
            </div>
            <div class="shell__user">
              <div class="shell__user-name">{{ profile.displayName }}</div>
              <div class="shell__user-email">{{ profile.email }}</div>
            </div>
            <button
              type="button"
              class="shell__logout-icon"
              aria-label="Log out"
              title="Log out"
              (click)="logout.emit()"
            >
              <oq-icon name="log-out" [size]="16" />
            </button>
          </div>
        } @else {
          <button
            type="button"
            class="oq-btn oq-btn--secondary oq-btn--sm oq-btn--full"
            (click)="logout.emit()"
          >
            <oq-icon name="log-out" [size]="15" />
            <span>Log out</span>
          </button>
        }
      </div>
    </aside>
  `,
  styles: [
    `
      .shell__sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 240px;
        background: var(--oq-bg-surface);
        border-right: 1px solid var(--oq-border-subtle);
        padding: 18px 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        transform: translateX(-100%);
        transition: transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
        z-index: 30;
        overflow-y: auto;

        &--open {
          transform: translateX(0);
        }
      }

      .shell__sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 6px;
      }

      .shell__brand {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: var(--oq-text-primary);
      }

      .shell__brand-name {
        font-size: 1.0625rem;
        font-weight: 700;
        letter-spacing: -0.02em;
      }

      .shell__close-btn {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--oq-text-muted);
        display: grid;
        place-items: center;
        cursor: pointer;

        &:hover {
          background: var(--oq-bg-subtle);
          color: var(--oq-text-primary);
        }
      }

      .shell__nav {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .shell__nav-group {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .shell__nav-heading {
        padding: 0 10px 4px;
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: var(--oq-text-muted);
      }

      .shell__nav-link {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 8px 10px;
        border-radius: 10px;
        border: none;
        background: transparent;
        color: var(--oq-text-secondary);
        font: inherit;
        font-size: 0.875rem;
        font-weight: 500;
        text-decoration: none;
        text-align: left;
        cursor: pointer;
        transition:
          background-color var(--oq-transition),
          color var(--oq-transition);

        &:hover {
          background: var(--oq-bg-subtle);
          color: var(--oq-text-primary);
        }

        &--active {
          background: var(--oq-accent-soft);
          color: var(--oq-accent);
          font-weight: 600;
        }
      }

      .shell__sidebar-footer {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding-top: 12px;
        border-top: 1px solid var(--oq-border-subtle);
      }

      .shell__account {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 8px;
        padding: 10px;
        border-radius: var(--oq-radius-md);
        background: var(--oq-bg-subtle);
        border: 1px solid var(--oq-border-subtle);
      }

      .shell__avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--oq-accent);
        color: #fff;
        font-size: 0.8125rem;
        font-weight: 700;
        display: grid;
        place-items: center;
        flex-shrink: 0;
      }

      .shell__user {
        min-width: 0;
        flex: 1;
      }

      .shell__user-name {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--oq-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .shell__user-email {
        font-size: 0.75rem;
        color: var(--oq-text-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .shell__logout-icon {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: var(--oq-text-muted);
        display: grid;
        place-items: center;
        cursor: pointer;
        flex-shrink: 0;

        &:hover {
          background: var(--oq-bg-surface);
          color: var(--oq-danger);
        }
      }

      @media (min-width: 1025px) {
        .shell__sidebar {
          position: sticky;
          top: 0;
          height: 100vh;
          transform: translateX(0);
          flex-shrink: 0;
        }

        .shell__close-btn {
          display: none;
        }
      }
    `,
  ],
})
export class OqSidebarComponent {
  readonly drawerOpen = input<boolean>(false);
  readonly user = input<UserProfile | null>(null);
  readonly theme = input<AppTheme>('light');

  readonly closeDrawer = output<void>();
  readonly toggleTheme = output<void>();
  readonly logout = output<void>();

  protected readonly navGroups: NavGroup[] = [
    {
      label: 'Study',
      items: [
        { label: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard' },
        { label: 'All Vocabulary', route: '/vocabulary', icon: 'book-open' },
        { label: 'Topics', route: '/topics', icon: 'folder' },
      ],
    },
    {
      label: 'Practice',
      items: [
        { label: 'Flashcards', route: '/flashcards', icon: 'layers' },
        { label: 'Quizzes', route: '/quizzes', icon: 'help-circle' },
      ],
    },
    {
      label: 'Insights',
      items: [
        { label: 'Progress & Streak', route: '/progress', icon: 'bar-chart' },
        { label: 'Leaderboard', route: '/leaderboard', icon: 'trophy' },
      ],
    },
  ];

  protected initialOf(name: string): string {
    return name.trim().charAt(0).toUpperCase() || 'U';
  }
}
