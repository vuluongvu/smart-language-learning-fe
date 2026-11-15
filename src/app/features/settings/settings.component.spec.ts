import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ThemeService } from '../../shared/services/theme.service';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('switches theme between light and dark mode', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    const themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();

    expect(themeService.theme()).toBe('light');
    themeService.setTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
