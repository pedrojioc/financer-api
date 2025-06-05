import { Controller, Get } from '@nestjs/common'
import { GendersService } from './genders.service'

@Controller('genders')
export class GendersController {
  constructor(private readonly genderService: GendersService) {}

  @Get()
  findAll() {
    return this.genderService.findAll()
  }
}
