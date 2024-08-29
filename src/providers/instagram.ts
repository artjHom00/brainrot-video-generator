import puppeteer, { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer';
import { Post } from './types/post.interface'
import axios from 'axios';

class InstagramScraper {
    protected browser!: Browser; // Use definite assignment assertion
    protected page!: Page;
    private puppeteerLaunchOptions?: PuppeteerLaunchOptions;
    private initialized: boolean;
    private HOST: string;

    constructor(puppeteerLaunchOptions?: PuppeteerLaunchOptions) {
        this.puppeteerLaunchOptions = puppeteerLaunchOptions
        this.initialized = false;
        this.HOST = 'https://instagram.com'
    }

    protected async initialize(puppeteerLaunchOptions?: PuppeteerLaunchOptions): Promise<void> {
        try {
            this.browser = await puppeteer.launch(puppeteerLaunchOptions);
            this.page = await this.browser.newPage();

            this.initialized = true;
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
            if(this.page) {
                await this.page.goto(`${this.HOST}/${userId}/reels/`);
                
                await this.page.waitForNetworkIdle();
    
                return;
            }
        } catch (e) {
            console.log('goToUserPage -> catch', e);
            throw e;
        }
    }

    public async scrapeUsersPosts(userId: string): Promise<Post[]> {
        try {

            // Initialize browser asynchronously
            if(!this.initialized) {
                await this.initialize(this.puppeteerLaunchOptions)
            }
            
            await this.goToUserPage(userId);

            // getting posts
            let postsIds: string[] = await this.page.evaluate(() => {
                const allPostsDOM = document.querySelectorAll('._al5p');
                const postsIds = [];
                
                for(let post of allPostsDOM) {
                    let postId = post.children[0].children[0].getAttribute('href')?.split('/')[2];

                    if(postId) {
                        postsIds.push(postId)
                    }
                }

                return postsIds;
            })

            let fullPostsData: Post[] = await Promise.all(postsIds.map((postId) => this.downloadPost(postId)))

            return fullPostsData

        } catch (e) {
            console.log('scrapeUsersPosts -> catch', e);
            throw e;
        }
    }

    private async downloadPost(postId: string): Promise<Post> {
        try {
            
            const requestUrl: string = this.getInstagramPostJSONUrl(postId);

            const { data: { graphql: { shortcode_media: postData } } } = await axios.get(requestUrl)

            return {
                postId,
                thumbnailUrl: postData.display_url,
                videoUrl: postData.video_url,
                dimensions: postData.dimensions,
                location: postData.location,
                video_url: postData.video_url
            }
            
        } catch (e) {
            console.log('downloadPost -> catch', e);
            throw e;
        }
    }

    // Add a method to close the browser
    protected async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

export default InstagramScraper;