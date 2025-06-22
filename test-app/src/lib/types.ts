export interface Headers {
  Authorization?: string;
  'Content-Type'?: string;
  [key: string]: string | undefined;
}

export interface RequestOptions {
  method?: string;
  headers?: Headers;
  body?: string;
}
