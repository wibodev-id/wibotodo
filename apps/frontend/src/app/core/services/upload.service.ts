import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/uploads`;

  upload(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<UploadResponse>(this.api, fd);
  }

  imageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl}${path}`;
  }
}
