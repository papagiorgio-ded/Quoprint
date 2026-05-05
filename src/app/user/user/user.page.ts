import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonImg, IonRouterOutlet } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
  imports: [IonContent, IonRouterOutlet, IonButton,CommonModule,IonImg]
})
export class UserPage {

  public isAdmin = false;
  public user: any = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.actualizarRol();

    
    window.addEventListener('rolChanged', () => {
      this.actualizarRol();
    });

   this.user =  JSON.parse(localStorage.getItem('detaileduser') || '{}');
   
  }

  ionViewWillEnter() {
    this.actualizarRol();
  }

  actualizarRol() {
    this.isAdmin = localStorage.getItem('rol') === 'admin';
  }

  go(path: string) {
    this.router.navigate([path]);
  }

  goAdmin() {
    if (this.isAdmin) {
      this.router.navigate(['/admin']);
    }
  }
}