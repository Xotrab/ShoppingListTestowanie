import { Timestamp } from "@angular/fire/firestore";
import { ShoppingItemDto } from "./shopping-item-dto";

export interface ShoppingListDto {
	id?: string;
	name: string;
	userId: string;
	deadline: Timestamp | null;
	items: ShoppingItemDto[];
};