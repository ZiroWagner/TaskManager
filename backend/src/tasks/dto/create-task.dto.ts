import { IsNotEmpty, IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

export class CreateTaskDto {
    @ApiProperty({ example: 'Comprar leche' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ example: 'Ir al supermercado a comprar leche', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ enum: TaskStatus, default: TaskStatus.TODO, required: false })
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;
}
