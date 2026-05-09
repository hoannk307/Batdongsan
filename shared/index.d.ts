export interface SelectOption {
  id: number | string;
  name: string;
}

export declare const ROOMS_OPTIONS: SelectOption[];
export declare const BATH_OPTIONS: SelectOption[];
export declare const BED_OPTIONS: SelectOption[];
export declare const PRICE_OPTIONS: SelectOption[];
export declare const RENT_PRICE_OPTIONS: SelectOption[];
export declare const SQUARE_FEET_OPTIONS: SelectOption[];

export declare const PROPERTY_STATUS: {
  readonly FOR_SALE: "FOR_SALE";
  readonly FOR_RENT: "FOR_RENT";
  readonly SOLD: "SOLD";
  readonly RENTED: "RENTED";
};

export declare const PROPERTY_STATUS_OPTIONS: SelectOption[];
