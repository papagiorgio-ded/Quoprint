import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// Ionic standalone
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  AlertController,
  IonButtons
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-laser',
  templateUrl: './laser.page.html',
  styleUrls: ['./laser.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonModal,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButtons
  ]
})
export class LaserPage {

  constructor(private http: HttpClient,private alertController: AlertController) {}

  ngOnInit(){
    this.getMateriales();
  }
  // 🔥 CONTROL DEL MODAL
  public isModalOpencreatematerial = false;
  public localapi:string = 'http://localhost:3000'
  // 📦 FORMULARIO
  public form = {
    nombre: '',
    ancho: 0,
     alto: 0,
    merma: 0,
    coste: 0,
      limpieza: 0,
      mascara: 0,
      pintura: 0,
      IVA: 0,
      tiempo_corte: 0,
      mano_obra: 0,
     // ultima_mod: 0,
  };

  public materiales: any[] = [];

public isEditModalOpen = false;

public materialEdit: any = {};

  // 🚀 ABRIR MODAL
  abrirModal() {
    this.isModalOpencreatematerial = true;
  }

  // ❌ CERRAR MODAL
  cerrarModal() {
    this.isModalOpencreatematerial = false;
  }

  // 💾 CREAR MATERIAL (LUEGO CONECTAMOS BACKEND)
 crearMaterial() {

  const payload = {
    nombre: this.form.nombre,
    ancho: this.form.ancho,
    alto: this.form.alto,
    coste: this.form.coste,
    merma: this.form.merma,
    limpieza: this.form.limpieza,
    mascara: this.form.mascara,
    pintura: this.form.pintura,
    tiempo_corte: this.form.tiempo_corte,
    mano_obra: this.form.mano_obra,
    iva: this.form.IVA
  };

  this.http.post(`${this.localapi}/materials`, payload)
    .subscribe({
      next: (res) => {
        console.log('Material creado:', res);

        // cerrar modal
        this.isModalOpencreatematerial = false;

        // reset form
        this.form = {
          nombre: '',
          ancho: 0,
          alto: 0,
          coste: 0,
          merma: 0,
          limpieza: 0,
          mascara: 0,
          pintura: 0,
          tiempo_corte: 0,
          mano_obra: 0,
          IVA: 0
        };
        this.presentalertconfirmacion();
         this.getMateriales()
      },
      error: (err) => {
        console.error('Error creando material:', err);
      }
    });
   
}


 getMateriales() {
  this.http.get<any[]>(`${this.localapi}/getmaterials`)
    .subscribe({
      next: (res) => {
        this.materiales = res;
        console.log(this.materiales)
      },
      error: (err) => {
        console.error(err);
      }
    });
}

seleccionarMaterial(material: any) {
  this.materialEdit = { ...material }; // copia segura
  this.isEditModalOpen = true;
}

formatearFecha(fecha: string) {
  return new Date(fecha).toLocaleString('es-ES');
}

guardarEdicion() {
  this.http.put(
    `${this.localapi}/materials/${this.materialEdit.id}`,
    this.materialEdit
  ).subscribe({
    next: (res) => {
      console.log('Actualizado:', res);
      this.isEditModalOpen = false;
      this.getMateriales();
      this.cerrarModal()
      this.presentalertconfirmacion();
    },
    error: (err) => {
      console.error(err);
    }
  });
}

 async presentalertconfirmacion() {
    const alert = await this.alertController.create({
      header: 'Guardado con exito',
      subHeader: 'pulse el boton de abajo para continuar',
      buttons: ['Close'],
    });

    await alert.present();
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
          this.deletematerials(material);
        }
      }
    ]
  });

  await alert.present();
}


deletematerials(material: any) {

  const id = material.id;

  this.http.delete(`${this.localapi}/deletematerial/${id}`)
    .subscribe({
      next: (res) => {
        console.log('Eliminado:', res);
        this.getMateriales();
      },
      error: (err) => {
        console.error(err);
      }
    });

}
}