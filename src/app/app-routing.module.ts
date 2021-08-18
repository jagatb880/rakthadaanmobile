import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'landing', loadChildren: './pages/landing/landing.module#LandingPageModule' },  
  { path: 'login', loadChildren: './pages/auth/login/login.module#LoginPageModule' },
  { path: 'register', loadChildren: './pages/auth/register/register.module#RegisterPageModule' },
  
  { path: 'request', loadChildren: './pages/request/request.module#RequestPageModule', canActivate:[AuthGuard] },
  { path: 'dashboard', loadChildren: './pages/dashboard/dashboard.module#DashboardPageModule', canActivate: [AuthGuard] },
  { path: 'home', loadChildren: './home/home.module#HomePageModule', canActivate: [AuthGuard] },
  { path: 'list', loadChildren: './list/list.module#ListPageModule', canActivate: [AuthGuard] },
  {
    path: 'expandable',
    loadChildren: () => import('./expandable/expandable.module').then( m => m.ExpandablePageModule)
  },
  {
    path: 'accepted',
    loadChildren: () => import('./accepted/accepted.module').then( m => m.AcceptedPageModule)
  },
  {
    path: 'donationrequest',
    loadChildren: () => import('./donationrequest/donationrequest.module').then( m => m.DonationrequestPageModule)
  },
  {
    path: 'others',
    loadChildren: () => import('./others/others.module').then( m => m.OthersPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/auth/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'change-password',
    loadChildren: () => import('./change-password/change-password.module').then( m => m.ChangePasswordPageModule)
  },
  {
    path: 'edit-profile',
    loadChildren: () => import('./edit-profile/edit-profile.module').then( m => m.EditProfilePageModule)
  },
  {
    path: 'note',
    loadChildren: () => import('./note/note.module').then( m => m.NotePageModule)
  },
  {
    path: 'popover',
    loadChildren: () => import('./popover/popover.module').then( m => m.PopoverPageModule)
  },
  {
    path: 'edit-request',
    loadChildren: () => import('./edit-request/edit-request.module').then( m => m.EditRequestPageModule)
  },
  {
    path: 'ratingpopover',
    loadChildren: () => import('./ratingpopover/ratingpopover.module').then( m => m.RatingpopoverPageModule)
  },
  {
    path: 'plasma-registration',
    loadChildren: () => import('./plasma-registration/plasma-registration.module').then( m => m.PlasmaRegistrationPageModule)
  },
  {
    path: 'plasma-terms',
    loadChildren: () => import('./plasma-terms/plasma-terms.module').then( m => m.PlasmaTermsPageModule)
  },
  {
    path: 'suggestion',
    loadChildren: () => import('./pages/suggestion/suggestion.module').then( m => m.SuggestionPageModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./pages/suggestions/search/search.module').then( m => m.SearchPageModule)
  },
  {
    path: 'add-suggestion',
    loadChildren: () => import('./pages/suggestions/add-suggestion/add-suggestion.module').then( m => m.AddSuggestionPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then( m => m.NotificationsPageModule)
  },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}