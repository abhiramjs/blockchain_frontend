import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header">
      <h1>🔗 Profile Data System</h1>
      <p>Blockchain-powered profile management with Hedera integration</p>
      <div style="margin-top: 15px;">
        <span [class]="'status-indicator ' + (apiStatus === 'online' ? 'status-online' : 'status-offline')"></span>
        <span>{{ apiStatusText }}</span>
        <br>
        <span [class]="'status-indicator ' + (blockchainStatus === 'online' ? 'status-online' : 'status-offline')" style="margin-top: 10px;"></span>
        <span>{{ blockchainStatusText }}</span>
      </div>
    </div>
  `,
  styles: [`
    .header {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }

    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
    }

    .header p {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .status-indicator {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 10px;
    }

    .status-online {
      background: #28a745;
    }

    .status-offline {
      background: #dc3545;
    }
  `]
})
export class HeaderComponent implements OnInit {
  apiStatus: string = 'offline';
  apiStatusText: string = 'Checking connection...';
  blockchainStatus: string = 'offline';
  blockchainStatusText: string = 'Checking blockchain...';

  ngOnInit() {
    this.checkApiStatus();
    this.checkBlockchainStatus();
    
    // Check status every 30 seconds
    setInterval(() => {
      this.checkApiStatus();
      this.checkBlockchainStatus();
    }, 30000);
  }

  async checkApiStatus() {
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/health');
      const data = await response.json();
      
      if (data.status === 'healthy') {
        this.apiStatus = 'online';
        this.apiStatusText = 'API Connected';
      } else {
        throw new Error('API not healthy');
      }
    } catch (error) {
      this.apiStatus = 'offline';
      this.apiStatusText = 'API Disconnected';
    }
  }

  async checkBlockchainStatus() {
    try {
      const response = await fetch('http://localhost:3000/api/v1/blockchain/health');
      const data = await response.json();
      
      if (data.status === 'demo_mode') {
        this.blockchainStatus = 'demo';
        this.blockchainStatusText = 'Demo Mode (Mock Data)';
      } else if (data.status === 'healthy') {
        this.blockchainStatus = 'online';
        this.blockchainStatusText = `Blockchain Connected (${data.operatorId})`;
      } else if (data.status === 'unhealthy') {
        this.blockchainStatus = 'offline';
        this.blockchainStatusText = `Connection Failed (${data.operatorId})`;
      } else {
        this.blockchainStatus = 'offline';
        this.blockchainStatusText = 'Blockchain Error';
      }
    } catch (error) {
      this.blockchainStatus = 'offline';
      this.blockchainStatusText = 'Status Check Failed';
    }
  }
} 