import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { VerificationResponse } from '../../models/company-profile.interface';

@Component({
  selector: 'app-verify-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tab-content">
      <h2>Verify Company Profile</h2>
      
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Verifying profile on blockchain...</p>
      </div>
      
      <div [class]="'result ' + (isSuccess ? 'success' : 'error')" *ngIf="resultMessage" [innerHTML]="resultMessage"></div>
      
      <div class="verification-info" *ngIf="!loading && !resultMessage">
        <div class="info-card">
          <h3>🔍 Profile Verification</h3>
          <p>This page verifies company profiles stored on the blockchain using file ID and public key parameters.</p>
          <div class="url-info">
            <strong>URL Parameters:</strong>
            <ul>
              <li><code>file_id</code> - The blockchain file identifier</li>
              <li><code>pubkey</code> - The public key for verification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tab-content {
      padding: 40px;
    }

    .loading {
      text-align: center;
      margin: 20px 0;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #4facfe;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .result {
      margin-top: 20px;
      padding: 20px;
      border-radius: 8px;
    }

    .result.success {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }

    .result.error {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }

    .verification-info {
      margin-top: 20px;
    }

    .info-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .info-card h3 {
      margin: 0 0 15px 0;
      font-size: 1.3rem;
    }

    .info-card p {
      margin: 0 0 20px 0;
      opacity: 0.9;
    }

    .url-info {
      background: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 8px;
    }

    .url-info ul {
      margin: 10px 0 0 0;
      padding-left: 20px;
    }

    .url-info li {
      margin-bottom: 5px;
    }

    .url-info code {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
    }

    .success-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      margin-top: 20px;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .error-card {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      margin-top: 20px;
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
    }

    .profile-section {
      background: #f8f9fa;
      border: 1px solid #e1e5e9;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .section-title {
      color: #4facfe;
      font-size: 1.3rem;
      margin-bottom: 15px;
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

    .array-value {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .array-tag {
      background: #4facfe;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .timestamp-display {
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      color: #666;
    }

    .blockchain-info {
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      border: 1px solid #2196f3;
      border-radius: 12px;
      padding: 20px;
      margin-top: 20px;
    }

    .verification-status {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      padding: 12px 24px;
      border-radius: 30px;
      font-weight: 600;
      margin-bottom: 15px;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .verification-status.invalid {
      background: linear-gradient(135deg, #f44336, #d32f2f);
      box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
    }

    .verification-details {
      background: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
    }

    .verification-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .verification-item:last-child {
      border-bottom: none;
    }

    .verification-label {
      font-weight: 600;
      opacity: 0.9;
    }

    .verification-value {
      opacity: 0.8;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }

    .verification-value.true {
      color: #4CAF50;
    }

    .verification-value.false {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class VerifyProfileComponent implements OnInit {
  loading: boolean = false;
  resultMessage: string = '';
  isSuccess: boolean = false;
  fileId: string = '';
  pubkey: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.fileId = params['file_id'] || '';
      this.pubkey = params['pubkey'] || '';
      
      if (this.fileId && this.pubkey) {
        this.verifyProfile();
      }
    });
  }

  async verifyProfile() {
    if (!this.fileId || !this.pubkey) {
      this.resultMessage = `
        <div class="error-card">
          <h3>❌ Missing Parameters</h3>
          <p><strong>Details:</strong> Both file_id and pubkey are required for verification.</p>
          <div class="verification-details">
            <p><strong>Received:</strong></p>
            <ul>
              <li>file_id: ${this.fileId || 'Missing'}</li>
              <li>pubkey: ${this.pubkey || 'Missing'}</li>
            </ul>
          </div>
        </div>
      `;
      this.isSuccess = false;
      return;
    }

    this.loading = true;
    this.resultMessage = '';

    try {
      const response = await fetch('http://localhost:3000/blockchain/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: this.fileId,
          pubkey: this.pubkey
        })
      });

      const result: VerificationResponse = await response.json();
      
      if (response.ok && result.success && result.profile_data && result.verification) {
        const profile = result.profile_data;
        const verification = result.verification;
        
        this.resultMessage = `
          <div class="success-card">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
              <span style="font-size: 2rem;">🔍</span>
              <div>
                <h3 style="margin: 0; color: #155724;">Profile Verification Complete</h3>
                <p style="margin: 5px 0 0 0; color: #155724; opacity: 0.8;">Blockchain verification results</p>
              </div>
            </div>
          </div>

          <div class="profile-section">
            <h4 class="section-title">🏢 Company Information</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Company Name</span>
                <span class="info-value">${profile.company_name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Location</span>
                <span class="info-value">${profile.location}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Contact</span>
                <span class="info-value">${profile.contact}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Company Size</span>
                <span class="info-value">${profile.size}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Year Established</span>
                <span class="info-value">${profile.established}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Annual Revenue</span>
                <span class="info-value">${profile.revenue}</span>
              </div>
            </div>
          </div>

          ${profile.market_segments && Array.isArray(profile.market_segments) && profile.market_segments.length > 0 ? `
          <div class="profile-section">
            <h4 class="section-title">🎯 Market Segments</h4>
            <div class="array-value">
              ${profile.market_segments.map((segment: string) => `<span class="array-tag">${segment}</span>`).join('')}
            </div>
          </div>
          ` : ''}

          ${profile.technology_focus && Array.isArray(profile.technology_focus) && profile.technology_focus.length > 0 ? `
          <div class="profile-section">
            <h4 class="section-title">🔬 Technology Focus</h4>
            <div class="array-value">
              ${profile.technology_focus.map((tech: string) => `<span class="array-tag">${tech}</span>`).join('')}
            </div>
          </div>
          ` : ''}

          ${profile.key_markets && Array.isArray(profile.key_markets) && profile.key_markets.length > 0 ? `
          <div class="profile-section">
            <h4 class="section-title">🌍 Key Markets</h4>
            <div class="array-value">
              ${profile.key_markets.map((market: string) => `<span class="array-tag">${market}</span>`).join('')}
            </div>
          </div>
          ` : ''}

          ${profile.customer_segments && Array.isArray(profile.customer_segments) && profile.customer_segments.length > 0 ? `
          <div class="profile-section">
            <h4 class="section-title">👥 Customer Segments</h4>
            <div class="array-value">
              ${profile.customer_segments.map((segment: string) => `<span class="array-tag">${segment}</span>`).join('')}
            </div>
          </div>
          ` : ''}

          ${profile.competitive_position ? `
          <div class="profile-section">
            <h4 class="section-title">🏆 Competitive Position</h4>
            <div class="info-value">${profile.competitive_position}</div>
          </div>
          ` : ''}

          ${profile.partnerships && Array.isArray(profile.partnerships) && profile.partnerships.length > 0 ? `
          <div class="profile-section">
            <h4 class="section-title">🤝 Partnerships</h4>
            <div class="array-value">
              ${profile.partnerships.map((partner: string) => `<span class="array-tag">${partner}</span>`).join('')}
            </div>
          </div>
          ` : ''}

          ${profile.certifications && Array.isArray(profile.certifications) && profile.certifications.length > 0 ? `
          <div class="profile-section">
            <h4 class="section-title">🏅 Certifications</h4>
            <div class="array-value">
              ${profile.certifications.map((cert: string) => `<span class="array-tag">${cert}</span>`).join('')}
            </div>
          </div>
          ` : ''}

          ${profile.sales_channels && Array.isArray(profile.sales_channels) && profile.sales_channels.length > 0 ? `
          <div class="profile-section">
            <h4 class="section-title">📈 Sales Channels</h4>
            <div class="array-value">
              ${profile.sales_channels.map((channel: string) => `<span class="array-tag">${channel}</span>`).join('')}
            </div>
          </div>
          ` : ''}

          <div class="blockchain-info">
            <h4 style="margin: 0 0 15px 0; color: #1976d2;">🔗 Verification Results</h4>
            
            <div class="verification-status ${verification.is_valid ? '' : 'invalid'}">
              <span>${verification.is_valid ? '✅' : '❌'}</span>
              <span>${verification.is_valid ? 'Profile Verified' : 'Profile Invalid'}</span>
            </div>
            
            <div class="verification-details">
              <div class="verification-item">
                <span class="verification-label">Signature Verified:</span>
                <span class="verification-value ${verification.signature_verified ? 'true' : 'false'}">${verification.signature_verified ? '✅ Yes' : '❌ No'}</span>
              </div>
              <div class="verification-item">
                <span class="verification-label">Hash Match:</span>
                <span class="verification-value ${verification.hash_match ? 'true' : 'false'}">${verification.hash_match ? '✅ Yes' : '❌ No'}</span>
              </div>
              <div class="verification-item">
                <span class="verification-label">Verification Timestamp:</span>
                <span class="verification-value">${new Date(verification.verification_timestamp).toLocaleString()}</span>
              </div>
              <div class="verification-item">
                <span class="verification-label">Hedera Hash:</span>
                <span class="verification-value">${verification.hedera_hash.substring(0, 20)}...</span>
              </div>
              <div class="verification-item">
                <span class="verification-label">Lisk Hash:</span>
                <span class="verification-value">${verification.lisk_hash.substring(0, 20)}...</span>
              </div>
            </div>
          </div>
        `;
        this.isSuccess = true;
      } else {
        const errorMessage = result.error || 'Failed to verify profile';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      this.resultMessage = `
        <div class="error-card">
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
            <span style="font-size: 2rem;">❌</span>
            <div>
              <h3 style="margin: 0; color: #721c24;">Verification Failed</h3>
              <p style="margin: 5px 0 0 0; color: #721c24; opacity: 0.8;">Could not verify profile on blockchain</p>
            </div>
          </div>
          <div class="verification-details">
            <p><strong>Error Details:</strong> ${error.message}</p>
            <p><strong>Parameters Used:</strong></p>
            <ul>
              <li>file_id: ${this.fileId}</li>
              <li>pubkey: ${this.pubkey}</li>
            </ul>
          </div>
        </div>
      `;
      this.isSuccess = false;
    } finally {
      this.loading = false;
    }
  }
} 