import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import {
  OqButtonComponent,
  OqCardComponent,
  OqCheckboxComponent,
  OqDropdownComponent,
  OqEmptyStateComponent,
  OqIconComponent,
  OqInputComponent,
  OqModalComponent,
  OqPageHeaderComponent,
  OqProgressBarComponent,
  OqSelectComponent,
  OqSelectOption,
  OqSidebarComponent,
  OqStatCardComponent,
  OqStreakCardComponent,
} from './index';

@Component({
  imports: [
    ReactiveFormsModule,
    OqInputComponent,
    OqSelectComponent,
    OqCheckboxComponent,
    OqButtonComponent,
    OqCardComponent,
    OqModalComponent,
    OqDropdownComponent,
    OqPageHeaderComponent,
    OqEmptyStateComponent,
    OqProgressBarComponent,
    OqStreakCardComponent,
    OqStatCardComponent,
    OqSidebarComponent,
    OqIconComponent,
  ],
  template: `
    <form [formGroup]="form">
      <oq-input formControlName="term" label="Term" placeholder="Enter word" hint="Helper hint" />
      <oq-select formControlName="level" label="Level" [options]="levelOptions" />
      <oq-checkbox
        formControlName="visible"
        label="Show on leaderboard"
        description="Opt in to streak rankings"
      />
    </form>

    <oq-button variant="primary" size="sm" (clicked)="buttonClicks = buttonClicks + 1">
      Save word
    </oq-button>

    <oq-card variant="subtle" padding="compact" [interactive]="true">
      <p>Card body</p>
    </oq-card>

    <oq-modal
      [open]="modalOpen"
      title="Edit Vocabulary"
      description="Update term details"
      (closed)="modalClosedCount = modalClosedCount + 1"
    >
      <p>Modal content</p>
    </oq-modal>

    <oq-dropdown label="Actions" icon="settings">
      <button type="button" role="menuitem">Export JSON</button>
    </oq-dropdown>

    <oq-page-header
      eyebrow="Library"
      title="All Vocabulary"
      subtitle="Manage your saved words"
      backLink="/dashboard"
      backLabel="Back to Dashboard"
    >
      <button type="button" actions class="oq-btn oq-btn--primary">Add Word</button>
    </oq-page-header>

    <oq-empty-state icon="book-open" title="No words yet" description="Create your first card">
      <button type="button" actions class="oq-btn oq-btn--primary">Create</button>
    </oq-empty-state>

    <oq-progress-bar
      [value]="3"
      [max]="4"
      label="Session Progress"
      [showPercent]="true"
      tone="success"
    />

    <oq-streak-card
      [currentStreak]="5"
      [longestStreak]="9"
      timezone="Asia/Ho_Chi_Minh"
      [isActiveToday]="true"
    />

    <oq-stat-card
      label="Mastered"
      [value]="42"
      detail="Ready to recall"
      icon="check"
      tone="success"
      actionLink="/vocabulary"
      actionLabel="View library"
    />

    <oq-sidebar
      [drawerOpen]="drawerOpen"
      [theme]="'light'"
      [lang]="'en'"
      [user]="profile"
      (closeDrawer)="drawerClosed = true"
      (toggleTheme)="themeToggled = true"
      (toggleLang)="langToggled = true"
      (logout)="loggedOut = true"
    />

    <oq-icon name="flame" [size]="20" />
  `,
})
class TestHostComponent {
  readonly form = new FormGroup({
    term: new FormControl('resilient', { nonNullable: true }),
    level: new FormControl<string | null>('B2'),
    visible: new FormControl(true, { nonNullable: true }),
  });

  readonly levelOptions: OqSelectOption<string | null>[] = [
    { label: 'B1', value: 'B1' },
    { label: 'B2', value: 'B2' },
    { label: 'C1', value: 'C1' },
  ];

  readonly profile = {
    id: 1,
    email: 'learner@openquiz.test',
    displayName: 'Linh Learner',
    avatarUrl: null,
    timezone: 'Asia/Ho_Chi_Minh',
    isLeaderboardVisible: true,
    role: 'USER' as const,
    hasPassword: true,
    linkedProviders: ['local'],
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  };

  buttonClicks = 0;
  modalOpen = true;
  modalClosedCount = 0;
  drawerOpen = true;
  drawerClosed = false;
  themeToggled = false;
  langToggled = false;
  loggedOut = false;
}

describe('Shared UI Component Library', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('supports ReactiveForms ControlValueAccessor across OqInput, OqSelect, and OqCheckbox', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;

    const inputEl = el.querySelector<HTMLInputElement>('oq-input input');
    const selectEl = el.querySelector<HTMLSelectElement>('oq-select select');
    const checkboxEl = el.querySelector<HTMLInputElement>('oq-checkbox input[type="checkbox"]');

    expect(inputEl?.value).toBe('resilient');
    expect(selectEl?.selectedIndex).toBe(1);
    expect(checkboxEl?.checked).toBe(true);

    if (inputEl) {
      inputEl.value = 'pragmatic';
      inputEl.dispatchEvent(new Event('input'));
    }
    if (selectEl) {
      selectEl.selectedIndex = 2;
      selectEl.dispatchEvent(new Event('change'));
    }
    if (checkboxEl) {
      checkboxEl.checked = false;
      checkboxEl.dispatchEvent(new Event('change'));
    }
    fixture.detectChanges();

    expect(host.form.value).toEqual({
      term: 'pragmatic',
      level: 'C1',
      visible: false,
    });

    host.form.disable();
    fixture.detectChanges();
    expect(inputEl?.disabled).toBe(true);
    expect(selectEl?.disabled).toBe(true);
    expect(checkboxEl?.disabled).toBe(true);
  });

  it('renders OqButton and OqCard with expected variant classes and emits clicked', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const btn = el.querySelector<HTMLButtonElement>('oq-button button');
    expect(btn?.classList.contains('oq-btn--primary')).toBe(true);
    expect(btn?.classList.contains('oq-btn--sm')).toBe(true);

    btn?.click();
    expect(fixture.componentInstance.buttonClicks).toBe(1);

    const card = el.querySelector<HTMLElement>('oq-card .oq-card');
    expect(card?.classList.contains('oq-card--subtle')).toBe(true);
    expect(card?.classList.contains('oq-card--compact')).toBe(true);
    expect(card?.classList.contains('oq-card--interactive')).toBe(true);
  });

  it('opens OqModal, closes on Escape and close button, and opens/closes OqDropdown', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;

    const dialog = el.querySelector<HTMLElement>('oq-modal [role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(el.textContent).toContain('Edit Vocabulary');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(host.modalClosedCount).toBe(1);

    el.querySelector<HTMLButtonElement>('oq-modal .oq-modal__close')?.click();
    expect(host.modalClosedCount).toBe(2);

    const dropdownBtn = el.querySelector<HTMLButtonElement>('oq-dropdown button');
    expect(el.querySelector('oq-dropdown [role="menu"]')).toBeNull();

    dropdownBtn?.click();
    fixture.detectChanges();
    expect(el.querySelector('oq-dropdown [role="menu"]')).not.toBeNull();
    expect(dropdownBtn?.getAttribute('aria-expanded')).toBe('true');

    el.querySelector<HTMLButtonElement>('oq-dropdown [role="menuitem"]')?.click();
    fixture.detectChanges();
    expect(el.querySelector('oq-dropdown [role="menu"]')).toBeNull();
  });

  it('renders OqPageHeader, OqEmptyState, OqProgressBar, OqStreakCard, OqStatCard, and OqSidebar', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('oq-page-header h1')?.textContent).toContain('All Vocabulary');
    expect(el.querySelector('oq-page-header .oq-page-header__back')?.textContent).toContain(
      'Back to Dashboard',
    );
    expect(el.querySelector('oq-empty-state h3')?.textContent).toContain('No words yet');

    const progress = el.querySelector<HTMLElement>('oq-progress-bar [role="progressbar"]');
    expect(progress?.getAttribute('aria-valuenow')).toBe('3');
    expect(progress?.getAttribute('aria-valuemax')).toBe('4');
    expect(el.querySelector('oq-progress-bar .oq-progress__pct')?.textContent).toContain('75%');

    expect(el.querySelector('oq-streak-card')?.textContent).toContain('Longest streak: 9 days');
    expect(el.querySelector('oq-streak-card')?.textContent).toContain(
      'Qualified activity completed today',
    );
    expect(el.querySelector('oq-stat-card')?.textContent).toContain('42');
    expect(el.querySelector('oq-stat-card a')?.getAttribute('href')).toBe('/vocabulary');

    const sidebarAside = el.querySelector<HTMLElement>('aside#app-sidebar-nav');
    expect(sidebarAside?.classList.contains('shell__sidebar--open')).toBe(true);
    expect(sidebarAside?.textContent).toContain('Linh Learner');

    el.querySelector<HTMLButtonElement>('oq-sidebar .shell__nav-action')?.click();
    el.querySelector<HTMLButtonElement>('oq-sidebar .shell__lang-action')?.click();
    el.querySelector<HTMLButtonElement>('oq-sidebar .shell__logout-icon')?.click();
    el.querySelector<HTMLButtonElement>('oq-sidebar .shell__close-btn')?.click();
    expect(host.themeToggled).toBe(true);
    expect(host.langToggled).toBe(true);
    expect(host.loggedOut).toBe(true);
    expect(host.drawerClosed).toBe(true);
  });

  it('handles zero max gracefully in OqProgressBarComponent', () => {
    const fixture = TestBed.createComponent(OqProgressBarComponent);
    fixture.componentRef.setInput('value', 5);
    fixture.componentRef.setInput('max', 0);
    fixture.componentRef.setInput('showPercent', true);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('0%');
    expect(vi.isMockFunction(vi.fn())).toBe(true);
  });
});
