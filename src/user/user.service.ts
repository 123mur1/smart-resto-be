import { ConflictException, Injectable } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { PrismaService } from "src/prisma/prisma.service";
import { InfrastructureService } from "src/share/infrastructure/infrastructure.service";

import { CreateUserDto } from "./dto/create-user.dto";
import { QueryUserDto } from "./dto/query-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly infrastructureService: InfrastructureService
  ) {}
  async create(createUserDto: CreateUserDto) {
    await this.infrastructureService.checkDuplicate("user", [
      { property: "email", value: createUserDto.email },
      { property: "phone", value: createUserDto.phone },
    ]);
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
    return {
      status: true,
      message: "User created successfully",
      user: {
        id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at,
      },
    };
  }

  async findAll(query?: QueryUserDto) {
    const where: Record<string, any> = {};
    if (query?.id) {
      where.id = {
        contains: query.id,
        mode: "insensitive",
      };
    }
    if (query?.email) {
      where.email = {
        contains: query.email,
        mode: "insensitive",
      };
    }
    if (query?.fullName) {
      where.fullName = {
        contains: query.fullName,
        mode: "insensitive",
      };
    }
    if (query?.phone) {
      where.phone = {
        contains: query.phone,
        mode: "insensitive",
      };
    }
    if (query?.role) {
      where.role = {
        equals: query.role,
      };
    }
    const users = await this.prisma.user.findMany({
      where: Object.keys(where).length ? where : undefined,
      select: {
        user_id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        role: true,
        created_at: true,
      },
    });

    if (users.length === 0) {
      return {
        status: false,
        message: "No users found",
        users: [],
      };
    }
    return {
      status: true,
      message: "Users fetched successfully",
      users,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: id },
      select: {
        user_id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        role: true,
        created_at: true,
      },
    });
    return {
      status: true,
      message: "User fetched successfully",
      user: user,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      if (updateUserDto.password.length < 60) {
        const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
        updateUserDto.password = hashedPassword;
      }
    }
    const user = await this.prisma.user.update({
      where: { user_id: id },
      data: updateUserDto,
      select: {
        user_id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        role: true,
        created_at: true,
      },
    });
    return {
      status: true,
      message: "User updated successfully",
      user: user,
    };
  }

  async remove(id: string) {
    const user = await this.prisma.user.delete({
      where: { user_id: id },
    });
    return {
      status: true,
      message: "User deleted successfully",
      user: user,
    };
  }
}
