import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './entities/category.entity';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });
    if (existCategory) {
      throw new InternalServerErrorException('Name already taken');
    }
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  findAll() {
    return this.categoryRepository.find();
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const existCategory = await this.categoryRepository.findOne({
      where: { id },
    });
    if (existCategory) {
      throw new InternalServerErrorException('Category not found!');
    }
    const category = await this.categoryRepository.update(
      id,
      updateCategoryDto,
    );
    return category;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.categoryRepository.delete(id);
    return { message: 'Category deleted' };
  }
}
