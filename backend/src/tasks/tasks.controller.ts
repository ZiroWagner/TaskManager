import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva tarea' })
    create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
        return this.tasksService.create(req.user.userId, createTaskDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las tareas del usuario' })
    findAll(@Request() req) {
        return this.tasksService.findAll(req.user.userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una tarea por ID' })
    findOne(@Request() req, @Param('id') id: string) {
        return this.tasksService.findOne(+id, req.user.userId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una tarea' })
    update(@Request() req, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.tasksService.update(+id, req.user.userId, updateTaskDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una tarea' })
    remove(@Request() req, @Param('id') id: string) {
        return this.tasksService.remove(+id, req.user.userId);
    }
}
