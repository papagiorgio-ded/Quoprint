import { Routes } from '@angular/router';
import { AuthGuard } from './auth-guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.page').then(m => m.LoginPage)
  },

  /* =========================
      🔥 ADMIN (SIN PREFIJO)
  ========================== */
  {
  path: 'admin',
  loadComponent: () =>
    import('./admin/admin/admin.page').then(m => m.AdminPage),

  canActivate: [AuthGuard],

  children: [
    {
      path: '',
      redirectTo: 'laser',
      pathMatch: 'full'
    },
    {
      path: 'laser',
      loadComponent: () =>
        import('./admin/laser/laser.page').then(m => m.LaserPage)
    },
    {
      path: 'xerox',
      loadComponent: () =>
        import('./admin/xerox/xerox.page').then(m => m.XeroxPage)
    },
    {
      path: 'ploter',
      loadComponent: () =>
        import('./admin/ploter/ploter.page').then(m => m.PloterPage)
    },
    {
      path: 'dtf',
      loadComponent: () =>
        import('./admin/dtf/dtf.page').then(m => m.DtfPage)
    }
  ]
},

  /* =========================
      👤 USER (CON PREFIJO USER)
  ========================== */
  {
    path: 'user',
    loadComponent: () =>
      import('./user/user/user.page').then(m => m.UserPage),

    children: [
      {
        path: '',
        redirectTo: 'laser',
        pathMatch: 'full'
      },
      {
        path: 'laser',
        loadComponent: () =>
          import('./user/userlaser/userlaser.page').then(m => m.UserlaserPage)
      },
      {
        path: 'xerox',
        loadComponent: () =>
          import('./user/userxerox/userxerox.page').then(m => m.UserxeroxPage)
      },
      {
        path: 'ploter',
        loadComponent: () =>
          import('./user/userploter/userploter.page').then(m => m.UserploterPage)
      },
      {
        path: 'dtf',
        loadComponent: () =>
          import('./user/userdtf/userdtf.page').then(m => m.UserdtfPage)
      }
    ]
  }

];