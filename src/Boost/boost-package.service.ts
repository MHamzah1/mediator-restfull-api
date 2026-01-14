import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoostPackage } from '../entities/boost-package.entity';
import {
  CreateBoostPackageDto,
  UpdateBoostPackageDto,
} from './dto';

@Injectable()
export class BoostPackageService {
  constructor(
    @InjectRepository(BoostPackage)
    private boostPackageRepository: Repository<BoostPackage>,
  ) {}

  async create(createDto: CreateBoostPackageDto): Promise<BoostPackage> {
    // Check if package name already exists
    const existing = await this.boostPackageRepository.findOne({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException('Nama paket sudah digunakan');
    }

    const boostPackage = this.boostPackageRepository.create(createDto);
    return this.boostPackageRepository.save(boostPackage);
  }

  async findAll(includeInactive = false): Promise<BoostPackage[]> {
    const whereCondition = includeInactive ? {} : { isActive: true };
    
    return this.boostPackageRepository.find({
      where: whereCondition,
      order: { sortOrder: 'ASC', price: 'ASC' },
    });
  }

  async findOne(id: string): Promise<BoostPackage> {
    const boostPackage = await this.boostPackageRepository.findOne({
      where: { id },
    });

    if (!boostPackage) {
      throw new NotFoundException('Paket boost tidak ditemukan');
    }

    return boostPackage;
  }

  async update(id: string, updateDto: UpdateBoostPackageDto): Promise<BoostPackage> {
    const boostPackage = await this.findOne(id);

    // Check name uniqueness if name is being updated
    if (updateDto.name && updateDto.name !== boostPackage.name) {
      const existing = await this.boostPackageRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existing) {
        throw new ConflictException('Nama paket sudah digunakan');
      }
    }

    Object.assign(boostPackage, updateDto);
    return this.boostPackageRepository.save(boostPackage);
  }

  async remove(id: string): Promise<void> {
    const boostPackage = await this.findOne(id);
    await this.boostPackageRepository.remove(boostPackage);
  }

  async seedDefaultPackages(): Promise<void> {
    const count = await this.boostPackageRepository.count();
    
    if (count > 0) {
      return; // Already seeded
    }

    const defaultPackages = [
      {
        name: 'Basic',
        price: 17000,
        durationDays: 3,
        estimatedReachMin: 6144,
        estimatedReachMax: 17757,
        priorityScore: 10,
        description: 'Paket dasar untuk mulai meningkatkan jangkauan',
        sortOrder: 1,
      },
      {
        name: 'Standard',
        price: 34000,
        durationDays: 3,
        estimatedReachMin: 12289,
        estimatedReachMax: 35514,
        priorityScore: 20,
        description: 'Paket standar dengan jangkauan 2x lipat',
        sortOrder: 2,
      },
      {
        name: 'Premium',
        price: 60000,
        durationDays: 3,
        estimatedReachMin: 21686,
        estimatedReachMax: 62673,
        priorityScore: 30,
        description: 'Paket premium untuk jangkauan maksimal',
        sortOrder: 3,
      },
      {
        name: 'Pro',
        price: 70000,
        durationDays: 3,
        estimatedReachMin: 25300,
        estimatedReachMax: 73118,
        priorityScore: 40,
        description: 'Paket profesional untuk seller serius',
        sortOrder: 4,
      },
      {
        name: 'Ultimate',
        price: 90000,
        durationDays: 3,
        estimatedReachMin: 32529,
        estimatedReachMax: 94009,
        priorityScore: 50,
        description: 'Paket ultimate dengan prioritas tertinggi',
        sortOrder: 5,
      },
    ];

    for (const pkg of defaultPackages) {
      const boostPackage = this.boostPackageRepository.create(pkg);
      await this.boostPackageRepository.save(boostPackage);
    }
  }
}
