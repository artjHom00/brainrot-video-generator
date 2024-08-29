import InstagramScraper from './providers/instagram';
import { PuppeteerLaunchOptions } from 'puppeteer';
interface BrainrotGeneratorOptions {
    backgroundVideosDir?: string;
    puppeteerLaunchOptions?: PuppeteerLaunchOptions;
}

class BrainrotGenerator extends InstagramScraper {
    private videosTopic: string;
    private options: BrainrotGeneratorOptions;
    
    constructor(videosTopic: string, options?: BrainrotGeneratorOptions) {
        super(options?.puppeteerLaunchOptions)
        this.options = options || {};
        this.videosTopic = videosTopic;

    }

    
}

export default BrainrotGenerator
