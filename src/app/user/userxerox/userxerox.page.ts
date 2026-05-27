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
  IonToolbar,
  IonTextarea
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';

interface Papel {
  id: number;
  nombre: string;
  precio_papel: string | number;
}

interface ConfigGlobal {
  plastificado: number;
  iva: number;
  grapado: number;
  coste_grapado:number,
  mano_obra:number,
  blanco_negro:number,
  color:number,
  hendido_coste:number,
  hendido_maquina:number
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
    IonRadio, IonList, IonRadioGroup, IonToggle,
    IonTextarea
  ]
})
export class UserxeroxPage implements OnInit {

  constructor(
    private http: HttpClient,
    private alertController: AlertController
  ) {}

  public localapi: string = 'https://backend-ofwl.onrender.com';
  public papeles: Papel[] = [];
  public miPdf: Blob | null = null;
   public multiplicador:number = 3;
 public multiplicadorradio:number = 0;

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
  caraA: 'color', // 'bn' | 'color'
  caraB: 'color', // 'bn' | 'color'

  // 📦 EXTRA
  plastificado: false,

  // 🟡 LEGACY (si lo estabas usando antes en lógica vieja)
  una_cara: true,
  doble_cara: false,
  grapado: false,
  descripcion: 'Escriba una descripción...',
  mano_obra_tiempo: 0,
  hendidos_cantidad: 0
};

public configGlobal: ConfigGlobal = {
  plastificado: 0,
  iva: 21,
  grapado: 0,
  coste_grapado: 0,
  mano_obra: 0,
  blanco_negro: 0,
  color: 0,
  hendido_coste: 0,
  hendido_maquina: 0
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

  const hendidos = n(this.form.hendidos_cantidad);

  const paginas = n(this.form.paginas);
  const copias = n(this.form.copias) || 1;

  // 🔥 FACTOR TAMAÑO
  const factor = this.factorTamano(this.form.tamano);

  const esUna = this.form.modo_cara === 'una';
  const esDoble = this.form.modo_cara === 'doble';

  let hojas = paginas;

  // 📄 DOBLE CARA
  if (esDoble) {
    hojas = Math.ceil(paginas / 2);
  }

  let total = 0;

  // 🖨️ PRECIOS GLOBALES
  const precioBN = n(this.configGlobal.blanco_negro);
  const precioColor = n(this.configGlobal.color);

  // 🟢 UNA CARA
  if (esUna) {

    const precio =
      this.form.una_cara_tipo === 'color'
        ? precioColor
        : precioBN;

    // 🔥 aplicar factor tamaño
    total += paginas * (precio / factor);
  }

  // 🔵 DOBLE CARA
  if (esDoble) {

    const precioA =
      this.form.caraA === 'color'
        ? precioColor
        : precioBN;

    const precioB =
      this.form.caraB === 'color'
        ? precioColor
        : precioBN;

    // 🔥 aplicar factor tamaño
    total += hojas * ((precioA + precioB) / factor);
  }

  // 📄 PAPEL
  total += hojas * (n(papel.precio_papel) / factor);

  // 🔁 COPIAS
  total *= copias;

  // 🔥 PLASTIFICADO
  if (this.form.plastificado) {

    total +=
      hojas *
      (n(this.configGlobal.plastificado) / factor) *
      copias;
  }

  // 🧷 GRAPADO
  if (this.form.grapado) {

    total += n(this.configGlobal.coste_grapado);
  }

  // 📐 HENDIDO
  if (hendidos > 0) {

    // coste variable
    total +=
      hendidos *
      n(this.configGlobal.hendido_coste);

    // coste fijo máquina
    total +=
      n(this.configGlobal.hendido_maquina);
  }

  // 👷 MANO DE OBRA
  const minutos = n(this.form.mano_obra_tiempo);

  const costeManoObra =
    minutos *
    (n(this.configGlobal.mano_obra) / 60);

  total += costeManoObra;

  // 🧾 IVA
  this.subtotal = total;

  this.IVA =
    total *
    (n(this.configGlobal.iva) / 100);

this.IVA = this.IVA * this.multiplicador;

this.subtotal = this.subtotal * this.multiplicador;

  this.totalCalculado =
    total + this.IVA;
    this.multiplicadorradio = this.totalCalculado * this.multiplicador;
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
          iva: Number(res.iva) || 21,
          grapado: Number(res.grapado) || 0,
          coste_grapado: Number(res.coste_grapado) || 0,
          mano_obra: Number(res.mano_obra) || 0,
          blanco_negro: Number(res.blanco_negro) || 0,
          color: Number(res.color) || 0,
          hendido_coste: Number(res.hendido_coste) || 0,
          hendido_maquina: Number(res.hendido_maquina) || 0
        };
      },
      error: (err) => {
        console.error('Error cargando config xerox:', err);
      }
    });
}
  

onMultiplicadorChange(event: any) {
  this.multiplicador = Number(event.detail.value);
  this.calcularXerox();
}
}