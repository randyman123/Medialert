import { Test, TestingModule } from '@nestjs/testing';
import { BloquesHorariosController } from './bloques-horarios.controller';
import { BloquesHorariosService } from './bloques-horarios.service';

describe('BloquesHorariosController', () => {
  let controller: BloquesHorariosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BloquesHorariosController],
      providers: [BloquesHorariosService],
    }).compile();

    controller = module.get<BloquesHorariosController>(BloquesHorariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
