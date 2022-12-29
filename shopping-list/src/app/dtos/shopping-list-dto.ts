import { ShoppingItemDto } from "./shopping-item-dto";

export interface ShoppingListDto {
	id?: string;
	name: string;
	deadline: string;
	items: ShoppingItemDto[];
};