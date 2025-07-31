// Company Profile Interface - Matches Backend Schema
export interface CompanyProfile {
  // User-editable fields
  company_name: string;
  location: string;
  contact: string;
  size: string;
  established: string;
  revenue: string;
  market_segments?: string[] | string;
  technology_focus?: string[] | string;
  key_markets?: string[] | string;
  customer_segments?: string[] | string;
  competitive_position?: string;
  partnerships?: string[] | string;
  certifications?: string[] | string;
  sales_channels?: string[] | string;
  
  // System fields (display only, set by backend)
  id?: string; // UUID - auto-generated
  blockchain_ref?: string; // display only
  data_hash?: string; // display only
  created_at?: string; // DateTime - display only
  updated_at?: string; // DateTime - display only
  deleted_at?: string; // DateTime - optional, display only
}

// API Request/Response Interfaces
export interface BlockchainStoreRequest {
  profile_data: CompanyProfile;
  timestamp: string;
}

export interface BlockchainUpdateRequest {
  file_id: string;
  profile_data: CompanyProfile;
  timestamp: string;
  private_key: string;
}

export interface BlockchainStoreResponse {
  success: boolean;
  file_id: string;
  profile_hash: string;
  public_key: string;
  private_key: string; // Add private key to response
  timestamp: string;
  verification_url: string;
  qr_code_data: string;
  error?: string; // Added for error handling
}

export interface ProfileUpdateResponse {
  success: boolean;
  new_file_id: string;
  new_version: number;
  profile_hash: string;
  public_key: string;
  timestamp: string;
  diffs: ProfileDiff[];
  error?: string; // Added for error handling
}

export interface ProfileDiff {
  field_name: string;
  old_value: any;
  new_value: any;
}

export interface ProfileWithHistory {
  profile_data: CompanyProfile;
  metadata: CompanyProfileMetadata;
  edit_history: UserHistory[];
  signature_verified: boolean;
  blockchain_ref: string;
  data_hash: string;
  error?: string; // Added for error handling
}

export interface CompanyProfileMetadata {
  id: string;
  file_id: string;
  version: number;
  profile_hash: string;
  public_key: string;
  signature: string;
  timestamp: string;
  profile_data: CompanyProfile;
  created_at: string;
  updated_at: string;
}

export interface UserHistory {
  id: string;
  user_id: string;
  changed_fields: string[];
  old_values: any;
  new_values: any;
  change_summary: string;
  changed_at: string;
}

export interface VerificationResponse {
  success: boolean;
  profile_data?: CompanyProfile;
  verification?: {
    is_valid: boolean;
    signature_verified: boolean;
    hash_match: boolean;
    verification_timestamp: string;
    hedera_hash: string;
    lisk_hash: string;
  };
  error?: string; // Added for error handling
} 