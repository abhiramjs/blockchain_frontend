import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tab-content">
      <div class="professional-header">
        <div class="company-logo">
          <div class="logo-placeholder">🏢</div>
        </div>
        <div class="company-info">
          <h1 class="company-name">Blockchain Verification Portal</h1>
          <p class="company-tagline">Enterprise Identity Verification System</p>
        </div>
      </div>
      
      <div id="verification-content">
        <div class="loading" *ngIf="loading">
          <div class="spinner"></div>
          <p>Verifying profile credentials...</p>
        </div>
        
        <div *ngIf="!loading && verificationResult" [innerHTML]="verificationResult"></div>
      </div>
    </div>
  `,
  styles: [`
    .tab-content {
      padding: 0;
    }

    .professional-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 12px 12px 0 0;
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 0;
    }

    .company-logo .logo-placeholder {
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .company-info .company-name {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .company-info .company-tagline {
      margin: 5px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
      font-weight: 300;
    }

    .verification-professional {
      background: white;
      border-radius: 0 0 12px 12px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    }

    .verification-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
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

    .verification-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
      margin-top: 25px;
    }

    .detail-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      border-left: 4px solid #667eea;
    }

    .detail-card h4 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }

    .detail-grid {
      display: grid;
      gap: 12px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-weight: 600;
      color: #666;
      font-size: 14px;
    }

    .detail-value {
      color: #333;
      font-weight: 500;
      text-align: right;
      max-width: 60%;
      word-break: break-word;
    }

    .blockchain-info {
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      border: 1px solid #2196f3;
      border-radius: 12px;
      padding: 20px;
      margin-top: 20px;
    }

    .verification-footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      color: #666;
      font-size: 14px;
    }

    .timestamp-professional {
      font-family: 'Courier New', monospace;
      background: #f8f9fa;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
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

    .verification-error {
      background: linear-gradient(135deg, #ffebee, #ffcdd2);
      border: 2px solid #f44336;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 25px;
      box-shadow: 0 4px 12px rgba(244, 67, 54, 0.2);
    }

    .error-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    }

    .error-icon {
      font-size: 2.5rem;
    }

    .error-title {
      margin: 0;
      color: #c62828;
      font-size: 1.8rem;
    }

    .timestamp-display {
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      color: #666;
    }
  `]
})
export class VerifyProfileComponent implements OnInit {
  loading: boolean = true;
  verificationResult: string = '';

  ngOnInit() {
    this.checkVerificationRequest();
  }

  async checkVerificationRequest() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('profileId') && urlParams.has('userId')) {
      await this.showProfessionalVerification(urlParams);
    } else {
      this.loading = false;
      this.verificationResult = `
        <div class="verification-professional">
          <div class="verification-header">
            <h2>No Verification Request</h2>
            <p>This page is used for profile verification. Please use a valid verification link.</p>
          </div>
        </div>
      `;
    }
  }

  async showProfessionalVerification(urlParams: URLSearchParams) {
    const profileId = urlParams.get('profileId');
    const userId = urlParams.get('userId');
    const timestamp = urlParams.get('timestamp');
    const signature = urlParams.get('signature');
    const hash = urlParams.get('hash');
    const isPublic = urlParams.get('public') === 'true';

    try {
      // Call verification API
      const response = await fetch(`http://localhost:3000/api/v1/blockchain/verify?profileId=${profileId}&userId=${userId}&timestamp=${timestamp}&signature=${signature}&hash=${hash}`);
      const data = await response.json();
      
      if (data.status === 'verified') {
        this.verificationResult = this.createProfessionalVerificationHTML(data, isPublic);
      } else {
        this.verificationResult = this.createProfessionalErrorHTML(data);
      }
    } catch (error) {
      this.verificationResult = this.createProfessionalErrorHTML({
        status: 'error',
        message: 'Verification system temporarily unavailable',
        timestamp: new Date().toISOString(),
        profileId,
        userId
      });
    } finally {
      this.loading = false;
    }
  }

  createProfessionalVerificationHTML(data: any, isPublic: boolean): string {
    const profile = data.profile;
    const verification = data.verification;
    const blockchain = data.blockchain;
    
    return `
      <div class="verification-professional">
        <div class="verification-header">
          <div class="verification-status">
            <span>✅</span>
            <span>Profile Successfully Verified</span>
          </div>
          <h2 style="margin: 0; color: #333; font-size: 24px;">Identity Verification Complete</h2>
          <p style="margin: 10px 0 0 0; color: #666;">This profile has been cryptographically verified on the blockchain</p>
        </div>

        <div class="verification-details">
          <div class="detail-card">
            <h4>👤 Personal Information</h4>
            <div class="detail-grid">
              ${profile.data.firstName ? `<div class="detail-item"><span class="detail-label">First Name</span><span class="detail-value">${profile.data.firstName}</span></div>` : ''}
              ${profile.data.lastName ? `<div class="detail-item"><span class="detail-label">Last Name</span><span class="detail-value">${profile.data.lastName}</span></div>` : ''}
              ${profile.data.email ? `<div class="detail-item"><span class="detail-label">Email</span><span class="detail-value">${profile.data.email}</span></div>` : ''}
              ${profile.data.phone ? `<div class="detail-item"><span class="detail-label">Phone</span><span class="detail-value">${profile.data.phone}</span></div>` : ''}
              ${profile.data.nationality ? `<div class="detail-item"><span class="detail-label">Nationality</span><span class="detail-value">${profile.data.nationality}</span></div>` : ''}
            </div>
          </div>

          <div class="detail-card">
            <h4>💼 Professional Information</h4>
            <div class="detail-grid">
              ${profile.data.company ? `<div class="detail-item"><span class="detail-label">Company</span><span class="detail-value">${profile.data.company}</span></div>` : ''}
              ${profile.data.jobTitle ? `<div class="detail-item"><span class="detail-label">Job Title</span><span class="detail-value">${profile.data.jobTitle}</span></div>` : ''}
              ${profile.data.department ? `<div class="detail-item"><span class="detail-label">Department</span><span class="detail-value">${profile.data.department}</span></div>` : ''}
              ${profile.data.industry ? `<div class="detail-item"><span class="detail-label">Industry</span><span class="detail-value">${profile.data.industry}</span></div>` : ''}
              ${profile.data.workEmail ? `<div class="detail-item"><span class="detail-label">Work Email</span><span class="detail-value">${profile.data.workEmail}</span></div>` : ''}
            </div>
          </div>

          <div class="detail-card">
            <h4>📍 Location Information</h4>
            <div class="detail-grid">
              ${profile.data.city ? `<div class="detail-item"><span class="detail-label">City</span><span class="detail-value">${profile.data.city}</span></div>` : ''}
              ${profile.data.state ? `<div class="detail-item"><span class="detail-label">State/Province</span><span class="detail-value">${profile.data.state}</span></div>` : ''}
              ${profile.data.country ? `<div class="detail-item"><span class="detail-label">Country</span><span class="detail-value">${profile.data.country}</span></div>` : ''}
              ${profile.data.postalCode ? `<div class="detail-item"><span class="detail-label">Postal Code</span><span class="detail-value">${profile.data.postalCode}</span></div>` : ''}
            </div>
          </div>

          ${!isPublic ? `
          <div class="detail-card">
            <h4>📋 Update History</h4>
            ${profile.updateHistory && profile.updateHistory.length > 0 ? `
              <div class="detail-grid">
                ${profile.updateHistory.slice(0, 5).map((update: any, index: number) => `
                  <div class="detail-item" style="grid-column: 1 / -1; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                      <span class="detail-label">Update #${profile.updateHistory.length - index}</span>
                      <span class="detail-value timestamp-professional">${new Date(update.timestamp).toLocaleString()}</span>
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">
                      <strong>Source:</strong> ${update.updateSource}
                    </div>
                    <div style="font-size: 12px; color: #666;">
                      <strong>Fields Changed:</strong>
                      <div style="margin-top: 5px; padding-left: 10px;">
                        ${update.changedFields.map((field: any) => `
                          <div style="margin-bottom: 3px;">
                            • <strong>${field.fieldName}</strong>: ${field.oldValue === undefined ? 'created' : field.newValue === null ? 'removed' : 'updated'}
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                `).join('')}
                ${profile.updateHistory.length > 5 ? `
                  <div style="text-align: center; color: #666; font-size: 12px; font-style: italic;">
                    Showing latest 5 updates. Total: ${profile.updateHistory.length} updates
                  </div>
                ` : ''}
              </div>
            ` : `
              <div style="text-align: center; padding: 20px; color: #666;">
                <span style="font-size: 2rem; opacity: 0.3;">📝</span>
                <p>No update history available for this profile.</p>
              </div>
            `}
          </div>
          ` : ''}

          <div class="detail-card">
            <h4>🔐 Verification Details</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Profile ID</span>
                <span class="detail-value timestamp-professional">${profile.id}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">User ID</span>
                <span class="detail-value timestamp-professional">${profile.userId}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Verified At</span>
                <span class="detail-value timestamp-professional">${new Date(verification.verifiedAt).toLocaleString()}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Created At</span>
                <span class="detail-value timestamp-professional">${new Date(profile.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="blockchain-info">
          <h4 style="margin: 0 0 15px 0; color: #1976d2;">🔗 Blockchain Network Information</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div class="detail-item">
              <span class="detail-label">Network</span>
              <span class="detail-value">${blockchain.network}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Operator ID</span>
              <span class="detail-value timestamp-professional">${blockchain.operatorId}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Mode</span>
              <span class="detail-value">${blockchain.isDemo ? 'Demo Mode' : 'Live Network'}</span>
            </div>
          </div>
        </div>

        <div class="verification-footer">
          <p><strong>This verification was generated automatically by our blockchain-secured identity system.</strong></p>
          <p>For questions about this verification, please contact the issuing organization.</p>
          <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
            Powered by Blockchain Verification Portal • Secured by Hedera Hashgraph
          </p>
        </div>
      </div>
    `;
  }

  createProfessionalErrorHTML(data: any): string {
    return `
      <div class="verification-professional">
        <div class="verification-header">
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: linear-gradient(135deg, #f44336, #d32f2f);
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: 600;
            margin-bottom: 15px;
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
          ">
            <span>❌</span>
            <span>Verification Failed</span>
          </div>
          <h2 style="margin: 0; color: #333; font-size: 24px;">Identity Verification Unsuccessful</h2>
          <p style="margin: 10px 0 0 0; color: #666;">${data.message || 'The profile could not be verified at this time'}</p>
        </div>

        <div class="detail-card" style="border-left-color: #f44336;">
          <h4>❌ Error Information</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Status</span>
              <span class="detail-value">${data.status}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Timestamp</span>
              <span class="detail-value timestamp-professional">${new Date(data.timestamp).toLocaleString()}</span>
            </div>
            ${data.profileId ? `
              <div class="detail-item">
                <span class="detail-label">Profile ID</span>
                <span class="detail-value timestamp-professional">${data.profileId}</span>
              </div>
            ` : ''}
            ${data.userId ? `
              <div class="detail-item">
                <span class="detail-label">User ID</span>
                <span class="detail-value timestamp-professional">${data.userId}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <div style="background: rgba(244, 67, 54, 0.1); border-radius: 12px; padding: 20px; margin-top: 20px;">
          <h4 style="margin: 0 0 15px 0; color: #c62828;">🔧 Possible Solutions</h4>
          <ul style="margin: 0; padding-left: 20px; color: #d32f2f;">
            <li>Verify that the verification link is complete and unmodified</li>
            <li>Check that the link has not expired</li>
            <li>Contact the organization that issued this verification</li>
            <li>Ensure you have a stable internet connection</li>
          </ul>
        </div>

        <div class="verification-footer">
          <p><strong>If you believe this is an error, please contact technical support.</strong></p>
          <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
            Powered by Blockchain Verification Portal • Secured by Hedera Hashgraph
          </p>
        </div>
      </div>
    `;
  }
} 