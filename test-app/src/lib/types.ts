export interface Headers {
  Authorization?: string;
  'Content-Type'?: string;
}

export interface RequestOptions {
  method?: string;
  headers?: Headers;
  body?: string;
}
