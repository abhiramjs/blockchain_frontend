import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

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
  certifications: CertificationDetail[]; // Now stores certification details with URLs
  sales_channels: string[];
}

interface CertificationDetail {
  url: string; // The file URL (off-chain)
  certificationName: string; // Stored on-chain
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
  profile_data?: any; // Add this property for backend response analysis
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

// File management interface for better organization
interface CertificationFile {
  id: string;
  name: string;
  url: string;
  isExisting: boolean;
  file?: File; // Only present for new files
  operation: 'preserve' | 'replace' | 'append' | 'remove'; // Track what operation to perform
  originalIndex?: number; // Track original position for replacements
  // Simplified certification details to be stored on-chain
  certificationName: string;
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
  updateExistingCertificationUrls: string[] = []; // Store existing file URLs
  readableError: string = '';

  // Store certification files in a more organized way
  updateCertificationItems: CertificationFile[] = [];


  // API base URL
  private readonly API_BASE_URL = 'http://localhost:3000';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.testBackendConnection();
    this.initializeForms();
    this.restoreActiveTab();
    
    // Reset private key validation on component initialization
    this.privateKeyValidated = false;
    
    // Debug form initialization
    console.log('🔍 DEBUG: Component initialized');
    console.log('🔍 DEBUG: Update form created:', this.updateForm);
    console.log('🔍 DEBUG: Update form valid:', this.updateForm.valid);
    console.log('🔍 DEBUG: Update form invalid:', this.updateForm.invalid);
    
    // Debug form structure
    setTimeout(() => {
      this.debugFormValidation();
    }, 2000);
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
    console.log('🔍 DEBUG: Initializing forms...');
    
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
      certifications: this.fb.array([]), // This will store certification objects with details
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
      certifications: this.fb.array([]), // This will store certification objects with details
      sales_channels: this.fb.array([])
      // Removed private_key field as it's handled separately
    });

    // Private Key Form
    this.privateKeyForm = this.fb.group({
      private_key: ['', Validators.required]
    });
    
    console.log('🔍 DEBUG: Forms initialized');
    console.log('🔍 DEBUG: Update form valid:', this.updateForm.valid);
    console.log('🔍 DEBUG: Update form invalid:', this.updateForm.invalid);
    console.log('🔍 DEBUG: Update form controls:', Object.keys(this.updateForm.controls));
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
    return this.createForm.get('certifications') as FormArray<FormGroup>;
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
    return this.updateForm.get('certifications') as FormArray<FormGroup>;
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
    // Create a simplified FormGroup with only certificate name
    const newCertificationGroup = this.fb.group({
      certificationName: ['', Validators.required],
      fileName: [''] // This will store the uploaded file name
    });
    certificationsArray.push(newCertificationGroup);
    this.certificationFiles.push(null as any);
  }

  // Override the removeArrayItem method for certifications
  removeCertificationItem(index: number) {
    const certificationsArray = this.createForm.get('certifications') as FormArray;
    certificationsArray.removeAt(index);
    this.certificationFiles.splice(index, 1);
  }

  // Add a new certification file slot (for new files)
  addUpdateCertificationItem() {
    console.log('🔍 DEBUG: Adding new certification file slot');
    console.log('🔍 DEBUG: Current updateCertificationItems length:', this.updateCertificationItems.length);
    console.log('🔍 DEBUG: Current form certifications array length:', (this.updateForm.get('certifications') as FormArray)?.length);
    
    // Add to form array - create a simplified FormGroup with only certificate name
    const certificationsArray = this.updateForm.get('certifications') as FormArray;
    const newCertificationGroup = this.fb.group({
      certificationName: ['', Validators.required],
      fileName: [''] // This will store the uploaded file name
    });
    certificationsArray.push(newCertificationGroup);
    
    // Add to our organized file management
    const newFileId = `new_slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newItem = {
      id: newFileId,
      name: '',
      url: '',
      isExisting: false,
      operation: 'append' as const,
      // Initialize simplified certification details
      certificationName: ''
    };
    this.updateCertificationItems.push(newItem);
    
    console.log('🔍 DEBUG: Added new certification slot. Total items:', this.updateCertificationItems.length);
    console.log('🔍 DEBUG: Form array length:', certificationsArray.length);
    console.log('🔍 DEBUG: New item added:', newItem);
    console.log('🔍 DEBUG: Full updateCertificationItems array:', this.updateCertificationItems);
    
    // Debug form validation after adding item
    setTimeout(() => {
      this.debugFormValidation();
      console.log('🔍 DEBUG: After adding item - Form valid:', this.updateForm.valid);
      console.log('🔍 DEBUG: After adding item - Form certifications length:', (this.updateForm.get('certifications') as FormArray)?.length);
    }, 100);
  }

  // Remove a certification item (existing or new)
  removeUpdateCertificationItem(index: number) {
    console.log('🔍 DEBUG: Removing certification item at index:', index);
    
    const item = this.updateCertificationItems[index];
    if (item) {
      if (item.isExisting) {
        // Mark existing file for removal
        item.operation = 'remove';
        console.log(`🔍 DEBUG: Marked existing file "${item.name}" for removal`);
        this.showSuccess(`🗑️ File "${item.name}" marked for removal`);
      } else {
        // Remove new file completely
        this.updateCertificationItems.splice(index, 1);
        
        // Remove from form array
        const certificationsArray = this.updateForm.get('certifications') as FormArray;
        certificationsArray.removeAt(index);
        
        console.log(`🔍 DEBUG: Removed new file "${item.name}" completely`);
        this.showSuccess(`🗑️ File "${item.name}" removed`);
      }
    }
    
    console.log('🔍 DEBUG: Certification array length after removal:', this.updateCertificationItems.length);
  }

  // Method to restore a removed certification file
  restoreUpdateCertificationItem(index: number) {
    console.log('🔍 DEBUG: Restoring certification item at index:', index);
    
    const item = this.updateCertificationItems[index];
    if (item && item.operation === 'remove') {
      item.operation = 'preserve';
      console.log(`🔍 DEBUG: Restored file "${item.name}" from removal`);
      this.showSuccess(`🔄 File "${item.name}" restored`);
    }
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
        const certificationGroup = certificationsArray.at(index) as FormGroup;
        certificationGroup.patchValue({ fileName: file.name });
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
    console.log('🔍 DEBUG: File upload triggered for index:', index);
    console.log('🔍 DEBUG: Event:', event);
    console.log('🔍 DEBUG: Current updateCertificationItems length:', this.updateCertificationItems.length);
          console.log('🔍 DEBUG: Current form certifications length:', (this.updateForm.get('certifications') as FormArray)?.length);
    
    const file = event.target.files[0];
    if (file) {
      console.log('🔍 DEBUG: File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      
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

      // Get the certification item at this index
      const certificationItem = this.updateCertificationItems[index];
      if (!certificationItem) {
        console.error('❌ No certification item found at index:', index);
        console.error('❌ updateCertificationItems array:', this.updateCertificationItems);
        console.error('❌ Form certifications array:', this.updateForm.get('certifications')?.value);
        return;
      }

      // Log the BEFORE state
      console.log('🔍 DEBUG: BEFORE file selection - certificationItem at index', index, ':', {
        id: certificationItem.id,
        name: certificationItem.name,
        url: certificationItem.url,
        isExisting: certificationItem.isExisting,
        hasFile: !!certificationItem.file,
        operation: certificationItem.operation
      });

      // Smart detection: Check if this is replacing an existing file or adding a new one
      const hasExistingFile = certificationItem.isExisting && certificationItem.url && certificationItem.url.trim() !== '';
      const isReplacingExisting = hasExistingFile;
      
      if (isReplacingExisting) {
        // Updating an existing file - REPLACE operation
        console.log('🔍 DEBUG: Replacing existing file:', certificationItem.name);
        console.log('🔍 DEBUG: Old URL that will be replaced:', certificationItem.url);
        
        certificationItem.name = file.name;
        certificationItem.file = file; // Mark for upload
        certificationItem.operation = 'replace'; // Mark as replacement operation
        // Keep the original URL and isExisting flag to help with replacement logic
        
        // Log the AFTER state for replacement
        console.log('🔍 DEBUG: AFTER file replacement - certificationItem at index', index, ':', {
          id: certificationItem.id,
          name: certificationItem.name,
          url: certificationItem.url,
          isExisting: certificationItem.isExisting,
          hasFile: !!certificationItem.file,
          operation: certificationItem.operation,
          fileSize: certificationItem.file?.size,
          fileType: certificationItem.file?.type
        });
        
        this.showSuccess(`🔄 File "${file.name}" will REPLACE the existing file "${certificationItem.name}".`);
      } else {
        // Adding a new file - APPEND operation
        console.log('🔍 DEBUG: Adding new file to empty slot or replacing empty slot');
        certificationItem.name = file.name;
        certificationItem.file = file;
        certificationItem.operation = 'append'; // Mark as append operation
        // Clear URL for new files (append operation)
        certificationItem.url = '';
        certificationItem.isExisting = false; // Mark as new file
        
        // Generate a unique ID for the new file to distinguish it from others
        certificationItem.id = `new_file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Log the AFTER state for new file
        console.log('🔍 DEBUG: AFTER new file addition - certificationItem at index', index, ':', {
          id: certificationItem.id,
          name: certificationItem.name,
          url: certificationItem.url,
          isExisting: certificationItem.isExisting,
          hasFile: !!certificationItem.file,
          operation: certificationItem.operation,
          fileSize: certificationItem.file?.size,
          fileType: certificationItem.file?.type
        });
        
        this.showSuccess(`➕ File "${file.name}" ADDED as a NEW certification file.`);
      }
      
      // Update the form control with file name for display
      const certificationsArray = this.updateForm.get('certifications') as FormArray;
      if (certificationsArray.at(index)) {
        const certificationControl = certificationsArray.at(index) as FormGroup;
        certificationControl.patchValue({
          fileName: file.name
        });
        console.log('🔍 DEBUG: Form control updated with filename:', file.name);
      } else {
        console.error('❌ ERROR: Form control not found at index:', index);
        console.error('❌ ERROR: Form certifications array length:', certificationsArray.length);
      }
      
      // Debug form validation after file selection
      setTimeout(() => {
        this.debugFormValidation();
        console.log('🔍 DEBUG: After file selection - Form valid:', this.updateForm.valid);
        console.log('🔍 DEBUG: After file selection - updateCertificationItems:', this.updateCertificationItems);
      }, 100);
    } else {
      console.log('🔍 DEBUG: No file selected');
    }
  }

  // Method to upload certification files for update form
  async uploadUpdateCertificationFiles(): Promise<string[]> {
    const uploadedUrls: string[] = [];
    console.log('🔍 DEBUG: Starting uploadUpdateCertificationFiles with', this.updateCertificationItems.length, 'items');
    
    // 🔍 CRITICAL: Process files in the correct order for final array construction
    // First, process all REPLACE operations
    console.log('🔍 DEBUG: === PROCESSING REPLACEMENT FILES FIRST ===');
    for (let i = 0; i < this.updateCertificationItems.length; i++) {
      const item = this.updateCertificationItems[i];
      if (item.operation === 'replace' && item.file) {
        try {
          console.log(`🔄 Uploading replacement file at index ${i}: ${item.name}`);
          console.log(`🔍 DEBUG: This file will replace existing URL: ${item.url}`);
          
          // Upload file and create certification details
          const downloadUrl = await this.uploadFileAndCreateCertification(item.file, i);
          uploadedUrls.push(downloadUrl);
          console.log(`✅ Replacement file uploaded and certification created at index ${i}: ${downloadUrl}`);
        } catch (error: any) {
          console.error(`❌ Error uploading replacement file at index ${i}: ${item.name}`, error);
          throw new Error(`Failed to upload replacement file ${item.name}: ${error.message || error}`);
        }
      }
    }
    
    // Second, process all APPEND operations
    console.log('🔍 DEBUG: === PROCESSING APPENDED FILES SECOND ===');
    for (let i = 0; i < this.updateCertificationItems.length; i++) {
      const item = this.updateCertificationItems[i];
      if (item.operation === 'append' && item.file) {
        try {
          console.log(`➕ Uploading new appended file at index ${i}: ${item.name}`);
          
          // Upload file and create certification details
          const downloadUrl = await this.uploadFileAndCreateCertification(item.file, i);
          uploadedUrls.push(downloadUrl);
          console.log(`✅ Appended file uploaded and certification created at index ${i}: ${downloadUrl}`);
        } catch (error: any) {
          console.error(`❌ Error uploading appended file at index ${i}: ${item.name}`, error);
          throw new Error(`Failed to upload appended file ${item.name}: ${error.message || error}`);
        }
      }
    }
    
    // Third, add all PRESERVE operations (existing URLs)
    console.log('🔍 DEBUG: === ADDING PRESERVED FILES THIRD ===');
    for (let i = 0; i < this.updateCertificationItems.length; i++) {
      const item = this.updateCertificationItems[i];
      if (item.operation === 'preserve' && item.url) {
        console.log(`ℹ️ Preserving existing file at index ${i}: ${item.name}`);
        console.log(`🔍 DEBUG: Pushed PRESERVED URL to uploadedUrls[${uploadedUrls.length}]: ${item.url}`);
        uploadedUrls.push(item.url);
      }
    }
    
    // Note: REMOVE operations are skipped (don't add anything to uploadedUrls)

    console.log('🔍 DEBUG: Final uploadedUrls array:', uploadedUrls);
    console.log('🔍 DEBUG: uploadedUrls length:', uploadedUrls.length);
    console.log('🔍 DEBUG: === UPLOAD ORDER SUMMARY ===');
    console.log('🔍 DEBUG: 1. Replacement files (first in uploadedUrls)');
    console.log('🔍 DEBUG: 2. Appended files (second in uploadedUrls)');
    console.log('🔍 DEBUG: 3. Preserved files (last in uploadedUrls)');
    return uploadedUrls;
  }

  // Upload file and create certification details in one call
  private async uploadFileAndCreateCertification(file: File, index: number): Promise<string> {
    try {
      // First upload the file using the existing endpoint
      const form = new FormData();
      form.append('file', file);

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

      if (!response || !response.id) {
        throw new Error('Invalid response from server');
      }

      // Construct the download URL for the uploaded file
      const downloadUrl = `${this.API_BASE_URL}/documents/${response.id}/download`;
      
      // Get certification details from the form
      const certificationFormGroup = this.updateCertificationsArray.at(index) as FormGroup;
      const formValues = certificationFormGroup ? certificationFormGroup.value : {};
      
      // Create simplified certification details request for the Rust backend
      const certificationRequest = {
        user_id: '00000000-0000-0000-0000-000000000000', // Use a valid UUID format
        certification_name: formValues.certificationName || file.name.replace(/\.[^/.]+$/, ''),
        file_url: downloadUrl,
        file_hash: await this.generateFileHash(file),
        file_name: file.name
      };
      
      console.log('📝 Creating certification details in Rust backend:', certificationRequest);
      
      // Call the Rust backend to create certification details
      const certResponse = await this.http.post<any>(
        `${this.API_BASE_URL}/certifications/details`,
        certificationRequest
      ).toPromise();
      
      if (certResponse && certResponse.success) {
        console.log('✅ Certification details created successfully in Rust backend:', certResponse);
      } else {
        console.warn('⚠️ Failed to create certification details in Rust backend:', certResponse);
        // Continue with file upload even if certification details creation fails
      }
      
      return downloadUrl;
    } catch (error) {
      console.error('❌ Error in uploadFileAndCreateCertification:', error);
      throw error;
    }
  }

  // Generate file hash for blockchain verification
  private async generateFileHash(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Simple hash generation (in production, use crypto.subtle.digest)
          let hash = 0;
          for (let i = 0; i < uint8Array.length; i++) {
            const char = uint8Array[i];
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
          }
          
          resolve(hash.toString(16));
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // Create certification details for a file in the create profile flow
  private async createCertificationDetailsForFile(file: File, fileUrl: string, index: number): Promise<void> {
    try {
      // Get certification details from the create form
      const certificationFormGroup = this.certificationsArray.at(index) as FormGroup;
      const formValues = certificationFormGroup ? certificationFormGroup.value : {};
      
      // Create simplified certification details request for the Rust backend
      const certificationRequest = {
        user_id: '00000000-0000-0000-0000-000000000000', // Use a valid UUID format
        certification_name: formValues.certificationName || file.name.replace(/\.[^/.]+$/, ''),
        file_url: fileUrl,
        file_hash: await this.generateFileHash(file),
        file_name: file.name
      };
      
      console.log('📝 Creating certification details in Rust backend for create profile:', certificationRequest);
      
      // Call the Rust backend to create certification details
      const certResponse = await this.http.post<any>(
        `${this.API_BASE_URL}/certifications/details`,
        certificationRequest
      ).toPromise();
      
      if (certResponse && certResponse.success) {
        console.log('✅ Certification details created successfully in Rust backend for create profile:', certResponse);
      } else {
        console.warn('⚠️ Failed to create certification details in Rust backend for create profile:', certResponse);
      }
    } catch (error) {
      console.error('❌ Error creating certification details for create profile:', error);
      throw error;
    }
  }

  // Retrieve certification details from Rust backend
  async getCertificationDetails(userId: string = '00000000-0000-0000-0000-000000000000'): Promise<any[]> {
    try {
      console.log('📋 Retrieving certification details from Rust backend for user:', userId);
      
      const response = await this.http.get<any>(
        `${this.API_BASE_URL}/certifications/user/${userId}/details`
      ).toPromise();
      
      if (response && response.success) {
        console.log('✅ Retrieved certification details from Rust backend:', response.certifications);
        return response.certifications || [];
      } else {
        console.warn('⚠️ Failed to retrieve certification details from Rust backend:', response);
        return [];
      }
    } catch (error) {
      console.error('❌ Error retrieving certification details from Rust backend:', error);
      return [];
    }
  }

  // Update certification details in Rust backend
  async updateCertificationDetails(certificationId: string, updates: any): Promise<boolean> {
    try {
      console.log('✏️ Updating certification details in Rust backend:', certificationId, updates);
      
      const response = await this.http.post<any>(
        `${this.API_BASE_URL}/certifications/details/${certificationId}`,
        updates
      ).toPromise();
      
      if (response && response.success) {
        console.log('✅ Certification details updated successfully in Rust backend:', response);
        return true;
      } else {
        console.warn('⚠️ Failed to update certification details in Rust backend:', response);
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating certification details in Rust backend:', error);
      return false;
    }
  }

  // Helper method to get certification display name
  getCertificationDisplayName(cert: any): string {
    try {
      // Comprehensive null/undefined check
      if (!cert || cert === null || cert === undefined) {
        return 'Unknown Certification';
      }
      
      // Handle string format (old format: just a URL string)
      if (typeof cert === 'string') {
        if (cert.trim() !== '') {
          return this.extractFileNameFromUrl(cert);
        }
        return 'Unknown Certification';
      }
      
      // Handle object format (new format: CertificationDetail object)
      if (cert && typeof cert === 'object' && cert !== null) {
        // Check for certificationName first
        if (cert.certificationName !== undefined && cert.certificationName !== null) {
          const name = String(cert.certificationName);
          return name.trim() !== '' ? name : 'Unknown Certification';
        }
        
        // Check for url as fallback
        if (cert.url !== undefined && cert.url !== null) {
          const url = String(cert.url);
          if (url.trim() !== '') {
            return this.extractFileNameFromUrl(url);
          }
        }
      }
      
      // Default fallback
      return 'Unknown Certification';
    } catch (error) {
      console.warn('⚠️ Error getting certification display name:', cert, error);
      return 'Unknown Certification';
    }
  }

  // Helper method to get certification URL
  getCertificationUrl(cert: any): string {
    try {
      // Comprehensive null/undefined check
      if (!cert || cert === null || cert === undefined) {
        return '';
      }
      
      // Handle string format (old format: just a URL string)
      if (typeof cert === 'string') {
        return cert.trim() !== '' ? cert : '';
      }
      
      // Handle object format (new format: CertificationDetail object)
      if (cert && typeof cert === 'object' && cert !== null) {
        if (cert.url !== undefined && cert.url !== null) {
          const url = String(cert.url);
          return url.trim() !== '' ? url : '';
        }
      }
      
      return '';
    } catch (error) {
      console.warn('⚠️ Error getting certification URL:', cert, error);
      return '';
    }
  }

  // Helper method to extract filename from URL
  private extractFileNameFromUrl(url: any): string {
    // Ensure url is a valid string before processing
    if (!url) return 'Unknown File';
    if (typeof url !== 'string') {
      console.warn('⚠️ extractFileNameFromUrl called with non-string:', typeof url, url);
      return 'Unknown File';
    }
    if (url.trim() === '') return 'Unknown File';
    
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      return fileName || 'Unknown File';
    } catch (error) {
      console.warn('⚠️ Error extracting filename from URL:', url, error);
      return 'Unknown File';
    }
  }

  // Method to clear update certification files
  private clearUpdateCertificationFiles() {
    this.updateCertificationFiles = [];
    this.updateExistingCertificationUrls = []; // Clear existing URLs
    this.updateCertificationItems = []; // Clear items
    console.log('🔍 DEBUG: Cleared update certification files array');
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
      this.clearUpdateCertificationFiles(); // Clear certification files when switching to update tab
      
      // Add debugging for form validation
      setTimeout(() => {
        this.debugFormValidation();
      }, 1000);
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

  // Debug method to check form validation
  private debugFormValidation() {
    console.log('🔍 DEBUG: Update Form Validation Status');
    console.log('Form valid:', this.updateForm.valid);
    console.log('Form invalid:', this.updateForm.invalid);
    console.log('Form pristine:', this.updateForm.pristine);
    console.log('Form dirty:', this.updateForm.dirty);
    
    // Check each field
    const fields = ['company_name', 'location', 'contact', 'size', 'established', 'revenue', 'competitive_position'];
    fields.forEach(field => {
      const control = this.updateForm.get(field);
      if (control) {
        console.log(`${field}:`, {
          valid: control.valid,
          invalid: control.invalid,
          value: control.value,
          errors: control.errors
        });
      }
    });
    
    // Check arrays
    const arrays = ['market_segments', 'technology_focus', 'key_markets', 'customer_segments', 'partnerships', 'certifications', 'sales_channels'];
    arrays.forEach(arrayName => {
      const array = this.updateForm.get(arrayName) as FormArray;
      console.log(`${arrayName}:`, {
        length: array.length,
        valid: array.valid,
        invalid: array.invalid
      });
    });
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
        console.log('📡 History response type:', typeof historyResponse);
        console.log('📡 History response keys:', Object.keys(historyResponse || {}));

        if (historyResponse) {
          console.log('📡 Raw history response:', JSON.stringify(historyResponse, null, 2));
          console.log('📡 Edit history length:', historyResponse.edit_history?.length || 0);
          console.log('📡 Profile data:', historyResponse.profile_data);
          console.log('📡 Metadata:', historyResponse.metadata);
          
          // Check if the response has the expected structure
          if (!historyResponse.profile_data) {
            console.error('❌ No profile_data in history response');
            throw new Error('Invalid history response: missing profile_data');
          }
          
          if (!historyResponse.metadata) {
            console.error('❌ No metadata in history response');
            throw new Error('Invalid history response: missing metadata');
          }
          
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

          // Process edit history entries - these contain the changes between versions
          if (historyResponse.edit_history && historyResponse.edit_history.length > 0) {
            console.log('📊 Processing edit history entries...');
            console.log('📊 Edit history structure:', JSON.stringify(historyResponse.edit_history[0], null, 2));
            console.log('📊 Edit history length:', historyResponse.edit_history.length);
            
            // The edit_history contains the changes between versions
            // We need to create a proper version history from this
            const initialProfileData = historyResponse.profile_data;
            const emptyProfileData = this.createEmptyProfileData();
            const allFields = Object.keys(initialProfileData);
            
            // Add the initial version (before any changes)
            historyArray.push({
              version: 1,
              profile_data: emptyProfileData, // Start with empty data
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
            
            // Now add each change as a new version
            historyResponse.edit_history.forEach((entry, index) => {
              const version = index + 2; // Start from version 2
              console.log(`📊 Processing change for version ${version}:`, {
                changed_fields: entry.changed_fields,
                old_values: entry.old_values,
                new_values: entry.new_values,
                changed_at: entry.changed_at
              });
              
              // Debug the actual structure of the entry
              console.log(`📊 Entry ${index} structure:`, {
                hasChangedFields: !!entry.changed_fields,
                changedFieldsType: typeof entry.changed_fields,
                changedFieldsLength: Array.isArray(entry.changed_fields) ? entry.changed_fields.length : 'Not array',
                hasOldValues: !!entry.old_values,
                oldValuesType: typeof entry.old_values,
                hasNewValues: !!entry.new_values,
                newValuesType: typeof entry.new_values,
                hasChangedAt: !!entry.changed_at
              });
              
              // Ensure all required fields exist and are valid
              if (!entry.changed_fields || !Array.isArray(entry.changed_fields)) {
                console.warn(`⚠️ Skipping entry ${index} - invalid changed_fields:`, entry.changed_fields);
                return;
              }
              
              if (!entry.old_values || !entry.new_values) {
                console.warn(`⚠️ Skipping entry ${index} - missing old_values or new_values:`, {
                  old_values: entry.old_values,
                  new_values: entry.new_values
                });
                return;
              }
              
              const historyEntry = {
                version: version,
                profile_data: entry.new_values, // This version has the new values
                timestamp: entry.changed_at || historyResponse.metadata.timestamp,
                profile_hash: historyResponse.metadata.profile_hash,
                public_key: historyResponse.metadata.public_key,
                signature: historyResponse.metadata.signature,
                change_info: {
                  changed_fields: entry.changed_fields,
                  old_values: entry.old_values,
                  new_values: entry.new_values
                }
              };
              
              console.log(`📊 Created history entry for version ${version}:`, historyEntry);
              historyArray.push(historyEntry);
            });
          } else {
            console.log('⚠️ No edit history found in response');
            
            // Create initial version with change_info showing "empty" to "current" state
            const initialProfileData = historyResponse.profile_data;
            const emptyProfileData = this.createEmptyProfileData();
            const allFields = Object.keys(initialProfileData);
            
            console.log('📊 Creating initial version since no edit history exists...');
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

          // Note: When edit history exists, change_info is already populated from backend
          // No need to recalculate differences as they're already provided
          if (historyArray.length > 1) {
            console.log('📊 Edit history already contains change information from backend');
            console.log('📊 No need to recalculate differences');
          }

          // Reverse the array so latest version appears at the top
          historyArray.reverse();
          
          console.log('📊 Final history array:', JSON.stringify(historyArray, null, 2));
          console.log('📊 History array details:', historyArray.map(h => ({
            version: h.version,
            hasChangeInfo: !!h.change_info,
            changedFields: h.change_info?.changed_fields?.length || 0,
            hasOldValues: !!h.change_info?.old_values,
            hasNewValues: !!h.change_info?.new_values,
            timestamp: h.timestamp
          })));
          
          // Additional debugging for each history item
          historyArray.forEach((item, index) => {
            console.log(`📊 History item ${index} (version ${item.version}):`, {
              hasProfileData: !!item.profile_data,
              profileDataKeys: item.profile_data ? Object.keys(item.profile_data) : [],
              hasChangeInfo: !!item.change_info,
              changeInfoDetails: item.change_info ? {
                changedFields: item.change_info.changed_fields,
                hasOldValues: !!item.change_info.old_values,
                hasNewValues: !!item.change_info.new_values,
                oldValuesKeys: item.change_info.old_values ? Object.keys(item.change_info.old_values) : [],
                newValuesKeys: item.change_info.new_values ? Object.keys(item.change_info.new_values) : []
              } : null
            });
          });

          this.regulatorProfileData = {
            current_profile: latestResponse.profile_data,
            history: historyArray
          };
          
          console.log('✅ Regulator profile data loaded successfully');
          console.log('📊 Current profile:', this.regulatorProfileData.current_profile);
          console.log('📊 Current profile certifications:', this.regulatorProfileData.current_profile.certifications);
          console.log('📊 History versions:', this.regulatorProfileData.history.length);
          console.log('📊 History array details:', this.regulatorProfileData.history.map(h => ({
            version: h.version,
            hasChangeInfo: !!h.change_info,
            changedFields: h.change_info?.changed_fields?.length || 0,
            timestamp: h.timestamp
          })));
          
          // Debug certification structure
          if (this.regulatorProfileData.current_profile.certifications) {
            console.log('🔍 Certification structure analysis:');
            this.regulatorProfileData.current_profile.certifications.forEach((cert: any, index: number) => {
              console.log(`  Cert ${index}:`, {
                type: typeof cert,
                value: cert,
                hasUrl: cert && typeof cert === 'object' && 'url' in cert,
                hasCertificationName: cert && typeof cert === 'object' && 'certificationName' in cert
              });
            });
          }
          
          // Debug what the template should display
          console.log('🔍 Template display debugging:');
          console.log('🔍 History length check:', this.regulatorProfileData.history.length);
          console.log('🔍 First history item:', this.regulatorProfileData.history[0]);
          console.log('🔍 First history change_info:', this.regulatorProfileData.history[0]?.change_info);
          
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
          
          // Use the global error handler
          this.handleComponentError(error, 'loadRegulatorProfileData');
          
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
          
          // Set empty data to prevent template errors
          this.regulatorProfileData = {
            current_profile: {},
            history: []
          };
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
          
          // Create certification details in Rust backend for each uploaded file
          for (let i = 0; i < this.certificationFiles.length; i++) {
            const file = this.certificationFiles[i];
            if (file) {
              try {
                await this.createCertificationDetailsForFile(file, certificationUrls[i], i);
              } catch (error) {
                console.warn(`⚠️ Failed to create certification details for file ${i}:`, error);
                // Continue with profile creation even if certification details creation fails
              }
            }
          }
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
        certifications: certificationUrls.map((url, index) => {
          // Get the certificate name from the form
          const certificationGroup = this.certificationsArray.at(index) as FormGroup;
          const certificateName = certificationGroup?.get('certificationName')?.value || url.split('/').pop() || 'Document';
          
          return {
            url: url,
            certificationName: certificateName
          };
        }), // Convert URLs to simplified CertificationDetail objects
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
        console.log('✅ Profile data received:', validationResponse.profile_data);
        
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
          
          console.log('🔍 DEBUG: Converted profile data:', this.currentProfile);
          console.log('🔍 DEBUG: Profile certifications:', this.currentProfile.certifications);
          
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
    console.log('🔍 DEBUG: Update profile method called');
    console.log('🔍 DEBUG: Form valid:', this.updateForm.valid);
    console.log('🔍 DEBUG: Form invalid:', this.updateForm.invalid);
    
    if (this.updateForm.invalid) {
      console.log('❌ Form is invalid, showing error');
      this.showError('Please fill in all required fields.');
      
      // Debug form validation errors
      this.debugFormValidation();
      return;
    }

    console.log('✅ Form is valid, proceeding with update');
    this.updateProfileLoading = true;
    this.clearMessages();

    try {
      // Get existing certification URLs from the current profile
      let existingCertificationUrls: string[] = [];
      if (this.currentProfile && this.currentProfile.certifications) {
        // Extract URLs from CertificationDetail objects or use strings directly
        existingCertificationUrls = this.currentProfile.certifications.map(cert => {
          if (typeof cert === 'string') {
            return cert;
          } else if (cert && typeof cert === 'object' && 'url' in cert) {
            return cert.url;
          }
          return '';
        }).filter(url => url !== '');
        console.log('🔍 DEBUG: Existing certification URLs:', existingCertificationUrls);
      }

      // Upload new certification files if any
      let newCertificationUrls: string[] = [];
      const hasNewFiles = this.updateCertificationItems.some(item => item.file);
      if (hasNewFiles) {
        try {
          console.log('🔍 DEBUG: Found new files to upload, starting upload process...');
          newCertificationUrls = await this.uploadUpdateCertificationFiles();
          console.log('🔍 DEBUG: New certification URLs:', newCertificationUrls);
        } catch (error) {
          this.showError(`Failed to upload certification files: ${error}`);
          this.updateProfileLoading = false;
          return;
        }
      } else {
        console.log('🔍 DEBUG: No new files to upload, preserving existing files only');
      }

      // Build the final certification details array by processing each item in updateCertificationItems
      const allCertificationDetails: CertificationDetail[] = [];
      let replacementUrlIndex = 0;
      let appendUrlIndex = 0;
      
      console.log('🔍 DEBUG: === STARTING URL CONSTRUCTION ===');
      console.log('🔍 DEBUG: Current profile certifications:', this.currentProfile?.certifications);
      console.log('🔍 DEBUG: New certification URLs:', newCertificationUrls);
      console.log('🔍 DEBUG: updateCertificationItems:', this.updateCertificationItems);
      
      // 🔍 CRITICAL: Build the final array in the correct order
      // First, handle preserved certifications (existing files that weren't changed)
      const preservedCertifications: CertificationDetail[] = [];
      this.updateCertificationItems.forEach((item, index) => {
        if (item.operation === 'preserve' && item.url) {
          const certificationFormGroup = this.updateCertificationsArray.at(index) as FormGroup;
          const formData = certificationFormGroup ? certificationFormGroup.value : null;
          
          preservedCertifications.push({
            url: item.url,
            certificationName: formData?.certificationName || item.certificationName || item.name
          });
          console.log(`🔍 DEBUG: PRESERVED: "${item.name}" -> "${item.url}"`);
        }
      });
      
      // Second, handle replacement certifications (existing files that were replaced)
      const replacementCertifications: CertificationDetail[] = [];
      this.updateCertificationItems.forEach((item, index) => {
        if (item.operation === 'replace' && item.file && replacementUrlIndex < newCertificationUrls.length) {
          const newUrl = newCertificationUrls[replacementUrlIndex];
          const certificationFormGroup = this.updateCertificationsArray.at(index) as FormGroup;
          const formData = certificationFormGroup ? certificationFormGroup.value : null;
          
          replacementCertifications.push({
            url: newUrl,
            certificationName: formData?.certificationName || item.certificationName || item.name
          });
          console.log(`🔍 DEBUG: REPLACED: "${item.name}" -> "${newUrl}" (using replacementUrlIndex: ${replacementUrlIndex})`);
          replacementUrlIndex++;
        }
      });
      
      // Third, handle appended certifications (new files being added)
      const appendedCertifications: CertificationDetail[] = [];
      this.updateCertificationItems.forEach((item, index) => {
        if (item.operation === 'append' && item.file && appendUrlIndex < newCertificationUrls.length) {
          const newUrl = newCertificationUrls[appendUrlIndex];
          const certificationFormGroup = this.updateCertificationsArray.at(index) as FormGroup;
          const formData = certificationFormGroup ? certificationFormGroup.value : null;
          
          appendedCertifications.push({
            url: newUrl,
            certificationName: formData?.certificationName || item.certificationName || item.name
          });
          console.log(`🔍 DEBUG: APPENDED: "${item.name}" -> "${newUrl}" (using appendUrlIndex: ${appendUrlIndex})`);
          appendUrlIndex++;
        }
      });
      
      // 🔍 CRITICAL: Combine all certifications in the correct order
      // 1. Preserved certifications (keep their original order)
      // 2. Replacement certifications (keep their original order)  
      // 3. Appended certifications (add to the end)
      allCertificationDetails.push(...preservedCertifications);
      allCertificationDetails.push(...replacementCertifications);
      allCertificationDetails.push(...appendedCertifications);
      
      console.log('🔍 DEBUG: === FINAL ARRAY CONSTRUCTION ===');
      console.log('🔍 DEBUG: Preserved certifications:', preservedCertifications.length);
      console.log('🔍 DEBUG: Replacement certifications:', replacementCertifications.length);
      console.log('🔍 DEBUG: Appended certifications:', appendedCertifications.length);
      console.log('🔍 DEBUG: Total certifications:', allCertificationDetails.length);
      console.log('🔍 DEBUG: replacementUrlIndex used:', replacementUrlIndex);
      console.log('🔍 DEBUG: appendUrlIndex used:', appendUrlIndex);
      
      // 🔍 CRITICAL: Show the exact URL mapping
      console.log('🔍 DEBUG: === URL MAPPING VERIFICATION ===');
      console.log('🔍 DEBUG: newCertificationUrls array:', newCertificationUrls);
      console.log('🔍 DEBUG: Replacement URLs used (indices 0 to', replacementUrlIndex - 1, '):', newCertificationUrls.slice(0, replacementUrlIndex));
      console.log('🔍 DEBUG: Append URLs used (indices', replacementUrlIndex, 'to', replacementUrlIndex + appendUrlIndex - 1, '):', newCertificationUrls.slice(replacementUrlIndex, replacementUrlIndex + appendUrlIndex));
      console.log('🔍 DEBUG: === END URL MAPPING VERIFICATION ===');
      
      // Use the combined array directly (no need for cleaning since we're building it properly)
      const cleanedCertificationDetails = allCertificationDetails;
      
      console.log('🔍 DEBUG: Cleaned certification details array:', cleanedCertificationDetails);
      console.log('🔍 DEBUG: Cleaned array length:', cleanedCertificationDetails.length);
      
      // 🔍 CRITICAL: Final verification of the complete array
      console.log('🔍 DEBUG: === FINAL COMPLETE ARRAY VERIFICATION ===');
      console.log('🔍 DEBUG: Complete final array:');
      cleanedCertificationDetails.forEach((cert, index) => {
        console.log(`🔍 DEBUG:   [${index}]: "${cert.certificationName}" -> "${cert.url}"`);
      });
      console.log('🔍 DEBUG: === END FINAL COMPLETE ARRAY VERIFICATION ===');
      
      // 🔍 CRITICAL: Verify the final certification mapping
      console.log('🔍 DEBUG: === CERTIFICATION MAPPING VERIFICATION ===');
      console.log('🔍 DEBUG: Final allCertificationDetails array:', allCertificationDetails);
      
      // Additional verification: show what each item maps to
      console.log('🔍 DEBUG: Final mapping verification:');
      for (let i = 0; i < this.updateCertificationItems.length; i++) {
        const item = this.updateCertificationItems[i];
        if (item.operation === 'preserve') {
          console.log(`🔍 DEBUG: Index ${i}: PRESERVED - "${item.name}" -> "${item.url}"`);
        } else if (item.operation === 'replace') {
          if (item.originalIndex !== undefined) {
            console.log(`🔍 DEBUG: Index ${i}: REPLACED - "${item.name}" -> "${allCertificationDetails[item.originalIndex]?.url}"`);
          } else {
            console.log(`🔍 DEBUG: Index ${i}: REPLACED - "${item.name}" -> "${allCertificationDetails[i]?.url}"`);
          }
        } else if (item.operation === 'append') {
          console.log(`🔍 DEBUG: Index ${i}: APPENDED - "${item.name}" -> "${allCertificationDetails[allCertificationDetails.length - 1]?.url}"`);
        } else if (item.operation === 'remove') {
          console.log(`🔍 DEBUG: Index ${i}: REMOVED - "${item.name}" - no certification`);
        } else {
          console.log(`🔍 DEBUG: Index ${i}: EMPTY SLOT - no file or certification`);
        }
      }
      
      console.log('🔍 DEBUG: === END CERTIFICATION MAPPING VERIFICATION ===');
      
      // 🔍 CRITICAL: Verify the cleaned array mapping
      console.log('🔍 DEBUG: === CLEANED ARRAY MAPPING VERIFICATION ===');
      console.log('🔍 DEBUG: Cleaned array verification:');
      cleanedCertificationDetails.forEach((cert, index) => {
        console.log(`🔍 DEBUG: Cleaned[${index}]: "${cert.certificationName}" -> "${cert.url}"`);
      });
      console.log('🔍 DEBUG: === END CLEANED ARRAY MAPPING VERIFICATION ===');
      
      console.log('🔍 DEBUG: Final allCertificationDetails after replacement:', allCertificationDetails);
      console.log('🔍 DEBUG: Final cleanedCertificationDetails:', cleanedCertificationDetails);
      console.log('🔍 DEBUG: File management summary:', this.getCertificationFilesSummary());
      console.log('🔍 DEBUG: Files breakdown:', this.getCertificationFilesBreakdown());
      
      // Prepare profile data
      const profileData: CompanyProfile = {
        company_name: this.updateForm.get('company_name')?.value || '',
        location: this.updateForm.get('location')?.value || '',
        contact: this.updateForm.get('contact')?.value || '',
        size: this.updateForm.get('size')?.value || '',
        established: this.updateForm.get('established')?.value || '',
        revenue: this.updateForm.get('revenue')?.value || '',
        market_segments: this.updateMarketSegmentsArray.value.filter((item: string) => item && item.trim() !== ''),
        technology_focus: this.updateTechnologyFocusArray.value.filter((item: string) => item && item.trim() !== ''),
        key_markets: this.updateKeyMarketsArray.value.filter((item: string) => item && item.trim() !== ''),
        customer_segments: this.updateCustomerSegmentsArray.value.filter((item: string) => item && item.trim() !== ''),
        competitive_position: this.updateForm.get('competitive_position')?.value || '',
        partnerships: this.updatePartnershipsArray.value.filter((item: string) => item && item.trim() !== ''),
        certifications: cleanedCertificationDetails, // Use cleaned certification details
        sales_channels: this.updateSalesChannelsArray.value.filter((item: string) => item && item.trim() !== '')
      };

      // Validate that all required fields have values
      const requiredFields = ['company_name', 'location', 'contact', 'size', 'established', 'revenue', 'competitive_position'];
      const missingFields = requiredFields.filter(field => !profileData[field as keyof CompanyProfile] || profileData[field as keyof CompanyProfile] === '');
      
      if (missingFields.length > 0) {
        this.showError(`Missing required fields: ${missingFields.join(', ')}`);
        this.updateProfileLoading = false;
        return;
      }

      // 🔍 LOGGING: Show the private key being used for update
      console.log('🔄 UPDATE PROFILE - Using private key:', this.privateKeyForm.get('private_key')?.value);
      console.log('🔄 UPDATE PROFILE - Private key length:', this.privateKeyForm.get('private_key')?.value.length);
      console.log('🔄 UPDATE PROFILE - File ID:', this.fileId);

      console.log('🔄 Updating profile with file ID:', this.fileId);
      console.log('🔍 DEBUG: Request payload:', {
        profile_data: profileData,
        timestamp: new Date().toISOString()
      });
      console.log('🔍 DEBUG: Profile data structure:', {
        company_name: typeof profileData.company_name,
        location: typeof profileData.location,
        contact: typeof profileData.contact,
        size: typeof profileData.size,
        established: typeof profileData.established,
        revenue: typeof profileData.revenue,
        competitive_position: typeof profileData.competitive_position,
        market_segments: Array.isArray(profileData.market_segments),
        technology_focus: Array.isArray(profileData.technology_focus),
        key_markets: Array.isArray(profileData.key_markets),
        customer_segments: Array.isArray(profileData.customer_segments),
        partnerships: Array.isArray(profileData.partnerships),
        certifications: Array.isArray(profileData.certifications),
        sales_channels: Array.isArray(profileData.sales_channels)
      });
      
      // 🔍 CRITICAL: Show the exact certifications array being sent to the API
      console.log('🔍 DEBUG: === FINAL API PAYLOAD ANALYSIS ===');
      console.log('🔍 DEBUG: certifications array being sent to API:', profileData.certifications);
      console.log('🔍 DEBUG: certifications array length:', profileData.certifications.length);
      console.log('🔍 DEBUG: Each certification detail in the payload:');
      profileData.certifications.forEach((cert, index) => {
        console.log(`🔍 DEBUG:   [${index}]: ${cert.certificationName} -> ${cert.url}`);
      });
      console.log('🔍 DEBUG: === END API PAYLOAD ANALYSIS ===');
      
      console.log('🔍 DEBUG: Headers:', {
        'Content-Type': 'application/json',
        'private_key': this.privateKeyForm.get('private_key')?.value ? '***SET***' : '***NOT SET***'
      });
      
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'private_key': this.privateKeyForm.get('private_key')?.value
      });

      const response = await this.http.post<ProfileUpdateResponse>(
        `${this.API_BASE_URL}/blockchain/update/${this.fileId}`,
        {
          profile_data: profileData,
          timestamp: new Date().toISOString() // Add the missing timestamp field
        },
        { headers }
      ).toPromise();

      if (response) {
        console.log('✅ Profile updated successfully:', response);
        
        // 🔍 DEBUG: Analyze the response to see what the backend actually processed
        console.log('🔍 DEBUG: === BACKEND RESPONSE ANALYSIS ===');
        console.log('🔍 DEBUG: Response structure:', response);
        if (response.profile_data && response.profile_data.certifications) {
          console.log('🔍 DEBUG: Backend processed certifications:', response.profile_data.certifications);
          console.log('🔍 DEBUG: Backend certifications length:', response.profile_data.certifications.length);
          
          // Compare what we sent vs what the backend processed
          console.log('🔍 DEBUG: === SENT vs PROCESSED COMPARISON ===');
          console.log('🔍 DEBUG: What we sent:', profileData.certifications);
          console.log('🔍 DEBUG: What backend processed:', response.profile_data.certifications);
          
          // Check if file replacement was successful
          const sentUrls = new Set(profileData.certifications.map(cert => cert.url));
          const processedUrls = new Set(response.profile_data.certifications.map((cert: any) => 
            typeof cert === 'string' ? cert : cert.url
          ));
          const newUrls = [...sentUrls].filter(url => !this.updateExistingCertificationUrls.includes(url));
          const oldUrls = this.updateExistingCertificationUrls.filter(url => !sentUrls.has(url));
          
          console.log('🔍 DEBUG: New URLs we sent:', newUrls);
          console.log('🔍 DEBUG: Old URLs that should have been replaced:', oldUrls);
          console.log('🔍 DEBUG: === END COMPARISON ===');
        }
        console.log('🔍 DEBUG: === END BACKEND RESPONSE ANALYSIS ===');
        
        this.profileUpdateResponse = response;
        this.updateProfileSuccess = 'Profile updated successfully!';
        this.showSuccess('Profile updated successfully!');
        
        // Refresh the latest profile data
        await this.loadSingleLatestProfile();
        
        // Check backend file storage to see if files were actually replaced
        await this.checkBackendFileStorage();
        
        // Clear update form arrays but preserve existing files
        this.clearFormArrays(this.updateForm);
        // Don't clear updateCertificationFiles here - keep them for potential further updates
      } else {
        throw new Error('No response received from server');
      }
    } catch (error) {
      console.error('❌ Update profile error:', error);
      
      // Handle specific error types
      if (error instanceof HttpErrorResponse) {
        if (error.status === 422) {
          console.error('🔍 422 Unprocessable Entity - Request validation failed');
          console.error('🔍 Error body:', error.error);
          
          // Try to extract more specific error information
          let errorMessage = 'Request validation failed';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error && error.error.error) {
            errorMessage = error.error.error;
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          
          this.showError(`Validation error: ${errorMessage}`);
        } else {
          this.handleApiError(error, 'Failed to update profile');
        }
      } else {
        this.handleApiError(error, 'Failed to update profile');
      }
    } finally {
      this.updateProfileLoading = false;
    }
  }

  private populateUpdateForm(profile: CompanyProfile) {
    // Clear existing arrays first
    this.clearFormArrays(this.updateForm);
    
    // Clear existing certification files array
    this.updateCertificationFiles = [];
    this.updateExistingCertificationUrls = [];
    this.updateCertificationItems = [];
    
    console.log('🔍 DEBUG: Populating update form with profile:', profile);
    console.log('🔍 DEBUG: Profile certifications:', profile.certifications);
    
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
    
    // Populate arrays with required validators
    if (profile.market_segments && profile.market_segments.length > 0) {
      profile.market_segments.forEach(segment => {
        this.updateMarketSegmentsArray.push(this.fb.control(segment, Validators.required));
      });
    }
    
    if (profile.technology_focus && profile.technology_focus.length > 0) {
      profile.technology_focus.forEach(tech => {
        this.updateTechnologyFocusArray.push(this.fb.control(tech, Validators.required));
      });
    }
    
    if (profile.key_markets && profile.key_markets.length > 0) {
      profile.key_markets.forEach(market => {
        this.updateKeyMarketsArray.push(this.fb.control(market, Validators.required));
      });
    }
    
    if (profile.customer_segments && profile.customer_segments.length > 0) {
      profile.customer_segments.forEach(segment => {
        this.updateCustomerSegmentsArray.push(this.fb.control(segment, Validators.required));
      });
    }
    
    if (profile.partnerships && profile.partnerships.length > 0) {
      profile.partnerships.forEach(partner => {
        this.updatePartnershipsArray.push(this.fb.control(partner, Validators.required));
      });
    }
    
          if (profile.certifications && profile.certifications.length > 0) {
        profile.certifications.forEach((cert, index) => {
          console.log('🔍 DEBUG: Processing certification:', cert);
          
          // Handle both old string format and new CertificationDetail format
          let certUrl = '';
          let certName = '';
          
          if (typeof cert === 'string') {
            // Old format: just a URL string
            certUrl = cert;
            // Extract filename from URL
            certName = this.extractFileNameFromUrl(cert);
          } else if (cert && typeof cert === 'object' && 'url' in cert) {
            // New format: CertificationDetail object
            certUrl = cert.url;
            certName = cert.certificationName || this.extractFileNameFromUrl(cert.url);
          }
          
          console.log('🔍 DEBUG: Extracted certification data:', {
            url: certUrl,
            name: certName
          });
          
          // Add to form array - create a simplified FormGroup with only certificate name
          const certificationGroup = this.fb.group({
            certificationName: [certName, Validators.required],
            fileName: [certName, Validators.required] // Store the uploaded file name
          });
          this.updateCertificationsArray.push(certificationGroup);
          
          // Add to our organized file management
          this.updateCertificationItems.push({
            id: certUrl,
            name: certName,
            url: certUrl,
            isExisting: true,
            operation: 'preserve',
            originalIndex: index,
            // Initialize simplified certification details
            certificationName: certName
          });
          
          // Store existing URL for reference
          this.updateExistingCertificationUrls.push(certUrl);
        });
        console.log('🔍 DEBUG: Populated certifications array with', profile.certifications.length, 'existing files');
        console.log('🔍 DEBUG: updateCertificationItems array length:', this.updateCertificationItems.length);
        console.log('🔍 DEBUG: updateCertificationItems:', this.updateCertificationItems);
      }
    
    if (profile.sales_channels && profile.sales_channels.length > 0) {
      profile.sales_channels.forEach(channel => {
        this.updateSalesChannelsArray.push(this.fb.control(channel, Validators.required));
      });
    }
    
    // Debug form validation after populating
    console.log('🔍 DEBUG: Form populated, checking validation...');
    setTimeout(() => {
      this.debugFormValidation();
    }, 100);
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
  
  // Helper method to get object keys safely
  getObjectKeys(obj: any): string[] {
    if (obj && typeof obj === 'object') {
      return Object.keys(obj);
    }
    return [];
  }
  
  // Helper method to validate certification data
  isValidCertification(cert: any): boolean {
    try {
      if (!cert || cert === null || cert === undefined) {
        return false;
      }
      
      // Check if it's a valid string (URL)
      if (typeof cert === 'string') {
        return cert.trim() !== '';
      }
      
      // Check if it's a valid object with required properties
      if (typeof cert === 'object' && cert !== null) {
        // Must have either certificationName or url
        return (cert.certificationName !== undefined && cert.certificationName !== null) ||
               (cert.url !== undefined && cert.url !== null);
      }
      
      return false;
    } catch (error) {
      console.warn('⚠️ Error validating certification:', cert, error);
      return false;
    }
  }
  
  // TrackBy function for certifications to improve performance and prevent errors
  trackByCertification(index: number, cert: any): any {
    if (!cert) return index;
    
    if (typeof cert === 'string') {
      return cert;
    }
    
    if (cert && typeof cert === 'object') {
      return cert.certificationName || cert.url || cert.id || index;
    }
    
    return index;
  }
  
  // Safe method to get profile values with proper validation
  safeGetProfileValue(profile: any, fieldName: string): any {
    if (!profile || !fieldName) {
      return null;
    }
    
    try {
      const value = profile[fieldName];
      
      // Handle null/undefined values
      if (value === null || value === undefined) {
        return null;
      }
      
      // Handle array values
      if (Array.isArray(value)) {
        // Filter out invalid items for certifications
        if (fieldName === 'certifications') {
          console.log(`🔍 Processing certifications field:`, {
            totalItems: value.length,
            items: value.map((item, index) => ({
              index,
              type: typeof item,
              value: item,
              isValid: this.isValidCertification(item)
            }))
          });
          return value.filter(cert => this.isValidCertification(cert));
        }
        return value;
      }
      
      // Handle other types
      return value;
    } catch (error) {
      console.warn(`⚠️ Error accessing profile field ${fieldName}:`, error);
      return null;
    }
  }
  
  // Safe method to check if profile has array content
  safeHasArrayContent(profile: any, fieldName: string): boolean {
    const value = this.safeGetProfileValue(profile, fieldName);
    return Array.isArray(value) && value.length > 0;
  }
  
  // Safe method to download certification files
  safeDownloadCertification(cert: any): void {
    try {
      if (!this.isValidCertification(cert)) {
        console.warn('⚠️ Cannot download invalid certification:', cert);
        return;
      }
      
      const url = this.getCertificationUrl(cert);
      if (!url) {
        console.warn('⚠️ No valid URL found for certification:', cert);
        return;
      }
      
      // Use the existing download method if available
      if (typeof this.downloadFile === 'function') {
        this.downloadFile(url, this.getCertificationDisplayName(cert));
      } else {
        // Fallback: open in new tab
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('❌ Error downloading certification:', cert, error);
    }
  }
  
  // Global error handler for the component
  private handleComponentError(error: any, context: string): void {
    console.error(`❌ Error in ${context}:`, error);
    
    // Log additional error details for debugging
    if (error && typeof error === 'object') {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        context: context
      });
    }
  }
  
  // Debug method to log change_info structure
  debugChangeInfo(version: any): void {
    console.log(`🔍 Debugging version ${version.version}:`, {
      hasChangeInfo: !!version.change_info,
      changeInfoType: typeof version.change_info,
      changeInfoKeys: version.change_info ? Object.keys(version.change_info) : [],
      oldValues: version.change_info?.old_values,
      newValues: version.change_info?.new_values,
      changedFields: version.change_info?.changed_fields,
      oldValuesType: typeof version.change_info?.old_values,
      newValuesType: typeof version.change_info?.new_values,
      oldValuesKeys: version.change_info?.old_values ? Object.keys(version.change_info.old_values) : [],
      newValuesKeys: version.change_info?.new_values ? Object.keys(version.change_info.new_values) : []
    });
  }

  // Certification status methods
  isPreservingCertification(index: number): boolean {
    // Check if this certification slot is being preserved (not changed)
    return this.updateCertificationItems && this.updateCertificationItems[index] && 
           this.updateCertificationItems[index].operation === 'preserve';
  }

  isReplacingCertification(index: number): boolean {
    // Check if this certification slot is being replaced
    return this.updateCertificationItems && this.updateCertificationItems[index] && 
           this.updateCertificationItems[index].operation === 'replace';
  }

  isAppendingCertification(index: number): boolean {
    // Check if this certification slot is being appended (new file)
    return this.updateCertificationItems && this.updateCertificationItems[index] && 
           this.updateCertificationItems[index].operation === 'append';
  }

  isEmptyCertificationSlot(index: number): boolean {
    // Check if this certification slot is empty
    return this.updateCertificationItems && this.updateCertificationItems[index] && 
           this.updateCertificationItems[index].operation === 'remove';
  }

  // Debug methods
  debugCertificationItemsState(): void {
    console.log('🔍 Debugging certification items state:', {
      updateCertificationItems: this.updateCertificationItems,
      currentCertifications: this.regulatorProfileData?.current_profile?.certifications
    });
  }

  checkBackendFileStorage(): void {
    console.log('🔍 Checking backend file storage...');
    // This method would typically make an API call to check backend storage
    // For now, just log the current state
    console.log('Current file storage state:', {
      hasCurrentProfile: !!this.regulatorProfileData?.current_profile,
      hasCertifications: !!this.regulatorProfileData?.current_profile?.certifications,
      certificationCount: this.regulatorProfileData?.current_profile?.certifications?.length || 0
    });
  }

  showProfileComparisonForRegulatory(): void {
    console.log('🔍 Showing profile comparison for regulatory...');
    // This method would typically show a modal or navigate to comparison view
    // For now, just log the action
    console.log('Profile comparison requested for regulatory compliance');
  }

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

  // Check backend connectivity
  async checkBackendHealth() {
    try {
      console.log('🔍 DEBUG: Checking backend health...');
      const response = await this.http.get(`${this.API_BASE_URL}/health`, { responseType: 'text' as 'json' }).toPromise();
      console.log('✅ Backend health check successful:', response);
      return true;
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      this.showError('Cannot connect to backend server. Please check if the server is running.');
      return false;
    }
  }

  // Helper method to check if a certification item is an existing file
  isExistingCertification(index: number): boolean {
    const item = this.updateCertificationItems[index];
    return item ? item.isExisting : false;
  }

  // Helper method to get the display text for a certification item
  getCertificationDisplayText(index: number): string {
    const item = this.updateCertificationItems[index];
    if (!item) return '';
    
    if (item.isExisting) {
      return `📄 ${item.name} (existing)`;
    } else if (item.file) {
      return `📎 ${item.name} (new)`;
    } else {
      return `➕ Click to add file`;
    }
  }

  // Helper method to get certification files summary
  getCertificationFilesSummary(): string {
    const breakdown = this.getCertificationFilesBreakdown();
    const parts = [];
    
    if (breakdown.existing.length > 0) {
      parts.push(`${breakdown.existing.length} existing`);
    }
    if (breakdown.replaced.length > 0) {
      parts.push(`${breakdown.replaced.length} replaced`);
    }
    if (breakdown.appended.length > 0) {
      parts.push(`${breakdown.appended.length} appended`);
    }
    if (breakdown.removed.length > 0) {
      parts.push(`${breakdown.removed.length} removed`);
    }
    if (breakdown.empty > 0) {
      parts.push(`${breakdown.empty} empty`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No files';
  }

  // Helper method to check if a certification item has a file
  hasCertificationFile(index: number): boolean {
    const item = this.updateCertificationItems[index];
    return item ? (item.isExisting || !!item.file) : false;
  }

  // Helper method to get the file name for display
  getCertificationFileName(index: number): string {
    const item = this.updateCertificationItems[index];
    if (!item) return '';
    
    if (item.isExisting) {
      return item.name;
    } else if (item.file) {
      return item.file.name;
    } else {
      return '';
    }
  }

  // Helper method to get file size in MB for display
  getFileSizeInMB(index: number): string {
    const item = this.updateCertificationItems[index];
    if (!item || !item.file) return '0';
    
    return (item.file.size / 1024 / 1024).toFixed(2);
  }

  // Helper method to get detailed certification files breakdown
  getCertificationFilesBreakdown(): { existing: string[], replaced: string[], appended: string[], removed: string[], empty: number } {
    const existing = this.updateCertificationItems
      .filter(item => item.operation === 'preserve')
      .map(item => item.name);

    const replaced = this.updateCertificationItems
      .filter(item => item.operation === 'replace')
      .map(item => item.name);

    const appended = this.updateCertificationItems
      .filter(item => item.operation === 'append')
      .map(item => item.name);

    const removed = this.updateCertificationItems
      .filter(item => item.operation === 'remove')
      .map(item => item.name);

    const emptySlots = this.updateCertificationItems
      .filter(item => !item.operation || item.operation === 'preserve' && !item.file)
      .length;

    return { existing, replaced, appended, removed, empty: emptySlots };
  }

  // Helper method to check if there are any changes to save
  hasCertificationChanges(): boolean {
    return this.updateCertificationItems.some(item => item.file);
  }

  // Method to clean up empty certification slots
  cleanupEmptyCertificationSlots() {
    console.log('🔍 DEBUG: Cleaning up empty certification slots');
    
    // Remove empty slots from the end of the array
    let removedCount = 0;
    for (let i = this.updateCertificationItems.length - 1; i >= 0; i--) {
      const item = this.updateCertificationItems[i];
      if (!item.isExisting && !item.file) {
        // Remove empty slot
        this.updateCertificationItems.splice(i, 1);
        
        // Also remove from form array
        const certificationsArray = this.updateForm.get('certifications') as FormArray;
        if (certificationsArray.at(i)) {
          certificationsArray.removeAt(i);
        }
        
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`🔍 DEBUG: Removed ${removedCount} empty certification slots`);
      this.showSuccess(`Cleaned up ${removedCount} empty file slot(s)`);
    }
  }

  // Method to reset certification files to original state
  resetCertificationFiles() {
    console.log('🔍 DEBUG: Resetting certification files to original state');
    
    // Clear all items
    this.updateCertificationItems = [];
    
    // Clear form array
    const certificationsArray = this.updateForm.get('certifications') as FormArray;
    while (certificationsArray.length !== 0) {
      certificationsArray.removeAt(0);
    }
    
    // Repopulate with existing files if we have a current profile
    if (this.currentProfile && this.currentProfile.certifications) {
      this.currentProfile.certifications.forEach(cert => {
        // Extract filename from URL more robustly
        let fileName = '';
        if (typeof cert === 'string') {
                  fileName = this.extractFileNameFromUrl(cert);
        } else {
          // Fallback if cert is not a string
          fileName = String(cert);
        }
        
        // Add to form array - create a FormGroup for certification details
        const certificationGroup = this.fb.group({
          certificationName: [fileName, Validators.required],
          certificationType: ['', Validators.required],
          issuingAuthority: ['', Validators.required],
          issueDate: ['', Validators.required],
          expiryDate: ['', Validators.required],
          description: [''],
          fileName: [fileName, Validators.required]
        });
        certificationsArray.push(certificationGroup);
        
        // Add to our organized file management
        this.updateCertificationItems.push({
          id: typeof cert === 'string' ? cert : cert.url,
          name: fileName,
          url: typeof cert === 'string' ? cert : cert.url,
          isExisting: true,
          operation: 'preserve',
          originalIndex: this.updateCertificationItems.length,
          // Initialize simplified certification details
          certificationName: fileName
        });
      });
    }
    
    console.log('🔍 DEBUG: Certification files reset. Total items:', this.updateCertificationItems.length);
    this.showSuccess('Certification files reset to original state');
  }

  // Debug method to show current certification files state
  debugCertificationFiles() {
    console.log('🔍 DEBUG: Current Certification Files State');
    console.log('🔍 DEBUG: updateCertificationItems:', this.updateCertificationItems);
    console.log('🔍 DEBUG: updateExistingCertificationUrls:', this.updateExistingCertificationUrls);
    console.log('🔍 DEBUG: Form certifications array:', this.updateCertificationsArray.value);
    
    if (this.currentProfile) {
      console.log('🔍 DEBUG: Current profile certifications:', this.currentProfile.certifications);
    }
    
    // Show breakdown
    const breakdown = this.getCertificationFilesBreakdown();
    console.log('🔍 DEBUG: Files breakdown:', breakdown);
    
    // Show summary
    const summary = this.getCertificationFilesSummary();
    console.log('🔍 DEBUG: Files summary:', summary);
  }

  // Method to manually refresh certification files display
  refreshCertificationFilesDisplay() {
    console.log('🔍 DEBUG: Refreshing certification files display');
    
    if (!this.currentProfile || !this.currentProfile.certifications) {
      console.log('🔍 DEBUG: No current profile or certifications to refresh');
      return;
    }
    
    // Clear current display
    this.updateCertificationItems = [];
    const certificationsArray = this.updateForm.get('certifications') as FormArray;
    while (certificationsArray.length !== 0) {
      certificationsArray.removeAt(0);
    }
    
    // Repopulate with existing files
    this.currentProfile.certifications.forEach(cert => {
      // Extract filename from URL more robustly
      let fileName = '';
      if (typeof cert === 'string') {
        fileName = this.extractFileNameFromUrl(cert);
      } else if (cert && typeof cert === 'object' && 'url' in cert) {
        fileName = cert.certificationName || this.extractFileNameFromUrl(cert.url);
      } else {
        // Fallback if cert is not a string
        fileName = String(cert);
      }
      
      // Add to form array - create a simplified FormGroup with only certificate name
      const certificationGroup = this.fb.group({
        certificationName: [fileName, Validators.required],
        fileName: [fileName, Validators.required]
      });
      certificationsArray.push(certificationGroup);
      
      // Add to our organized file management
      this.updateCertificationItems.push({
        id: typeof cert === 'string' ? cert : cert.url,
        name: fileName,
        url: typeof cert === 'string' ? cert : cert.url,
        isExisting: true,
        operation: 'preserve',
        originalIndex: this.updateCertificationItems.length,
        // Initialize simplified certification details
        certificationName: fileName
      });
    });
    
    console.log('🔍 DEBUG: Certification files display refreshed. Total items:', this.updateCertificationItems.length);
    this.showSuccess('Certification files display refreshed');
  }

  // Method to show what will happen when updating the profile
  showUpdatePreview(): string {
    if (!this.currentProfile) {
      return 'No profile loaded for editing';
    }
    
    const breakdown = this.getCertificationFilesBreakdown();
    let preview = 'Update Preview:\n';
    preview += `• Company Name: ${this.updateForm.get('company_name')?.value || 'No change'}\n`;
    preview += `• Location: ${this.updateForm.get('location')?.value || 'No change'}\n`;
    preview += `• Contact: ${this.updateForm.get('contact')?.value || 'No change'}\n`;
    preview += `• Size: ${this.updateForm.get('size')?.value || 'No change'}\n`;
    preview += `• Established: ${this.updateForm.get('established')?.value || 'No change'}\n`;
    preview += `• Revenue: ${this.updateForm.get('revenue')?.value || 'No change'}\n`;
    preview += `• Competitive Position: ${this.updateForm.get('competitive_position')?.value || 'No change'}\n`;
    preview += `• Certifications: ${breakdown.existing.length} existing + ${breakdown.replaced.length} replaced + ${breakdown.appended.length} appended files\n`;
    
    if (breakdown.replaced.length > 0) {
      preview += `• Files to be replaced: ${breakdown.replaced.join(', ')}\n`;
    }
    if (breakdown.appended.length > 0) {
      preview += `• New files to be appended: ${breakdown.appended.join(', ')}\n`;
    }
    
    return preview;
  }

  // Calculate differences between two profile versions
  calculateProfileDiff(oldData: any, newData: any): Array<{field_name: string, old_value: any, new_value: any}> {
    try {
      const diffs: Array<{field_name: string, old_value: any, new_value: any}> = [];
      
      if (!oldData || !newData || typeof oldData !== 'object' || typeof newData !== 'object') {
        return diffs;
      }
      
      // Get all unique keys from both objects
      const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
      
      for (const key of allKeys) {
        const oldValue = oldData[key];
        const newValue = newData[key];
        
        // Check if values are different
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          diffs.push({
            field_name: key,
            old_value: oldValue,
            new_value: newValue
          });
        }
      }
      
      return diffs;
    } catch (error) {
      console.warn('⚠️ Error calculating profile diff:', error);
      return [];
    }
  }

  // Test backend endpoint directly to see what data structure is returned
  async testBackendEndpoint() {
    try {
      console.log('🧪 Testing backend endpoint directly...');
      
      // First, get the latest profile to get a file_id
      const latestResponse = await this.http.get<SingleLatestProfileResponse>(
        `${this.API_BASE_URL}/blockchain/latest-available`
      ).toPromise();

      if (latestResponse && latestResponse.success && latestResponse.metadata?.file_id) {
        const fileId = latestResponse.metadata.file_id;
        console.log('🧪 Using file ID:', fileId);
        
        // Test the profiles endpoint directly
        const historyResponse = await this.http.get<any>(
          `${this.API_BASE_URL}/blockchain/profiles/${fileId}`
        ).toPromise();

        console.log('🧪 Raw backend response:', JSON.stringify(historyResponse, null, 2));
        console.log('🧪 Response type:', typeof historyResponse);
        console.log('🧪 Has edit_history:', !!historyResponse?.edit_history);
        console.log('🧪 Edit history length:', historyResponse?.edit_history?.length || 0);
        console.log('🧪 Has profile_data:', !!historyResponse?.profile_data);
        console.log('🧪 Has metadata:', !!historyResponse?.metadata);
        
        if (historyResponse?.edit_history) {
          console.log('🧪 First edit history entry:', historyResponse.edit_history[0]);
        }
        
        return historyResponse;
      } else {
        console.log('🧪 No latest profile available for testing');
        return null;
      }
    } catch (error) {
      console.error('🧪 Error testing backend endpoint:', error);
      return null;
    }
  }
} 