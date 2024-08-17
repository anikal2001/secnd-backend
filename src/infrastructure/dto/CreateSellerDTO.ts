import { IsNotEmpty, IsString } from'class-validator';

export class CreateSellerDto {
    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    store_name: string;

    @IsString()
    store_description: string;

    @IsString()
    store_logo: string;
}
