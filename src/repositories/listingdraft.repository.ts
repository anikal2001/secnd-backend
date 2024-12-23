import { AppDataSource } from '../database/config';
import { ListingDraft } from '../entity/product.entity';


export const ListingDraftRepository = AppDataSource.getRepository(ListingDraft).extend({
    
    async saveDraft(userId: string, draftData: Partial<ListingDraft>): Promise<ListingDraft> {
    
        let draft = await this.findOne({ where: { seller: {user_id: userId}} });

        if (!draft) {
            draft = this.create({ seller: { user_id: userId }, ...draftData });
        } else {
            Object.assign(draft, draftData);
        }

        return this.save(draft);
    },
});
