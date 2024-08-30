import InstagramScraper from './providers/instagram';
import { PuppeteerLaunchOptions } from 'puppeteer';
import { GenerationOptions } from './types/generationOptions';
import { InstagramPost } from './types/instagramPost';

import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import ffprobePath from '@ffprobe-installer/ffprobe';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs, { constants } from 'fs';

interface BrainrotGeneratorOptions {
    backgroundVideosDir?: string;
    puppeteerLaunchOptions?: PuppeteerLaunchOptions;
}

class BrainrotGenerator extends InstagramScraper {
    private accountsSource: string;
    private options: BrainrotGeneratorOptions;

    constructor(accountsSource: string, options?: BrainrotGeneratorOptions) {
        super(options?.puppeteerLaunchOptions)
        this.options = options || {};
        this.accountsSource = accountsSource;


        ffmpeg.setFfmpegPath(ffmpegPath.path);
        ffmpeg.setFfprobePath(ffprobePath.path);
    }

    private getRandomAccount(): string {
        if (this.accountsSource.length === 0) {
            throw new Error('accountsSource is empty');
        }
        const randomIndex = Math.floor(Math.random() * this.accountsSource.length);
        return this.accountsSource[randomIndex];
    }

    public async generateVideo(options: GenerationOptions): Promise<void> {
        try {

            let account = options.account || this.getRandomAccount()

            const posts: InstagramPost[] = await this.scrapeUsersPosts(account, options.count);

            for await (let post of posts) {
                // await this.editVideo(post.videoUrl, )
            }

        } catch (e) {
            console.log('generateVideo -> catch', e);
            throw e;
        }
    }

    private async createDirectoryIfNotExists(dir: string): Promise<string> {
        try {

            const finalPath = path.join(__dirname, dir) 

            if (!fs.existsSync(finalPath)) {
                fs.mkdirSync(finalPath, {
                    recursive: true
                })
            }
            
            return finalPath

        } catch (e) {
            throw e
        }
    }


    private async createFileIfNotExists(filename: string): Promise<string> {
        try {

            const finalPath = path.join(__dirname, filename) 

            try {
                fs.accessSync(finalPath, fs.constants.F_OK)
            } catch(e) {
                fs.writeFileSync(finalPath, '')
            }
            
            return finalPath
            
        } catch (e) {
            throw e
        }
    }

    private async deleteUnprocessedVideos(outputDir: string, list: string[]): Promise<string[]> {
        try {

            const files = fs.readdirSync(outputDir)
            
            // Determine files to delete
            const filesToDelete = files.filter(file => !list.includes(file));

            // Delete each file
            filesToDelete.forEach(file => {
                const filePath = path.join(outputDir, file);
                fs.unlinkSync(filePath);
            });

            return list

        } catch(e) {
            throw e;
        }
    }

    public async createBackgroundVideos(videoUrl: string, limit?: number) {
        try {
            const getVideosList = () => {
                const textContent: string = fs.readFileSync(listFile, 'utf-8') || ''
                const videosNames: string[] = textContent.split('\n').filter(videoName => videoName !== '')

                return videosNames
            }

            const outputDir = await this.createDirectoryIfNotExists(this.options?.backgroundVideosDir || './output/bg_videos/');
            const listFile = await this.createFileIfNotExists('./list.txt')

            const filePattern = path.join(outputDir, `bg_video_${uuidv4()}_%03d.mp4`);

            await new Promise<void>((resolve, reject) => {
    
                const outputOptions = [
                    '-map', '0',
                    '-f', 'segment',
                    '-segment_time', '58',
                    '-reset_timestamps', '1',
                    '-segment_list', listFile
                ];
    
                const ffmpegProcess = ffmpeg(videoUrl)
                    .videoFilters('crop=ih*9/8:ih')
                    .size('1080x960')
                    .outputOptions(outputOptions)
                    .audioCodec('aac') 
                    .audioBitrate('192k')
                    .output(filePattern)
                    .on('end', () => {
                        resolve()
                    })
                    .on('error', () => {})
                    .run();

                    // each time ffmpeg creates a new segment if writes to list.txt the name of the segment
                    // so we can watch for updates in that file and limit the amount of segments by killing ffmpeg process
                    if(limit) {
                        fs.watchFile(listFile, () => {
                            
                            if(getVideosList().length >= limit) {
                                // @ts-ignore
                                ffmpegProcess.kill();
                                fs.unwatchFile(listFile)

                                resolve();
                            }
                            
                        })
                    }
            });

            const videosList: string[] = getVideosList()
            this.deleteUnprocessedVideos(outputDir, videosList)
            return videosList;
    
        } catch (e) {
            throw e;
        }
    }


    // Todo: check if sourceVideo & backgroundVideo should be path / buffer or any.
    private async editVideo(sourceVideo: any, backgroundVideo: any): Promise<void> {
        try {
            return;
        } catch (e) {
            console.log('editVideo -> catch', e);
            throw e;
        }
    }

}

export default BrainrotGenerator
