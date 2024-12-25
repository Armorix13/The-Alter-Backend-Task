export type ShortenURLRequest = {
  longUrl: string;
  customAlias?: string;
  topic?: string;
};

export type RedirectToOrignalURLRequest = {
    shortId: string;
};
