import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonRadio, IonRadioGroup, IonRange, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-userploter',
  templateUrl: './userploter.page.html',
  styleUrls: ['./userploter.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonInput,IonItem,IonLabel,IonButton,IonButtons,IonSelectOption,IonSelect,IonCheckbox,IonRadio,IonList,IonRadioGroup,IonRange ]
})
export class UserploterPage implements OnInit {

  constructor(private http: HttpClient,private alertController: AlertController) { }

    
async presentalertpdfemail() {
    const alert = await this.alertController.create({
      header: 'Enviado con exito',
      subHeader: 'Revise la bandeja de spam si no le sale',
      buttons: ['Close'],
    });

    await alert.present();
  }
public localapi:string = 'http://localhost:3000'
 public totalVenta:any;
 public totalCalculado:any;
 public multiplicador:number = 3;
 public multiplicadorradio:number = 0;
 public subtotal:number = 0;
 public IVA:number = 0;
 public miPdf: any;
  ngOnInit() {

  
  }

  form = {
  ancho: 0,
  alto: 0,
  unidades: 0,

  tipo_trabajo: 'corte', // corte | impresion
  tipo_material: 'normal', // normal | premium | textil
  complejidad: 'simple', // simple | media | compleja

  precio_material_m2: 0,
  precio_tinta_ml: 0,

  densidad_tinta: 0,

  tiempo_min: 0,
  precio_min: 0,

  desgaste_unidad: 0,

  merma: 15
};



calcularPlotter() {

  const n = (v: any) => Number(v) || 0;

  const area = (n(this.form.ancho) * n(this.form.alto)) / 10000;
  const unidades = n(this.form.unidades);

  // 🧵 MATERIAL
  const factoresMaterial: any = {
    normal: 1,
    premium: 1.3,
    textil: 1.5
  };

  const factorMaterial = factoresMaterial[this.form.tipo_material] || 1;

  const costeMaterial =
    area *
    n(this.form.precio_material_m2) *
    unidades *
    factorMaterial;

  // 🧪 TINTA (solo impresión)
  let costeTinta = 0;

  if (this.form.tipo_trabajo === 'impresion') {
    const consumoTinta = area * (n(this.form.densidad_tinta) / 100);

    costeTinta =
      consumoTinta *
      n(this.form.precio_tinta_ml) *
      unidades;
  }

  // ⚙️ COMPLEJIDAD → más tiempo
  const factoresComplejidad: any = {
    simple: 1,
    media: 1.5,
    compleja: 2
  };

  const factorComplejidad = factoresComplejidad[this.form.complejidad] || 1;

  // 👷 MANO DE OBRA
  const costeManoObra =
    n(this.form.tiempo_min) *
    n(this.form.precio_min) *
    unidades *
    factorComplejidad;

  // 🔧 DESGASTE
  const costeDesgaste =
    n(this.form.desgaste_unidad) * unidades;

  // 📦 SUBTOTAL
  let subtotal =
    costeMaterial +
    costeTinta +
    costeManoObra +
    costeDesgaste;

  // 📉 MERMA
  subtotal *= 1 + n(this.form.merma) / 100;

  // 💸 COSTE FINAL
  this.subtotal = subtotal;
  this.totalCalculado = subtotal;

  // 💰 DESCUENTO POR VOLUMEN
  let descuento = 0;

  if (unidades >= 50) descuento = 0.1;
  if (unidades >= 100) descuento = 0.2;

  // 💰 PRECIO VENTA
  const margen = 60;

  this.totalVenta =
    subtotal *
    (1 + margen / 100) *
    (1 - descuento);

  
}


generarPDF() {
  const doc = new jsPDF();

  //  HEADER
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PixelTrade Plotter', 10, 15);

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

  doc.text('Unidades:', 10, y);
  doc.text(`${this.form.unidades}`, 80, y);

  doc.text('Precio tinta (ml):', 110, y);
  doc.text(`${this.form.precio_tinta_ml}`, 180, y);

  y += 10;
  doc.text('Tamaño:', 10, y);
  doc.text(`${this.form.ancho} x ${this.form.alto} cm`, 80, y);
   doc.text('Densidad tinta:', 110, y);
  doc.text(`${this.form.densidad_tinta}`, 180, y);
   

   y += 10;
  doc.text('Complejidad:', 10, y);
  doc.text(`${this.form.complejidad}`, 80, y);
  doc.text('Tipo trabajo:', 110, y);
  doc.text(`${this.form.tipo_trabajo}`, 180, y);
  

   y += 10;
  doc.text('Tipo de material:', 10, y);
  doc.text(`${this.form.tipo_material}`, 80, y);
   doc.text('Precio min:', 110, y);
  doc.text(`${this.form.precio_min}`, 180, y);

   y += 10;
  doc.text('Precio material:', 10, y);
  doc.text(`${this.form.precio_material_m2} €/m²`, 80, y);
   doc.text('Desgaste unidad:', 110, y);
  doc.text(`${this.form.desgaste_unidad}`, 180, y);

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
