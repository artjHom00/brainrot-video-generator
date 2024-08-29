import puppeteer, { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer';

class InstagramScraper {
    browser!: Browser; // Use definite assignment assertion
    page!: Page;
    HOST: string;

    constructor(puppeteerLaunchOptions?: PuppeteerLaunchOptions) {
        this.HOST = 'https://instagram.com'
        // Initialize browser asynchronously
        this.initialize(puppeteerLaunchOptions).catch((error) => {
            console.error('Error initializing InstagramScraper:', error);
        });
    }

    private async initialize(puppeteerLaunchOptions?: PuppeteerLaunchOptions): Promise<void> {
        try {
            this.browser = await puppeteer.launch(puppeteerLaunchOptions);
            this.page = await this.browser.newPage();
        } catch (e) {
            console.error('initialize -> catch:', e);
            throw e; // Rethrow error after logging it
        }
    }

    private getInstagramPostJSONUrl(postId: string): string {
        return `${this.HOST}/reel/${postId}/?__a=1&__d=dis`;
    }

    private async goToUserPage(userId: string): Promise<void> {
        try {
            await this.page.goto(`${this.HOST}/${userId}/reels/`);
            
            await this.page.waitForNetworkIdle();

            return;
        } catch (e) {
            console.log('goToUserPage -> catch', e);
            throw e;
        }
    }

    protected async scrapeUsersPosts(userId: string): Promise<void> {
        try {
            
            await this.goToUserPage(userId);

        } catch (e) {
            console.log('scrapeUsersPosts -> catch', e);
            throw e;
        }
    }

    private async downloadPost(postId: string): Promise<void> {
        try {
            
        } catch (e) {
            console.log('downloadPost -> catch', e);
            throw e;
        }
    }

    // Add a method to close the browser
    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

export default InstagramScraper;