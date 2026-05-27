import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonImg, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '@auth0/auth0-angular';
import { HttpClient } from '@angular/common/http';
import { Route } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonButton,IonImg]
})
export class LoginPage implements OnInit {

  constructor(public auth: AuthService,private http: HttpClient,private router: Router) { }

  ngOnInit() {
    
  this.auth.user$.subscribe(user => {
  if (user) {
    // 🔥 guardar usuario completo
    localStorage.setItem('detaileduser', JSON.stringify(user));

    // 📧 enviar solo si tiene email
    if (user.email) {
      this.sendUser(user.email);
    }
  }
});
}


public api:string = "https://backend-ofwl.onrender.com"

sendUser(email: string) {
  this.http.post(`${this.api}/users`, {
    email: email,
    location: 'Madrid'
  }).subscribe({
    next: (res: any) => {

      console.log('Usuario enviado:', res);

      // 💾 guardar datos
      localStorage.setItem('rol', res.user.rol);
      localStorage.setItem('email', res.user.email);
      localStorage.setItem('user', JSON.stringify(res.user));

      // 🔄 avisar a la app
      window.dispatchEvent(new Event('rolChanged'));

      // 🚀 AQUÍ ESTÁ LA CLAVE
      this.router.navigate(['/user']);

    },
    error: (err) => {
      console.error('Error:', err);
    }
  });
}


  login() {
  this.auth.loginWithRedirect({
    appState: {
      target: '/user'
    }

    
  });

  
}

logout() {
   localStorage.removeItem('rol'); // 👈 CLAVE
  this.auth.logout({
    logoutParams: {
      returnTo: window.location.origin
      
    }
  });
}

}
