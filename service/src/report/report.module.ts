import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportSchema, Report } from './report.schema';
import { InstanceModule } from '@/instance/instance.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    InstanceModule
  ],
  controllers: [ReportController],
  providers: [ReportService]
})
export class ReportModule {}
