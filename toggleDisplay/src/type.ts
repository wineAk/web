export type selectorElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLLIElement | null;

export type source = {
  selector: string;
  values?: string[];
};

export type target = {
  selector: string;
  required?: boolean;
};

export type toggleDisplay = {
  source: source;
  targets: target[];
};