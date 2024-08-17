import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory } from '../../core/entity/product_category.model';
import { ProductColors as Colour } from'../../core/entity/color.model';
import { Seller } from'../../core/entity/seller.model';
import { Tag } from'../../core/entity/tags.model';
import { ProductAttribute } from'../../core/entity/product_attribute.model';
import { ProductItem } from'../../core/entity/product_item.model';

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsString()
    listed_size: string;

    @IsNotEmpty()
    @IsString()
    brand: string;

    @IsNotEmpty()
    @IsString()
    gender: string;

    @ValidateNested()
    @Type(() =>ProductCategory)
    product_category: ProductCategory;

    @ValidateNested()
    @Type(() =>Colour)
    primaryColor: Colour;

    @ValidateNested()
    @Type(() =>Colour)
    secondaryColor: Colour;

    @ValidateNested()
    @Type(() =>Seller)
    seller: Seller;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() =>Tag)
    tags: Tag[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() =>ProductAttribute)
    attributes: ProductAttribute[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() =>ProductItem)
    items: ProductItem[];
}
