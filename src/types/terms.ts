export type TermsDocument = {
  _id?: string;
  version: string;
  content: string;
  language: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TermsResponse = {
  message: string;
  terms: TermsDocument;
};
