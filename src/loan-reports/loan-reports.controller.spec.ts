import { Test, TestingModule } from '@nestjs/testing'
import { LoanReportsController } from './loan-reports.controller'
import { LoanReportsService } from './loan-reports.service'
import { DataSource, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Loan } from 'src/loans/entities/loan.entity'
import { MockType, dataSourceMockFactory } from '../../../../test/mocks/data-source.mock'

describe('LoanReportsController', () => {
  let controller: LoanReportsController
  let repository: Repository<Loan>
  let reportServices: LoanReportsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoanReportsController],
      providers: [
        LoanReportsService,
        { provide: getRepositoryToken(Loan), useClass: Repository },
        { provide: DataSource, useFactory: dataSourceMockFactory },
      ],
    }).compile()

    controller = module.get<LoanReportsController>(LoanReportsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
