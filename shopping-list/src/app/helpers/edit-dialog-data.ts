import { ShoppingItemDto } from "../dtos/shopping-item-dto";

export interface EditDialogData {
    listId: string;
    itemIndex: number;
    item: ShoppingItemDto;
}