import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyProfile, BlockchainUpdateRequest, ProfileUpdateResponse } from '../../models/company-profile.interface';
import { profileUpdateService } from '../../app.component';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="update-container">
      <div class="update-header">
        <h2>✏️ Update Company Profile</h2>
        <p>Enter your private key to load and update your company profile</p>
      </div>
      
      <!-- Private Key Input Section -->
      <div class="private-key-section" *ngIf="!profileLoaded">
        <h3>🔐 Authentication Required</h3>
        <div class="private-key-warning">
          <strong>⚠️ IMPORTANT:</strong> You need your private key to update your profile.
          <br><br>
          <strong>ℹ️ INFO:</strong> This private key was provided when you created your profile.
        </div>
        
        <div class="form-group">
          <label for="private_key_input">Your Private Key:</label>
          <input 
            type="password" 
            id="private_key_input" 
            [(ngModel)]="privateKeyInput" 
            placeholder="Enter your private key"
            class="private-key-input"
            required
          />
        </div>
        
        <button 
          type="button" 
          class="btn" 
          (click)="validateAndLoadProfile()" 
          [disabled]="!privateKeyInput || validatingPrivateKey"
        >
          {{ validatingPrivateKey ? 'Loading Profile...' : 'Load Profile for Editing' }}
        </button>
        
        <div class="loading" *ngIf="validatingPrivateKey">
          <div class="spinner"></div>
          <p>Validating private key and loading profile...</p>
        </div>
      </div>
      
      <!-- Update Form - Only show after profile is loaded -->
      <div class="update-form-section" *ngIf="profileLoaded">
        <div class="form-header">
          <h3>📝 Edit Company Profile</h3>
          <p>Make changes to your profile and submit to update on the blockchain</p>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
          <!-- Basic Company Information -->
          <div class="form-section">
            <h4 class="section-title">🏢 Basic Company Information</h4>
            <div class="form-row">
              <div class="form-group">
                <label for="company_name">Company Name:</label>
                <input type="text" id="company_name" formControlName="company_name" placeholder="Update company name" />
              </div>
              <div class="form-group">
                <label for="location">Location:</label>
                <input type="text" id="location" formControlName="location" placeholder="Update location" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="contact">Contact:</label>
                <input type="text" id="contact" formControlName="contact" placeholder="Update contact" />
              </div>
              <div class="form-group">
                <label for="size">Company Size:</label>
                <select id="size" formControlName="size">
                  <option value="">Select size</option>
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
                <label for="established">Year Established:</label>
                <input type="text" id="established" formControlName="established" placeholder="Update year established" />
              </div>
              <div class="form-group">
                <label for="revenue">Annual Revenue:</label>
                <select id="revenue" formControlName="revenue">
                  <option value="">Select revenue</option>
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
          </div>

          <!-- Market & Technology Information -->
          <div class="form-section">
            <h4 class="section-title">🎯 Market & Technology Focus</h4>
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
          </div>

          <!-- Customer & Business Information -->
          <div class="form-section">
            <h4 class="section-title">👥 Customer & Business Information</h4>
            <div class="form-group">
              <label for="customer_segments">Customer Segments:</label>
              <input type="text" id="customer_segments" formControlName="customer_segments" placeholder="e.g., Industrial, Government, Telecom (comma-separated)" />
            </div>

            <div class="form-group">
              <label for="competitive_position">Competitive Position:</label>
              <textarea id="competitive_position" formControlName="competitive_position" rows="3" placeholder="Update competitive position"></textarea>
            </div>
          </div>

          <!-- Partnerships & Certifications -->
          <div class="form-section">
            <h4 class="section-title">🤝 Partnerships & Certifications</h4>
            <div class="form-group">
              <label for="partnerships">Partnerships:</label>
              <input type="text" id="partnerships" formControlName="partnerships" placeholder="e.g., Siemens, Cisco, European Space Agency (comma-separated)" />
            </div>

            <div class="form-group">
              <label for="certifications">Certifications:</label>
              <input type="text" id="certifications" formControlName="certifications" placeholder="e.g., ISO 9001, TISAX, ENISA Compliant (comma-separated)" />
            </div>
          </div>

          <!-- Sales Channels -->
          <div class="form-section">
            <h4 class="section-title">📈 Sales Channels</h4>
            <div class="form-group">
              <label for="sales_channels">Sales Channels:</label>
              <input type="text" id="sales_channels" formControlName="sales_channels" placeholder="e.g., Resellers, Enterprise Sales, Global Integrators (comma-separated)" />
            </div>
          </div>

          <!-- Profile Info Display -->
          <div class="profile-info-display">
            <h4 class="section-title">📋 Profile Information</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">File ID:</span>
                <span class="info-value">{{ currentFileId }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Current Version:</span>
                <span class="info-value">{{ currentVersion }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Updated:</span>
                <span class="info-value">{{ lastUpdated }}</span>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="resetForm()">
              🔄 Reset to Original
            </button>
            <button type="submit" class="btn-primary" [disabled]="loading || !profileForm.valid">
              {{ loading ? 'Updating Profile...' : 'Update Company Profile' }}
            </button>
          </div>
        </form>
      </div>
      
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Updating profile on blockchain...</p>
      </div>
      
      <div [class]="'result ' + (isSuccess ? 'success' : 'error')" *ngIf="resultMessage" [innerHTML]="resultMessage"></div>
    </div>
  `,
  styles: [`
    .update-container {
      padding: 40px;
      background: white;
      min-height: 100vh;
    }

    .update-header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 15px;
      color: white;
    }

    .update-header h2 {
      margin: 0 0 10px 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .update-header p {
      margin: 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .private-key-section {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      border: 2px solid #ff4757;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 30px;
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
    }

    .private-key-section h3 {
      margin: 0 0 15px 0;
      color: white;
      font-size: 1.4rem;
    }

    .private-key-warning {
      background: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #ff4757;
      color: white;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: white;
    }

    .private-key-input {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      font-size: 16px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-family: 'Courier New', monospace;
    }

    .private-key-input::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    .private-key-input:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.8);
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
    }

    .btn {
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 12px 30px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .update-form-section {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
    }

    .form-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .form-header h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .form-header p {
      margin: 0;
      color: #666;
    }

    .form-section {
      background: white;
      border-radius: 8px;
      padding: 25px;
      margin-bottom: 25px;
      border: 1px solid #e9ecef;
    }

    .section-title {
      color: #667eea;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 20px 0;
      display: flex;
      align-items: center;
      gap: 10px;
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
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .profile-info-display {
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      border: 1px solid #2196f3;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 25px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .info-label {
      font-weight: 600;
      color: #1976d2;
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
      font-family: 'Courier New', monospace;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background: #5a6268;
      transform: translateY(-2px);
    }

    .loading {
      text-align: center;
      margin: 20px 0;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
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

    .error-card {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      margin-top: 20px;
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
    }

    @media (max-width: 768px) {
      .update-container {
        padding: 20px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 15px;
      }

      .form-actions {
        flex-direction: column;
        align-items: center;
      }

      .update-header h2 {
        font-size: 1.6rem;
      }

      .update-header p {
        font-size: 1rem;
      }
    }
  `]
})
export class UpdateProfileComponent {
  profileForm: FormGroup;
  loading: boolean = false;
  validatingPrivateKey: boolean = false;
  resultMessage: string = '';
  isSuccess: boolean = false;
  
  // Private key handling
  privateKeyInput: string = '';
  validatedPrivateKey: string = '';
  profileLoaded: boolean = false;
  
  // Profile data
  currentFileId: string = '';
  currentVersion: number = 0;
  lastUpdated: string = '';
  originalProfileData: CompanyProfile | null = null;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      company_name: [''],
      location: [''],
      contact: [''],
      size: [''],
      established: [''],
      revenue: [''],
      market_segments: [''],
      technology_focus: [''],
      key_markets: [''],
      customer_segments: [''],
      competitive_position: [''],
      partnerships: [''],
      certifications: [''],
      sales_channels: ['']
    });
  }

  async validateAndLoadProfile() {
    if (!this.privateKeyInput.trim()) {
      this.resultMessage = `
        <div class="error-card">
          <h3>❌ Validation Error</h3>
          <p><strong>Details:</strong> Please enter your private key.</p>
        </div>
      `;
      this.isSuccess = false;
      return;
    }

    this.validatingPrivateKey = true;
    this.resultMessage = '';

    try {
      // First, we need to get the file_id from the private key
      // In a real implementation, the backend would have an endpoint to map private_key to file_id
      // For now, we'll simulate this with a demo endpoint or use a known file_id
      
      // Simulate getting file_id from private key
      const fileId = await this.getFileIdFromPrivateKey(this.privateKeyInput);
      
      if (!fileId) {
        throw new Error('Invalid private key. No profile found for this key.');
      }

      // Now fetch the profile data using the file_id
      const response = await fetch(`http://localhost:3000/blockchain/profiles/${fileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // Store the validated private key
        this.validatedPrivateKey = this.privateKeyInput;
        this.privateKeyInput = ''; // Clear for security
        
        // Store profile data
        this.originalProfileData = result.profile_data;
        this.currentFileId = result.metadata.file_id;
        this.currentVersion = result.metadata.version;
        this.lastUpdated = new Date(result.metadata.updated_at).toLocaleString();
        
        // Populate form with existing data
        this.populateFormWithProfileData(result.profile_data);
        
        this.profileLoaded = true;
        
        this.resultMessage = `
          <div class="success-card">
            <h3>✅ Profile Loaded Successfully</h3>
            <p>Your profile has been loaded and is ready for editing. Make your changes and click "Update Company Profile" to save.</p>
          </div>
        `;
        this.isSuccess = true;
      } else {
        throw new Error(result.error || 'Failed to load profile');
      }
    } catch (error: any) {
      this.resultMessage = `
        <div class="error-card">
          <h3>❌ Profile Loading Failed</h3>
          <p><strong>Details:</strong> ${error.message}</p>
          <p><strong>Possible reasons:</strong></p>
          <ul>
            <li>Invalid private key</li>
            <li>Profile not found</li>
            <li>Backend service unavailable</li>
          </ul>
        </div>
      `;
      this.isSuccess = false;
    } finally {
      this.validatingPrivateKey = false;
    }
  }

  private async getFileIdFromPrivateKey(privateKey: string): Promise<string> {
    // Call the backend endpoint to get file_id from private key
    const response = await fetch('http://localhost:3000/blockchain/file-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        private_key: privateKey
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      return result.file_id;
    } else {
      throw new Error(result.error || 'Failed to get file ID from private key');
    }
  }

  private populateFormWithProfileData(profileData: CompanyProfile) {
    // Convert arrays to comma-separated strings for form display
    const formData = {
      company_name: profileData.company_name || '',
      location: profileData.location || '',
      contact: profileData.contact || '',
      size: profileData.size || '',
      established: profileData.established || '',
      revenue: profileData.revenue || '',
      market_segments: Array.isArray(profileData.market_segments) ? profileData.market_segments.join(', ') : profileData.market_segments || '',
      technology_focus: Array.isArray(profileData.technology_focus) ? profileData.technology_focus.join(', ') : profileData.technology_focus || '',
      key_markets: Array.isArray(profileData.key_markets) ? profileData.key_markets.join(', ') : profileData.key_markets || '',
      customer_segments: Array.isArray(profileData.customer_segments) ? profileData.customer_segments.join(', ') : profileData.customer_segments || '',
      competitive_position: profileData.competitive_position || '',
      partnerships: Array.isArray(profileData.partnerships) ? profileData.partnerships.join(', ') : profileData.partnerships || '',
      certifications: Array.isArray(profileData.certifications) ? profileData.certifications.join(', ') : profileData.certifications || '',
      sales_channels: Array.isArray(profileData.sales_channels) ? profileData.sales_channels.join(', ') : profileData.sales_channels || ''
    };

    this.profileForm.patchValue(formData);
  }

  resetForm() {
    if (this.originalProfileData) {
      this.populateFormWithProfileData(this.originalProfileData);
    }
  }

  async onSubmit() {
    if (this.profileForm.invalid || !this.validatedPrivateKey) {
      this.resultMessage = `
        <div class="error-card">
          <h3>❌ Validation Error</h3>
          <p><strong>Details:</strong> Form must be valid and private key must be provided.</p>
        </div>
      `;
      this.isSuccess = false;
      return;
    }

    this.loading = true;
    this.resultMessage = '';

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

      // Remove empty fields
      Object.keys(profileData).forEach(key => {
        if (profileData[key as keyof CompanyProfile] === '' || 
            (Array.isArray(profileData[key as keyof CompanyProfile]) && 
             (profileData[key as keyof CompanyProfile] as string[]).length === 0)) {
          delete profileData[key as keyof CompanyProfile];
        }
      });

      // Check if at least one field has data
      if (Object.keys(profileData).length === 0) {
        this.resultMessage = `
          <div class="error-card">
            <h3>❌ Validation Error</h3>
            <p><strong>Details:</strong> Please provide at least one field to update.</p>
          </div>
        `;
        this.isSuccess = false;
        this.loading = false;
        return;
      }

      const response = await fetch(`http://localhost:3000/blockchain/profiles/${this.currentFileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_data: profileData,
          timestamp: new Date().toISOString(),
          private_key: this.validatedPrivateKey
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        this.resultMessage = `
          <div class="success-card">
            <h3>✅ Company Profile Updated Successfully!</h3>
            <div class="profile-info">
              <div class="info-row">
                <span class="label">New File ID:</span>
                <span class="value">${result.new_file_id}</span>
              </div>
              <div class="info-row">
                <span class="label">Version:</span>
                <span class="value">${result.new_version}</span>
              </div>
              <div class="info-row">
                <span class="label">Updated:</span>
                <span class="value">${new Date(result.timestamp).toLocaleString()}</span>
              </div>
              <div class="info-row">
                <span class="label">Fields Changed:</span>
                <span class="value">${result.diffs.length}</span>
              </div>
            </div>
            
            ${result.diffs.length > 0 ? `
            <div class="verification-section">
              <h4>📋 Changes Made</h4>
              ${result.diffs.map((diff: any) => `
                <div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 4px;">
                  <strong>${diff.field_name}:</strong> 
                  <span style="color: #ff6b6b;">${diff.old_value || 'Empty'}</span> 
                  → 
                  <span style="color: #4CAF50;">${diff.new_value}</span>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
        `;
        this.isSuccess = true;
        
        // Update current version and file ID
        this.currentVersion = result.new_version;
        this.currentFileId = result.new_file_id;
        this.lastUpdated = new Date(result.timestamp).toLocaleString();
        
        // Clear private key for security
        this.validatedPrivateKey = '';
        this.profileLoaded = false;

        // Notify the main app component that the profile has been updated
        profileUpdateService.notifyUpdate();
      } else {
        const errorMessage = result.error || 'Failed to update profile';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      this.resultMessage = `
        <div class="error-card">
          <h3>❌ Error Updating Profile</h3>
          <p><strong>Details:</strong> ${error.message}</p>
        </div>
      `;
      this.isSuccess = false;
    } finally {
      this.loading = false;
    }
  }
} 