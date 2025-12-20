// src/user/user.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/createUserDto';
import { UpdateUserDto } from './dto/updateUserDto';
import { QueryUserDto } from './dto/queryUserDto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const user = this.usersRepository.create({
      ...createUserDto,
    });

    return this.usersRepository.save(user);
  }

  // Helper untuk menghitung date range berdasarkan periode
  private getDateRangeFromPeriode(periode: string): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (periode) {
      case 'Today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'ThisWeek':
        const firstDayOfWeek = now.getDate() - now.getDay();
        startDate.setDate(firstDayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'LastWeek':
        const firstDayOfLastWeek = now.getDate() - now.getDay() - 7;
        const lastDayOfLastWeek = firstDayOfLastWeek + 6;
        startDate.setDate(firstDayOfLastWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(lastDayOfLastWeek);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'ThisMonth':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(endDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'LastMonth':
        startDate.setMonth(startDate.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(endDate.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'ThisYear':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'LastYear':
        startDate.setFullYear(startDate.getFullYear() - 1, 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setFullYear(endDate.getFullYear() - 1, 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'Last3Months':
        startDate.setMonth(startDate.getMonth() - 3);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'Last6Months':
        startDate.setMonth(startDate.getMonth() - 6);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      default:
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  }

  async findAll(queryDto: QueryUserDto) {
    const {
      page = 1,
      perPage = 10,
      search,
      orderBy = 'createdAt',
      sortDirection = 'DESC',
      role,
      startDate,
      endDate,
      periode,
    } = queryDto;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Select fields tanpa password (TAMBAHKAN whatsappNumber dan location)
    queryBuilder.select([
      'user.id',
      'user.email',
      'user.fullName',
      'user.phoneNumber',
      'user.whatsappNumber',
      'user.location',
      'user.role',
      'user.createdAt',
      'user.updatedAt',
    ]);

    // Filter berdasarkan search (nama atau email)
    if (search) {
      queryBuilder.andWhere(
        '(user.fullName LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter berdasarkan role
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // Filter berdasarkan periode
    if (periode) {
      const { startDate: periodStart, endDate: periodEnd } =
        this.getDateRangeFromPeriode(periode);
      queryBuilder.andWhere(
        'user.createdAt BETWEEN :periodStart AND :periodEnd',
        {
          periodStart,
          periodEnd,
        },
      );
    }
    // Filter berdasarkan startDate dan endDate manual
    else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      queryBuilder.andWhere('user.createdAt BETWEEN :start AND :end', {
        start,
        end,
      });
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      queryBuilder.andWhere('user.createdAt >= :start', { start });
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('user.createdAt <= :end', { end });
    }

    // Sorting
    const validOrderFields = ['createdAt', 'updatedAt', 'fullName', 'email'];
    const orderField = validOrderFields.includes(orderBy)
      ? orderBy
      : 'createdAt';
    queryBuilder.orderBy(`user.${orderField}`, sortDirection);

    // Pagination
    const skip = (page - 1) * perPage;
    queryBuilder.skip(skip).take(perPage);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      perPage,
      lastPage: Math.ceil(total / perPage),
    };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'fullName',
        'phoneNumber',
        'whatsappNumber',
        'location',
        'role',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Cek email duplikat jika email diupdate
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email sudah digunakan');
      }
    }

    // Hash password jika diupdate
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    // Return tanpa password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = updatedUser;
    return result as User;
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    await this.usersRepository.delete(id);
    return { message: 'User berhasil dihapus' };
  }
}
