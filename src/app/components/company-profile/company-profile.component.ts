import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as QRCode from 'qrcode';
import { lastValueFrom } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface CompanyProfile {
  company_name: string;
  location: string;
  contact: string;
  size: string;
  established: string;
  revenue: string;
  market_segments: string[];
  technology_focus: string[];
  key_markets: string[];
  customer_segments: string[];
  competitive_position: string;
  partnerships: string[];
  certifications: string[]; // Changed back to string[] for URLs
  sales_channels: string[];
}

interface ProfileResponse {
  success: boolean;
  file_id: string;
  profile_hash: string;
  public_key: string;
  private_key: string;
  timestamp: string;
  verification_url: string;
  qr_code_data: string;
}

interface SingleLatestProfileResponse {
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

interface ProfileUpdateResponse {
  success: boolean;
  new_file_id: string;
  new_version: number;
  profile_hash: string;
  public_key: string;
  timestamp: string;
  diffs: any[];
}

interface PrivateKeyValidationResponse {
  success: boolean;
  file_id: string;
  public_key: string;
  version: number;
  profile_data: any;
}

interface ProfileHistoryResponse {
  profile_data: any;
  metadata: {
    id: string;
    file_id: string;
    version: number;
    profile_hash: string;
    public_key: string;
    private_key: string;
    signature: string;
    timestamp: string;
    profile_data: any;
    created_at: string;
    updated_at: string;
  };
  edit_history: Array<{
    changed_fields: string[];
    old_values: any;
    new_values: any;
    changed_at: string;
  }>;
  signature_verified: boolean;
  blockchain_ref: string;
  data_hash: string;
}

interface RegulatorProfileData {
  current_profile: any;
  history: Array<{
    version: number;
    profile_data: any;
    timestamp: string;
    profile_hash: string;
    public_key: string;
    signature: string;
    change_info?: {
      changed_fields: string[];
      old_values: any;
      new_values: any;
    };
  }>;
}


@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.css']
})
export class CompanyProfileComponent implements OnInit {
  // Tab management
  activeTab: string = 'create';

  // Form management
  createForm!: FormGroup;
  updateForm!: FormGroup;
  privateKeyForm!: FormGroup;

  // Data and state
  currentProfile: CompanyProfile | null = null;
  latestProfileData: SingleLatestProfileResponse | null = null;
  fileId: string = '';
  publicKey: string = '';
  privateKey: string = '';
  
  // QR Code state
  qrCodeDataUrl: string = '';
  qrCodeUrl: string = '';
  qrCodeFileId: string = '';
  showQRCode: boolean = false;
  hideQRCodeSection: boolean = false;
  
  // Create Profile Success State
  showCreateSuccess: boolean = false;
  createdProfileData: ProfileResponse | null = null;

  // Loading and error states
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  readProfileLoading: boolean = false;
  readProfileError: string = '';

  // Update Profile specific states
  updateProfileLoading: boolean = false;
  updateProfileError: string = '';
  updateProfileSuccess: string = '';
  profileUpdateResponse: ProfileUpdateResponse | null = null;
  privateKeyValidated: boolean = false;

  // Regulator Profile specific states
  regulatorProfileLoading: boolean = false;
  regulatorProfileError: string = '';
  regulatorProfileData: RegulatorProfileData | null = null;

  // Add properties for file handling
  certificationFiles: File[] = [];
  uploadedCertificationUrls: string[] = [];
  updateCertificationFiles: File[] = []; // For update form
  readableError: string = '';

  // PDF rendering properties
  pdfUrl: SafeResourceUrl | null = null;
  currentPdfId: string | null = null;

  // API base URL
  private readonly API_BASE_URL = 'http://localhost:3000';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit() {
    this.testBackendConnection();
    this.initializeForms();
    this.restoreActiveTab();
    
    // Reset private key validation on component initialization
    this.privateKeyValidated = false;
  }

  // Helper method to convert observable to promise
  private async observableToPromise<T>(observable: any): Promise<T> {
    return new Promise((resolve, reject) => {
      observable.subscribe({
        next: (value: T) => resolve(value),
        error: (error: any) => reject(error)
      });
    });
  }

  private testBackendConnection() {
    console.log('🔍 Testing backend connection...');
    this.http
      .get(`${this.API_BASE_URL}/health`, { responseType: 'text' as 'json' })
      .subscribe({
        next: (response) => {
          console.log('✅ Backend connection successful:', response);
        },
        error: (error) => {
          console.error('❌ Backend connection failed:', error);
        },
      });
  }

  private initializeForms() {
    // Create Profile Form
    this.createForm = this.fb.group({
      company_name: ['', Validators.required],
      location: ['', Validators.required],
      contact: ['', Validators.required],
      size: ['', Validators.required],
      established: ['', Validators.required],
      revenue: ['', Validators.required],
      market_segments: this.fb.array([]),
      technology_focus: this.fb.array([]),
      key_markets: this.fb.array([]),
      customer_segments: this.fb.array([]),
      competitive_position: ['', Validators.required],
      partnerships: this.fb.array([]),
      certifications: this.fb.array([]), // This will store file references
      sales_channels: this.fb.array([]),
      private_key: ['', Validators.required]
    });

    // Update Profile Form
    this.updateForm = this.fb.group({
      company_name: ['', Validators.required],
      location: ['', Validators.required],
      contact: ['', Validators.required],
      size: ['', Validators.required],
      established: ['', Validators.required],
      revenue: ['', Validators.required],
      market_segments: this.fb.array([]),
      technology_focus: this.fb.array([]),
      key_markets: this.fb.array([]),
      customer_segments: this.fb.array([]),
      competitive_position: ['', Validators.required],
      partnerships: this.fb.array([]),
      certifications: this.fb.array([]), // This will store file references
      sales_channels: this.fb.array([]),
      private_key: ['', Validators.required]
    });

    // Private Key Form
    this.privateKeyForm = this.fb.group({
      private_key: ['', Validators.required]
    });
  }

  // Generate a secure private key
  generatePrivateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.createForm.patchValue({ private_key: result });
  }

  // Helper methods for FormArrays
  get marketSegmentsArray() {
    return this.createForm.get('market_segments') as FormArray;
  }

  get technologyFocusArray() {
    return this.createForm.get('technology_focus') as FormArray;
  }

  get keyMarketsArray() {
    return this.createForm.get('key_markets') as FormArray;
  }

  get customerSegmentsArray() {
    return this.createForm.get('customer_segments') as FormArray;
  }

  get partnershipsArray() {
    return this.createForm.get('partnerships') as FormArray;
  }

  get certificationsArray() {
    return this.createForm.get('certifications') as FormArray;
  }

  get salesChannelsArray() {
    return this.createForm.get('sales_channels') as FormArray;
  }

  // Update form FormArrays
  get updateMarketSegmentsArray() {
    return this.updateForm.get('market_segments') as FormArray;
  }

  get updateTechnologyFocusArray() {
    return this.updateForm.get('technology_focus') as FormArray;
  }

  get updateKeyMarketsArray() {
    return this.updateForm.get('key_markets') as FormArray;
  }

  get updateCustomerSegmentsArray() {
    return this.updateForm.get('customer_segments') as FormArray;
  }

  get updatePartnershipsArray() {
    return this.updateForm.get('partnerships') as FormArray;
  }

  get updateCertificationsArray() {
    return this.updateForm.get('certifications') as FormArray;
  }

  get updateSalesChannelsArray() {
    return this.updateForm.get('sales_channels') as FormArray;
  }

  // Add/Remove array items
  addArrayItem(array: FormArray, value: string = '') {
    array.push(this.fb.control(value, Validators.required));
  }

  removeArrayItem(array: FormArray, index: number) {
    array.removeAt(index);
  }

  // Override the addArrayItem method for certifications to handle file inputs
  addCertificationItem() {
    const certificationsArray = this.createForm.get('certifications') as FormArray;
    certificationsArray.push(this.fb.control(''));
    this.certificationFiles.push(null as any);
  }

  // Override the removeArrayItem method for certifications
  removeCertificationItem(index: number) {
    const certificationsArray = this.createForm.get('certifications') as FormArray;
    certificationsArray.removeAt(index);
    this.certificationFiles.splice(index, 1);
  }

  // Override the addArrayItem method for update certifications
  addUpdateCertificationItem() {
    const certificationsArray = this.updateForm.get('certifications') as FormArray;
    certificationsArray.push(this.fb.control(''));
    this.updateCertificationFiles.push(null as any);
  }

  // Override the removeArrayItem method for update certifications
  removeUpdateCertificationItem(index: number) {
    const certificationsArray = this.updateForm.get('certifications') as FormArray;
    certificationsArray.removeAt(index);
    this.updateCertificationFiles.splice(index, 1);
  }

  // File upload method for certifications in create form
  onFileSelect(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'text/csv',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        this.showError('Invalid file type. Please upload PDF, CSV, PNG, JPG, JPEG, or DOCX files only.');
        return;
      }

      // Validate file size (max 25MB to match backend)
      const maxSize = 25 * 1024 * 1024; // 25MB
      if (file.size > maxSize) {
        this.showError('File size too large. Please upload files smaller than 25MB.');
        return;
      }

      // Store the file in the certificationFiles array
      this.certificationFiles[index] = file;
      
      // Update the form control with file name for display
      const certificationsArray = this.createForm.get('certifications') as FormArray;
      if (certificationsArray.at(index)) {
        certificationsArray.at(index).setValue(file.name);
      }

      this.showSuccess(`File "${file.name}" selected successfully.`);
    }
  }

  // Method to upload certification files to backend
  async uploadCertificationFiles(): Promise<string[]> {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < this.certificationFiles.length; i++) {
      const file = this.certificationFiles[i];
      if (file) {
        try {
          const form = new FormData();
          form.append('file', file);

          // Use the new documents/upload endpoint with proper error handling
          const response = await lastValueFrom(
            this.http.post<any>(
              `${this.API_BASE_URL}/documents/upload`,
              form,
              {
                observe: 'events',
                reportProgress: true
              }
            ).pipe(
              filter((event: any) => event.type === 4), // Only complete events
              map((event: any) => event.body)
            )
          );

          if (response && response.id) {
            // Construct the download URL for the uploaded file
            const downloadUrl = `${this.API_BASE_URL}/documents/${response.id}/download`;
            uploadedUrls.push(downloadUrl);
            console.log(`✅ Certification file uploaded: ${response.original_name} (ID: ${response.id})`);
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error: any) {
          console.error(`❌ Error uploading certification file: ${file.name}`, error);
          
          // Extract error message from response
          let errorMessage = 'Upload failed';
          if (error?.error?.error) {
            errorMessage = error.error.error;
          } else if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          
          this.readableError = errorMessage;
          throw new Error(`Failed to upload ${file.name}: ${errorMessage}`);
        }
      }
    }

    return uploadedUrls;
  }

  // File upload method for certifications in update form
  onUpdateFileSelect(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'text/csv',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        this.showError('Invalid file type. Please upload PDF, CSV, PNG, JPG, JPEG, or DOCX files only.');
        return;
      }

      // Validate file size (max 25MB to match backend)
      const maxSize = 25 * 1024 * 1024; // 25MB
      if (file.size > maxSize) {
        this.showError('File size too large. Please upload files smaller than 25MB.');
        return;
      }

      // Store the file in the updateCertificationFiles array
      this.updateCertificationFiles[index] = file;
      
      // Update the form control with file name for display
      const certificationsArray = this.updateForm.get('certifications') as FormArray;
      if (certificationsArray.at(index)) {
        certificationsArray.at(index).setValue(file.name);
      }

      this.showSuccess(`File "${file.name}" selected successfully.`);
    }
  }

  // Method to upload certification files for update form
  async uploadUpdateCertificationFiles(): Promise<string[]> {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < this.updateCertificationFiles.length; i++) {
      const file = this.updateCertificationFiles[i];
      if (file) {
        try {
          const form = new FormData();
          form.append('file', file);

          // Use the new documents/upload endpoint with proper error handling
          const response = await lastValueFrom(
            this.http.post<any>(
              `${this.API_BASE_URL}/documents/upload`,
              form,
              {
                observe: 'events',
                reportProgress: true
              }
            ).pipe(
              filter((event: any) => event.type === 4), // Only complete events
              map((event: any) => event.body)
            )
          );

          if (response && response.id) {
            // Construct the download URL for the uploaded file
            const downloadUrl = `${this.API_BASE_URL}/documents/${response.id}/download`;
            uploadedUrls.push(downloadUrl);
            console.log(`✅ Update certification file uploaded: ${response.original_name} (ID: ${response.id})`);
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error: any) {
          console.error(`❌ Error uploading update certification file: ${file.name}`, error);
          
          // Extract error message from response
          let errorMessage = 'Upload failed';
          if (error?.error?.error) {
            errorMessage = error.error.error;
          } else if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          
          this.readableError = errorMessage;
          throw new Error(`Failed to upload ${file.name}: ${errorMessage}`);
        }
      }
    }

    return uploadedUrls;
  }

  // Tab management
  async setActiveTab(tab: string) {
    this.activeTab = tab;
    this.saveActiveTab(tab);
    this.clearMessages();
    
    // Reset private key validation when switching to update tab
    if (tab === 'update') {
      this.privateKeyValidated = false;
      this.currentProfile = null;
      this.fileId = '';
      this.publicKey = '';
      this.updateProfileError = '';
      this.updateProfileSuccess = '';
    } else if (tab === 'read') {
      // Reset QR code visibility when switching to Read tab
      this.hideQRCodeSection = false;
      // Load single latest profile when switching to Read tab
      await this.loadSingleLatestProfile();
      // Force regenerate QR code with latest data
      await this.generateQRCode();
    } else if (tab === 'regulator') {
      // Load regulator profile data with history when switching to Regulator tab
      await this.loadRegulatorProfileData();
    }
  }
  
  // Wrapper method for template calls
  onTabClick(tab: string) {
    this.setActiveTab(tab).catch(error => {
      console.error('Error switching tabs:', error);
    });
  }

  // Save active tab to localStorage
  private saveActiveTab(tab: string) {
    try {
      localStorage.setItem('companyProfileActiveTab', tab);
    } catch (error) {
      console.warn('Could not save active tab to localStorage:', error);
    }
  }

  // Restore active tab from localStorage
  private restoreActiveTab() {
    try {
      const savedTab = localStorage.getItem('companyProfileActiveTab');
      if (savedTab && ['create', 'read', 'update', 'regulator'].includes(savedTab)) {
        this.activeTab = savedTab;
        
        // Load data for the restored tab if needed
        if (savedTab === 'read') {
          this.loadSingleLatestProfile();
        } else if (savedTab === 'regulator') {
          this.loadRegulatorProfileData();
        }
      }
    } catch (error) {
      console.warn('Could not restore active tab from localStorage:', error);
    }
  }

  // API Methods
  async loadSingleLatestProfile() {
    try {
      this.readProfileLoading = true;
      this.readProfileError = '';
      console.log('🔍 Loading single latest profile from backend...');

      // Fetch the single most recent profile from the backend using modern approach
      const response = await this.http.get<SingleLatestProfileResponse>(
        `${this.API_BASE_URL}/blockchain/latest-available`
      ).toPromise();

      console.log('📡 Raw response:', response);

      if (response && response.success) {
        this.latestProfileData = response;
        
        // Convert the profile data to CompanyProfile format for display
        if (response.profile_data) {
          this.currentProfile = {
            company_name: response.profile_data.company_name || '',
            location: response.profile_data.location || '',
            contact: response.profile_data.contact || '',
            size: response.profile_data.size || '',
            established: response.profile_data.established || '',
            revenue: response.profile_data.revenue || '',
            market_segments: response.profile_data.market_segments || [],
            technology_focus: response.profile_data.technology_focus || [],
            key_markets: response.profile_data.key_markets || [],
            customer_segments: response.profile_data.customer_segments || [],
            competitive_position: response.profile_data.competitive_position || '',
            partnerships: response.profile_data.partnerships || [],
            certifications: response.profile_data.certifications || [],
            sales_channels: response.profile_data.sales_channels || []
          };
          
          console.log('🔍 Profile data set successfully:', this.currentProfile);
          console.log('🔍 Company name:', this.currentProfile.company_name);
        }

        console.log('✅ Single latest profile loaded successfully:', this.currentProfile);
        console.log('🔍 Setting readProfileLoading to false');
        this.showSuccess('Latest profile data loaded successfully');
        
        // Automatically generate QR code after profile data is loaded
        await this.generateQRCode();
      } else {
        console.log('⚠️ Response received but success is false:', response);
        throw new Error('No valid response received from server');
      }
    } catch (error: any) {
      console.error('❌ Error loading single latest profile:', error);
      
      // Handle 404 (No profiles available) as a normal state, not an error
      if (error.status === 404) {
        console.log('ℹ️ No profiles available - this is normal for empty database');
        this.readProfileError = '';
        this.currentProfile = null;
        this.latestProfileData = null;
      } else if (error.status === 0) {
        console.log('❌ Network error - backend not reachable');
        this.readProfileError = 'Cannot connect to backend server. Please check if the server is running.';
      } else {
        this.readProfileError = 'Failed to load latest profile data';
        this.handleApiError(error, 'Failed to load latest profile data');
      }
    } finally {
      console.log('🔍 Finally block: Setting readProfileLoading to false');
      this.readProfileLoading = false;
      console.log('🔍 Current state - readProfileLoading:', this.readProfileLoading);
      console.log('🔍 Current state - currentProfile:', this.currentProfile);
      console.log('🔍 Current state - readProfileError:', this.readProfileError);
      
      // Force change detection
      this.cdr.detectChanges();
    }
  }

  // Load regulator profile data with complete history
  async loadRegulatorProfileData() {
    try {
      this.regulatorProfileLoading = true;
      this.regulatorProfileError = '';
      console.log('🔍 Loading regulator profile data with history...');

      // First, get the latest profile data (same as Read Profile)
      const latestResponse = await this.http.get<SingleLatestProfileResponse>(
        `${this.API_BASE_URL}/blockchain/latest-available`
      ).toPromise();

      if (latestResponse && latestResponse.success && latestResponse.profile_data) {
        // Get the file_id from the latest profile
        const fileId = latestResponse.metadata.file_id;
        
        // Now get the complete history for this profile using the new backend logic
        const historyResponse = await this.http.get<ProfileHistoryResponse>(
          `${this.API_BASE_URL}/blockchain/profiles/${fileId}`
        ).toPromise();

        console.log('📡 History response:', historyResponse);

        if (historyResponse) {
          // Create history array from the edit history
          const historyArray: Array<{
            version: number;
            profile_data: any;
            timestamp: string;
            profile_hash: string;
            public_key: string;
            signature: string;
            change_info?: {
              changed_fields: string[];
              old_values: any;
              new_values: any;
            };
          }> = [];

          // Process edit history entries - now these contain actual before/after data
          historyResponse.edit_history.forEach((entry, index) => {
            // Since backend now returns newest first, version 1 is the latest
            const version = index + 1;
            console.log(`📊 Processing version ${version}:`, {
              changed_fields: entry.changed_fields,
              old_values: entry.old_values,
              new_values: entry.new_values
            });
            
            historyArray.push({
              version: version,
              profile_data: entry.new_values, // Use new_values as the profile data for this version
              timestamp: entry.changed_at,
              profile_hash: historyResponse.metadata.profile_hash,
              public_key: historyResponse.metadata.public_key,
              signature: historyResponse.metadata.signature,
              change_info: {
                changed_fields: entry.changed_fields,
                old_values: entry.old_values,
                new_values: entry.new_values
              }
            });
          });

          // Add the initial version if no edit history exists
          if (historyArray.length === 0) {
            // Create initial version with change_info showing "empty" to "current" state
            const initialProfileData = historyResponse.profile_data;
            const emptyProfileData = this.createEmptyProfileData();
            const allFields = Object.keys(initialProfileData);
            
            console.log('📊 Creating initial version with change_info:', {
              allFields,
              emptyProfileData,
              initialProfileData
            });
            
            historyArray.push({
              version: 1, // Latest version is version 1
              profile_data: initialProfileData,
              timestamp: historyResponse.metadata.timestamp,
              profile_hash: historyResponse.metadata.profile_hash,
              public_key: historyResponse.metadata.public_key,
              signature: historyResponse.metadata.signature,
              change_info: {
                changed_fields: allFields, // All fields are considered "added" in initial version
                old_values: emptyProfileData,
                new_values: initialProfileData
              }
            });
          }

          // Reverse the array so latest version appears at the top
          historyArray.reverse();

          this.regulatorProfileData = {
            current_profile: latestResponse.profile_data,
            history: historyArray
          };
          
          console.log('✅ Regulator profile data loaded successfully');
          console.log('📊 Current profile:', this.regulatorProfileData.current_profile);
          console.log('📊 History versions:', this.regulatorProfileData.history.length);
          
          this.showSuccess('Regulator profile data loaded successfully');
        } else {
          throw new Error('Failed to load profile history');
        }
      } else {
        // No profiles available
        this.regulatorProfileData = null;
        console.log('ℹ️ No profiles available for regulator view');
      }
    } catch (error: any) {
      console.error('❌ Error loading regulator profile data:', error);
      
      if (error.status === 404) {
        console.log('ℹ️ No profiles available - this is normal for empty database');
        this.regulatorProfileError = '';
        this.regulatorProfileData = null;
      } else if (error.status === 0) {
        console.log('❌ Network error - backend not reachable');
        this.regulatorProfileError = 'Cannot connect to backend server. Please check if the server is running.';
      } else {
        this.regulatorProfileError = 'Failed to load regulator profile data';
        this.handleApiError(error, 'Failed to load regulator profile data');
      }
    } finally {
      this.regulatorProfileLoading = false;
      this.cdr.detectChanges();
    }
  }

  async createProfile() {
    if (this.createForm.invalid) {
      this.showError('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    try {
      // First, upload certification files if any
      let certificationUrls: string[] = [];
      if (this.certificationFiles.some(file => file !== null)) {
        try {
          certificationUrls = await this.uploadCertificationFiles();
        } catch (error) {
          this.showError(`Failed to upload certification files: ${error}`);
          this.isLoading = false;
          return;
        }
      }

      // Prepare profile data
      const profileData: CompanyProfile = {
        company_name: this.createForm.get('company_name')?.value,
        location: this.createForm.get('location')?.value,
        contact: this.createForm.get('contact')?.value,
        size: this.createForm.get('size')?.value,
        established: this.createForm.get('established')?.value,
        revenue: this.createForm.get('revenue')?.value,
        market_segments: this.marketSegmentsArray.value,
        technology_focus: this.technologyFocusArray.value,
        key_markets: this.keyMarketsArray.value,
        customer_segments: this.customerSegmentsArray.value,
        competitive_position: this.createForm.get('competitive_position')?.value,
        partnerships: this.partnershipsArray.value,
        certifications: certificationUrls, // Use uploaded URLs
        sales_channels: this.salesChannelsArray.value
      };

      // Add private key to profile data
      const profileDataWithPrivateKey = {
        ...profileData,
        private_key: this.createForm.get('private_key')?.value
      };

      // 🔍 LOGGING: Show the private key being used for creation
      console.log('🚀 CREATE PROFILE - Using private key:', this.createForm.get('private_key')?.value);
      console.log('🚀 CREATE PROFILE - Private key length:', this.createForm.get('private_key')?.value.length);
      console.log('🚀 CREATE PROFILE - Private key (first 10 chars):', this.createForm.get('private_key')?.value.substring(0, 10) + '...');
      
      console.log('🚀 Creating profile with data:', profileDataWithPrivateKey);
      
      const response = await this.http.post<ProfileResponse>(
        `${this.API_BASE_URL}/blockchain/store`,
        {
          profile_data: profileDataWithPrivateKey,
          timestamp: new Date().toISOString()
        }
      ).toPromise();

      if (response) {
        console.log('✅ Profile created successfully:', response);
        
        this.createdProfileData = response;
        this.fileId = response.file_id;
        this.publicKey = response.public_key;
        this.privateKey = response.private_key;
        
        // Generate QR code
        await this.generateQRCode();
        
        this.showCreateSuccess = true;
        this.showSuccess('Profile created successfully!');
        
        // Reset form
        this.createForm.reset();
        this.clearFormArrays(this.createForm);
        this.certificationFiles = []; // Clear uploaded files
        this.uploadedCertificationUrls = []; // Clear uploaded URLs
      } else {
        throw new Error('No response received from server');
      }
    } catch (error) {
      this.handleApiError(error, 'Failed to create profile');
    } finally {
      this.isLoading = false;
    }
  }

  async validatePrivateKey() {
    if (this.privateKeyForm.invalid) {
      this.showError('Please enter a valid private key');
      return;
    }

    try {
      this.updateProfileLoading = true;
      this.updateProfileError = '';
      this.updateProfileSuccess = '';
      
      const privateKey = this.privateKeyForm.get('private_key')?.value;
      
      // 🔍 LOGGING: Show the user's entered private key
      console.log('🔐 USER ENTERED PRIVATE KEY:', privateKey);
      console.log('🔐 Private key length:', privateKey.length);
      console.log('🔐 Private key (first 10 chars):', privateKey.substring(0, 10) + '...');
      
      console.log('🔐 Validating private key...');

      // Step 1: Get file_id and profile data using private key
      const validationResponse = await this.http.post<PrivateKeyValidationResponse>(
        `${this.API_BASE_URL}/blockchain/profiles/private/validate`,
        { private_key: privateKey }
      ).toPromise();

      if (validationResponse && validationResponse.success) {
        console.log('✅ Private key validated successfully');
        console.log('✅ File ID:', validationResponse.file_id);
        console.log('✅ Public Key:', validationResponse.public_key);
        console.log('✅ Version:', validationResponse.version);
        
        this.fileId = validationResponse.file_id;
        this.publicKey = validationResponse.public_key;
        
        // Convert the profile data to CompanyProfile format
        if (validationResponse.profile_data) {
          this.currentProfile = {
            company_name: validationResponse.profile_data.company_name || '',
            location: validationResponse.profile_data.location || '',
            contact: validationResponse.profile_data.contact || '',
            size: validationResponse.profile_data.size || '',
            established: validationResponse.profile_data.established || '',
            revenue: validationResponse.profile_data.revenue || '',
            market_segments: validationResponse.profile_data.market_segments || [],
            technology_focus: validationResponse.profile_data.technology_focus || [],
            key_markets: validationResponse.profile_data.key_markets || [],
            customer_segments: validationResponse.profile_data.customer_segments || [],
            competitive_position: validationResponse.profile_data.competitive_position || '',
            partnerships: validationResponse.profile_data.partnerships || [],
            certifications: validationResponse.profile_data.certifications || [],
            sales_channels: validationResponse.profile_data.sales_channels || []
          };
          
          // Populate update form with current profile data
          this.populateUpdateForm(this.currentProfile);
        }
        
        this.privateKeyValidated = true;
        this.updateProfileSuccess = 'Private key validated successfully. Profile loaded for editing.';
        console.log('📝 Profile loaded for editing:', this.currentProfile);
      } else {
        throw new Error('Invalid private key or profile not found');
      }
    } catch (error: any) {
      console.error('❌ Private key validation error:', error);
      
      if (error.status === 404) {
        this.updateProfileError = 'No profile found for this private key. Please check your private key.';
      } else if (error.status === 400) {
        this.updateProfileError = 'Invalid private key format. Please check your private key.';
      } else if (error.status === 0) {
        this.updateProfileError = 'Cannot connect to backend server. Please check if the server is running.';
      } else {
        this.updateProfileError = 'Failed to validate private key. Please check your private key and try again.';
      }
      
      this.handleApiError(error, 'Failed to validate private key');
    } finally {
      this.updateProfileLoading = false;
      this.cdr.detectChanges();
    }
  }

  async updateProfile() {
    if (this.updateForm.invalid) {
      this.showError('Please fill in all required fields.');
      return;
    }

    this.updateProfileLoading = true;
    this.clearMessages();

    try {
      // First, upload certification files if any
      let certificationUrls: string[] = [];
      if (this.updateCertificationFiles.some(file => file !== null)) {
        try {
          certificationUrls = await this.uploadUpdateCertificationFiles();
        } catch (error) {
          this.showError(`Failed to upload certification files: ${error}`);
          this.updateProfileLoading = false;
          return;
        }
      }

      // Prepare profile data
      const profileData: CompanyProfile = {
        company_name: this.updateForm.get('company_name')?.value,
        location: this.updateForm.get('location')?.value,
        contact: this.updateForm.get('contact')?.value,
        size: this.updateForm.get('size')?.value,
        established: this.updateForm.get('established')?.value,
        revenue: this.updateForm.get('revenue')?.value,
        market_segments: this.updateMarketSegmentsArray.value,
        technology_focus: this.updateTechnologyFocusArray.value,
        key_markets: this.updateKeyMarketsArray.value,
        customer_segments: this.updateCustomerSegmentsArray.value,
        competitive_position: this.updateForm.get('competitive_position')?.value,
        partnerships: this.updatePartnershipsArray.value,
        certifications: certificationUrls, // Use uploaded URLs
        sales_channels: this.updateSalesChannelsArray.value
      };

      // 🔍 LOGGING: Show the private key being used for update
      console.log('🔄 UPDATE PROFILE - Using private key:', this.privateKeyForm.get('private_key')?.value);
      console.log('🔄 UPDATE PROFILE - Private key length:', this.privateKeyForm.get('private_key')?.value.length);
      console.log('🔄 UPDATE PROFILE - File ID:', this.fileId);

      console.log('🔄 Updating profile with file ID:', this.fileId);
      
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'private_key': this.privateKeyForm.get('private_key')?.value
      });

      const response = await this.http.post<ProfileUpdateResponse>(
        `${this.API_BASE_URL}/blockchain/update/${this.fileId}`,
        {
          profile_data: profileData,
          private_key: this.privateKeyForm.get('private_key')?.value
        },
        { headers }
      ).toPromise();

      if (response) {
        console.log('✅ Profile updated successfully:', response);
        
        this.profileUpdateResponse = response;
        this.updateProfileSuccess = 'Profile updated successfully!';
        this.showSuccess('Profile updated successfully!');
        
        // Refresh the latest profile data
        await this.loadSingleLatestProfile();
        
        // Clear update form arrays
        this.clearFormArrays(this.updateForm);
        this.updateCertificationFiles = []; // Clear uploaded files
      } else {
        throw new Error('No response received from server');
      }
    } catch (error) {
      this.handleApiError(error, 'Failed to update profile');
    } finally {
      this.updateProfileLoading = false;
    }
  }

  private populateUpdateForm(profile: CompanyProfile) {
    // Clear existing arrays first
    this.clearFormArrays(this.updateForm);
    
    // Populate form with profile data
    this.updateForm.patchValue({
      company_name: profile.company_name,
      location: profile.location,
      contact: profile.contact,
      size: profile.size,
      established: profile.established,
      revenue: profile.revenue,
      competitive_position: profile.competitive_position,
      // Don't populate private_key - user must enter it
    });
    
    // Populate arrays
    if (profile.market_segments && profile.market_segments.length > 0) {
      profile.market_segments.forEach(segment => {
        this.updateMarketSegmentsArray.push(this.fb.control(segment));
      });
    }
    
    if (profile.technology_focus && profile.technology_focus.length > 0) {
      profile.technology_focus.forEach(tech => {
        this.updateTechnologyFocusArray.push(this.fb.control(tech));
      });
    }
    
    if (profile.key_markets && profile.key_markets.length > 0) {
      profile.key_markets.forEach(market => {
        this.updateKeyMarketsArray.push(this.fb.control(market));
      });
    }
    
    if (profile.customer_segments && profile.customer_segments.length > 0) {
      profile.customer_segments.forEach(segment => {
        this.updateCustomerSegmentsArray.push(this.fb.control(segment));
      });
    }
    
    if (profile.partnerships && profile.partnerships.length > 0) {
      profile.partnerships.forEach(partner => {
        this.updatePartnershipsArray.push(this.fb.control(partner));
      });
    }
    
    if (profile.certifications && profile.certifications.length > 0) {
      profile.certifications.forEach(cert => {
        this.updateCertificationsArray.push(this.fb.control(cert));
      });
    }
    
    if (profile.sales_channels && profile.sales_channels.length > 0) {
      profile.sales_channels.forEach(channel => {
        this.updateSalesChannelsArray.push(this.fb.control(channel));
      });
    }
  }

  private clearFormArrays(form: FormGroup) {
    const arrays = ['market_segments', 'technology_focus', 'key_markets', 'customer_segments', 'partnerships', 'certifications', 'sales_channels'];
    arrays.forEach(arrayName => {
      const array = form.get(arrayName) as FormArray;
      while (array.length !== 0) {
        array.removeAt(0);
      }
    });
  }

  private handleApiError(error: any, defaultMessage: string) {
    console.error('🔍 Detailed error:', error);
    
    if (error instanceof HttpErrorResponse) {
      console.error('📊 HTTP Error Status:', error.status);
      console.error('📊 HTTP Error Message:', error.message);
      console.error('📊 HTTP Error Body:', error.error);
      
      if (error.status === 404) {
        this.showError('Profile not found');
      } else if (error.status === 401) {
        this.showError('Invalid private key');
      } else if (error.status === 400) {
        const errorMsg = error.error?.error || error.error?.message || error.message;
        this.showError(`Invalid data provided: ${errorMsg}`);
      } else if (error.status === 0) {
        this.showError('Network error: Cannot connect to backend server. Please check if the server is running.');
      } else {
        const errorMsg = error.error?.error || error.error?.message || error.message;
        this.showError(`Server error (${error.status}): ${errorMsg}`);
      }
    } else {
      console.error('❌ Non-HTTP Error:', error);
      const errorMsg = error.message || error.toString();
      this.showError(`${defaultMessage}: ${errorMsg}`);
    }
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.readableError = message; // Set the readable error for UI display
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
      this.readableError = '';
    }, 5000);
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 5000);
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Create Profile Success Methods
  copyToClipboard(text: string, type: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.showSuccess(`${type} copied to clipboard!`);
    }).catch(() => {
      this.showError('Failed to copy to clipboard');
    });
  }

  downloadPrivateKey() {
    if (!this.createdProfileData) return;
    
    const content = `Private Key: ${this.createdProfileData.private_key}\nPublic Key: ${this.createdProfileData.public_key}\nFile ID: ${this.createdProfileData.file_id}\nTimestamp: ${this.createdProfileData.timestamp}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `private_key_${this.createdProfileData.file_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    this.showSuccess('Private key downloaded successfully!');
  }

  closeCreateSuccess() {
    this.showCreateSuccess = false;
    this.createdProfileData = null;
  }

  // Field change tracking helper methods
  isFieldChanged(historyEntry: any, fieldName: string): boolean {
    if (!historyEntry.change_info) return false;
    return historyEntry.change_info.changed_fields.includes(fieldName);
  }

  getFieldChangeType(historyEntry: any, fieldName: string): string {
    if (!this.isFieldChanged(historyEntry, fieldName)) return '';
    
    const oldValue = this.getFieldOldValue(historyEntry, fieldName);
    const newValue = this.getFieldNewValue(historyEntry, fieldName);
    
    if (oldValue === null || oldValue === undefined || oldValue === '') {
      return 'added';
    } else if (newValue === null || newValue === undefined || newValue === '') {
      return 'removed';
    } else {
      return 'modified';
    }
  }

  getFieldOldValue(historyEntry: any, fieldName: string): any {
    if (!historyEntry.change_info) return null;
    return historyEntry.change_info.old_values[fieldName];
  }

  getFieldNewValue(historyEntry: any, fieldName: string): any {
    if (!historyEntry.change_info) return null;
    return historyEntry.change_info.new_values[fieldName];
  }

  getFieldChangeTypeDetailed(historyEntry: any, fieldName: string): string {
    const changeType = this.getFieldChangeType(historyEntry, fieldName);
    switch (changeType) {
      case 'added': return 'Added';
      case 'removed': return 'Removed';
      case 'modified': return 'Modified';
      default: return '';
    }
  }

  formatFieldValue(value: any): string {
    if (value === null || value === undefined) return 'N/A';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  }

  // Add helper method for template
  objectKeys = Object.keys;

  // Create empty profile data for initial version comparison
  createEmptyProfileData(): any {
    return {
      company_name: '',
      location: '',
      contact: '',
      size: '',
      established: '',
      revenue: '',
      competitive_position: '',
      market_segments: '',
      technology_focus: '',
      key_markets: '',
      customer_segments: '',
      partnerships: '',
      certifications: '',
      sales_channels: ''
    };
  }

  isFieldChangedInComparison(changedFields: string[], fieldName: string): boolean {
    const isChanged = changedFields.includes(fieldName);
    console.log(`🔍 Field change check: ${fieldName} -> ${isChanged ? 'CHANGED' : 'unchanged'}`);
    return isChanged;
  }

  formatFieldValueForComparison(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    if (typeof value === 'string' && value.trim() === '') {
      return '';
    }
    return String(value);
  }

  getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
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

  // Generate QR code for verification
  async generateQRCode() {
    console.log('🔍 Generating QR code for verification...');
    console.log('🔍 Current latestProfileData:', this.latestProfileData);
    
    // Wait for profile data to be loaded if not already available
    if (!this.latestProfileData?.metadata?.file_id) {
      console.log('⏳ Waiting for profile data to load...');
      return;
    }
    
    // Generate the verification URL with DID using file_id
    const fileId = this.latestProfileData?.metadata?.file_id || 'unknown';
    console.log('🔍 Using file ID for QR code:', fileId);
    const verificationUrl = `http://localhost:4200/verify?did=did:hedera:${fileId}`;
    
    try {
      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Store QR code data for inline display
      this.qrCodeDataUrl = qrCodeDataUrl;
      this.qrCodeUrl = verificationUrl;
      this.qrCodeFileId = fileId;
      this.showQRCode = true;
      
      // Show QR code information
      const qrInfo = `
🔍 QR Code Information:
📱 URL: ${verificationUrl}
🆔 DID: did:hedera:${fileId}
📋 File ID: ${fileId}
📋 Public Key: ${this.latestProfileData?.metadata?.public_key || 'unknown'}
    
You can scan this QR code to verify the profile on any device.
      `;
      
      console.log(qrInfo);
      
      // Show a success message
      this.showSuccess('QR code generated for verification');
    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      this.showError('Failed to generate QR code');
    }
  }

  // Custom method for Read Profile tab (kept for backward compatibility)
  async navigateToFullProfile() {
    await this.generateQRCode();
  }

  // Hide QR code section
  hideQRCode() {
    this.hideQRCodeSection = true;
  }
  
  // Refresh latest profile data from backend
  async refreshLatestProfileData() {
    try {
      console.log('🔄 Refreshing latest profile data from backend...');
      await this.loadSingleLatestProfile();
      console.log('✅ Latest profile data refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing latest profile data:', error);
    }
  }

  // Open verification page in new tab
  openVerificationPage() {
    if (this.qrCodeUrl) {
      window.open(this.qrCodeUrl, '_blank');
    }
  }

  // Helper method to extract document ID from various URL formats
  private extractDocumentId(documentIdOrUrl: string): string {
    console.log('🔍 extractDocumentId called with:', documentIdOrUrl);
    
    // If it's already a UUID, return it
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(documentIdOrUrl)) {
      console.log('✅ Already a UUID:', documentIdOrUrl);
      return documentIdOrUrl;
    }
    
    // If it's a URL, try to extract UUID from it
    if (documentIdOrUrl.includes('/')) {
      // Look for UUID pattern in the URL
      const urlUuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
      const match = documentIdOrUrl.match(urlUuidPattern);
      if (match) {
        console.log('✅ UUID extracted from URL:', match[0]);
        return match[0];
      }
      
      // Try to extract from the path segments
      const pathSegments = documentIdOrUrl.split('/');
      for (const segment of pathSegments) {
        if (segment.length === 36 && uuidPattern.test(segment)) {
          console.log('✅ UUID found in path segment:', segment);
          return segment;
        }
      }
      
      // If still no UUID found, use the last segment
      const lastSegment = pathSegments[pathSegments.length - 1] || documentIdOrUrl;
      console.log('⚠️ Using last path segment as documentId:', lastSegment);
      return lastSegment;
    }
    
    // If it's not a URL and not a UUID, return as is
    console.log('⚠️ No UUID found, returning as is:', documentIdOrUrl);
    return documentIdOrUrl;
  }

  async loadPdfForViewing(documentIdOrUrl: string) {
    try {
      console.log('🔍 loadPdfForViewing called with:', documentIdOrUrl);
      
      const documentId = this.extractDocumentId(documentIdOrUrl);
      console.log('🎯 Final documentId:', documentId);
      
      const url = `${this.API_BASE_URL}/documents/${documentId}/file`;
      console.log('🌐 Requesting URL:', url);

      const response = await this.http.get(url, { responseType: 'blob' }).toPromise();

      if (response) {
        // The response is already a Blob, don't create a new one
        const objectUrl = URL.createObjectURL(response);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
        this.currentPdfId = documentId;
        console.log('✅ PDF loaded for inline viewing:', documentId);
      }
    } catch (error) {
      console.error('❌ Error loading PDF for viewing:', error);
      this.showError('Failed to load PDF for viewing');
    }
  }

  // Load image for inline viewing
  async loadImageForViewing(documentId: string, mimeType: string) {
    try {
      const response = await this.http.get(
        `${this.API_BASE_URL}/documents/${documentId}/file`,
        { responseType: 'blob' }
      ).toPromise();

      if (response) {
        // The response is already a Blob, don't create a new one
        const objectUrl = URL.createObjectURL(response);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
        this.currentPdfId = documentId;
        console.log('✅ Image loaded for inline viewing:', documentId);
      }
    } catch (error) {
      console.error('❌ Error loading image for viewing:', error);
      this.showError('Failed to load image for viewing');
    }
  }

  // Check if file type supports inline viewing
  supportsInlineViewing(mimeType: string): boolean {
    return mimeType.startsWith('application/pdf') || 
           mimeType.startsWith('image/');
  }

  // Get file type for display
  getFileTypeForDisplay(mimeType: string): string {
    if (mimeType.startsWith('application/pdf')) return 'PDF';
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType === 'text/csv') return 'CSV';
    if (mimeType.includes('wordprocessingml')) return 'DOCX';
    return 'File';
  }

  // Clear PDF viewer
  clearPdfViewer() {
    if (this.pdfUrl) {
      // Revoke the object URL to free memory
      const url = this.pdfUrl.toString();
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url.replace('blob:', ''));
      }
      this.pdfUrl = null;
      this.currentPdfId = null;
    }
  }

  // Download file
  async downloadFile(documentIdOrUrl: string, fileName: string) {
    try {
      console.log('🔍 downloadFile called with:', documentIdOrUrl);
      
      const documentId = this.extractDocumentId(documentIdOrUrl);
      console.log('🎯 Final documentId:', documentId);
      
      const url = `${this.API_BASE_URL}/documents/${documentId}/download`;
      console.log('🌐 Requesting URL:', url);

      const response = await this.http.get(url, { responseType: 'blob' }).toPromise();

      if (response) {
        // The response is already a Blob, don't create a new one
        const objectUrl = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(objectUrl);
        this.showSuccess('File downloaded successfully!');
      }
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      this.showError('Failed to download file');
    }
  }
} 