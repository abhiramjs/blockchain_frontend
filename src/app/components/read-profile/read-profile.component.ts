import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-read-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tab-content">
      <h2>Read Profile</h2>
      <form (ngSubmit)="onSubmit()" #readForm="ngForm">
        <div class="form-group">
          <label for="userId">User ID:</label>
          <input type="text" id="userId" name="userId" [(ngModel)]="userId" required placeholder="Enter User ID to search" />
        </div>
        <button type="submit" class="btn" [disabled]="loading">Read Profile</button>
      </form>
      
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Reading profile...</p>
      </div>
      
      <div [class]="'result ' + (isSuccess ? 'success' : 'error')" *ngIf="resultMessage" [innerHTML]="resultMessage"></div>
    </div>
  `,
  styles: [`
    .tab-content {
      padding: 40px;
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

    .form-group input {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
      background: white;
    }

    .form-group input:focus {
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

    .timestamp-display {
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      color: #666;
    }

    .update-history-container {
      max-height: 600px;
      overflow-y: auto;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .update-record {
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      transition: all 0.3s ease;
      position: relative;
    }

    .update-record:hover {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    }

    .update-record.latest-update {
      border-color: #28a745;
      background: linear-gradient(135deg, #f8fff8, #e8f5e8);
    }

    .update-record.latest-update::before {
      content: "LATEST";
      position: absolute;
      top: -8px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .update-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e9ecef;
    }

    .update-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .update-badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .update-badge.manual {
      background: #e3f2fd;
      color: #1976d2;
      border: 1px solid #2196f3;
    }

    .update-badge.api {
      background: #f3e5f5;
      color: #7b1fa2;
      border: 1px solid #9c27b0;
    }

    .update-badge.system {
      background: #fff3e0;
      color: #f57c00;
      border: 1px solid #ff9800;
    }

    .update-date {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #666;
      background: #f8f9fa;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .update-id {
      font-family: 'Courier New', monospace;
      font-size: 10px;
      color: #999;
      background: #f1f3f4;
      padding: 2px 6px;
      border-radius: 3px;
    }

    .changes-count {
      background: #667eea;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .field-changes {
      display: grid;
      gap: 10px;
    }

    .field-change {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 12px;
      border-left: 4px solid #dee2e6;
    }

    .field-change.created {
      border-left-color: #28a745;
      background: linear-gradient(135deg, #f8fff8, #e8f5e8);
    }

    .field-change.updated {
      border-left-color: #ffc107;
      background: linear-gradient(135deg, #fffdf7, #fff8e1);
    }

    .field-change.deleted {
      border-left-color: #dc3545;
      background: linear-gradient(135deg, #fff8f8, #ffebee);
    }

    .field-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .change-icon {
      font-size: 14px;
      width: 20px;
      text-align: center;
    }

    .field-values {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      font-size: 14px;
    }

    .old-value {
      background: #ffebee;
      color: #c62828;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      text-decoration: line-through;
      opacity: 0.8;
    }

    .new-value {
      background: #e8f5e8;
      color: #2e7d32;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      font-weight: 600;
    }

    .arrow {
      color: #666;
      font-weight: bold;
      font-size: 16px;
    }

    .hash-info {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid #e9ecef;
      font-size: 11px;
      color: #666;
    }

    .hash-label {
      font-weight: 600;
      margin-right: 8px;
    }

    .hash-value {
      font-family: 'Courier New', monospace;
      background: #f1f3f4;
      padding: 2px 6px;
      border-radius: 3px;
    }

    .history-note {
      text-align: center;
      padding: 15px;
      background: #e9ecef;
      border-radius: 8px;
      color: #666;
      font-style: italic;
      margin-top: 10px;
    }

    .no-history {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-history p {
      margin-top: 10px;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .update-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
      }

      .field-values {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .arrow {
        transform: rotate(90deg);
        align-self: center;
      }
    }
  `]
})
export class ReadProfileComponent {
  userId: string = '';
  loading: boolean = false;
  resultMessage: string = '';
  isSuccess: boolean = false;

  async onSubmit() {
    this.loading = true;
    this.resultMessage = '';

    try {
      const response = await fetch(`http://localhost:3000/api/v1/blockchain/profile/${this.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        this.resultMessage = `
          <div class="success-card">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
              <span style="font-size: 2rem;">✅</span>
              <div>
                <h3 style="margin: 0; color: #155724;">Profile Found Successfully!</h3>
                <p style="margin: 5px 0 0 0; color: #155724; opacity: 0.8;">Retrieved from blockchain storage</p>
              </div>
            </div>
          </div>

          <div class="profile-section">
            <h4 class="section-title">📋 Profile Information</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Profile ID</span>
                <span class="info-value">${result.id}</span>
              </div>
              <div class="info-item">
                <span class="info-label">User ID</span>
                <span class="info-value">${result.userId}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Created At</span>
                <span class="info-value timestamp-display">${new Date(result.createdAt).toLocaleString()}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Updated</span>
                <span class="info-value timestamp-display">${new Date(result.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="profile-section">
            <h4 class="section-title">👤 Personal Details</h4>
            <div class="info-grid">
              ${Object.entries(result.data)
                .filter(([key]) => key !== 'fullName')
                .map(([key, value]) => `
                <div class="info-item">
                  <span class="info-label">${this.formatFieldName(key)}</span>
                  <span class="info-value">${value || 'Not provided'}</span>
                </div>
              `).join('')}
            </div>
          </div>

          ${result.updateHistory && result.updateHistory.length > 0 ? `
          <div class="profile-section">
            <h4 class="section-title">📋 Update History</h4>
            <div class="update-history-container">
              ${result.updateHistory.slice(-10).reverse().map((update: any, index: number) => `
                <div class="update-record ${index === 0 ? 'latest-update' : ''}">
                  <div class="update-header">
                    <div class="update-info">
                      <span class="update-badge ${this.getUpdateBadgeClass(update.updateSource)}">${this.formatUpdateSource(update.updateSource)}</span>
                      <span class="update-date">${new Date(update.timestamp).toLocaleString()}</span>
                      <span class="update-id">ID: ${update.updateId.substring(0, 8)}</span>
                    </div>
                    <div class="changes-count">
                      ${update.changedFields.length} field${update.changedFields.length !== 1 ? 's' : ''} changed
                    </div>
                  </div>
                  <div class="field-changes">
                    ${update.changedFields.map((change: any) => `
                      <div class="field-change ${change.changeType}">
                        <div class="field-name">
                          <span class="change-icon">${this.getChangeIcon(change.changeType)}</span>
                          ${this.formatFieldName(change.fieldName)}
                        </div>
                        <div class="field-values">
                          ${change.changeType === 'created' ? `
                            <span class="new-value">Added: "${change.newValue}"</span>
                          ` : change.changeType === 'updated' ? `
                            <span class="old-value">From: "${change.previousValue || 'Empty'}"</span>
                            <span class="arrow">→</span>
                            <span class="new-value">To: "${change.newValue}"</span>
                          ` : `
                            <span class="old-value">Removed: "${change.previousValue}"</span>
                          `}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                  ${update.previousHash && update.newHash ? `
                    <div class="hash-info">
                      <span class="hash-label">Data Hash:</span>
                      <span class="hash-value">${update.previousHash} → ${update.newHash}</span>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
              ${result.updateHistory.length > 10 ? `
                <div class="history-note">
                  Showing latest 10 updates. Total: ${result.updateHistory.length} updates
                </div>
              ` : ''}
            </div>
          </div>
          ` : `
          <div class="profile-section">
            <h4 class="section-title">📋 Update History</h4>
            <div class="no-history">
              <span style="font-size: 2rem; opacity: 0.3;">📝</span>
              <p>No update history available. This profile was created before history tracking was enabled.</p>
            </div>
          </div>
          `}
        `;
        this.isSuccess = true;
      } else if (response.status === 404) {
        this.resultMessage = `
          <div class="error-card">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
              <span style="font-size: 2rem;">🔍</span>
              <div>
                <h3 style="margin: 0; color: #721c24;">Profile Not Found</h3>
                <p style="margin: 5px 0 0 0; color: #721c24; opacity: 0.8;">No profile exists with this User ID</p>
              </div>
            </div>
            <div class="profile-section">
              <p><strong>Searched for:</strong> ${this.userId}</p>
              <div style="margin-top: 15px; padding: 15px; background: rgba(114, 28, 36, 0.1); border-radius: 8px;">
                <h5 style="margin: 0 0 10px 0; color: #721c24;">💡 Suggestions:</h5>
                <ul style="margin: 0; padding-left: 20px; color: #721c24;">
                  <li>Double-check the User ID for typos</li>
                  <li>Make sure you're using the correct User ID from a created profile</li>
                  <li>Try creating a new profile first</li>
                </ul>
              </div>
            </div>
          </div>
        `;
        this.isSuccess = false;
      } else {
        throw new Error(result.error || 'Failed to read profile');
      }
    } catch (error: any) {
      this.resultMessage = `
        <div class="error-card">
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
            <span style="font-size: 2rem;">❌</span>
            <div>
              <h3 style="margin: 0; color: #721c24;">Error Reading Profile</h3>
              <p style="margin: 5px 0 0 0; color: #721c24; opacity: 0.8;">Failed to retrieve profile data</p>
            </div>
          </div>
          <div class="profile-section">
            <p><strong>Error Details:</strong> ${error.message}</p>
            <div style="margin-top: 15px; padding: 15px; background: rgba(114, 28, 36, 0.1); border-radius: 8px;">
              <h5 style="margin: 0 0 10px 0; color: #721c24;">🔧 Troubleshooting:</h5>
              <ul style="margin: 0; padding-left: 20px; color: #721c24;">
                <li>Check your internet connection</li>
                <li>Verify the API server is running</li>
                <li>Try refreshing the page</li>
              </ul>
            </div>
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

  getUpdateBadgeClass(updateSource: string): string {
    return updateSource.toLowerCase();
  }

  formatUpdateSource(updateSource: string): string {
    switch(updateSource) {
      case 'manual': return 'Manual Update';
      case 'api': return 'API Update';
      case 'system': return 'System Update';
      default: return updateSource;
    }
  }

  getChangeIcon(changeType: string): string {
    switch(changeType) {
      case 'created': return '➕';
      case 'updated': return '✏️';
      case 'deleted': return '❌';
      default: return '📝';
    }
  }
} 