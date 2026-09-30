export interface Photo {
  readonly id: string;
  readonly thumbUrl: string;
  readonly url: string;
  readonly largeUrl: string;
  readonly width: number | null;
  readonly height: number | null;
  readonly license: string;
  readonly attribution: string;
}
