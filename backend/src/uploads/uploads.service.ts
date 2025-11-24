import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
    private readonly uploadsDir = path.join(__dirname, '..', '..', '..', 'uploads');

    constructor() {
        this.ensureDirectoryExists(path.join(this.uploadsDir, 'avatars'));
        this.ensureDirectoryExists(path.join(this.uploadsDir, 'attachments'));
    }

    private ensureDirectoryExists(dirPath: string) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    async saveAvatar(file: Express.Multer.File): Promise<string> {
        const filename = `avatar-${uuidv4()}.webp`;
        const filepath = path.join(this.uploadsDir, 'avatars', filename);

        await sharp(file.buffer)
            .resize(256, 256, { fit: 'cover' })
            .toFormat('webp')
            .toFile(filepath);

        return `/uploads/avatars/${filename}`;
    }

    private sanitizeName(name: string): string {
        return name.replace(/[^a-z0-9\-_]/gi, '_').toLowerCase();
    }

    async saveAttachment(file: Express.Multer.File, pathSegments: string[] = []): Promise<{ url: string; type: string; filename: string }> {
        const isImage = file.mimetype.startsWith('image/');
        const filename = `${uuidv4()}-${file.originalname}`;

        // Construct path: uploads/attachments/{userId}/{project}/{task}/filename
        const sanitizedSegments = pathSegments.map(s => this.sanitizeName(s));
        const relativeDir = path.join('attachments', ...sanitizedSegments);
        const absoluteDir = path.join(this.uploadsDir, relativeDir);

        this.ensureDirectoryExists(absoluteDir);

        const filepath = path.join(absoluteDir, filename);

        if (isImage) {
            // Optional: Optimize attachments too? For now, just save.
            fs.writeFileSync(filepath, file.buffer);
        } else {
            fs.writeFileSync(filepath, file.buffer);
        }

        // URL needs forward slashes regardless of OS
        const urlPath = ['uploads', 'attachments', ...sanitizedSegments, filename].join('/');

        return {
            url: `/${urlPath}`,
            type: isImage ? 'IMAGE' : 'FILE',
            filename: file.originalname,
        };
    }

    async deleteFile(fileUrl: string) {
        try {
            // fileUrl is like /uploads/avatars/filename.webp
            // We need to resolve it to the absolute path
            // uploadsDir is .../uploads
            // So we strip /uploads from the start of fileUrl
            const relativePath = fileUrl.replace(/^\/uploads\//, '');
            const fullPath = path.join(this.uploadsDir, relativePath);

            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        } catch (error) {
            console.error(`Error deleting file ${fileUrl}:`, error);
        }
    }

    async deleteFolder(pathSegments: string[]) {
        try {
            const sanitizedSegments = pathSegments.map(s => this.sanitizeName(s));
            const relativeDir = path.join('attachments', ...sanitizedSegments);
            const fullPath = path.join(this.uploadsDir, relativeDir);

            if (fs.existsSync(fullPath)) {
                fs.rmSync(fullPath, { recursive: true, force: true });
            }
        } catch (error) {
            console.error(`Error deleting folder ${pathSegments.join('/')}:`, error);
        }
    }
}
