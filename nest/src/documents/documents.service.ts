import { Injectable } from '@nestjs/common';
import { DataStoreService } from '../common/data-store.service.js';

export interface DocumentItem {
  id: string;
  label: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'safe' | 'soon' | 'expired';
  color: 'green' | 'amber' | 'red';
}

@Injectable()
export class DocumentsService {
  public readonly TODAY = '2026-05-15';

  constructor(private dataStore: DataStoreService) {}

  getDocuments() {
    const rawData = this.dataStore.getDocumentsData();
    const docs = rawData.documents || [];
    const warningDays = rawData.thresholds?.warningDays ?? 30;

    const todayParts = this.TODAY.split('-').map(Number);
    const todayDate = new Date(Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2]));

    const items: DocumentItem[] = docs.map((doc: any) => {
      const expParts = doc.expiryDate.split('-').map(Number);
      const expDate = new Date(Date.UTC(expParts[0], expParts[1] - 1, expParts[2]));
      const diffTime = expDate.getTime() - todayDate.getTime();
      const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let status: 'safe' | 'soon' | 'expired' = 'safe';
      let color: 'green' | 'amber' | 'red' = 'green';

      if (daysRemaining <= 0) {
        status = 'expired';
        color = 'red';
      } else if (daysRemaining <= warningDays) {
        status = 'soon';
        color = 'amber';
      } else {
        status = 'safe';
        color = 'green';
      }

      return {
        id: doc.id,
        label: doc.label,
        expiryDate: doc.expiryDate,
        daysRemaining,
        status,
        color,
      };
    });

    return {
      today: this.TODAY,
      warningDays,
      documents: items,
    };
  }
}
