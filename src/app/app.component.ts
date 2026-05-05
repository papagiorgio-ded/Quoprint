import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  template: '<ion-app><ion-router-outlet></ion-router-outlet></ion-app>',
  standalone: true,
  imports: [IonApp, IonRouterOutlet] 
})
export class AppComponent {

  constructor(private auth: AuthService, private router: Router) {
    this.auth.appState$.subscribe((appState: any) => {
      if (appState?.target) {
        this.router.navigateByUrl(appState.target);
      }
    });
    this.auth.user$.subscribe(user => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
});
  }
}
