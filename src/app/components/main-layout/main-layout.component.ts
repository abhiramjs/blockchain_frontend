import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyProfileComponent } from '../company-profile/company-profile.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, CompanyProfileComponent],
  template: `
    <app-company-profile></app-company-profile>
  `,
  styles: []
})
export class MainLayoutComponent {
} 