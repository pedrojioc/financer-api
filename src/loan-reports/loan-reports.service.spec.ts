import { Test, TestingModule } from '@nestjs/testing'
import { LoanReportsService } from './loan-reports.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Loan } from 'src/loans/entities/loan.entity'
import { dataSourceMockFactory } from '../../../../test/mocks/data-source.mock'

describe('LoanReportsService', () => {
  let service: LoanReportsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanReportsService,
        { provide: getRepositoryToken(Loan), useClass: Repository },
        { provide: DataSource, useFactory: dataSourceMockFactory },
      ],
    }).compile()

    service = module.get<LoanReportsService>(LoanReportsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
