import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tabs">
      <button 
        class="tab" 
        [class.active]="activeTab === 'create'"
        (click)="setActiveTab('create')">
        <span class="tab-icon">➕</span>
        <span class="tab-label">Create Profile</span>
      </button>
      <button 
        class="tab" 
        [class.active]="activeTab === 'read'"
        (click)="setActiveTab('read')">
        <span class="tab-icon">📖</span>
        <span class="tab-label">Read Profile</span>
      </button>
      <button 
        class="tab" 
        [class.active]="activeTab === 'update'"
        (click)="setActiveTab('update')">
        <span class="tab-icon">✏️</span>
        <span class="tab-label">Update Profile</span>
      </button>
      <button 
        class="tab" 
        [class.active]="activeTab === 'regulator'"
        (click)="setActiveTab('regulator')">
        <span class="tab-icon">🔍</span>
        <span class="tab-label">Regulator</span>
      </button>
    </div>
  `,
  styles: [`
    .tabs {
      display: flex;
      gap: 5px;
      padding: 0;
      margin: 0;
    }

    .tab {
      background: none;
      border: none;
      padding: 15px 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6c757d;
      font-weight: 500;
      transition: all 0.3s ease;
      border-bottom: 3px solid transparent;
      position: relative;
      font-size: 0.9rem;
    }

    .tab:hover {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }

    .tab.active {
      color: #667eea;
      border-bottom-color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }

    .tab-icon {
      font-size: 1.1rem;
    }

    .tab-label {
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .tabs {
        flex-wrap: wrap;
        gap: 2px;
      }

      .tab {
        flex: 1;
        min-width: 120px;
        padding: 12px 15px;
      }

      .tab-label {
        display: none;
      }
    }
  `]
})
export class TabsComponent {
  @Output() tabChange = new EventEmitter<string>();
  
  activeTab: string = 'create';
  showVerifyTab: boolean = false;

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }

  setShowVerifyTab(show: boolean) {
    this.showVerifyTab = show;
  }
}
