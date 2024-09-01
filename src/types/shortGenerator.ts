
import { PuppeteerLaunchOptions } from 'puppeteer';

export type ShortsGeneratorOptions = {
    outputDir?: string;
    backgroundVideosDir?: string;
    puppeteerLaunchOptions?: PuppeteerLaunchOptions;
}
