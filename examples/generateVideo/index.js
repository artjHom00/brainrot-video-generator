let ShortsGenerator = require('../../dist/index');
let path = require('path');

(async () => {

    let generator = new ShortsGenerator(['gaspnstuff'], {
        puppeteerLaunchOptions: {
            headless: false
        },
    })

    let bgVideo = path.join(__dirname, '/sample-background-video.mp4')
    let sourceReel = path.join(__dirname, '/sample-reel.mp4')

    await generator.generateVideo({
        sourceVideo: sourceReel,
        backgroundVideo: bgVideo,
    })

})()
