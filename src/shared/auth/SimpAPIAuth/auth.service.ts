import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = 'https://w65569.eu.pythonanywhere.com/api/token/';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(this.loginUrl, { username, password });
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string {
    return this.accessToken || localStorage.getItem('accessToken') || '';
  }

  getRefreshToken(): string {
    return this.refreshToken || localStorage.getItem('refreshToken') || '';
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }
}
