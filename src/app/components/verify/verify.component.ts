import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

interface VerificationData {
  success: boolean;
  profile_data: any;
  metadata: {
    file_id: string;
    version: number;
    public_key: string;
    profile_hash: string;
    created_at: string;
    updated_at: string;
  };
  signature_verified: boolean;
}

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>🔍 Profile Verification</h1>
        <p>Verify the authenticity of company profiles stored on Hedera blockchain</p>
        <button 
          *ngIf="!loading" 
          (click)="refreshVerification()" 
          class="refresh-btn"
          [disabled]="refreshing">
          🔄 {{ refreshing ? 'Refreshing...' : 'Refresh Data' }}
        </button>
      </div>

      <div *ngIf="loading" class="loading">
        <h3>🔍 Verifying Profile...</h3>
        <p>Please wait while we fetch and verify the profile data from the blockchain.</p>
      </div>

      <div *ngIf="error" class="error">
        <h3>❌ Verification Error</h3>
        <p>{{ error }}</p>
        <button (click)="refreshVerification()" class="retry-btn">
          🔄 Try Again
        </button>
      </div>

      <div *ngIf="verificationData && !loading" class="verification-content">
        <div class="verification-status">
          <h3>✅ Verification Status</h3>
          <p *ngIf="verificationData.signature_verified" class="status-success">
            ✅ Profile signature verified successfully
          </p>
          <p *ngIf="!verificationData.signature_verified" class="status-error">
            ❌ Profile signature verification failed
          </p>
        </div>

        <div class="metadata">
          <h4>📋 Profile Metadata</h4>
          <div class="metadata-item">
            <strong>File ID:</strong> <span>{{ verificationData.metadata.file_id }}</span>
          </div>
          <div class="metadata-item">
            <strong>Version:</strong> <span>{{ verificationData.metadata.version }}</span>
          </div>
          <div class="metadata-item">
            <strong>Public Key:</strong> <span>{{ verificationData.metadata.public_key }}</span>
          </div>
          <div class="metadata-item">
            <strong>Profile Hash:</strong> <span>{{ verificationData.metadata.profile_hash }}</span>
          </div>
          <div class="metadata-item">
            <strong>Created:</strong> <span>{{ verificationData.metadata.created_at | date:'medium' }}</span>
          </div>
          <div class="metadata-item">
            <strong>Updated:</strong> <span>{{ verificationData.metadata.updated_at | date:'medium' }}</span>
          </div>
        </div>

        <div class="profile-section">
          <h3>🏢 Company Profile Data</h3>
          <div class="profile-fields">
            <div *ngFor="let field of profileFields" class="field">
              <div class="field-label">{{ getFieldDisplayName(field.key) }}</div>
              <div class="field-value">{{ formatFieldValue(field.value) }}</div>
            </div>
          </div>
        </div>

        <div *ngIf="updateNote" class="update-note">
          <h4>📝 Note</h4>
          <p>{{ updateNote }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .header {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #eee;
      position: relative;
    }

    .header h1 {
      color: #2c3e50;
      margin: 0 0 10px 0;
      font-size: 1.8rem;
    }

    .header p {
      margin: 0 0 15px 0;
      color: #666;
      font-size: 1rem;
    }

    .refresh-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.3s;
    }

    .refresh-btn:hover:not(:disabled) {
      background: #2980b9;
    }

    .refresh-btn:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }

    .retry-btn {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }

    .retry-btn:hover {
      background: #c0392b;
    }

    .loading {
      text-align: center;
      padding: 30px 20px;
      color: #666;
    }

    .loading h3 {
      margin: 0 0 10px 0;
      font-size: 1.3rem;
    }

    .error {
      background: #ffebee;
      color: #c62828;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
      border-left: 4px solid #c62828;
    }

    .verification-status {
      margin: 15px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 5px;
    }

    .status-success {
      color: #2e7d32;
      font-weight: bold;
    }

    .status-error {
      color: #c62828;
      font-weight: bold;
    }

    .metadata {
      margin: 15px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 5px;
    }

    .metadata h4 {
      color: #2c3e50;
      margin-top: 0;
      font-size: 1.3rem;
    }

    .metadata-item {
      margin: 8px 0;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .metadata-item strong {
      color: #555;
      font-size: 0.9rem;
    }

    .profile-section {
      margin: 15px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 5px;
    }

    .profile-section h3 {
      color: #2c3e50;
      margin-top: 0;
      font-size: 1.3rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      margin: 10px 0;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .field-label {
      font-weight: bold;
      color: #555;
      margin-bottom: 5px;
      font-size: 0.9rem;
    }

    .field-value {
      color: #333;
      word-break: break-word;
    }

    .update-note {
      margin: 15px 0;
      padding: 15px;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 5px;
      color: #856404;
    }

    .update-note h4 {
      margin-top: 0;
      color: #856404;
    }
  `]
})
export class VerifyComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  refreshing: boolean = false;
  error: string = '';
  verificationData: VerificationData | null = null;
  profileFields: Array<{key: string, value: any}> = [];
  updateNote: string = '';
  private routeSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('🔄 VerifyComponent initialized');
    
    // Subscribe to route changes to refresh data when URL changes
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      console.log('🔄 Route params changed:', params);
      this.verifyProfile();
    });
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  async refreshVerification() {
    console.log('🔄 Manual refresh triggered');
    this.refreshing = true;
    this.error = '';
    this.updateNote = '';
    this.verificationData = null; // Clear previous data
    this.profileFields = []; // Clear previous fields
    await this.verifyProfile();
    this.refreshing = false;
  }

  private async verifyProfile() {
    try {
      console.log('🔄 Starting verification process...');
      
      // Get DID from URL parameters
      const did = this.getDidFromUrl();
      console.log('🔍 DID from URL:', did);

      if (!did) {
        this.error = 'No DID parameter found in URL. Please scan the QR code again.';
        this.loading = false;
        return;
      }

      // Extract file ID from DID
      const fileId = this.extractFileIdFromDid(did);
      console.log('🔍 File ID from DID:', fileId);

      if (!fileId) {
        this.error = 'Invalid DID format. Expected format: did:hedera:{file_id}';
        this.loading = false;
        return;
      }

      // Use the same logic as "Read Profile" tab - fetch the latest available profile
      console.log('📡 Fetching latest available profile (like Read Profile tab)...');
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await this.http.get<any>(
        `http://localhost:3000/blockchain/latest-available`
      ).toPromise();

      console.log('📡 Latest available response:', response);

      if (response && response.success && response.profile_data) {
        // Convert the response to match our VerificationData interface
        this.verificationData = {
          success: true,
          profile_data: response.profile_data,
          metadata: response.metadata,
          signature_verified: response.signature_verified || false
        };
        
        console.log('✅ Latest available profile loaded successfully');
        console.log('📋 Latest File ID:', this.verificationData.metadata.file_id);
        console.log('📋 Latest Version:', this.verificationData.metadata.version);
        console.log('📋 Requested File ID:', fileId);
        console.log('📋 Profile Data:', this.verificationData.profile_data);
        
        this.profileFields = this.convertProfileToFields(response.profile_data);
        console.log('📋 Profile Fields:', this.profileFields);
        
        // Show a note if the displayed file ID is different from the requested one
        if (this.verificationData.metadata.file_id !== fileId) {
          this.updateNote = `🔄 The requested file ID (${fileId}) was not found. Displaying the latest available profile (${this.verificationData.metadata.file_id}) instead.`;
        }
      } else {
        console.error('❌ Invalid response structure:', response);
        this.error = 'Failed to verify profile. Please try again.';
      }
    } catch (error: any) {
      console.error('❌ Error verifying profile:', error);
      
      if (error.status === 404) {
        this.error = 'No profiles available. Please create a profile first.';
      } else if (error.status === 0) {
        this.error = 'Cannot connect to backend server. Please check if the server is running.';
      } else {
        this.error = 'Failed to verify profile. Please check the DID and try again.';
      }
    } finally {
      this.loading = false;
      console.log('🔄 Verification process completed');
    }
  }

  private checkForUpdates(verificationData: VerificationData) {
    const version = verificationData.metadata.version;
    const updatedAt = new Date(verificationData.metadata.updated_at);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // If version is 1 and it's been more than a day, suggest checking for updates
    if (version === 1 && daysSinceUpdate > 1) {
      this.updateNote = '💡 This appears to be version 1 of the profile. There may be newer versions available. Consider checking the main profile page for updates.';
    }
  }

  private getDidFromUrl(): string | null {
    // Try to get from query parameters
    const did = this.route.snapshot.queryParamMap.get('did');
    if (did) {
      console.log('🔍 Found DID in query params:', did);
      return did;
    }

    // Try to get from hash fragment
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const didFromHash = hashParams.get('did');
      if (didFromHash) {
        console.log('🔍 Found DID in hash params:', didFromHash);
        return didFromHash;
      }
    }

    return null;
  }

  private extractFileIdFromDid(did: string): string | null {
    const match = did.match(/did:hedera:(.+)/);
    return match ? match[1] : null;
  }

  private convertProfileToFields(profileData: any): Array<{key: string, value: any}> {
    const fields: Array<{key: string, value: any}> = [];
    
    for (const [key, value] of Object.entries(profileData)) {
      if (value !== null && value !== undefined && value !== '') {
        fields.push({ key, value });
      }
    }
    
    return fields;
  }

  getFieldDisplayName(fieldName: string): string {
    const fieldNames: {[key: string]: string} = {
      'company_name': 'Company Name',
      'location': 'Location',
      'contact': 'Contact',
      'size': 'Size',
      'established': 'Established',
      'revenue': 'Revenue',
      'market_segments': 'Market Segments',
      'technology_focus': 'Technology Focus',
      'key_markets': 'Key Markets',
      'customer_segments': 'Customer Segments',
      'competitive_position': 'Competitive Position',
      'partnerships': 'Partnerships',
      'certifications': 'Certifications',
      'sales_channels': 'Sales Channels'
    };
    return fieldNames[fieldName] || fieldName;
  }

  formatFieldValue(value: any): string {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  }
} 