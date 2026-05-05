import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {

    const rol = localStorage.getItem('rol');

    if (rol === 'admin') {
      return true;
    }

    // ❌ si no es admin, lo mandas fuera
    this.router.navigate(['/user']);
    return false;
  }
}