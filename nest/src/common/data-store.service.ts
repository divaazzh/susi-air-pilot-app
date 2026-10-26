import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DataStoreService implements OnModuleInit {
  private flightHoursData: any = {};
  private documentsData: any = {};
  private schedulesData: any = {};

  onModuleInit() {
    this.loadData();
  }

  public loadData() {
    const candidateDirs = [
      process.env.DATA_DIR,
      path.join(process.cwd(), 'data'),
      path.join(process.cwd(), '..', 'data'),
      'D:/apply kerja/susi-air-pilot-app/data',
      path.join(process.cwd(), 'dist', 'data'),
    ].filter(Boolean) as string[];

    let foundDir = '';
    for (const dir of candidateDirs) {
      if (fs.existsSync(path.join(dir, 'mock-flight-hours.json'))) {
        foundDir = dir;
        break;
      }
    }

    if (!foundDir) {
      console.warn('Data directory not found in candidate paths:', candidateDirs);
      return;
    }

    try {
      const fhPath = path.join(foundDir, 'mock-flight-hours.json');
      const docPath = path.join(foundDir, 'mock-documents.json');
      const schPath = path.join(foundDir, 'mock-schedules.json');

      if (fs.existsSync(fhPath)) {
        this.flightHoursData = JSON.parse(fs.readFileSync(fhPath, 'utf8'));
      }
      if (fs.existsSync(docPath)) {
        this.documentsData = JSON.parse(fs.readFileSync(docPath, 'utf8'));
      }
      if (fs.existsSync(schPath)) {
        this.schedulesData = JSON.parse(fs.readFileSync(schPath, 'utf8'));
      }
      console.log(`Mock data loaded successfully from ${foundDir}`);
    } catch (e) {
      console.error('Failed to load mock json files', e);
    }
  }

  getFlightHoursData() {
    return this.flightHoursData;
  }

  getDocumentsData() {
    return this.documentsData;
  }

  getSchedulesData() {
    return this.schedulesData;
  }
}
