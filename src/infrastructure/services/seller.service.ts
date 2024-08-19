import {Seller} from '../../core/entity/seller.model';
import { SellerRepository } from '../repositories/sellerRepository';
import { CreateSellerDto } from '../dto/CreateSellerDTO';

export class SellerService {

    async createSeller(createSellerDto: CreateSellerDto): Promise<Seller> {
        const sellerData: Partial<Seller> = {
            email: createSellerDto.email,
            store_name: createSellerDto.store_name,
            store_description: createSellerDto.store_description,
            store_logo: createSellerDto.store_logo,
        };
        return await SellerRepository.save(sellerData)

        // return await SellerRepository.createAndSave(sellerData);
    }

    async fetchSellers(): Promise<Seller[]> {
        return await SellerRepository.find();
    }
}
