import { Repository } from "typeorm";
import { ListingDraft } from "../entity/product.entity";
import { ListingDraftRepository } from "../repositories/listingdraft.repository";
import { plainToClass } from "class-transformer";
export class ListingDraftService {
    async saveDraft(userId: string, body: ListingDraft): Promise<ListingDraft> {
        const draftData = plainToClass(ListingDraft, body);    
        const draft = await ListingDraftRepository.saveDraft(userId, draftData);
        return draft;
    }
}