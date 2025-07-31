import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyProfileComponent } from './components/company-profile/company-profile.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CompanyProfileComponent],
  template: `
    <app-company-profile></app-company-profile>
  `,
  styles: []
})
export class AppComponent {
} 