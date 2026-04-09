export interface Article {
  SK: string;
  Title: string;
  Description?: string; 
  Picture?: string | null;
  Status: 'active' | 'draft';
  Created_At?: string;
  isDetailFetched?: boolean; 
}