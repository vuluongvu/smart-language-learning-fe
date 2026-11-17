import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppLocale, TranslatePipe, TxKey } from '../../i18n';
import { AppTheme } from '../../services/theme.service';
import { UserProfile } from '../../types/auth.types';
import { OqIconComponent, OqIconName } from '../icon/icon.component';

interface NavGroup {
  labelKey: TxKey;
  items: { labelKey: TxKey; route: string; icon: OqIconName }[];
}

@Component({
  selector: 'oq-sidebar',
  imports: [RouterLink, RouterLinkActive, OqIconComponent, TranslatePipe],
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
          [attr.aria-label]="'common.closeMenu' | t"
          (click)="closeDrawer.emit()"
        >
          <oq-icon name="x" [size]="18" />
        </button>
      </div>

      <nav class="shell__nav" aria-label="Main navigation">
        @for (group of navGroups; track group.labelKey) {
          <div class="shell__nav-group">
            <span class="shell__nav-heading">{{ group.labelKey | t }}</span>
            @for (item of group.items; track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="shell__nav-link--active"
                ariaCurrentWhenActive="page"
                class="shell__nav-link"
                (click)="closeDrawer.emit()"
              >
                <oq-icon [name]="item.icon" [size]="18" />
                <span>{{ item.labelKey | t }}</span>
              </a>
            }
          </div>
        }
      </nav>

      <div class="shell__sidebar-footer">
        <span class="shell__nav-heading">{{ 'nav.settingsGroup' | t }}</span>
        <a
          routerLink="/settings"
          routerLinkActive="shell__nav-link--active"
          ariaCurrentWhenActive="page"
          class="shell__nav-link"
          (click)="closeDrawer.emit()"
        >
          <oq-icon name="settings" [size]="18" />
          <span>{{ 'nav.settings' | t }}</span>
        </a>

        <button
          type="button"
          class="shell__nav-link shell__nav-action"
          (click)="toggleTheme.emit()"
          [attr.aria-label]="
            'common.switchToTheme'
              | t
                : {
                    mode:
                      theme() === 'light' ? ('common.darkShort' | t) : ('common.lightShort' | t),
                  }
          "
        >
          <oq-icon [name]="theme() === 'light' ? 'moon' : 'sun'" [size]="18" />
          <span>{{ (theme() === 'light' ? 'common.darkMode' : 'common.lightMode') | t }}</span>
        </button>

        <button
          type="button"
          class="shell__nav-link shell__lang-action"
          (click)="toggleLang.emit()"
          [attr.aria-label]="'common.switchLangAria' | t"
        >
          <oq-icon name="globe" [size]="18" />
          <span>{{ 'common.langLabel' | t }}</span>
          <span class="shell__lang-pill">{{ lang().toUpperCase() }}</span>
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
              [attr.aria-label]="'common.logout' | t"
              [attr.title]="'common.logout' | t"
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
            <span>{{ 'common.logout' | t }}</span>
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

      .shell__lang-pill {
        margin-left: auto;
        padding: 1px 6px;
        border-radius: 6px;
        font-size: 0.6875rem;
        font-weight: 700;
        background: var(--oq-bg-subtle);
        color: var(--oq-text-secondary);
        border: 1px solid var(--oq-border-subtle);
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
  readonly lang = input<AppLocale>('en');

  readonly closeDrawer = output<void>();
  readonly toggleTheme = output<void>();
  readonly toggleLang = output<void>();
  readonly logout = output<void>();

  protected readonly navGroups: NavGroup[] = [
    {
      labelKey: 'nav.study',
      items: [
        { labelKey: 'nav.dashboard', route: '/dashboard', icon: 'layout-dashboard' },
        { labelKey: 'nav.vocabulary', route: '/vocabulary', icon: 'book-open' },
        { labelKey: 'nav.topics', route: '/topics', icon: 'folder' },
      ],
    },
    {
      labelKey: 'nav.practice',
      items: [
        { labelKey: 'nav.flashcards', route: '/flashcards', icon: 'layers' },
        { labelKey: 'nav.quizzes', route: '/quizzes', icon: 'help-circle' },
        { labelKey: 'nav.aiTutor', route: '/ai-tutor', icon: 'sparkles' },
      ],
    },
    {
      labelKey: 'nav.insights',
      items: [
        { labelKey: 'nav.progress', route: '/progress', icon: 'bar-chart' },
        { labelKey: 'nav.leaderboard', route: '/leaderboard', icon: 'trophy' },
      ],
    },
  ];

  protected initialOf(name: string): string {
    return name.trim().charAt(0).toUpperCase() || 'U';
  }
}
