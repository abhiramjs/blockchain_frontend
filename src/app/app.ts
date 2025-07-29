import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { CreateProfileComponent } from './components/create-profile/create-profile.component';
import { ReadProfileComponent } from './components/read-profile/read-profile.component';
import { UpdateProfileComponent } from './components/update-profile/update-profile.component';
import { VerifyProfileComponent } from './components/verify-profile/verify-profile.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    TabsComponent,
    CreateProfileComponent,
    ReadProfileComponent,
    UpdateProfileComponent,
    VerifyProfileComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  activeTab: string = 'create';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
