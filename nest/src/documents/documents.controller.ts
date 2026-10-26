import { Controller, Get } from '@nestjs/common';
import { DataStoreService } from '../common/data-store.service.js';

@Controller('documents')
export class DocumentsController {
  constructor(private dataStore: DataStoreService) {}

  @Get()
  getDocuments() {
    const docData = this.dataStore.getDocumentsData();
    const evaluationDate = '2026-05-15';
    const today = new Date(evaluationDate);
    const warningDays = docData.thresholds?.warningDays || 30;

    const documents = (docData.documents || []).map((doc: any) => {
      const expiry = new Date(doc.expiryDate);
      const diffTime = expiry.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status = 'safe';
      if (daysRemaining <= 0) {
        status = 'expired';
      } else if (daysRemaining <= warningDays) {
        status = 'soon';
      }

      return {
        ...doc,
        daysRemaining,
        status,
      };
    });

    return {
      evaluationDate,
      documents,
    };
  }
}
