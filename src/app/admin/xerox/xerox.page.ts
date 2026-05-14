import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar,IonModal, IonButtons, IonItem, IonLabel, IonInput, AlertController} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';

interface ConfigGlobal {
  plastificado: number;
 
}

@Component({
  selector: 'app-xerox',
  templateUrl: './xerox.page.html',
  styleUrls: ['./xerox.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonButton,IonModal,IonButtons,IonItem,IonLabel,IonInput]
})
export class XeroxPage implements OnInit {

  constructor(private http: HttpClient,private alertController: AlertController) { }

  ngOnInit() {
    this.cargarPapeles();
    this.getConfig();
  }
public papeles: any[] = [];
  public localapi:string = 'http://localhost:3000'
  showPapelModal = false;

nuevoPapel = {
  nombre: '',
  precio_papel: 0,
  precio_copia: 0,
  plastificado: 0,
  blanco_negro: 0,
  color: 0
};

 configGlobal: ConfigGlobal = {
    plastificado: 0,
  };

openPapelModal() {
  this.showPapelModal = true;
}

closePapelModal() {
  this.showPapelModal = false;

  // reset
  this.nuevoPapel = {
    nombre: '',
    precio_papel: 0,
    precio_copia: 0,
    plastificado:0,
    blanco_negro: 0,
    color: 0
  };
}

guardarPapel() {
  if (!this.nuevoPapel.nombre || !this.nuevoPapel.precio_papel || !this.nuevoPapel.precio_copia) {
    alert('Rellena todos los campos');
    return;
  }

  // 🔥 aquí lo mandas a tu backend
  this.http.post(`${this.localapi}/newpapel`, this.nuevoPapel)
    .subscribe({
      next: () => {
        console.log('Papel guardado');

        this.closePapelModal();

        // opcional: recargar lista
        this.cargarPapeles();
      },
      error: (err) => {
        console.error(err);
      }
    });
}
cargarPapeles() {
  this.http.get(`${this.localapi}/getpapels`).subscribe({
    next: (res: any) => {
      console.log('Papeles obtenidos:', res);
      this.papeles = res;
    },
    error: (err) => {
      console.error('Error obteniendo papeles:', err);
    }
  });
}

async presentAlertOK() {
  const alert = await this.alertController.create({
    header: 'Guardado',
    message: 'Configuración actualizada correctamente',
    buttons: ['OK']
  });

  await alert.present();
}

showEditModal = false;

public editarPapel: any= {};

openEditModal(papel: any) {
  this.editarPapel = { ...papel }; // copia segura
  this.showEditModal = true;
}

closeEditModal() {
  this.showEditModal = false;

  
}

guardarEdicion() {
  console.log('Guardando papel editado:', this.editarPapel);
  this.http.put(`${this.localapi}/editpapel/${this.editarPapel.id}`, this.editarPapel)
    .subscribe(() => {
      this.closeEditModal();
      this.cargarPapeles(); // refrescar lista
    });
}
 async presentalertdelete(material: any) {
  const alert = await this.alertController.create({
    header: '¿Seguro que quieres borrar el material?',
    message: 'Esta acción no se puede deshacer',
    buttons: [
      {
        text: 'No',
        role: 'cancel'
      },
      {
        text: 'Sí',
        role: 'destructive',
        handler: () => {
          this.eliminarPapel(material);
        }
      }
    ]
  });

  await alert.present();
}

eliminarPapel(papel:any){
let id = papel.id;
  this.http.delete(`${this.localapi}/deletepapel/${id}`).subscribe({
    next: () => {
      console.log('Papel eliminado');
      this.cargarPapeles(); // refrescar lista
    },
    error: (err) => {
      console.error('Error eliminando papel:', err);
    }
  });
}


 getConfig() {
    this.http.get<ConfigGlobal>(`${this.localapi}/config-global_xerox`)
      .subscribe({
        next: (res) => this.configGlobal = res,
        error: (err) => console.error(err)
      });
  }

  guardarConfig() {

  this.http.put(`${this.localapi}/config-global-xerox`, this.configGlobal)
    .subscribe({
      next: () => {
        console.log('Config guardada');
        this.presentAlertOK();
      },
      error: (err) => console.error(err)
    });

}
}
