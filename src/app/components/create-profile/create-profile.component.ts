import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyProfile, BlockchainStoreRequest, BlockchainStoreResponse } from '../../models/company-profile.interface';
import { profileUpdateService } from '../../app.component';

@Component({
  selector: 'app-create-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="tab-content">
      <h2>Create Company Profile</h2>
      <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
        
        <!-- Basic Company Information -->
        <h3 class="form-section-title">🏢 Basic Company Information</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="company_name">Company Name *:</label>
            <input type="text" id="company_name" formControlName="company_name" required />
          </div>
          <div class="form-group">
            <label for="location">Location *:</label>
            <input type="text" id="location" formControlName="location" required placeholder="City, Country" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="contact">Contact *:</label>
            <input type="text" id="contact" formControlName="contact" required placeholder="Email or Phone" />
          </div>
          <div class="form-group">
            <label for="size">Company Size *:</label>
            <select id="size" formControlName="size" required>
              <option value="">Select Size</option>
              <option value="1-10 employees">1-10 employees</option>
              <option value="11-50 employees">11-50 employees</option>
              <option value="51-100 employees">51-100 employees</option>
              <option value="101-250 employees">101-250 employees</option>
              <option value="251-500 employees">251-500 employees</option>
              <option value="501-1000 employees">501-1000 employees</option>
              <option value="1000+ employees">1000+ employees</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="established">Year Established *:</label>
            <input type="text" id="established" formControlName="established" required placeholder="e.g., 2016" />
          </div>
          <div class="form-group">
            <label for="revenue">Annual Revenue *:</label>
            <select id="revenue" formControlName="revenue" required>
              <option value="">Select Revenue</option>
              <option value="Under $1M">Under $1M</option>
              <option value="$1M-$5M">$1M-$5M</option>
              <option value="$5M-$10M">$5M-$10M</option>
              <option value="$10M-$25M">$10M-$25M</option>
              <option value="$25M-$50M">$25M-$50M</option>
              <option value="$50M-$100M">$50M-$100M</option>
              <option value="$100M+">$100M+</option>
            </select>
          </div>
        </div>

        <!-- Market & Technology Information -->
        <h3 class="form-section-title">🎯 Market & Technology Focus</h3>
        <div class="form-group">
          <label for="market_segments">Market Segments:</label>
          <input type="text" id="market_segments" formControlName="market_segments" placeholder="e.g., Cybersecurity, IoT, Edge Computing (comma-separated)" />
        </div>

        <div class="form-group">
          <label for="technology_focus">Technology Focus:</label>
          <input type="text" id="technology_focus" formControlName="technology_focus" placeholder="e.g., Zero Trust Security, Edge AI, Device Management (comma-separated)" />
        </div>

        <div class="form-group">
          <label for="key_markets">Key Markets:</label>
          <input type="text" id="key_markets" formControlName="key_markets" placeholder="e.g., Europe, North America, Middle East (comma-separated)" />
        </div>

        <!-- Customer & Business Information -->
        <h3 class="form-section-title">👥 Customer & Business Information</h3>
        <div class="form-group">
          <label for="customer_segments">Customer Segments:</label>
          <input type="text" id="customer_segments" formControlName="customer_segments" placeholder="e.g., Industrial, Government, Telecom (comma-separated)" />
        </div>

        <div class="form-group">
          <label for="competitive_position">Competitive Position:</label>
          <textarea id="competitive_position" formControlName="competitive_position" rows="3" placeholder="Describe your competitive position in the market"></textarea>
        </div>

        <!-- Partnerships & Certifications -->
        <h3 class="form-section-title">🤝 Partnerships & Certifications</h3>
        <div class="form-group">
          <label for="partnerships">Partnerships:</label>
          <input type="text" id="partnerships" formControlName="partnerships" placeholder="e.g., Siemens, Cisco, European Space Agency (comma-separated)" />
        </div>

        <div class="form-group">
          <label for="certifications">Certifications:</label>
          <input type="text" id="certifications" formControlName="certifications" placeholder="e.g., ISO 9001, TISAX, ENISA Compliant (comma-separated)" />
        </div>

        <!-- Sales Channels -->
        <h3 class="form-section-title">📈 Sales Channels</h3>
        <div class="form-group">
          <label for="sales_channels">Sales Channels:</label>
          <input type="text" id="sales_channels" formControlName="sales_channels" placeholder="e.g., Resellers, Enterprise Sales, Global Integrators (comma-separated)" />
        </div>

        <!-- Private Key Section (Required) -->
        <h3 class="form-section-title">🔐 Private Key (Required)</h3>
        <div class="private-key-info">
          <p><strong>ℹ️ Information:</strong> You must provide your own private key to create a company profile.</p>
          <p><strong>⚠️ Security Note:</strong> This private key will be used to sign your profile data on the blockchain. Keep it secure and never share it with anyone.</p>
        </div>
        
        <div class="form-group">
          <label for="private_key">Your Private Key *:</label>
          <div class="password-input-container">
            <input 
              [type]="showPassword ? 'text' : 'password'"
              id="private_key" 
              formControlName="private_key" 
              placeholder="Enter your private key (required)"
              class="form-input password-input"
              required
              (input)="onPrivateKeyInput($event)"
            />
            <button 
              type="button" 
              class="password-toggle-btn"
              (click)="togglePasswordVisibility()"
              [title]="showPassword ? 'Hide password' : 'Show password'"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <small class="help-text">This private key is required to create your profile. Make sure to keep it secure.</small>
          <small class="debug-text" *ngIf="privateKeyDebug">Debug: Input field is working - {{ privateKeyDebug }}</small>
        </div>

        <button type="submit" class="btn create-profile-btn" [disabled]="loading || !profileForm.valid">Create Company Profile</button>
      </form>
      
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Creating profile on blockchain...</p>
      </div>
      
      <div [class]="'result ' + (isSuccess ? 'success' : 'error')" *ngIf="resultMessage" [innerHTML]="resultMessage"></div>
      
      <!-- Private Key Section - Only show after successful creation -->
      <div class="private-key-section" *ngIf="showPrivateKeySection && privateKey">
        <h3>🔐 Private Key Generated</h3>
        <div class="private-key-warning">
          <strong>⚠️ IMPORTANT:</strong> Save this private key securely. You will need it to update your profile later.
          <br><br>
          <strong>⚠️ SECURITY WARNING:</strong> This private key will only be shown once. If you lose it, you cannot update your profile.
        </div>
        
        <div class="form-group">
          <label>Your Private Key:</label>
          <input type="text" [value]="privateKey" readonly class="private-key-input" placeholder="Private key will appear here">
        </div>
        
        <div class="link-container">
          <button (click)="copyToClipboard(privateKey)" class="copy-btn">📋 Copy Private Key</button>
          <button (click)="savePrivateKey()" class="save-private-key-btn">💾 Download Private Key</button>
        </div>
        
        <p style="margin-top: 15px; font-size: 14px; opacity: 0.8;">
          <strong>Next Steps:</strong><br>
          1. Copy or download your private key<br>
          2. Store it securely (not in this browser)<br>
          3. Use it when updating your profile later
        </p>
      </div>
    </div>
  `,
  styles: [`
    .tab-content {
      padding: 40px;
    }

    .form-section-title {
      color: #4facfe;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 30px 0 20px 0;
      padding: 10px 0;
      border-bottom: 2px solid #e8f4fd;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .form-section-title:first-of-type {
      margin-top: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
      background: white;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: #4facfe;
      box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
    }

    .form-input {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
      background: white;
      color: #333;
      font-family: 'Courier New', monospace;
    }

    .form-input:focus {
      outline: none;
      border-color: #4facfe;
      box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
    }

    .form-input::placeholder {
      color: #999;
    }

    .password-input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-input {
      padding-right: 50px;
    }

    .password-toggle-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      padding: 5px;
      border-radius: 4px;
      transition: all 0.3s ease;
      color: #666;
    }

    .password-toggle-btn:hover {
      background: rgba(79, 172, 254, 0.1);
      color: #4facfe;
    }

    .password-toggle-btn:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.3);
    }

    .btn {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .btn:hover {
      transform: translateY(-2px);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .create-profile-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 30px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 20px;
      width: 100%;
    }

    .create-profile-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
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

    .success-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      margin-top: 20px;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .profile-info {
      margin: 20px 0;
      background: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding: 5px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .info-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .label {
      font-weight: 600;
      opacity: 0.9;
    }

    .value {
      font-weight: 400;
      opacity: 0.8;
    }

    .verification-section {
      margin-top: 20px;
      background: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }

    .link-container {
      display: flex;
      gap: 10px;
      margin: 10px 0;
    }

    .link-input {
      flex: 1;
      padding: 10px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 14px;
    }

    .link-input::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    .copy-btn {
      padding: 10px 15px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
    }

    .copy-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }

    .link-note {
      font-size: 14px;
      opacity: 0.8;
      margin: 10px 0 0 0;
    }

    .private-key-section {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      border: 2px solid #ff4757;
      border-radius: 12px;
      padding: 20px;
      margin-top: 20px;
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
    }

    .private-key-warning {
      background: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
      border-left: 4px solid #ff4757;
    }

    .private-key-info {
      background: rgba(255, 107, 107, 0.1);
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #ff4757;
    }

    .private-key-info p {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .private-key-info p:last-child {
      margin-bottom: 0;
    }

    .help-text {
      display: block;
      margin-top: 5px;
      font-size: 0.8rem;
      color: #666;
      font-style: italic;
    }

    .debug-text {
      display: block;
      margin-top: 5px;
      font-size: 0.8rem;
      color: #4facfe;
      font-weight: bold;
    }

    .private-key-input {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 6px;
      width: 100%;
      margin-bottom: 10px;
    }

    .private-key-input::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    .save-private-key-btn {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .save-private-key-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 15px;
      }
    }
  `]
})
export class CreateProfileComponent {
  profileForm: FormGroup;
  loading: boolean = false;
  resultMessage: string = '';
  isSuccess: boolean = false;
  privateKey: string = '';
  showPrivateKeySection: boolean = false;
  privateKeyDebug: string = '';
  showPassword: boolean = false;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      company_name: ['', Validators.required],
      location: ['', Validators.required],
      contact: ['', Validators.required],
      size: ['', Validators.required],
      established: ['', Validators.required],
      revenue: ['', Validators.required],
      market_segments: [''],
      technology_focus: [''],
      key_markets: [''],
      customer_segments: [''],
      competitive_position: [''],
      partnerships: [''],
      certifications: [''],
      sales_channels: [''],
      private_key: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    this.resultMessage = '';
    this.showPrivateKeySection = false;

    try {
      // Prepare profile data
      const profileData: CompanyProfile = this.profileForm.value;
      
      // Convert comma-separated strings to arrays for backend
      profileData.market_segments = profileData.market_segments ? 
        (typeof profileData.market_segments === 'string' ? 
          profileData.market_segments.split(',').map((item: string) => item.trim()).filter((item: string) => item !== '') : 
          profileData.market_segments) : [];
      profileData.technology_focus = profileData.technology_focus ? 
        (typeof profileData.technology_focus === 'string' ? 
          profileData.technology_focus.split(',').map((item: string) => item.trim()).filter((item: string) => item !== '') : 
          profileData.technology_focus) : [];
      profileData.key_markets = profileData.key_markets ? 
        (typeof profileData.key_markets === 'string' ? 
          profileData.key_markets.split(',').map((item: string) => item.trim()).filter((item: string) => item !== '') : 
          profileData.key_markets) : [];
      profileData.customer_segments = profileData.customer_segments ? 
        (typeof profileData.customer_segments === 'string' ? 
          profileData.customer_segments.split(',').map((item: string) => item.trim()).filter((item: string) => item !== '') : 
          profileData.customer_segments) : [];
      profileData.partnerships = profileData.partnerships ? 
        (typeof profileData.partnerships === 'string' ? 
          profileData.partnerships.split(',').map((item: string) => item.trim()).filter((item: string) => item !== '') : 
          profileData.partnerships) : [];
      profileData.certifications = profileData.certifications ? 
        (typeof profileData.certifications === 'string' ? 
          profileData.certifications.split(',').map((item: string) => item.trim()).filter((item: string) => item !== '') : 
          profileData.certifications) : [];
      profileData.sales_channels = profileData.sales_channels ? 
        (typeof profileData.sales_channels === 'string' ? 
          profileData.sales_channels.split(',').map((item: string) => item.trim()).filter((item: string) => item !== '') : 
          profileData.sales_channels) : [];

      // Prepare request - Include private_key if provided by user
      const request: BlockchainStoreRequest = {
        profile_data: profileData,
        timestamp: new Date().toISOString()
      };

      // Include the required private key in the request
      const userPrivateKey = (profileData as any).private_key;
      if (userPrivateKey && userPrivateKey.trim()) {
        (request as any).private_key = userPrivateKey.trim();
      } else {
        throw new Error('Private key is required');
      }

      const response = await fetch('http://localhost:3000/blockchain/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // Store private key temporarily for display
        this.privateKey = result.private_key || '';
        
        // Private key is always user-provided since it's required
        const privateKeySource = 'User Provided';
        
        this.resultMessage = `
          <div class="success-card">
            <h3>✅ Company Profile Created Successfully!</h3>
            <div class="profile-info">
              <div class="info-row">
                <span class="label">File ID:</span>
                <span class="value">${result.file_id}</span>
              </div>
              <div class="info-row">
                <span class="label">Company Name:</span>
                <span class="value">${profileData.company_name}</span>
              </div>
              <div class="info-row">
                <span class="label">Location:</span>
                <span class="value">${profileData.location}</span>
              </div>
              <div class="info-row">
                <span class="label">Contact:</span>
                <span class="value">${profileData.contact}</span>
              </div>
              <div class="info-row">
                <span class="label">Created:</span>
                <span class="value">${new Date(result.timestamp).toLocaleString()}</span>
              </div>
              <div class="info-row">
                <span class="label">Private Key:</span>
                <span class="value">${privateKeySource}</span>
              </div>
            </div>
            
            <div class="verification-section">
              <h4>🔗 Verification Link</h4>
              <div class="link-container">
                <input type="text" value="${result.verification_url}" readonly class="link-input">
                <button (click)="copyToClipboard('${result.verification_url}')" class="copy-btn">📋 Copy</button>
              </div>
              <p class="link-note">Click the link above to verify the profile on the blockchain</p>
            </div>

            <div class="verification-section" style="margin-top: 20px; border-top: 2px solid #eee; padding-top: 20px; background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); border-radius: 12px; padding: 20px;">
              <h4>🔗 Public Verification Link</h4>
              <div class="link-container">
                <input type="text" value="${result.verification_url}&public=true" readonly class="link-input">
                <button (click)="copyToClipboard('${result.verification_url}&public=true')" class="copy-btn">📋 Copy</button>
              </div>
              <p class="link-note">Public verification link (without update history)</p>
            </div>
          </div>
        `;
        this.isSuccess = true;
        
        // Don't show private key section since user already provided their own key
        this.showPrivateKeySection = false;
        
        // Reset form
        this.profileForm.reset();

        // Notify other tabs to refresh their data
        profileUpdateService.notifyUpdate();
      } else {
        const errorMessage = result.error || 'Failed to create profile';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      this.resultMessage = `
        <div class="error-card">
          <h3>❌ Error Creating Profile</h3>
          <p><strong>Details:</strong> ${error.message}</p>
        </div>
      `;
      this.isSuccess = false;
    } finally {
      this.loading = false;
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }

  onPrivateKeyInput(event: any) {
    this.privateKeyDebug = `Length: ${event.target.value.length} characters`;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  savePrivateKey() {
    if (this.privateKey) {
      // Create a blob and download the private key
      const blob = new Blob([this.privateKey], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'private_key.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Clear the private key from memory
      this.privateKey = '';
      this.showPrivateKeySection = false;
    }
  }
} 