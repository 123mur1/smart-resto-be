import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { InfrastructureService } from "src/share/infrastructure/infrastructure.service";

import { CreateMealDto } from "./dto/create-meal.dto";
import { UpdateMealDto } from "./dto/update-meal.dto";

@Injectable()
export class MealService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly infrastructureService: InfrastructureService
  ) {}
  create(createMealDto: CreateMealDto) {
    const meal = this.prisma.meal.create({
      data: createMealDto,
    });
    return {
      status: true,
      message: "Meal created successfully",
      meal,
    };
  }

  findAll() {
    const meals = this.prisma.meal.findMany();
    return {
      status: true,
      message: "Meals retrieved successfully",
      meals,
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
