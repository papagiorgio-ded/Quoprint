import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';

interface Papel {
  id: number;
  nombre: string;
  blanco_negro: string | number;
  color: string | number;
  precio_papel: string | number;
}

interface ConfigGlobal {
  plastificado: number;
  iva: number;
}

@Component({
  selector: 'app-userxerox',
  templateUrl: './userxerox.page.html',
  styleUrls: ['./userxerox.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    CommonModule, FormsModule,
    IonInput, IonItem, IonLabel, IonButton, IonButtons,
    IonSelectOption, IonSelect, IonCheckbox,
    IonRadio, IonList, IonRadioGroup, IonToggle
  ]
})
export class UserxeroxPage implements OnInit {

  constructor(
    private http: HttpClient,
    private alertController: AlertController
  ) {}

  public localapi: string = 'http://localhost:3000';
  public papeles: Papel[] = [];
  public miPdf: Blob | null = null;

  subtotal: number = 0;
  IVA: number = 0;
  totalCalculado: number = 0;
form: any = {
  // 📄 LO VIEJO (compatibilidad)
  paginas: 0,
  copias: 1,
  tamano: 'A4',
  tipo_papel: null as Papel | null,

  // 🔁 SISTEMA NUEVO (control limpio de cara)
  modo_cara: 'una', // 'una' | 'doble'

  // 🟢 UNA CARA (nuevo sistema)
  una_cara_tipo: 'bn', // 'bn' | 'color'

  // 🔵 DOBLE CARA (nuevo sistema)
  caraA: 'bn', // 'bn' | 'color'
  caraB: 'bn', // 'bn' | 'color'

  // 📦 EXTRA
  plastificado: false,

  // 🟡 LEGACY (si lo estabas usando antes en lógica vieja)
  una_cara: true,
  doble_cara: false
};

public configGlobal: ConfigGlobal = {
  plastificado: 0,
  iva: 21
};

syncModoCara() {
  this.form.una_cara = this.form.modo_cara === 'una';
  this.form.doble_cara = this.form.modo_cara === 'doble';
}

onModoCaraChange() {
  this.syncModoCara();
  this.calcularXerox();
}

  ngOnInit() {
    this.getpapels();
     this.getConfigGlobalXerox();
  }

  // 🔁 EVITAR CONFLICTO
  onUnaCaraChange() {
    if (this.form.una_cara) {
      this.form.doble_cara = false;
    }
  }

  onDobleCaraChange() {
    if (this.form.doble_cara) {
      this.form.una_cara = false;
    }
  }

  // 🧮 CALCULO PRINCIPAL
  factorTamano(tamano: string): number {
  switch (tamano) {
    case 'SRA3': return 1;
    case 'A4': return 2;
    case 'A5': return 4;
    case 'A6': return 8;
    case 'A7': return 16;
    default: return 2;
  }
}
calcularXerox() {

  const n = (v: any) => parseFloat(v) || 0;

  const papel = this.form.tipo_papel;
  if (!papel) return;

  const paginas = n(this.form.paginas);
  const copias = n(this.form.copias) || 1;

  const esUna = this.form.modo_cara === 'una';
  const esDoble = this.form.modo_cara === 'doble';

  let hojas = paginas;

  // 📄 DOBLE CARA = menos hojas
  if (esDoble) {
    hojas = Math.ceil(paginas / 2);
  }

  const precioBN = n(papel.blanco_negro);
  const precioColor = n(papel.color);

  let total = 0;

  // 🟢 UNA CARA
  if (esUna) {
    const precio = this.form.una_cara_tipo === 'color'
      ? precioColor
      : precioBN;

    total += paginas * precio;
  }

  // 🔵 DOBLE CARA
  if (esDoble) {
    const precioA = this.form.caraA === 'color' ? precioColor : precioBN;
    const precioB = this.form.caraB === 'color' ? precioColor : precioBN;

    total += hojas * (precioA + precioB);
  }

  // 📄 COSTE PAPEL
  total += hojas * n(papel.precio_papel);

  // 🔁 COPIAS
  total *= copias;

  // 🔥 PLASTIFICADO (GLOBAL ✅)
  if (this.form.plastificado) {
    total += hojas * n(this.configGlobal.plastificado) * copias;
  }

  // 🧾 IVA (MEJOR GLOBAL)
  this.subtotal = total;
  this.IVA = total * (n(this.configGlobal.iva) / 100);
  this.totalCalculado = total + this.IVA;
}

  // 📦 BACKEND
  getpapels() {
    this.http.get<Papel[]>(`${this.localapi}/getpapels`)
      .subscribe({
        next: (res) => {
          this.papeles = res;
        },
        error: (err) => {
          console.error('Error obteniendo papeles:', err);
        }
      });
  }

  // 📄 PDF
  generarPDF() {

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('PixelTrade Xerox', 10, 15);

    const fecha = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Fecha: ${fecha}`, 200, 15, { align: 'right' });

    doc.line(10, 25, 200, 25);

    doc.setFontSize(16);
    doc.text('PRESUPUESTO', 105, 35, { align: 'center' });

    let y = 50;

    doc.text(`Copias: ${this.form.copias}`, 10, y);

    y += 10;
    doc.line(10, y, 200, y);

    y += 10;

    doc.text(`Subtotal: ${this.subtotal.toFixed(2)} €`, 10, y);
    doc.text(`IVA: ${this.IVA.toFixed(2)} €`, 10, y + 10);
    doc.text(`TOTAL: ${this.totalCalculado.toFixed(2)} €`, 10, y + 20);

    this.miPdf = doc.output('blob');
  }

  enviarPDF() {

    this.generarPDF();

    if (!this.miPdf) return;

    const formData = new FormData();

    formData.append('file', this.miPdf, 'presupuesto.pdf');
    formData.append('email', localStorage.getItem('email') || '');

    this.http.post(`${this.localapi}/upload-pdf`, formData)
      .subscribe({
        next: () => console.log('PDF enviado'),
        error: (err) => console.error(err)
      });

    this.presentalertpdfemail();
  }

  async presentalertpdfemail() {
    const alert = await this.alertController.create({
      header: 'Enviado con éxito',
      subHeader: 'Revisa spam si no aparece',
      buttons: ['OK']
    });

    await alert.present();
  }

  imprimirPDF() {

    this.generarPDF();

    if (!this.miPdf) return;

    const url = URL.createObjectURL(this.miPdf);

    const win = window.open(url);
    if (!win) return;

    win.onload = () => win.print();
  }

  getConfigGlobalXerox() {
  this.http.get<any>(`${this.localapi}/config-global_xerox`)
    .subscribe({
      next: (res) => {
        console.log('Config Xerox:', res);

        this.configGlobal = {
          plastificado: Number(res.plastificado) || 0,
          iva: Number(res.iva) || 21
        };
      },
      error: (err) => {
        console.error('Error cargando config xerox:', err);
      }
    });
}
  
}