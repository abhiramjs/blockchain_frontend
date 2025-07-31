import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyProfileComponent } from './components/company-profile/company-profile.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CompanyProfileComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  // The main app now just uses the combined company-profile component
}
