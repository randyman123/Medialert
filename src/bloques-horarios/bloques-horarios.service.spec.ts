import { Test, TestingModule } from '@nestjs/testing';
import { BloquesHorariosService } from './bloques-horarios.service';

describe('BloquesHorariosService', () => {
  let service: BloquesHorariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BloquesHorariosService],
    }).compile();

    service = module.get<BloquesHorariosService>(BloquesHorariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
