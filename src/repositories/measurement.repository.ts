import { AppDataSource } from "../database/config";
import { Measurement } from "../entity/measurement.entity";

export const MeasurementRepository = AppDataSource.getRepository(Measurement).extend({
    async findByUserId(userId: string): Promise<Measurement[]> {
        return await this.find({
            where: { userId: userId }
        });
    },
});