import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonButtons,
  IonButton,
  IonMenuButton,
  IonRouterOutlet
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  imports: [
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonButtons,
    IonButton,
    IonMenuButton,
    IonRouterOutlet
  ]
})
export class AdminPage {

  constructor(private router: Router) {}

  go(path: string) {
    this.router.navigate([path]);
  }
}