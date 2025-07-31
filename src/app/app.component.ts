import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateProfileComponent } from './components/create-profile/create-profile.component';
import { ReadProfileComponent } from './components/read-profile/read-profile.component';
import { UpdateProfileComponent } from './components/update-profile/update-profile.component';
import { RegulatorComponent } from './components/regulator/regulator.component';
import { TabsComponent } from './components/tabs/tabs.component';

// Simple event service for real-time updates
class ProfileUpdateService {
  private listeners: (() => void)[] = [];

  subscribe(callback: () => void) {
    this.listeners.push(callback);
  }

  notifyUpdate() {
    this.listeners.forEach(callback => callback());
  }
}

// Global instance
export const profileUpdateService = new ProfileUpdateService();

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CreateProfileComponent, ReadProfileComponent, UpdateProfileComponent, RegulatorComponent, TabsComponent],
  template: `
    <div class="app-container">
      <!-- Header -->
      <header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <div class="logo">🔗</div>
            <div class="title">
              <h1>Profile Data System</h1>
              <p>Blockchain-powered profile management with Hedera integration</p>
            </div>
          </div>
          <div class="header-info">
            <div class="status-indicator">
              <span class="status-dot"></span>
              <span class="status-text">API Disconnected</span>
            </div>
            <div class="status-indicator">
              <span class="status-dot connected"></span>
              <span class="status-text">Blockchain Connected</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Navigation Tabs -->
      <nav class="tab-navigation">
        <div class="tab-container">
          <app-tabs (tabChange)="onTabChange($event)"></app-tabs>
        </div>
      </nav>

      <!-- Tab Content -->
      <main class="tab-content">
        <div class="content-wrapper">
          <!-- Create Profile Tab -->
          <div *ngIf="activeTab === 'create'" class="tab-panel">
            <app-create-profile></app-create-profile>
          </div>

          <!-- Read Profile Tab -->
          <div *ngIf="activeTab === 'read'" class="tab-panel">
            <app-read-profile></app-read-profile>
          </div>

          <!-- Update Profile Tab -->
          <div *ngIf="activeTab === 'update'" class="tab-panel">
            <app-update-profile></app-update-profile>
          </div>

          <!-- Regulator Tab -->
          <div *ngIf="activeTab === 'regulator'" class="tab-panel">
            <app-regulator></app-regulator>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f8f9fa;
    }

    .app-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 0;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .logo {
      font-size: 2rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .title h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
    }

    .title p {
      margin: 5px 0 0 0;
      opacity: 0.9;
      font-size: 0.9rem;
    }

    .header-info {
      display: flex;
      gap: 20px;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #dc3545;
      animation: pulse 2s infinite;
    }

    .status-dot.connected {
      background: #28a745;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .tab-navigation {
      background: white;
      border-bottom: 1px solid #e9ecef;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .tab-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .tab-content {
      flex: 1;
      padding: 20px;
    }

    .content-wrapper {
      max-width: 1200px;
      margin: 0 auto;
    }

    .tab-panel {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .header-info {
        justify-content: center;
      }

      .title h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class AppComponent {
  activeTab: 'create' | 'read' | 'update' | 'regulator' = 'create';

  onTabChange(tab: string) {
    this.activeTab = tab as 'create' | 'read' | 'update' | 'regulator';
  }
} 