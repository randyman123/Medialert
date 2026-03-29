import { Test, TestingModule } from '@nestjs/testing';
import { CentrosMedicosController } from './centros-medicos.controller';
import { CentrosMedicosService } from './centros-medicos.service';

describe('CentrosMedicosController', () => {
  let controller: CentrosMedicosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CentrosMedicosController],
      providers: [CentrosMedicosService],
    }).compile();

    controller = module.get<CentrosMedicosController>(CentrosMedicosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
