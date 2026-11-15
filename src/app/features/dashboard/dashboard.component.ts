import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguagesApiService } from '../../shared/api/languages-api.service';
import { LanguageItem } from '../../shared/types/auth.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly languagesApi = inject(LanguagesApiService);

  protected readonly languages = signal<LanguageItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadLanguages();
  }

  loadLanguages(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.languagesApi.getLanguages().subscribe({
      next: (items) => {
        this.languages.set(items);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.errorMessage.set(extractApiError(err, 'Could not load supported languages'));
        this.isLoading.set(false);
      },
    });
  }
}
