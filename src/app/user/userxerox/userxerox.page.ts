import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonRadio, IonRadioGroup, IonSelect, IonSelectOption, IonTitle, IonToggle, IonToolbar } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';
@Component({
  selector: 'app-userxerox',
  templateUrl: './userxerox.page.html',
  styleUrls: ['./userxerox.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonInput,IonItem,IonLabel,IonButton,IonButtons,IonSelectOption,IonSelect,IonCheckbox,IonRadio,IonList,IonRadioGroup,IonToggle ]
})
export class UserxeroxPage implements OnInit {

  constructor(private http: HttpClient,private alertController: AlertController) { }
  public miPdf: any;
  public localapi:string = 'http://localhost:3000'

  
async presentalertpdfemail() {
    const alert = await this.alertController.create({
      header: 'Enviado con exito',
      subHeader: 'Revise la bandeja de spam si no le sale',
      buttons: ['Close'],
    });

    await alert.present();
  }
form = {
  copias: 0,
  color: false,
  tamano: 'A4',
  tipo_papel: 'normal',
  mano_obra: 0
};

subtotal = 0;
totalCalculado = 0;
IVA = 0;
  ngOnInit() {
  }

  calcularXerox() {

  const n = (v: any) => Number(v) || 0;

  const copias = n(this.form.copias);
  const color = this.form.color; // true/false
  const tamano = this.form.tamano; // A4, A3
  const tipoPapel = this.form.tipo_papel; // normal, premium

  // 💰 coste base
  let costePorCopia = color ? 0.10 : 0.02;

  // 📏 tamaño
  if (tamano === 'A3') {
    costePorCopia *= 1.5;
  }

  // 📄 tipo papel
  if (tipoPapel === 'premium') {
    costePorCopia *= 1.3;
  }

  // 📦 total base
  let total = costePorCopia * copias;

  // 👷 mano de obra (opcional)
  const manoObra = n(this.form.mano_obra) * copias;

  total += manoObra;

  // 💸 IVA
  const totalFinal = total * 1.21;

  this.totalCalculado = totalFinal;
  this.subtotal = total;
  this.IVA = totalFinal - total;

  
}

generarPDF() {
  const doc = new jsPDF();

  //  HEADER
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PixelTrade Xerox', 10, 15);

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

  doc.text('Copias:', 10, y);
  doc.text(`${this.form.copias}`, 80, y);

  y += 10;
  doc.text('Color:', 10, y);
  doc.text(this.form.color ? 'Sí' : 'No', 80, y);
   y += 10;
  doc.text('Tamaño:', 10, y);
  doc.text(`${this.form.tamano}`, 80, y);

   y += 10;
  doc.text('Tipo de papel:', 10, y);
  doc.text(`${this.form.tipo_papel}`, 80, y);

   y += 10;
  doc.text('Mano de obra:', 10, y);
  doc.text(`${this.form.mano_obra}`, 80, y);

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
