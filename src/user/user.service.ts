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
  async create(createUserDto: CreateUserDto, id?: any) {
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
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at,
      },
    };
  }

  async findAll(
    query?: QueryUserDto & {
      page?: number;
      limit?: number;
      sort?: string;
      order?: string;
    }
  ) {
    try {
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

      const page = Math.max(Number(query?.page ?? 1), 1);
      const limit = Math.min(Math.max(Number(query?.limit ?? 10), 1), 100);
      const skip = (page - 1) * limit;

      // whitelist sortable fields
      const allowedSortFields = [
        "created_at",
        "email",
        "first_name",
        "last_name",
        "role",
      ];
      const sortField = allowedSortFields.includes(query?.sort || "")
        ? query!.sort!
        : "created_at";
      const sortOrder =
        (query?.order || "desc").toLowerCase() === "asc" ? "asc" : "desc";

      const [users, total] = await this.prisma.$transaction([
        this.prisma.user.findMany({
          where: Object.keys(where).length ? where : undefined,
          skip,
          take: limit,
          orderBy: { [sortField]: sortOrder },
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            created_at: true,
          },
        }),
        this.prisma.user.count({
          where: Object.keys(where).length ? where : undefined,
        }),
      ]);

      const meta = this.infrastructureService.generatePaginationMeta?.(
        total,
        page,
        limit,
        "/user"
      ) ?? {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };

      if (total === 0) {
        return {
          status: false,
          message: "No users found",
          users: [],
          meta,
        };
      }

      return {
        status: true,
        message: "Users fetched successfully",
        users,
        meta,
      };
    } catch (error) {
      console.error(error);
      throw new ConflictException("Error fetching users");
    }
  }

  async findOne(id: string) {
    try {
      await this.infrastructureService.checkRecordExists("user", id);
      const user = await this.prisma.user.findUnique({
        where: { id: id },
        select: {
          id: true,
          fullName: true,
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
    } catch (error) {
      throw new ConflictException("Error fetching user");
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      await this.infrastructureService.checkRecordExists("user", id);
      if (updateUserDto.password) {
        if (updateUserDto.password.length < 60) {
          const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
          updateUserDto.password = hashedPassword;
        }
      }
      const user = await this.prisma.user.update({
        where: { id: id },
        data: updateUserDto,
        select: {
          id: true,
          fullName: true,
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
    } catch (error) {
      throw new ConflictException("Error updating user");
    }
  }

  async remove(id: string) {
    try {
      await this.infrastructureService.checkRecordExists("user", id);
      const user = await this.prisma.user.delete({
        where: { id: id },
      });
      return {
        status: true,
        message: "User deleted successfully",
        user: user,
      };
    } catch (error) {
      throw new ConflictException("Error deleting user");
    }
  }
}
