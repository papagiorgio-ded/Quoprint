import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonRadio, IonRadioGroup, IonSelect, IonSelectOption, IonTitle, IonToolbar,IonRange } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-userdtf',
  templateUrl: './userdtf.page.html',
  styleUrls: ['./userdtf.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonInput,IonItem,IonLabel,IonButton,IonButtons,IonSelectOption,IonSelect,IonCheckbox,IonRadio,IonList,IonRadioGroup,IonRange ]
})
export class UserdtfPage implements OnInit {

  constructor(private http: HttpClient,private alertController: AlertController) { }

form = {
  ancho: 0,
  alto: 0,
  unidades: 1,

  densidad_tinta: 50, // %
  calidad: 'normal', // normal | alta

  film_m2: 0,
  precio_film_m2: 0,

  tinta_cm: 0,
  tinta_blanca_factor: 1.5,

  polvo_m2: 0,
  precio_polvo_kg: 0,

  electricidad_kwh: 0.3,
  precio_kwh: 0.2,

  mano_obra_min: 0,
  precio_min: 0,

  merma: 12
};
public subtotal:number = 0;

public totalCalculado:number = 0;

public totalVenta:number = 0;

public miPdf: any;
 public localapi:string = 'http://localhost:3000'


  ngOnInit() {


  }


  calcularDTF() {
    if(!this.form.ancho && !this.form.alto) {
      return;
    }

  const n = (v: any) => Number(v) || 0;

  const area = (n(this.form.ancho) * n(this.form.alto)) / 10000; // cm² → m²
  const unidades = n(this.form.unidades);

  // 🧪 TINTA
  const tintaBase = area * (n(this.form.densidad_tinta) / 100);
  const tintaBlanca = tintaBase * n(this.form.tinta_blanca_factor);
  //TELA
   const factoresTela: any = {
    normal: 1,
    alta: 1.3
  };

  const factorTela = factoresTela[this.form.calidad] || 1;
  const costeTinta =
    (tintaBase + tintaBlanca) *
    n(this.form.tinta_cm) *
    unidades;

  // 🎞️ FILM
  const costeFilm =
    area *
    n(this.form.precio_film_m2) *
    unidades;

  // ⚡ ELECTRICIDAD
  const costeElectricidad =
    area *
    n(this.form.electricidad_kwh) *
    n(this.form.precio_kwh) *
    unidades;

  // 🧽 POLVO
  const costePolvo =
    area *
    n(this.form.precio_polvo_kg) *
    unidades;

  // 👷 MANO DE OBRA
  const costeManoObra =
    n(this.form.mano_obra_min) *
    n(this.form.precio_min) *
    unidades;

  // 📦 SUBTOTAL
  let subtotal =
    (costeTinta +
    costeFilm +
    costePolvo +
    costeElectricidad +
    costeManoObra) * factorTela;

    subtotal *= factorTela;

  // 📉 MERMA
  subtotal *= 1 + n(this.form.merma) / 100;

  // 💸 TOTAL COSTE
  this.subtotal = subtotal;
  this.totalCalculado = subtotal;

  // 💰 PRECIO VENTA (40% margen)
  const beneficio = 1.4;
  this.totalVenta = subtotal * beneficio;

 
}

generarPDF() {
  const doc = new jsPDF();


  //  HEADER
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PixelTrade DTF', 10, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Presupuestos personalizados', 10, 20);

  //  FECHA (derecha)
  const fecha = new Date().toLocaleDateString();
  doc.text(`Fecha: ${fecha}`, 200, 15, { align: 'right' });

  //  LINEA SEPARADORA
  doc.line(10, 25, 200, 25);

  //  TÍTULO
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESUPUESTO', 105, 35, { align: 'center' });

    // Bloques
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  let y = 50;

  doc.text('DTF', 10, y);

  y += 10;
  doc.text('Tamaño:', 10, y);
  doc.text(`${this.form.ancho} x ${this.form.alto} cm`, 80, y);

 doc.text('Mano de obra (min):', 110, y);
  doc.text(`${this.form.mano_obra_min}`, 180, y);

  y += 10;
  doc.text('Unidades:', 10, y);
  doc.text(`${this.form.unidades}`, 80, y);

  doc.text('Polvo adhesivo (€/kg):', 110, y);
  doc.text(`${this.form.precio_polvo_kg}`, 180, y);

  y += 10;
  doc.text('Calidad:', 10, y);
  doc.text(this.form.calidad, 80, y);

  
    y += 10;
  doc.text('Film(cm):', 10, y);
  doc.text(this.form.film_m2.toFixed(2), 80, y);

    y += 10;
  doc.text('Tinta (ml):', 10, y);
  doc.text(this.form.tinta_cm.toFixed(2), 80, y);

    y += 10;
  doc.text('Densidad Tinta (%):', 10, y);
  doc.text(this.form.densidad_tinta.toFixed(2), 80, y);

  //  LINEA
  y += 10;
  doc.line(10, y, 200, y);

  //  TOTALES (CAJA DERECHA)
  y += 10;

  const boxX = 120;
  const boxY = y;

  doc.rect(boxX, boxY, 80, 50);

  let ty = boxY + 10;

  doc.setFontSize(11);

  doc.text('Subtotal:', boxX + 5, ty);
  doc.text(`${this.subtotal.toFixed(2)} €`, boxX + 75, ty, { align: 'right' });

  ty += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', boxX + 5, ty);
  doc.text(`${this.totalCalculado.toFixed(2)} €`, boxX + 75, ty, { align: 'right' });

  ty += 10;
  doc.setFont('helvetica', 'normal');
  doc.text('Precio de Venta (recomendado):', boxX + 5, ty);
  doc.text(`${this.totalVenta.toFixed(2)} €`, boxX + 75, ty, { align: 'right' });

  //  FOOTER
  doc.setFontSize(9);
  doc.text('Gracias por confiar en PixelTrade', 105, 280, { align: 'center' });

  //  GUARDAR
  this.miPdf = doc.output('blob');

  console.log(' PDF generado');
}

enviarPDF() {
  this.generarPDF()
  if (!this.miPdf) {
    console.warn('❌ No hay PDF generado');
    return;
  }

  const formData = new FormData();

  formData.append('file', this.miPdf, 'presupuesto.pdf');
  formData.append('email', localStorage.getItem('email') || '');

  this.http.post(`${this.localapi}/upload-pdf`, formData)
    .subscribe({
      next: () => {
        console.log('✅ PDF enviado');
      },
      error: (err) => {
        console.error('❌ Error enviando PDF', err);
      }
    });
    this.presentalertpdfemail()
}

async presentalertpdfemail() {
    const alert = await this.alertController.create({
      header: 'Enviado con exito',
      subHeader: 'Revise la bandeja de spam si no le sale',
      buttons: ['Close'],
    });

    await alert.present();
  }

 imprimirPDF() {
    this.generarPDF()
  if (!this.miPdf) {
    console.warn('❌ No hay PDF generado');
    return;
  }

  const url = URL.createObjectURL(this.miPdf);

  const win = window.open(url);
  if (!win) return;

  win.onload = () => {
    win.print();
  };
}

}
