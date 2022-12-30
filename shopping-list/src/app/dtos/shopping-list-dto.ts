import { ShoppingItemDto } from "./shopping-item-dto";

export interface ShoppingListDto {
	id?: string;
	name: string;
	userId: string;
	deadline: string;
	items: ShoppingItemDto[];
};