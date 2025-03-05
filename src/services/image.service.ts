import { Repository } from 'typeorm';
import Image from '../entity/image.entity';
import { plainToClass } from 'class-transformer';
import { ImageRepository } from '../repositories/image.repository';

export class ImageService {
    private readonly imageRepository: Repository<Image>;

    constructor() {
        this.imageRepository = ImageRepository;
    }

    async create(imageData: Partial<Image>): Promise<Image> {
        const image = this.imageRepository.create(imageData);
        return this.imageRepository.save(image);
    }

    async findAll(): Promise<Image[]> {
        return this.imageRepository.find();
    }

    async findOne(id: string): Promise<Image | null> {
        return this.imageRepository.findOne({ where: { image_id: id } });
    }

    async update(id: string, imageData: Partial<Image>): Promise<Image | null> {
        await this.imageRepository.update({ image_id: id }, imageData);
        return this.imageRepository.findOne({ where: { image_id: id } });
    }

    async remove(id: string): Promise<void> {
        await this.imageRepository.delete(id);
    }
}