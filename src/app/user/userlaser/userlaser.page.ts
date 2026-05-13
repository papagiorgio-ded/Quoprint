import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonRadio, IonRadioGroup, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';

interface ConfigGlobal {
  mano_obra: number;
  iva: number;
  limpieza: number;
  mascara: number;
  pintura: number;
  tiempo_corte: number;
}
@Component({
  selector: 'app-userlaser',
  templateUrl: './userlaser.page.html',
  styleUrls: ['./userlaser.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonInput,IonItem,IonLabel,IonButton,IonButtons,IonSelectOption,IonSelect,IonCheckbox,IonRadio,IonList,IonRadioGroup ]
})
export class UserlaserPage implements OnInit {

  constructor(private http: HttpClient,private alertController: AlertController) { }
  public materiales: any[] = [];
 public materialSeleccionado: any;
 public totalCalculado:any;
 public configGlobal: ConfigGlobal = {
  mano_obra: 0,
  iva: 21,
  limpieza: 0,
  mascara: 0,
  pintura: 0,
  tiempo_corte: 0
 };
 public multiplicador:number = 3;
 public multiplicadorradio:number = 0;
 public subtotal:number = 0;
 public IVA:number = 0;
  public localapi:string = 'http://localhost:3000'
  ngOnInit() {

    this.getMateriales()
    this.getConfigGlobal()
  }

   public form = {
    material: '',
    ancho: 0,
     alto: 0,
      tiempo_corte: 0,
      mano_obra: 0,
      unidades: 0,
      pintado: false
     // ultima_mod: 0,
  };



calcular() {

  if (!this.materialSeleccionado) return;

  const m = this.materialSeleccionado;
  const g = this.configGlobal;

  const n = (v: any) => Number(v) || 0;

  // 📏 ÁREAS
  const areaPlancha = n(m.ancho_cm) * n(m.alto_cm);
  const areaPieza = n(this.form.ancho) * n(this.form.alto);
  const unidades = n(this.form.unidades || 1);

  if (areaPlancha === 0 || areaPieza === 0) {
    this.totalCalculado = 0;
    return;
  }

  // 💰 COSTE BASE CM²
  const costeBaseCm2 = n(m.coste) / areaPlancha;

  // 📦 MATERIAL
  const costeMaterial = costeBaseCm2 * areaPieza * unidades;

  // 🧠 GLOBAL (ya no viene del material)
  const mascara = n(g.mascara) * areaPieza * unidades;

  const pintura = this.form.pintado
    ? n(g.pintura) * unidades
    : 0;

  const corte =
  n(this.form.tiempo_corte) *
  n(g.mano_obra);

  const limpieza = n(g.limpieza) * unidades;

  const tiempoCorte = n(g.tiempo_corte);
const manoHora = n(g.mano_obra);

const manoObra =
  (tiempoCorte / 60) *
  manoHora *
  unidades;

  // 📊 SUBTOTAL
  let subtotal =
    costeMaterial +
    mascara +
    pintura +
    corte +
    limpieza +
    manoObra;

  // 📉 MERMA (sí sigue en material)
  subtotal *= 1 + n(m.merma_porcentaje) / 100;

  // 🧾 IVA (GLOBAL ahora)
  const total = subtotal * (1 + n(g.iva) / 100);

  // 🎯 RESULTADO FINAL
  this.multiplicadorradio = total * this.multiplicador;
  this.totalCalculado = total;
  this.subtotal = subtotal;
  this.IVA = total - subtotal;

  
}


   getMateriales() {
  this.http.get<any[]>(`${this.localapi}/getmaterials`)
    .subscribe({
      next: (res) => {
        this.materiales = res;
        
      },
      error: (err) => {
        console.error(err);
      }
    });
}



onMultiplicadorChange(event: any) {
  this.multiplicador = Number(event.detail.value);
  this.calcular();
}
miPdf: any; 

generarPDF() {
  const doc = new jsPDF();

  const m = this.materialSeleccionado;

  //  HEADER
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PixelTrade Laser', 10, 15);

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

  doc.text('Material:', 10, y);
  doc.text(m?.nombre || '-', 80, y);

  y += 10;
  doc.text('Tamaño:', 10, y);
  doc.text(`${this.form.ancho} x ${this.form.alto} cm`, 80, y);

  y += 10;
  doc.text('Unidades:', 10, y);
  doc.text(`${this.form.unidades}`, 80, y);

  y += 10;
  doc.text('Pintado:', 10, y);
  doc.text(this.form.pintado ? 'Sí' : 'No', 80, y);

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
  doc.text('IVA:', boxX + 5, ty);
  doc.text(`${this.IVA.toFixed(2)} €`, boxX + 75, ty, { align: 'right' });

  ty += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', boxX + 5, ty);
  doc.text(`${this.totalCalculado.toFixed(2)} €`, boxX + 75, ty, { align: 'right' });

  ty += 10;
  doc.setFont('helvetica', 'normal');
  doc.text('Ganancia esperada:', boxX + 5, ty);
  doc.text(`${this.multiplicadorradio.toFixed(2)} €`, boxX + 75, ty, { align: 'right' });

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
getConfigGlobal() {
  this.http.get<any>(`${this.localapi}/config-global`)
    .subscribe({
      next: (res) => {
        console.log('Config global:', res);

        this.configGlobal = {
          mano_obra: Number(res.mano_obra) || 0,
          iva: Number(res.iva) || 21,
          limpieza: Number(res.limpieza) || 0,
          mascara: Number(res.mascara) || 0,
          pintura: Number(res.pintura) || 0,
          tiempo_corte: Number(res.tiempo_corte) || 0
        };
      },
      error: (err) => console.error(err)
    });
}
}
