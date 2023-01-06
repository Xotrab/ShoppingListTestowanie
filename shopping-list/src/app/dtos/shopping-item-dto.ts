import { ImageDataDto } from "./image-data-dto";

export interface ShoppingItemDto {
	name: string;
	quantity: number | null;
	unit: string;
	imageData: ImageDataDto | null;
	purchased: boolean;	
};

export const COMMONLY_USED_ITEMS = [
    "bread",
    "milk",
    "water",
    "cheese",
    "rice",
    "onion",
    "ham"
];

export const DEFAULT_UNITS = [
    "kg",
    "g",
    "dkg",
    "packet",
    "l",
    "ml",
    "pieces"
];