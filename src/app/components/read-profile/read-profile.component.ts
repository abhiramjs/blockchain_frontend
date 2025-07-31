import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileWithHistory, CompanyProfile } from '../../models/company-profile.interface';
import { profileUpdateService } from '../../app.component';

@Component({
  selector: 'app-read-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="read-container">
      <div class="read-header">
        <h2>📖 Read Company Profile</h2>
        <p>Automatically fetching and displaying the latest public profile data</p>
      </div>

      <!-- Loading State -->
      <div class="loading-section" *ngIf="loading">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Fetching latest profile data from blockchain...</p>
        </div>
      </div>

      <!-- Profile Display -->
      <div class="profile-display" *ngIf="!loading && profileData">
        <div class="profile-header">
          <div class="company-info">
            <div class="company-logo">🏢</div>
            <div class="company-details">
              <h3>{{ profileData.company_name }}</h3>
              <p class="company-location">{{ profileData.location }}</p>
              <p class="company-contact">{{ profileData.contact }}</p>
            </div>
          </div>
          <div class="profile-status">
            <span class="status-badge verified">✅ Verified on Blockchain</span>
          </div>
        </div>

        <!-- Basic Information -->
        <div class="info-section">
          <h4 class="section-title">🏢 Basic Company Information</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Company Size</span>
              <span class="info-value">{{ profileData.size }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Year Established</span>
              <span class="info-value">{{ profileData.established }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Annual Revenue</span>
              <span class="info-value">{{ profileData.revenue }}</span>
            </div>
          </div>
        </div>

        <!-- Market & Technology Information -->
        <div class="info-section" *ngIf="getArrayField(profileData.market_segments).length > 0">
          <h4 class="section-title">🎯 Market Segments</h4>
          <div class="array-display">
            <span class="array-tag" *ngFor="let segment of getArrayField(profileData.market_segments)">{{ segment }}</span>
          </div>
        </div>

        <div class="info-section" *ngIf="getArrayField(profileData.technology_focus).length > 0">
          <h4 class="section-title">🔬 Technology Focus</h4>
          <div class="array-display">
            <span class="array-tag" *ngFor="let tech of getArrayField(profileData.technology_focus)">{{ tech }}</span>
          </div>
        </div>

        <div class="info-section" *ngIf="getArrayField(profileData.key_markets).length > 0">
          <h4 class="section-title">🌍 Key Markets</h4>
          <div class="array-display">
            <span class="array-tag" *ngFor="let market of getArrayField(profileData.key_markets)">{{ market }}</span>
          </div>
        </div>

        <!-- Customer & Business Information -->
        <div class="info-section" *ngIf="getArrayField(profileData.customer_segments).length > 0">
          <h4 class="section-title">👥 Customer Segments</h4>
          <div class="array-display">
            <span class="array-tag" *ngFor="let segment of getArrayField(profileData.customer_segments)">{{ segment }}</span>
          </div>
        </div>

        <div class="info-section" *ngIf="profileData.competitive_position">
          <h4 class="section-title">🏆 Competitive Position</h4>
          <div class="text-content">
            {{ profileData.competitive_position }}
          </div>
        </div>

        <!-- Partnerships & Certifications -->
        <div class="info-section" *ngIf="getArrayField(profileData.partnerships).length > 0">
          <h4 class="section-title">🤝 Partnerships</h4>
          <div class="array-display">
            <span class="array-tag" *ngFor="let partner of getArrayField(profileData.partnerships)">{{ partner }}</span>
          </div>
        </div>

        <div class="info-section" *ngIf="getArrayField(profileData.certifications).length > 0">
          <h4 class="section-title">🏅 Certifications</h4>
          <div class="array-display">
            <span class="array-tag" *ngFor="let cert of getArrayField(profileData.certifications)">{{ cert }}</span>
          </div>
        </div>

        <!-- Sales Channels -->
        <div class="info-section" *ngIf="getArrayField(profileData.sales_channels).length > 0">
          <h4 class="section-title">📈 Sales Channels</h4>
          <div class="array-display">
            <span class="array-tag" *ngFor="let channel of getArrayField(profileData.sales_channels)">{{ channel }}</span>
          </div>
        </div>

        <!-- Blockchain Information -->
        <div class="blockchain-section">
          <h4 class="section-title">🔗 Blockchain Information</h4>
          <div class="blockchain-info">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">File ID</span>
                <span class="info-value blockchain-value">{{ metadata.file_id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Version</span>
                <span class="info-value">{{ metadata.version }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Public Key</span>
                <span class="info-value blockchain-value">{{ metadata.public_key.substring(0, 20) }}...</span>
              </div>
              <div class="info-item">
                <span class="info-label">Profile Hash</span>
                <span class="info-value blockchain-value">{{ metadata.profile_hash.substring(0, 20) }}...</span>
              </div>
              <div class="info-item">
                <span class="info-label">Created At</span>
                <span class="info-value">{{ formatDate(metadata.created_at) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Updated At</span>
                <span class="info-value">{{ formatDate(metadata.updated_at) }}</span>
              </div>
            </div>
            
            <div class="verification-status">
              <div class="verification-item">
                <span class="verification-label">Signature Verified:</span>
                <span class="verification-value" [class.verified]="signatureVerified">
                  {{ signatureVerified ? '✅ Yes' : '❌ No' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Refresh Button -->
        <div class="refresh-section">
          <button class="refresh-btn" (click)="refreshProfile()" [disabled]="loading">
            <span class="refresh-icon">🔄</span>
            Refresh Profile Data
          </button>
          <p class="refresh-note">Last updated: {{ lastRefreshTime }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div class="error-section" *ngIf="!loading && errorMessage">
        <div class="error-card">
          <div class="error-header">
            <span class="error-icon">❌</span>
            <h3>Error Loading Profile</h3>
          </div>
          <p class="error-message">{{ errorMessage }}</p>
          <div class="error-actions">
            <button class="retry-btn" (click)="refreshProfile()" [disabled]="loading">
              🔄 Try Again
            </button>
            <button class="demo-btn" (click)="loadLatestProfile()" [disabled]="loading">
              📋 Load Latest Profile
            </button>
          </div>
        </div>
      </div>

      <!-- No Data State -->
      <div class="no-data-section" *ngIf="!loading && !profileData && !errorMessage">
        <div class="no-data-card">
          <div class="no-data-icon">📭</div>
          <h3>No Profile Data Available</h3>
          <p>No public profile data is currently available. This could be because:</p>
          <ul class="no-data-reasons">
            <li>No profiles have been created yet</li>
            <li>The backend service is not running</li>
            <li>Network connectivity issues</li>
          </ul>
          <div class="no-data-actions">
            <button class="retry-btn" (click)="refreshProfile()" [disabled]="loading">
              🔄 Try Again
            </button>
            <button class="demo-btn" (click)="loadLatestProfile()" [disabled]="loading">
              📋 Load Latest Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .read-container {
      padding: 40px;
      background: white;
      min-height: 100vh;
    }

    .read-header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 15px;
      color: white;
    }

    .read-header h2 {
      margin: 0 0 10px 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .read-header p {
      margin: 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .loading-section {
      text-align: center;
      padding: 60px 20px;
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-spinner p {
      color: #666;
      font-size: 1.1rem;
      margin: 0;
    }

    .profile-display {
      max-width: 1000px;
      margin: 0 auto;
    }

    .profile-header {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 2px solid #e9ecef;
    }

    .company-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .company-logo {
      font-size: 3rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 50%;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .company-details h3 {
      margin: 0 0 5px 0;
      color: #333;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .company-location {
      margin: 0 0 5px 0;
      color: #666;
      font-size: 1rem;
    }

    .company-contact {
      margin: 0;
      color: #667eea;
      font-weight: 500;
    }

    .profile-status {
      text-align: right;
    }

    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.verified {
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
    }

    .info-section {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 25px;
      border-left: 4px solid #667eea;
    }

    .section-title {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 1.3rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .info-label {
      font-weight: 600;
      color: #555;
      font-size: 0.9rem;
      margin-bottom: 5px;
    }

    .info-value {
      color: #333;
      font-size: 1rem;
      padding: 8px 12px;
      background: white;
      border: 1px solid #e1e5e9;
      border-radius: 4px;
    }

    .blockchain-value {
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      color: #666;
    }

    .array-display {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .array-tag {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .text-content {
      background: white;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #e1e5e9;
      color: #333;
      line-height: 1.6;
    }

    .blockchain-section {
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      border: 1px solid #2196f3;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 30px;
    }

    .blockchain-info {
      background: rgba(255, 255, 255, 0.5);
      border-radius: 8px;
      padding: 20px;
    }

    .verification-status {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(33, 150, 243, 0.2);
    }

    .verification-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
    }

    .verification-label {
      font-weight: 600;
      color: #1976d2;
    }

    .verification-value {
      font-weight: 500;
    }

    .verification-value.verified {
      color: #4CAF50;
    }

    .refresh-section {
      text-align: center;
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .refresh-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .refresh-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .refresh-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .refresh-icon {
      font-size: 1.1rem;
    }

    .refresh-note {
      margin: 10px 0 0 0;
      color: #666;
      font-size: 0.9rem;
    }

    .error-section, .no-data-section {
      text-align: center;
      padding: 40px 20px;
    }

    .error-card, .no-data-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 30px;
      max-width: 500px;
      margin: 0 auto;
      border: 2px solid #e9ecef;
    }

    .error-header, .no-data-icon {
      margin-bottom: 20px;
    }

    .error-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .error-icon {
      font-size: 2rem;
    }

    .error-header h3 {
      margin: 0;
      color: #721c24;
      font-size: 1.4rem;
    }

    .no-data-icon {
      font-size: 4rem;
      color: #666;
    }

    .error-message {
      color: #721c24;
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .no-data-card h3 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 1.4rem;
    }

    .no-data-card p {
      color: #666;
      margin-bottom: 15px;
    }

    .no-data-reasons {
      text-align: left;
      margin: 0 0 20px 0;
      padding-left: 20px;
      color: #666;
    }

    .no-data-reasons li {
      margin-bottom: 5px;
    }

    .error-actions, .no-data-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .retry-btn, .demo-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .retry-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .demo-btn {
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #333;
    }

    .retry-btn:hover, .demo-btn:hover {
      transform: translateY(-2px);
    }

    .retry-btn:disabled, .demo-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .read-container {
        padding: 20px;
      }

      .profile-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }

      .company-info {
        flex-direction: column;
        text-align: center;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .error-actions, .no-data-actions {
        flex-direction: column;
        align-items: center;
      }

      .read-header h2 {
        font-size: 1.6rem;
      }

      .read-header p {
        font-size: 1rem;
      }
    }
  `]
})
export class ReadProfileComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  profileData: CompanyProfile | null = null;
  metadata: any = null;
  signatureVerified: boolean = false;
  errorMessage: string = '';
  lastRefreshTime: string = '';
  private updateSubscription: (() => void) | null = null;
  private autoRefreshInterval: any = null;

  ngOnInit() {
    this.loadLatestProfile();
    // Subscribe to profile updates
    this.updateSubscription = () => {
      this.loadLatestProfile();
    };
    profileUpdateService.subscribe(this.updateSubscription);
    
    // Set up auto-refresh every 30 seconds
    this.autoRefreshInterval = setInterval(() => {
      this.loadLatestProfile();
    }, 30000); // 30 seconds
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.updateSubscription) {
      const index = profileUpdateService['listeners'].indexOf(this.updateSubscription);
      if (index > -1) {
        profileUpdateService['listeners'].splice(index, 1);
      }
    }
    
    // Clean up auto-refresh interval
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }

  async loadLatestProfile() {
    this.loading = true;
    this.errorMessage = '';
    
    try {
      // Use the new endpoint to get the latest available profile
      const response = await fetch('http://localhost:3000/blockchain/latest-available', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        this.profileData = result.profile_data;
        this.metadata = result.metadata;
        this.signatureVerified = result.signature_verified || false;
        this.lastRefreshTime = new Date().toLocaleString();
      } else if (response.status === 404) {
        // No profile found - show appropriate message instead of demo data
        this.profileData = null;
        this.metadata = null;
        this.signatureVerified = false;
        this.errorMessage = 'No profiles available. Create a profile first using the Create Profile tab.';
      } else {
        throw new Error(result.error || 'Failed to load profile');
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      this.errorMessage = error.message || 'Failed to load profile data';
      this.profileData = null;
      this.metadata = null;
      this.signatureVerified = false;
    } finally {
      this.loading = false;
    }
  }

  async refreshProfile() {
    await this.loadLatestProfile();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getArrayField(field: string[] | string | undefined): string[] {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') return [field];
    return [];
  }
} 