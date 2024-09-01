let ShortsGenerator = require('../../dist/index');
let path = require('path');

(async () => {

    let generator = new ShortsGenerator(['gaspnstuff'], {
        puppeteerLaunchOptions: {
            headless: false
        },
        outputD
    })

    let bgVideo = path.join(__dirname, '/sample-long-background-video.mp4')

    await generator.createBackgroundVideos(bgVideo, 1)

})()
