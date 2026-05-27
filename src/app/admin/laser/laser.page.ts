import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
  IonButtons,
  IonList,
  IonListHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/angular/standalone';

interface ConfigGlobal {
  mano_obra: number;
  iva: number;
  limpieza: number;
  mascara: number;
  pintura: number;
  tiempo_corte: number;
}

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
    IonButtons,
    IonList,
    IonListHeader,
  IonInfiniteScroll,
IonInfiniteScrollContent  ]
})
export class LaserPage {

  constructor(
    private http: HttpClient,
    private alertController: AlertController
  ) {}

  public localapi: string = 'https://backend-ofwl.onrender.com';

  // 🔥 CONFIG GLOBAL
  configGlobal: ConfigGlobal = {
    mano_obra: 0,
    iva: 0,
    limpieza: 0,
    mascara: 0,
    pintura: 0,
    tiempo_corte: 0
  };
hayCambios = false;

camposModificados: string[] = [];
  busqueda: string = '';
materialesFiltrados: any[] = [];
materialesVisibles: any[] = [];

limite: number = 10;
offset: number = 0;

  // 📦 FORM MATERIAL
  public form = {
    nombre: '',
    ancho: 0,
    alto: 0,
    coste: 0,
    merma: 0
  };

  public materiales: any[] = [];

  public isModalOpencreatematerial = false;
  public isEditModalOpen = false;

  public materialEdit: any = {};

  ngOnInit() {
    this.getMateriales();
    this.getConfig(); // 🔥 cargar config global
  }

  // =========================
  // 🔍 VALIDACIONES
  // =========================

  validarFormMaterial(): boolean {
    const f = this.form;

    if (!f.nombre || f.nombre.trim() === '') return false;
    if (f.ancho <= 0) return false;
    if (f.alto <= 0) return false;
    if (f.coste <= 0) return false;
    if (f.merma < 0) return false;

    return true;
  }

  validarConfig(): boolean {
    const c = this.configGlobal;

    return !(
      c.mano_obra < 0 ||
      c.iva < 0 ||
      c.limpieza < 0 ||
      c.mascara < 0 ||
      c.pintura < 0 ||
      c.tiempo_corte < 0
    );
  }

  async mostrarError(msg: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  // =========================
  // 📦 CRUD MATERIAL
  // =========================

  abrirModal() {
    this.isModalOpencreatematerial = true;
  }

  cerrarModal() {
    this.isModalOpencreatematerial = false;
  }

  crearMaterial() {

    if (!this.validarFormMaterial()) {
      this.mostrarError('❌ Todos los campos del material son obligatorios');
      return;
    }

    const payload = { ...this.form };

    this.http.post(`${this.localapi}/materials`, payload)
      .subscribe({
        next: () => {

          this.isModalOpencreatematerial = false;

          this.form = {
            nombre: '',
            ancho: 0,
            alto: 0,
            coste: 0,
            merma: 0
          };

          this.presentalertconfirmacion();
          this.getMateriales();
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  getMateriales() {
    this.http.get<any[]>(`${this.localapi}/getmaterials`)
      .subscribe({
    
        next: (res) => this.materiales = res,
        error: (err) => console.error(err),
          

        
      });
  }

  seleccionarMaterial(material: any) {
    this.materialEdit = { ...material };
    this.isEditModalOpen = true;
  }
guardarEdicion() {

  if (!this.materialEdit.nombre || this.materialEdit.nombre.trim() === '') {
    this.mostrarError('❌ El nombre no puede estar vacío');
    return;
  }

  this.http.put(
    `${this.localapi}/materials/${this.materialEdit.id}`,
    this.materialEdit
  ).subscribe({
    next: () => {
      this.isEditModalOpen = false;
      this.getMateriales();
      this.presentalertconfirmacion();
    },
    error: (err) => console.error(err)
  });
}
 guardarConfigGlobal() {

  // 🧠 VALIDACIÓN (evitar null / undefined)
  if (
    this.configGlobal.mano_obra == null ||
    this.configGlobal.iva == null ||
    this.configGlobal.limpieza == null ||
    this.configGlobal.mascara == null ||
    this.configGlobal.pintura == null ||
    this.configGlobal.tiempo_corte == null
  ) {
    this.mostrarError('❌ Faltan campos en la configuración global');
    return;
  }

  // 🧠 VALIDACIÓN EXTRA (opcional pero recomendable)
  if (this.configGlobal.iva < 0 || this.configGlobal.iva > 100) {
    this.mostrarError('❌ El IVA no es válido');
    return;
  }

  this.http.put(
    `${this.localapi}/config-global_laser`,
    this.configGlobal
  ).subscribe({
    next: () => {
      this.presentalertconfirmacion();
    },
    error: (err) => {
      console.error(err);
      this.mostrarError('❌ Error guardando configuración');
    }
  });
}

  deletematerials(material: any) {

    this.http.delete(`${this.localapi}/deletematerial/${material.id}`)
      .subscribe({
        next: () => this.getMateriales(),
        error: (err) => console.error(err)
      });
  }

  async presentalertdelete(material: any) {
    const alert = await this.alertController.create({
      header: '¿Eliminar material?',
      message: 'No se puede deshacer',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deletematerials(material)
        }
      ]
    });

    await alert.present();
  }

  // =========================
  // 🌍 CONFIG GLOBAL
  // =========================

  guardarConfig() {

    if (!this.validarConfig()) {
      this.mostrarError('❌ Configuración global inválida');
      return;
    }

    this.http.post(`${this.localapi}/config-global_laser`, this.configGlobal)
      .subscribe({
        next: () => this.presentalertconfirmacion(),
        error: (err) => console.error(err)

        
      });

      this.hayCambios = false;
        this.camposModificados = [];
  }

  getConfig() {
    this.http.get<ConfigGlobal>(`${this.localapi}/config-global_laser`)
      .subscribe({
        next: (res) => this.configGlobal = res,
        error: (err) => console.error(err)
      });
  }

  // =========================
  // 🔔 ALERTA OK
  // =========================

  async presentalertconfirmacion() {
    const alert = await this.alertController.create({
      header: 'Guardado con éxito',
      buttons: ['OK']
    });

    await alert.present();
  }

  onEditModalClose() {
  this.isEditModalOpen = false;
}

onCreateModalClose() {
  this.isModalOpencreatematerial = false;

  this.form = {
    nombre: '',
    ancho: 0,
    alto: 0,
    coste: 0,
    merma: 0
  };
}

filtrarMateriales() {
  const texto = this.busqueda.toLowerCase().trim();

  this.materialesFiltrados = this.materiales.filter(m =>
    m.nombre.toLowerCase().includes(texto)
  );

  this.resetScroll();
}

resetScroll() {
  this.offset = 0;
  this.materialesVisibles = [];

  this.loadMore();
}

loadMore(event?: any) {

  const data = this.materialesFiltrados.length
    ? this.materialesFiltrados
    : this.materiales;

  const siguiente = data.slice(this.offset, this.offset + this.limite);

  this.materialesVisibles = [
    ...this.materialesVisibles,
    ...siguiente
  ];

  this.offset += this.limite;

  if (event) {
    event.target.complete();

    if (this.offset >= data.length) {
      event.target.disabled = true;
    }
  }
}

marcarCambio(campo: string) {

  this.hayCambios = true;

  if (!this.camposModificados.includes(campo)) {
    this.camposModificados.push(campo);
  }
}
}