import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { CreateMealDto } from "./dto/create-meal.dto";
import { UpdateMealDto } from "./dto/update-meal.dto";
import { MealService } from "./meal.service";

@ApiTags("Meals")
@Controller("meal")
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Post()
  @ApiOperation({ summary: "Create a new meal" })
  @ApiBody({ type: CreateMealDto })
  @ApiCreatedResponse({ description: "Meal created successfully" })
  @ApiBadRequestResponse({ description: "Invalid input data" })
  create(@Body() createMealDto: CreateMealDto) {
    return this.mealService.create(createMealDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all meals" })
  @ApiOkResponse({ description: "List of meals returned" })
  findAll() {
    return this.mealService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a meal by id" })
  @ApiOkResponse({ description: "Meal returned" })
  @ApiNotFoundResponse({ description: "Meal not found" })
  findOne(@Param("id") id: string) {
    return this.mealService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a meal" })
  @ApiBody({ type: UpdateMealDto })
  @ApiOkResponse({ description: "Meal updated successfully" })
  @ApiBadRequestResponse({ description: "Invalid update data" })
  update(@Param("id") id: string, @Body() updateMealDto: UpdateMealDto) {
    return this.mealService.update(id, updateMealDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a meal" })
  @ApiOkResponse({ description: "Meal deleted successfully" })
  @ApiNotFoundResponse({ description: "Meal not found" })
  remove(@Param("id") id: string) {
    return this.mealService.remove(id);
  }
}
