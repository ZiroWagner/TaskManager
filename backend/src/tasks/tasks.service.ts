import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, createTaskDto: CreateTaskDto) {
        const status = createTaskDto.status || 'TODO';
        const projectId = createTaskDto.projectId;

        // Obtener el último orden para la columna específica y proyecto
        const lastTask = await this.prisma.task.findFirst({
            where: {
                userId,
                status: status as any,
                projectId: projectId || null,
            },
            orderBy: { order: 'desc' },
        });
        const newOrder = lastTask ? lastTask.order + 1 : 0;

        return this.prisma.task.create({
            data: {
                ...createTaskDto,
                status: status as any,
                userId,
                order: newOrder,
            },
        });
    }

    async findAll(userId: number, projectId?: number) {
        return this.prisma.task.findMany({
            where: {
                userId,
                ...(projectId !== undefined ? { projectId } : {}),
            },
            include: { project: true },
            orderBy: { order: 'asc' },
        });
    }

    async findOne(id: number, userId: number) {
        const task = await this.prisma.task.findFirst({
            where: { id, userId },
        });
        if (!task) throw new NotFoundException('Tarea no encontrada');
        return task;
    }

    async update(id: number, userId: number, updateTaskDto: UpdateTaskDto) {
        await this.findOne(id, userId); // Verificar existencia y propiedad
        return this.prisma.task.update({
            where: { id },
            data: updateTaskDto,
        });
    }

    async remove(id: number, userId: number) {
        await this.findOne(id, userId); // Verificar existencia y propiedad
        return this.prisma.task.delete({
            where: { id },
        });
    }
}
