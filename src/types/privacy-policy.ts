import type { ApiResponse } from ".";

export type PrivacyPolicyDocument = {
  _id?: string;
  content: string;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PrivacyPolicyResponse = ApiResponse<{
  privacyPolicy: PrivacyPolicyDocument;
}>;
