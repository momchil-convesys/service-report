import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User_DTO } from '../data/dtos';

interface LoginResponse {
  token: string;
  user: User_DTO;
}

const authTokenStorageKey = 'service-report-auth-token';
const defaultDaseUrl = 'http://localhost:3000/api';
const baseUrl = window.apiBaseUrl || defaultDaseUrl;

@Injectable({
  providedIn: 'root',
})
export class LocalAuthService {
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  get token(): string | null {
    return localStorage.getItem(authTokenStorageKey);
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${baseUrl}/auth/login`, { username, password }).pipe(
      tap((response) => {
        localStorage.setItem(authTokenStorageKey, response.token);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(authTokenStorageKey);
    this.router.navigate(['/login']);
  }
}
