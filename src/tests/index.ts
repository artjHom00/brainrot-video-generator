import BrainrotGenerator from '../index';
import path from 'path'

(async () => {
    
    let generator = new BrainrotGenerator(['__.football__reels__'], {
        puppeteerLaunchOptions: {
            headless: false
        },
    })

    let bgVideo = path.join(__dirname, '/bg-video.mp4')
    let sourceReel = path.join(__dirname, '/test_reel.mp4')
    let wideVideo = path.join(__dirname, '/test_wide_video.mp4')
    let shortBgVideo = path.join(__dirname, '/bg_video_75e9826a-6241-405f-be5a-6c58d1474a42_000.mp4')


    // await generator.generateVideo({
    //     // sourceVideo: sourceReel,
    //     backgroundVideo: shortBgVideo,
    // })
    
    await generator.createBackgroundVideos(bgVideo, 2)

})()

