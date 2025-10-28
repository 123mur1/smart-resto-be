import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { InfrastructureService } from "src/share/infrastructure/infrastructure.service";

import { CreateMealDto } from "./dto/create-meal.dto";
import { QueryMealDto } from "./dto/query-meal.dto";
import { UpdateMealDto } from "./dto/update-meal.dto";

@Injectable()
export class MealService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly infrastructureService: InfrastructureService
  ) {}
  async create(createMealDto: CreateMealDto, userId: string) {
    const meal = await this.prisma.meal.create({
      data: { ...createMealDto, user: { connect: { id: userId } } },
      select: {
        id: true,
        meal_type: true,
        status: true,
        price: true,
        created_at: true,
        user_id: true,
      },
    });
    return {
      status: true,
      message: "Meal created successfully",
      meal: meal,
    };
  }

  async findAll(
    query: QueryMealDto & {
      page?: number;
      limit?: number;
      sort?: string;
      order?: string;
    }
  ) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.meal_type) where.meal_type = query.meal_type;
    if (query.status) where.status = query.status;
    if (typeof query.price !== "undefined") where.price = query.price;
    if (query.user_id) where.user_id = query.user_id;

    // whitelist sortable fields to avoid injection / invalid columns
    const allowedSortFields = [
      "created_at",
      "price",
      "meal_type",
      "status",
      "updated_at",
    ];
    const sortField = allowedSortFields.includes(query.sort || "")
      ? query.sort!
      : "created_at";
    const sortOrder =
      (query.order || "desc").toLowerCase() === "asc" ? "asc" : "desc";

    const [meals, total] = await this.prisma.$transaction([
      this.prisma.meal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        select: {
          id: true,
          meal_type: true,
          status: true,
          price: true,
          created_at: true,
          user_id: true,
        },
      }),
      this.prisma.meal.count({ where }),
    ]);

    const meta = this.infrastructureService.generatePaginationMeta?.(
      total,
      page,
      limit,
      "/meal"
    ) ?? {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };

    return {
      status: true,
      message: "Meals retrieved successfully",
      meals,
      meta,
    };
  }

  async findOne(id: string) {
    await this.infrastructureService.checkRecordExists("meal", id);
    const meal = await this.prisma.meal.findUnique({
      where: { id: id },
    });
    return {
      status: true,
      message: "Meal retrieved successfully",
      meal,
    };
  }

  async update(id: string, updateMealDto: UpdateMealDto) {
    await this.infrastructureService.checkRecordExists("meal", id);
    const meal = await this.prisma.meal.update({
      where: { id: id },
      data: updateMealDto,
    });
    return {
      status: true,
      message: "Meal updated successfully",
      meal,
    };
  }

  async remove(id: string) {
    await this.infrastructureService.checkRecordExists("meal", id);
    const meal = await this.prisma.meal.delete({
      where: { id: id },
    });
    return {
      status: true,
      message: "Meal deleted successfully",
      meal,
    };
  }
}
