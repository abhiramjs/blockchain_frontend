import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tab-content">
      <h2>Create New Profile</h2>
      <form (ngSubmit)="onSubmit()" #createForm="ngForm">
        
        <!-- Personal Information Section -->
        <h3 class="form-section-title">👤 Personal Information</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">First Name *:</label>
            <input type="text" id="firstName" name="firstName" [(ngModel)]="profileData.firstName" required />
          </div>
          <div class="form-group">
            <label for="lastName">Last Name *:</label>
            <input type="text" id="lastName" name="lastName" [(ngModel)]="profileData.lastName" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="middleName">Middle Name:</label>
            <input type="text" id="middleName" name="middleName" [(ngModel)]="profileData.middleName" />
          </div>
          <div class="form-group">
            <label for="dateOfBirth">Date of Birth:</label>
            <input type="date" id="dateOfBirth" name="dateOfBirth" [(ngModel)]="profileData.dateOfBirth" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="gender">Gender:</label>
            <select id="gender" name="gender" [(ngModel)]="profileData.gender">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
          <div class="form-group">
            <label for="nationality">Nationality:</label>
            <input type="text" id="nationality" name="nationality" [(ngModel)]="profileData.nationality" placeholder="e.g., American, British" />
          </div>
        </div>

        <!-- Contact Information Section -->
        <h3 class="form-section-title">📞 Contact Information</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="email">Email Address *:</label>
            <input type="email" id="email" name="email" [(ngModel)]="profileData.email" required />
          </div>
          <div class="form-group">
            <label for="phone">Phone Number:</label>
            <input type="tel" id="phone" name="phone" [(ngModel)]="profileData.phone" placeholder="+1 (555) 123-4567" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="alternateEmail">Alternate Email:</label>
            <input type="email" id="alternateEmail" name="alternateEmail" [(ngModel)]="profileData.alternateEmail" />
          </div>
          <div class="form-group">
            <label for="alternatePhone">Alternate Phone:</label>
            <input type="tel" id="alternatePhone" name="alternatePhone" [(ngModel)]="profileData.alternatePhone" />
          </div>
        </div>

        <!-- Address Information Section -->
        <h3 class="form-section-title">🏠 Address Information</h3>
        <div class="form-group">
          <label for="streetAddress">Street Address:</label>
          <input type="text" id="streetAddress" name="streetAddress" [(ngModel)]="profileData.streetAddress" placeholder="123 Main Street" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="city">City:</label>
            <input type="text" id="city" name="city" [(ngModel)]="profileData.city" />
          </div>
          <div class="form-group">
            <label for="state">State/Province:</label>
            <input type="text" id="state" name="state" [(ngModel)]="profileData.state" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="postalCode">Postal/Zip Code:</label>
            <input type="text" id="postalCode" name="postalCode" [(ngModel)]="profileData.postalCode" />
          </div>
          <div class="form-group">
            <label for="country">Country:</label>
            <input type="text" id="country" name="country" [(ngModel)]="profileData.country" />
          </div>
        </div>

        <!-- Professional Information Section -->
        <h3 class="form-section-title">💼 Professional Information</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="company">Company/Organization:</label>
            <input type="text" id="company" name="company" [(ngModel)]="profileData.company" />
          </div>
          <div class="form-group">
            <label for="jobTitle">Job Title:</label>
            <input type="text" id="jobTitle" name="jobTitle" [(ngModel)]="profileData.jobTitle" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="department">Department:</label>
            <input type="text" id="department" name="department" [(ngModel)]="profileData.department" />
          </div>
          <div class="form-group">
            <label for="industry">Industry:</label>
            <input type="text" id="industry" name="industry" [(ngModel)]="profileData.industry" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="workPhone">Work Phone:</label>
            <input type="tel" id="workPhone" name="workPhone" [(ngModel)]="profileData.workPhone" />
          </div>
          <div class="form-group">
            <label for="workEmail">Work Email:</label>
            <input type="email" id="workEmail" name="workEmail" [(ngModel)]="profileData.workEmail" />
          </div>
        </div>

        <!-- Identification Section -->
        <h3 class="form-section-title">🆔 Identification</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="governmentId">Government ID Number:</label>
            <input type="text" id="governmentId" name="governmentId" [(ngModel)]="profileData.governmentId" placeholder="SSN, National ID, etc." />
          </div>
          <div class="form-group">
            <label for="passportNumber">Passport Number:</label>
            <input type="text" id="passportNumber" name="passportNumber" [(ngModel)]="profileData.passportNumber" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="drivingLicense">Driving License:</label>
            <input type="text" id="drivingLicense" name="drivingLicense" [(ngModel)]="profileData.drivingLicense" />
          </div>
          <div class="form-group">
            <label for="taxId">Tax ID:</label>
            <input type="text" id="taxId" name="taxId" [(ngModel)]="profileData.taxId" />
          </div>
        </div>

        <!-- Emergency Contact Section -->
        <h3 class="form-section-title">🚨 Emergency Contact</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="emergencyContactName">Emergency Contact Name:</label>
            <input type="text" id="emergencyContactName" name="emergencyContactName" [(ngModel)]="profileData.emergencyContactName" />
          </div>
          <div class="form-group">
            <label for="emergencyContactPhone">Emergency Contact Phone:</label>
            <input type="tel" id="emergencyContactPhone" name="emergencyContactPhone" [(ngModel)]="profileData.emergencyContactPhone" />
          </div>
        </div>
        <div class="form-group">
          <label for="emergencyContactRelationship">Relationship:</label>
          <input type="text" id="emergencyContactRelationship" name="emergencyContactRelationship" [(ngModel)]="profileData.emergencyContactRelationship" placeholder="Spouse, Parent, Sibling, etc." />
        </div>

        <!-- Additional Information Section -->
        <h3 class="form-section-title">📝 Additional Information</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="website">Website/Portfolio:</label>
            <input type="url" id="website" name="website" [(ngModel)]="profileData.website" placeholder="https://example.com" />
          </div>
          <div class="form-group">
            <label for="linkedIn">LinkedIn Profile:</label>
            <input type="url" id="linkedIn" name="linkedIn" [(ngModel)]="profileData.linkedIn" placeholder="https://linkedin.com/in/username" />
          </div>
        </div>
        <div class="form-group">
          <label for="skills">Skills (comma-separated):</label>
          <input type="text" id="skills" name="skills" [(ngModel)]="profileData.skills" placeholder="JavaScript, Python, Project Management" />
        </div>
        <div class="form-group">
          <label for="languages">Languages Spoken:</label>
          <input type="text" id="languages" name="languages" [(ngModel)]="profileData.languages" placeholder="English, Spanish, French" />
        </div>
        <div class="form-group">
          <label for="notes">Additional Notes:</label>
          <textarea id="notes" name="notes" [(ngModel)]="profileData.notes" rows="3" placeholder="Any additional information or notes"></textarea>
        </div>

        <button type="submit" class="btn create-profile-btn" [disabled]="loading">Create Comprehensive Profile</button>
      </form>
      
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Creating profile...</p>
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

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 15px;
      }
    }
  `]
})
export class CreateProfileComponent {
  profileData: any = {
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
    governmentId: '',
    passportNumber: '',
    drivingLicense: '',
    taxId: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
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

    try {
      // Add fullName calculation
      this.profileData.fullName = `${this.profileData.firstName} ${this.profileData.middleName} ${this.profileData.lastName}`.replace(/\s+/g, ' ').trim();

      const response = await fetch('http://localhost:3000/api/v1/blockchain/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.profileData)
      });

      const result = await response.json();
      
      if (response.ok) {
        const publicVerificationLink = result.verificationLink + '&public=true';
        this.resultMessage = `
          <div class="success-card">
            <h3>✅ Comprehensive Profile Created Successfully!</h3>
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
                <span class="label">Full Name:</span>
                <span class="value">${this.profileData.fullName}</span>
              </div>
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${this.profileData.email}</span>
              </div>
              <div class="info-row">
                <span class="label">Created:</span>
                <span class="value">${new Date(result.profile.createdAt).toLocaleString()}</span>
              </div>
            </div>
            
            <div class="verification-section">
              <h4>🔗 Verification Link</h4>
              <div class="link-container">
                <input type="text" value="${result.verificationLink}" readonly class="link-input">
                <button (click)="copyToClipboard('${result.verificationLink}')" class="copy-btn">📋 Copy</button>
              </div>
              <p class="link-note">Click the link above to verify the profile on the blockchain</p>
            </div>

            <div class="verification-section" style="margin-top: 20px; border-top: 2px solid #eee; padding-top: 20px; background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); border-radius: 12px; padding: 20px;">
              <h4>🔗 Public Verification Link</h4>
              <div class="link-container">
                <input type="text" value="${publicVerificationLink}" readonly class="link-input">
                <button (click)="copyToClipboard('${publicVerificationLink}')" class="copy-btn">📋 Copy</button>
              </div>
              <p class="link-note">Click the link above to verify the profile on the blockchain (Public view without update history)</p>
            </div>
          </div>
        `;
        this.isSuccess = true;
        
        // Reset form
        this.profileData = {
          firstName: '', lastName: '', middleName: '', dateOfBirth: '', gender: '', nationality: '',
          email: '', phone: '', alternateEmail: '', alternatePhone: '', streetAddress: '', city: '',
          state: '', postalCode: '', country: '', company: '', jobTitle: '', department: '',
          industry: '', workPhone: '', workEmail: '', governmentId: '', passportNumber: '',
          drivingLicense: '', taxId: '', emergencyContactName: '', emergencyContactPhone: '',
          emergencyContactRelationship: '', website: '', linkedIn: '', skills: '', languages: '', notes: ''
        };
      } else {
        throw new Error(result.error || 'Failed to create profile');
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
      // Show success message
      console.log('Copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }
} 