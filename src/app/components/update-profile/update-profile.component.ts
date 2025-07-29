import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tab-content">
      <h2>Update Profile</h2>
      <form (ngSubmit)="onSubmit()" #updateForm="ngForm">
        <div class="form-group">
          <label for="userId">User ID:</label>
          <input type="text" id="userId" name="userId" [(ngModel)]="userId" required placeholder="Enter User ID to update" />
        </div>
        
        <!-- Personal Information Section -->
        <h3 class="form-section-title">👤 Personal Information</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">First Name:</label>
            <input type="text" id="firstName" name="firstName" [(ngModel)]="updateData.firstName" placeholder="Update first name" />
          </div>
          <div class="form-group">
            <label for="lastName">Last Name:</label>
            <input type="text" id="lastName" name="lastName" [(ngModel)]="updateData.lastName" placeholder="Update last name" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="middleName">Middle Name:</label>
            <input type="text" id="middleName" name="middleName" [(ngModel)]="updateData.middleName" placeholder="Update middle name" />
          </div>
          <div class="form-group">
            <label for="dateOfBirth">Date of Birth:</label>
            <input type="date" id="dateOfBirth" name="dateOfBirth" [(ngModel)]="updateData.dateOfBirth" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="gender">Gender:</label>
            <select id="gender" name="gender" [(ngModel)]="updateData.gender">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
          <div class="form-group">
            <label for="nationality">Nationality:</label>
            <input type="text" id="nationality" name="nationality" [(ngModel)]="updateData.nationality" placeholder="Update nationality" />
          </div>
        </div>

        <!-- Contact Information Section -->
        <h3 class="form-section-title">📞 Contact Information</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="email">Email Address:</label>
            <input type="email" id="email" name="email" [(ngModel)]="updateData.email" placeholder="Update email address" />
          </div>
          <div class="form-group">
            <label for="phone">Phone Number:</label>
            <input type="tel" id="phone" name="phone" [(ngModel)]="updateData.phone" placeholder="Update phone number" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="alternateEmail">Alternate Email:</label>
            <input type="email" id="alternateEmail" name="alternateEmail" [(ngModel)]="updateData.alternateEmail" placeholder="Update alternate email" />
          </div>
          <div class="form-group">
            <label for="alternatePhone">Alternate Phone:</label>
            <input type="tel" id="alternatePhone" name="alternatePhone" [(ngModel)]="updateData.alternatePhone" placeholder="Update alternate phone" />
          </div>
        </div>
        
        <!-- Address Information Section -->
        <h3 class="form-section-title">🏠 Address Information</h3>
        <div class="form-group">
          <label for="streetAddress">Street Address:</label>
          <input type="text" id="streetAddress" name="streetAddress" [(ngModel)]="updateData.streetAddress" placeholder="Update street address" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="city">City:</label>
            <input type="text" id="city" name="city" [(ngModel)]="updateData.city" placeholder="Update city" />
          </div>
          <div class="form-group">
            <label for="state">State/Province:</label>
            <input type="text" id="state" name="state" [(ngModel)]="updateData.state" placeholder="Update state/province" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="postalCode">Postal/Zip Code:</label>
            <input type="text" id="postalCode" name="postalCode" [(ngModel)]="updateData.postalCode" placeholder="Update postal code" />
          </div>
          <div class="form-group">
            <label for="country">Country:</label>
            <input type="text" id="country" name="country" [(ngModel)]="updateData.country" placeholder="Update country" />
          </div>
        </div>

        <!-- Professional Information Section -->
        <h3 class="form-section-title">💼 Professional Information</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="company">Company/Organization:</label>
            <input type="text" id="company" name="company" [(ngModel)]="updateData.company" placeholder="Update company name" />
          </div>
          <div class="form-group">
            <label for="jobTitle">Job Title:</label>
            <input type="text" id="jobTitle" name="jobTitle" [(ngModel)]="updateData.jobTitle" placeholder="Update job title" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="department">Department:</label>
            <input type="text" id="department" name="department" [(ngModel)]="updateData.department" placeholder="Update department" />
          </div>
          <div class="form-group">
            <label for="industry">Industry:</label>
            <input type="text" id="industry" name="industry" [(ngModel)]="updateData.industry" placeholder="Update industry" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="workPhone">Work Phone:</label>
            <input type="tel" id="workPhone" name="workPhone" [(ngModel)]="updateData.workPhone" placeholder="Update work phone" />
          </div>
          <div class="form-group">
            <label for="workEmail">Work Email:</label>
            <input type="email" id="workEmail" name="workEmail" [(ngModel)]="updateData.workEmail" placeholder="Update work email" />
          </div>
        </div>

        <!-- Additional Information Section -->
        <h3 class="form-section-title">📝 Additional Information</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="website">Website/Portfolio:</label>
            <input type="url" id="website" name="website" [(ngModel)]="updateData.website" placeholder="Update website" />
          </div>
          <div class="form-group">
            <label for="linkedIn">LinkedIn Profile:</label>
            <input type="url" id="linkedIn" name="linkedIn" [(ngModel)]="updateData.linkedIn" placeholder="Update LinkedIn profile" />
          </div>
        </div>
        <div class="form-group">
          <label for="skills">Skills (comma-separated):</label>
          <input type="text" id="skills" name="skills" [(ngModel)]="updateData.skills" placeholder="Update skills" />
        </div>
        <div class="form-group">
          <label for="languages">Languages Spoken:</label>
          <input type="text" id="languages" name="languages" [(ngModel)]="updateData.languages" placeholder="Update languages" />
        </div>
        <div class="form-group">
          <label for="notes">Additional Notes:</label>
          <textarea id="notes" name="notes" [(ngModel)]="updateData.notes" rows="3" placeholder="Update additional information or notes"></textarea>
        </div>

        <button type="submit" class="btn" [disabled]="loading">Update Comprehensive Profile</button>
      </form>
      
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Updating profile...</p>
      </div>
      
      <div [class]="'result ' + (isSuccess ? 'success' : 'error')" *ngIf="resultMessage" [innerHTML]="resultMessage"></div>
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

    .error-card {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      margin-top: 20px;
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
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

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 15px;
      }
    }
  `]
})
export class UpdateProfileComponent {
  userId: string = '';
  updateData: any = {
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    email: '',
    phone: '',
    alternateEmail: '',
    alternatePhone: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    company: '',
    jobTitle: '',
    department: '',
    industry: '',
    workPhone: '',
    workEmail: '',
    website: '',
    linkedIn: '',
    skills: '',
    languages: '',
    notes: ''
  };

  loading: boolean = false;
  resultMessage: string = '';
  isSuccess: boolean = false;

  async onSubmit() {
    this.loading = true;
    this.resultMessage = '';

    // Validate User ID first
    if (!this.userId.trim()) {
      this.resultMessage = `
        <div class="error-card">
          <h3>❌ Validation Error</h3>
          <p><strong>Details:</strong> User ID is required. Please enter a valid User ID.</p>
          <div style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px; font-size: 12px;">
            <strong>Tip:</strong> You can get a User ID by creating a profile first or reading an existing profile.
          </div>
        </div>
      `;
      this.isSuccess = false;
      this.loading = false;
      return;
    }

    // Remove empty fields
    const cleanUpdateData = { ...this.updateData };
    Object.keys(cleanUpdateData).forEach(key => {
      if (!cleanUpdateData[key] || cleanUpdateData[key].trim() === '') {
        delete cleanUpdateData[key];
      }
    });

    // Check if at least one field has data
    if (Object.keys(cleanUpdateData).length === 0) {
      this.resultMessage = `
        <div class="error-card">
          <h3>❌ Validation Error</h3>
          <p><strong>Details:</strong> Please provide at least one field to update.</p>
          <div style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px; font-size: 12px;">
            <strong>Tip:</strong> Fill in any field you want to update and try again.
          </div>
        </div>
      `;
      this.isSuccess = false;
      this.loading = false;
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/v1/blockchain/profile/${this.userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: cleanUpdateData })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        this.resultMessage = `
          <div class="success-card">
            <h3>✅ Comprehensive Profile Updated Successfully!</h3>
            <div class="profile-info">
              <div class="info-row">
                <span class="label">Profile ID:</span>
                <span class="value">${result.profile.id}</span>
              </div>
              <div class="info-row">
                <span class="label">User ID:</span>
                <span class="value">${result.profile.userId}</span>
              </div>
              <div class="info-row">
                <span class="label">Created:</span>
                <span class="value">${new Date(result.profile.createdAt).toLocaleString()}</span>
              </div>
              <div class="info-row">
                <span class="label">Updated:</span>
                <span class="value">${new Date(result.profile.updatedAt).toLocaleString()}</span>
              </div>
            </div>
            
            <div class="profile-data">
              <h4>📋 Updated Profile Data</h4>
              <div class="data-container">
                ${Object.entries(result.profile.data).map(([key, value]) => `
                  <div class="data-row">
                    <span class="data-label">${this.formatFieldName(key)}:</span>
                    <span class="data-value">${value}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="verification-section">
              <h4>🔗 Updated Verification Link</h4>
              <div class="link-container">
                <input type="text" value="${result.verificationLink}" readonly class="link-input">
                <button (click)="copyToClipboard('${result.verificationLink}')" class="copy-btn">📋 Copy</button>
              </div>
            </div>
          </div>
        `;
        this.isSuccess = true;
        
        // Reset form
        this.updateData = {
          firstName: '', lastName: '', middleName: '', dateOfBirth: '', gender: '', nationality: '',
          email: '', phone: '', alternateEmail: '', alternatePhone: '', streetAddress: '', city: '',
          state: '', postalCode: '', country: '', company: '', jobTitle: '', department: '',
          industry: '', workPhone: '', workEmail: '', website: '', linkedIn: '', skills: '', languages: '', notes: ''
        };
      } else {
        // Handle different types of errors
        let errorMessage = 'Failed to update profile';
        if (result.message) {
          errorMessage = result.message;
        } else if (result.error) {
          errorMessage = result.error;
        } else if (!response.ok) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      let errorDetails = error.message;
      if (error.message === 'Failed to fetch') {
        errorDetails = 'Unable to connect to server. Please check your connection and try again.';
      } else if (error.message.includes('400')) {
        errorDetails = 'Invalid request data. Please check all fields and try again.';
      } else if (error.message.includes('404')) {
        errorDetails = 'Profile not found. Please verify the User ID is correct.';
      } else if (error.message.includes('500')) {
        errorDetails = 'Server error. Please try again later.';
      }
      
      this.resultMessage = `
        <div class="error-card">
          <h3>❌ Error Updating Profile</h3>
          <p><strong>Details:</strong> ${errorDetails}</p>
          <div style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px; font-size: 12px;">
            <strong>Debug Info:</strong><br>
            User ID: ${this.userId || 'Not provided'}<br>
            Fields to update: ${Object.keys(cleanUpdateData).length > 0 ? Object.keys(cleanUpdateData).join(', ') : 'None'}
          </div>
        </div>
      `;
      this.isSuccess = false;
    } finally {
      this.loading = false;
    }
  }

  formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }
} 