export type AboutAppContent = {
  _id?: string;
  content: string;
  language?: string;
  platform?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type GetAboutAppResponse = {
  content?: AboutAppContent;
  data?: AboutAppContent;
  message?: string;
  success?: boolean;
  statusCode?: number;
};

export type CreateAboutAppResponse = {
  aboutApp?: AboutAppContent;
  content?: AboutAppContent;
  data?: AboutAppContent;
  message?: string;
  success?: boolean;
  statusCode?: number;
};
