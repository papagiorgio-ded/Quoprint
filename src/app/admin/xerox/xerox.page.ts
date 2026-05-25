import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar,IonModal, IonButtons, IonItem, IonLabel, IonInput, AlertController, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInfiniteScroll, IonInfiniteScrollContent, IonList, IonFab, IonFabButton, IonFabList} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';

interface ConfigGlobal {
  plastificado: number;
  grapado: number;
  coste_grapado: number;
  mano_obra: number;
  blanco_negro:number;
  color:number;
  hendido_maquina:number;
  hendido_coste:number;
 
}

@Component({
  selector: 'app-xerox',
  templateUrl: './xerox.page.html',
  styleUrls: ['./xerox.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonButton,IonModal,IonButtons,IonItem,IonLabel,IonInput,IonCard,IonCardHeader,IonCardTitle,IonCardContent,IonInfiniteScroll,IonInfiniteScrollContent,IonList,IonFab,IonFabButton,IonFabList]
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
  precio_papel: 0
};
hayCambios: boolean = false;
camposModificados: Set<string> = new Set();
busqueda: string = '';

papelesFiltrados: any[] = [];
papelesVisibles: any[] = [];

pagina: number = 0;
limite: number = 10;

 configGlobal: ConfigGlobal = {
    plastificado: 0,
    grapado: 0,
    coste_grapado: 0,
    mano_obra:0,
    blanco_negro:0,
    color:0,
    hendido_maquina:0,
    hendido_coste:0
  };

openPapelModal() {
  this.showPapelModal = true;
}

closePapelModal() {
  this.showPapelModal = false;

  // reset
  this.nuevoPapel = {
    nombre: '',
    precio_papel: 0
  };
}

guardarPapel() {
  if (!this.nuevoPapel.nombre || !this.nuevoPapel.precio_papel ) {
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

  this.http.get<any[]>(`${this.localapi}/getpapels`)
    .subscribe({

      next: (res) => {

        this.papeles = res;

        this.aplicarFiltro(); // 🔥 nuevo flujo

      },

      error: (err) => {
        console.error('Error obteniendo papeles:', err);
      }

    });

}

aplicarFiltro() {

  const texto = this.busqueda.toLowerCase();

  this.papelesFiltrados = this.papeles.filter(p =>
    p.nombre.toLowerCase().includes(texto)
  );

  this.resetInfinite();

}

resetInfinite() {

  this.pagina = 0;

  this.papelesVisibles =
    this.papelesFiltrados.slice(0, this.limite);

}

loadMore(event: any) {

  this.pagina++;

  const inicio = this.pagina * this.limite;
  const fin = inicio + this.limite;

  const nuevos =
    this.papelesFiltrados.slice(inicio, fin);

  this.papelesVisibles.push(...nuevos);

  event.target.complete();

  if (this.papelesVisibles.length >= this.papelesFiltrados.length) {
    event.target.disabled = true;
  }

}
reiniciarBusqueda() {
  this.aplicarFiltro();
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
        this.hayCambios = false; 
        this.camposModificados.clear();
      },
      error: (err) => console.error(err)
    });

}


marcarCambio(campo: string) {
  this.camposModificados.add(campo);
  this.hayCambios = true;
}

}
