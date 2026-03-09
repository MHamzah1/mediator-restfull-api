import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specification } from '../entities/specification.entity';
import { CarModel } from '../entities/car-model.entity';
import { CreateSpecificationDto } from './dto/create-specification.dto';
import { UpdateSpecificationDto } from './dto/update-specification.dto';
import { QuerySpecificationDto } from './dto/query-specification.dto';

@Injectable()
export class SpecificationService {
  constructor(
    @InjectRepository(Specification)
    private specificationRepository: Repository<Specification>,
    @InjectRepository(CarModel)
    private carModelRepository: Repository<CarModel>,
  ) {}

  async create(
    createSpecificationDto: CreateSpecificationDto,
  ): Promise<{ message: string; data: Specification }> {
    // Cek apakah car model exists
    const carModel = await this.carModelRepository.findOne({
      where: { id: createSpecificationDto.modelId },
    });

    if (!carModel) {
      throw new NotFoundException('Model mobil tidak ditemukan');
    }

    const specification = this.specificationRepository.create(
      createSpecificationDto,
    );
    const savedSpecification =
      await this.specificationRepository.save(specification);

    return {
      message: 'Spesifikasi berhasil dibuat',
      data: savedSpecification,
    };
  }

  async findAll(queryDto: QuerySpecificationDto) {
    const {
      page = 1,
      pageSize = 10,
      modelId,
      search,
      sortBy = 'createdAt',
      sortDirection = 'DESC',
    } = queryDto;

    const queryBuilder =
      this.specificationRepository.createQueryBuilder('specification');

    // Join dengan car model
    queryBuilder.leftJoinAndSelect('specification.carModel', 'carModel');

    // Filter berdasarkan modelId
    if (modelId) {
      queryBuilder.andWhere('specification.modelId = :modelId', { modelId });
    }

    // Filter berdasarkan search (spec name atau spec value)
    if (search) {
      queryBuilder.andWhere(
        '(specification.specName ILIKE :search OR specification.specValue ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    // Sorting
    const orderField = sortBy === 'name' ? 'specName' : 'createdAt';
    queryBuilder.orderBy(`specification.${orderField}`, sortDirection);

    // Pagination
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    // Format response dengan modelName
    const formattedData = data.map((spec) => ({
      id: spec.id,
      modelId: spec.modelId,
      modelName: spec.carModel?.modelName || null,
      specName: spec.specName,
      specCategory: spec.specCategory,
      specValue: spec.specValue,
      specUnit: spec.specUnit,
      description: spec.description,
      isActive: spec.isActive,
      createdAt: spec.createdAt,
      updatedAt: spec.updatedAt,
    }));

    return {
      data: formattedData,
      pagination: {
        page,
        pageSize,
        totalRecords: total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string): Promise<Specification> {
    const specification = await this.specificationRepository.findOne({
      where: { id },
      relations: ['carModel'],
    });

    if (!specification) {
      throw new NotFoundException('Spesifikasi tidak ditemukan');
    }

    return specification;
  }

  async update(
    id: string,
    updateSpecificationDto: UpdateSpecificationDto,
  ): Promise<Specification> {
    const specification = await this.specificationRepository.findOne({
      where: { id },
    });

    if (!specification) {
      throw new NotFoundException('Spesifikasi tidak ditemukan');
    }

    // Jika modelId diubah, cek apakah model baru exists
    if (
      updateSpecificationDto.modelId &&
      updateSpecificationDto.modelId !== specification.modelId
    ) {
      const carModel = await this.carModelRepository.findOne({
        where: { id: updateSpecificationDto.modelId },
      });

      if (!carModel) {
        throw new NotFoundException('Model mobil tidak ditemukan');
      }
    }

    Object.assign(specification, updateSpecificationDto);
    return this.specificationRepository.save(specification);
  }

  async remove(id: string): Promise<{ message: string }> {
    const specification = await this.specificationRepository.findOne({
      where: { id },
    });

    if (!specification) {
      throw new NotFoundException('Spesifikasi tidak ditemukan');
    }

    await this.specificationRepository.delete(id);
    return { message: 'Spesifikasi berhasil dihapus' };
  }
}
