import { Test, TestingModule } from '@nestjs/testing';
import { CentrosMedicosService } from './centros-medicos.service';

describe('CentrosMedicosService', () => {
  let service: CentrosMedicosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CentrosMedicosService],
    }).compile();

    service = module.get<CentrosMedicosService>(CentrosMedicosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
