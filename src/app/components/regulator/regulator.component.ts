import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-regulator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="regulator-container">
      <!-- Header -->
      <div class="regulator-header">
        <h1>🔍 Regulator Dashboard</h1>
        <p>Dummy data for regulatory monitoring and compliance</p>
      </div>

      <!-- Dummy Data Sections -->
      <div class="content-sections">
        
        <!-- Company Overview -->
        <div class="section">
          <h2>🏢 Monitored Companies</h2>
          <div class="companies-grid">
            <div class="company-card">
              <div class="company-header">
                <span class="company-icon">🏢</span>
                <h3>TechCorp Solutions</h3>
                <span class="status-badge approved">✅ Approved</span>
              </div>
              <div class="company-details">
                <p><strong>Location:</strong> San Francisco, CA</p>
                <p><strong>Industry:</strong> Technology</p>
                <p><strong>Size:</strong> 500+ employees</p>
                <p><strong>Last Audit:</strong> March 15, 2024</p>
                <p><strong>Compliance Score:</strong> 98%</p>
              </div>
            </div>

            <div class="company-card">
              <div class="company-header">
                <span class="company-icon">🏢</span>
                <h3>DataFlow Systems</h3>
                <span class="status-badge pending">⏳ Pending</span>
              </div>
              <div class="company-details">
                <p><strong>Location:</strong> New York, NY</p>
                <p><strong>Industry:</strong> Data Analytics</p>
                <p><strong>Size:</strong> 200+ employees</p>
                <p><strong>Next Review:</strong> April 10, 2024</p>
                <p><strong>Compliance Score:</strong> 85%</p>
              </div>
            </div>

            <div class="company-card">
              <div class="company-header">
                <span class="company-icon">🏢</span>
                <h3>GreenEnergy Corp</h3>
                <span class="status-badge approved">✅ Approved</span>
              </div>
              <div class="company-details">
                <p><strong>Location:</strong> Austin, TX</p>
                <p><strong>Industry:</strong> Renewable Energy</p>
                <p><strong>Size:</strong> 150+ employees</p>
                <p><strong>Last Audit:</strong> February 28, 2024</p>
                <p><strong>Compliance Score:</strong> 95%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Regulatory Actions -->
        <div class="section">
          <h2>📋 Recent Regulatory Actions</h2>
          <div class="actions-list">
            <div class="action-item">
              <div class="action-header">
                <span class="action-type audit">Audit</span>
                <span class="action-date">March 15, 2024</span>
              </div>
              <h3>TechCorp Solutions - Annual Compliance Audit</h3>
              <p>Completed annual compliance audit. All requirements met. No issues found.</p>
              <div class="action-details">
                <span class="detail-item">✅ All checks passed</span>
                <span class="detail-item">📊 98% compliance rate</span>
                <span class="detail-item">📝 Report generated</span>
              </div>
            </div>

            <div class="action-item">
              <div class="action-header">
                <span class="action-type review">Review</span>
                <span class="action-date">March 10, 2024</span>
              </div>
              <h3>DataFlow Systems - Data Privacy Review</h3>
              <p>Scheduled data privacy compliance review. Documentation under review.</p>
              <div class="action-details">
                <span class="detail-item">⏳ Review in progress</span>
                <span class="detail-item">📋 Documentation submitted</span>
                <span class="detail-item">📅 Due: April 10, 2024</span>
              </div>
            </div>

            <div class="action-item">
              <div class="action-header">
                <span class="action-type approval">Approval</span>
                <span class="action-date">February 28, 2024</span>
              </div>
              <h3>GreenEnergy Corp - Environmental Compliance</h3>
              <p>Environmental compliance certification approved. All standards met.</p>
              <div class="action-details">
                <span class="detail-item">✅ Certification approved</span>
                <span class="detail-item">🌱 Environmental standards met</span>
                <span class="detail-item">📜 Certificate issued</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="section">
          <h2>📊 Regulatory Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">🏢</div>
              <div class="stat-number">15</div>
              <div class="stat-label">Companies Monitored</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-number">12</div>
              <div class="stat-label">Compliance Verified</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⏳</div>
              <div class="stat-number">3</div>
              <div class="stat-label">Pending Reviews</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-number">98%</div>
              <div class="stat-label">Overall Compliance Rate</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="section">
          <h2>⚡ Quick Actions</h2>
          <div class="actions-grid">
            <button class="action-btn primary">
              <span class="btn-icon">📋</span>
              <span class="btn-text">Generate Compliance Report</span>
            </button>
            <button class="action-btn secondary">
              <span class="btn-icon">🔍</span>
              <span class="btn-text">Audit Company Profile</span>
            </button>
            <button class="action-btn secondary">
              <span class="btn-icon">📊</span>
              <span class="btn-text">View Statistics</span>
            </button>
            <button class="action-btn secondary">
              <span class="btn-icon">📧</span>
              <span class="btn-text">Send Notifications</span>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer-section">
          <h3>🎯 Regulator Dashboard Active</h3>
          <p>This is dummy data demonstrating the Regulator functionality.</p>
          <p><strong>Last Updated:</strong> {{ currentTime }}</p>
          <p><strong>Data Source:</strong> Mock Regulatory Database</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .regulator-container {
      padding: 40px;
      background: white;
      min-height: 100vh;
    }

    .regulator-header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 15px;
      color: white;
    }

    .regulator-header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5rem;
      font-weight: 700;
    }

    .regulator-header p {
      margin: 0;
      opacity: 0.9;
      font-size: 1.2rem;
    }

    .content-sections {
      max-width: 1200px;
      margin: 0 auto;
    }

    .section {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      border-left: 4px solid #667eea;
    }

    .section h2 {
      margin: 0 0 25px 0;
      color: #333;
      font-size: 1.8rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .companies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
    }

    .company-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      border: 1px solid #e1e5e9;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .company-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e9ecef;
    }

    .company-icon {
      font-size: 2rem;
    }

    .company-header h3 {
      margin: 0;
      flex: 1;
      color: #333;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .status-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.approved {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }

    .company-details p {
      margin: 8px 0;
      color: #666;
      font-size: 0.95rem;
    }

    .actions-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .action-item {
      background: white;
      border-radius: 12px;
      padding: 25px;
      border: 1px solid #e1e5e9;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .action-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .action-type {
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .action-type.audit {
      background: #e3f2fd;
      color: #1976d2;
    }

    .action-type.review {
      background: #fff3e0;
      color: #f57c00;
    }

    .action-type.approval {
      background: #e8f5e8;
      color: #388e3c;
    }

    .action-date {
      color: #666;
      font-size: 0.9rem;
    }

    .action-item h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.2rem;
    }

    .action-item p {
      margin: 0 0 15px 0;
      color: #666;
    }

    .action-details {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .detail-item {
      background: #f8f9fa;
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      color: #666;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      border: 1px solid #e1e5e9;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 10px;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }

    .action-btn {
      padding: 15px 20px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .action-btn.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .action-btn.secondary {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .btn-icon {
      font-size: 1.2rem;
    }

    .footer-section {
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      border: 1px solid #2196f3;
      border-radius: 12px;
      padding: 25px;
      text-align: center;
      margin-top: 30px;
    }

    .footer-section h3 {
      margin: 0 0 15px 0;
      color: #1976d2;
      font-size: 1.4rem;
    }

    .footer-section p {
      margin: 8px 0;
      color: #1976d2;
    }

    @media (max-width: 768px) {
      .regulator-container {
        padding: 20px;
      }

      .regulator-header h1 {
        font-size: 2rem;
      }

      .companies-grid {
        grid-template-columns: 1fr;
      }

      .action-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      .action-details {
        flex-direction: column;
        gap: 8px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegulatorComponent {
  currentTime: string = new Date().toLocaleString();
} 