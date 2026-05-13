import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuditSummary } from '../../../core/models/models';

type Preset = 'this-month' | 'last-month' | 'this-quarter' | 'last-quarter' | 'this-year' | 'last-year' | 'custom';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-audit.component.html',
  styleUrl: './admin-audit.component.scss',
})
export class AdminAuditComponent implements OnInit {
  private http = inject(HttpClient);

  summary = signal<AuditSummary | null>(null);
  loading = signal(false);
  activePreset = signal<Preset>('this-month');

  fromDate = '';
  toDate = '';

  private presets: Record<Exclude<Preset, 'custom'>, () => { from: string; to: string }> = {
    'this-month': () => {
      const now = new Date();
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
      };
    },
    'last-month': () => {
      const now = new Date();
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0],
        to: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0],
      };
    },
    'this-quarter': () => {
      const now = new Date();
      const q = Math.floor(now.getMonth() / 3);
      return {
        from: new Date(now.getFullYear(), q * 3, 1).toISOString().split('T')[0],
        to: new Date(now.getFullYear(), q * 3 + 3, 0).toISOString().split('T')[0],
      };
    },
    'last-quarter': () => {
      const now = new Date();
      const q = Math.floor(now.getMonth() / 3);
      const prevQ = q === 0 ? 3 : q - 1;
      const year = q === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return {
        from: new Date(year, prevQ * 3, 1).toISOString().split('T')[0],
        to: new Date(year, prevQ * 3 + 3, 0).toISOString().split('T')[0],
      };
    },
    'this-year': () => {
      const now = new Date();
      return {
        from: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
        to: new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0],
      };
    },
    'last-year': () => {
      const now = new Date();
      return {
        from: new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0],
        to: new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0],
      };
    },
  };

  ngOnInit() {
    this.applyPreset('this-month');
  }

  applyPreset(preset: Preset) {
    this.activePreset.set(preset);
    if (preset !== 'custom') {
      const range = this.presets[preset]();
      this.fromDate = range.from;
      this.toDate = range.to;
      this.loadSummary();
    }
  }

  applyCustom() {
    this.activePreset.set('custom');
    this.loadSummary();
  }

  loadSummary() {
    this.loading.set(true);
    const params = this.buildParams();
    this.http.get<AuditSummary>(`${environment.apiUrl}/audit/summary?${params}`).subscribe({
      next: s => { this.summary.set(s); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private buildParams(): string {
    const p = new URLSearchParams();
    if (this.fromDate) p.set('from', this.fromDate);
    if (this.toDate) p.set('to', this.toDate);
    return p.toString();
  }

  maxBarHeight(data: { poojaRevenue: number; donationRevenue: number }[]): number {
    return Math.max(...data.map(d => d.poojaRevenue + d.donationRevenue), 1);
  }

  barHeightPct(value: number, max: number): number {
    return Math.round((value / max) * 100);
  }

  exportExcel(type: 'bookings' | 'donations' | 'combined') {
    const params = new URLSearchParams({ type, ...(this.fromDate ? { from: this.fromDate } : {}), ...(this.toDate ? { to: this.toDate } : {}) });
    const url = `${environment.apiUrl}/audit/export/excel?${params}`;
    this.triggerDownload(url, `audit-${type}.xlsx`);
  }

  exportPdf() {
    const params = this.buildParams();
    const url = `${environment.apiUrl}/audit/export/pdf?${params}`;
    this.triggerDownload(url, 'audit-report.pdf');
  }

  private triggerDownload(url: string, filename: string) {
    this.http.get(url, { responseType: 'blob', headers: { Accept: '*/*' } }).subscribe({
      next: blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      },
    });
  }

  formatCurrency(v: number): string {
    return '₹' + v.toLocaleString('en-IN');
  }

  presetLabel(p: Preset): string {
    const map: Record<Preset, string> = {
      'this-month': 'This Month',
      'last-month': 'Last Month',
      'this-quarter': 'This Quarter',
      'last-quarter': 'Last Quarter',
      'this-year': 'This Year',
      'last-year': 'Last Year',
      'custom': 'Custom',
    };
    return map[p];
  }

  readonly presetList: Preset[] = ['this-month', 'last-month', 'this-quarter', 'last-quarter', 'this-year', 'last-year'];
}
