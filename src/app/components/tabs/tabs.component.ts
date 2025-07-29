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
        Create Profile
      </button>
      <button 
        class="tab" 
        [class.active]="activeTab === 'read'"
        (click)="setActiveTab('read')">
        Read Profile
      </button>
      <button 
        class="tab" 
        [class.active]="activeTab === 'update'"
        (click)="setActiveTab('update')">
        Update Profile
      </button>
      <button 
        class="tab" 
        [class.active]="activeTab === 'verify'"
        (click)="setActiveTab('verify')"
        [style.display]="showVerifyTab ? 'block' : 'none'">
        Verify Profile
      </button>
    </div>
  `,
  styles: [`
    .tabs {
      display: flex;
      margin-bottom: 30px;
      border-bottom: 2px solid #f0f0f0;
    }

    .tab {
      padding: 15px 25px;
      background: none;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      color: #666;
      border-bottom: 3px solid transparent;
      transition: all 0.3s ease;
    }

    .tab.active {
      color: #4facfe;
      border-bottom-color: #4facfe;
    }

    .tab:hover {
      color: #4facfe;
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