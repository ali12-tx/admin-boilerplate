export type PrivacyPolicyDocument = {
  _id?: string;
  content: string;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PrivacyPolicyResponse = {
  message: string;
  privacyPolicy: PrivacyPolicyDocument;
};
