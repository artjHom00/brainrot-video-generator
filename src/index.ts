import InstagramScraper from './providers/instagram';
import { GenerationOptions } from './types/generationOptions';
import { ShortsGeneratorOptions } from './types/shortsGeneratorOptions';


import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import ffprobePath from '@ffprobe-installer/ffprobe';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import extractUUID from './utils/extractUUID';


/**
 * @export
 * @class ShortsGenerator
 * @typedef {ShortsGenerator}
 * @extends {InstagramScraper}
 */
export default class ShortsGenerator extends InstagramScraper {
    /**
     * @private
     * @type {string[]}
     */
    private accountsSource: string[];
    /**
     * @private
     * @type {ShortsGeneratorOptions}
     */
    private options: ShortsGeneratorOptions;

    /**
     * Creates an instance of ShortsGenerator.
     *
     * @constructor
     * @param {string[]} accountsSource
     * @param {?ShortsGeneratorOptions} [options]
     */
    constructor(accountsSource: string[], options?: ShortsGeneratorOptions) {
        super(options?.puppeteerLaunchOptions)

        this.options = options || {};


        if(!options?.outputDir) {
            this.options['outputDir'] = __dirname
        }

        if(!options?.backgroundVideosDir) {
            this.options['backgroundVideosDir'] = path.join(__dirname, '/bg_videos')
        }

        this.accountsSource = accountsSource;


        ffmpeg.setFfmpegPath(ffmpegPath.path);
        ffmpeg.setFfprobePath(ffprobePath.path);
    }

    /**
     * @private
     * @returns {string}
     */
    private getRandomAccount(): string {
        if (this.accountsSource.length === 0) {
            throw new Error('accountsSource is empty');
        }
        const randomIndex = Math.floor(Math.random() * this.accountsSource.length);
        return this.accountsSource[randomIndex];
    }

    /**
     * @public
     * @async
     * @param {GenerationOptions} options
     * @returns {Promise<void>}
     */
    public async generateVideo(options: GenerationOptions): Promise<void> {
        try {

            let account = options.account || this.getRandomAccount()

            const sourceVideo = options.sourceVideo || (await this.scrapeUsersPosts(account, 1))[0].videoUrl;
            
            await this.editVideo(sourceVideo, options.backgroundVideo)

        } catch (e) {
            console.log('generateVideo -> catch', e);
            throw e;
        }
    }

    /**
     * @private
     * @async
     * @param {string} dirPath
     * @returns {Promise<string>}
     */
    private async createDirectoryIfNotExists(dirPath: string): Promise<string> {
        try {

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, {
                    recursive: true
                })
            }
            
            return dirPath

        } catch (e) {
            throw e
        }
    }


    /**
     * @private
     * @async
     * @param {string} filePath
     * @returns {Promise<string>}
     */
    private async createFileIfNotExists(filePath: string): Promise<string> {
        try {

            try {
                fs.accessSync(filePath, fs.constants.F_OK)
            } catch(e) {
                fs.writeFileSync(filePath, '')
            }
            
            return filePath
            
        } catch (e) {
            throw e
        }
    }

    /**
     * @private
     * @async
     * @param {string} outputDir
     * @param {string[]} list
     * @returns {Promise<string[]>}
     */
    private async deleteUnprocessedVideos(outputDir: string, list: string[]): Promise<string[]> {
        try {
            
            const files = fs.readdirSync(outputDir)
            const uuid = extractUUID(list[0]) || null

            if(uuid) {
                // Determine files to delete
                const filesToDelete = files.filter(file => !list.includes(file) && file.includes(uuid));
    
                // Delete each file
                filesToDelete.forEach(file => {
                    const filePath = path.join(outputDir, file);
                    fs.unlinkSync(filePath);
                });
    
            }

            return list

        } catch(e) {
            throw e;
        }
    }

    /**
     * @public
     * @async
     * @param {string} videoUrl
     * @param {?number} [limit]
     * @returns {unknown}
     */
    public async createBackgroundVideos(videoUrl: string, limit?: number) {
        try {
            const getVideosList = () => {
                const textContent: string = fs.readFileSync(listFile, 'utf-8') || ''
                const videosNames: string[] = textContent.split('\n').filter(videoName => videoName !== '')

                return videosNames
            }

            const outputDir = await this.createDirectoryIfNotExists(this.options.backgroundVideosDir!);
            const listFile = await this.createFileIfNotExists(path.join(this.options.backgroundVideosDir!, './list.txt'))

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
                    .videoFilters('crop=ih*9/16:ih')
                    .size('1080x1920')
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
    /**
     * @private
     * @async
     * @param {*} sourceVideo
     * @param {*} backgroundVideo
     * @returns {Promise<void>}
     */
    private async editVideo(sourceVideo: any, backgroundVideo: any): Promise<void> {
        try {
            let output = path.join(this.options.outputDir!, `edited_${uuidv4()}.mp4`)
            await new Promise<void>((resolve, reject) => {

                ffmpeg.ffprobe(sourceVideo, (e, metadata) => {
                    if (e) reject(e);
                
                    const duration = metadata.format.duration!;
                    const width = Math.min(1000, metadata.streams[0].width!);

                    const fadeOutStart = (duration - 1).toFixed(0);
                    const cropDuration = (duration + 3).toFixed(0);
                
                    ffmpeg()
                    .input(backgroundVideo)
                    .input(sourceVideo)
                    .complexFilter([
                        // Scale the background video to 1080x1920
                        '[0:v]scale=1080:1920[bg]',
                        // Scale the source video to 95% of the background video size
                        `[1:v]scale=${width}:-1[src]`,
                        // Apply fade-in and fade-out effects to the source video
                        '[src]format=yuva420p,fade=t=in:st=1:d=1:alpha=1,fade=t=out:st=' + fadeOutStart + ':d=1:alpha=1[trans]',
                        // Overlay the source video on the background video, centered
                        '[bg][trans]overlay=(W-w)/2:(H-h)/2[outv]'
                    ])
                    .outputOptions([
                        '-map [outv]',   // Output the combined video stream
                        '-map 1:a',      // Map the audio from the source video
                    ])
                    .output(output)
                    .duration(cropDuration) // Crop the video to the desired duration
                    .on("error", () => {})
                    .on("end", () => {
                        resolve();
                    })
                    .run();
                });
            })

        } catch (e) {
            console.log('editVideo -> catch', e);
            throw e;
        }
    }

}