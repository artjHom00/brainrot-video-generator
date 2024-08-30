import BrainrotGenerator from '../index';

(async () => {
    let generator = new BrainrotGenerator('football', {
        puppeteerLaunchOptions: {
            headless: false
        }
    })
    // const res: any = await generator.scrapeUsersPosts('__.football__reels__');
    // let url = 'https://instagram.fevn7-1.fna.fbcdn.net/o1/v/t16/f1/m86/6843281357EB6056F237285ECC9E2BB0_video_dashinit.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=108&vs=554408060349306_567206870&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC82ODQzMjgxMzU3RUI2MDU2RjIzNzI4NUVDQzlFMkJCMF92aWRlb19kYXNoaW5pdC5tcDQVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dJSG9SQnN2SzZrYmtrc0ZBRUY5OUstZG9tOVpicV9FQUFBRhUCAsgBACgAGAAbABUAACaul%2BiP14aIQBUCKAJDMywXQD9VP3ztkWgYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HAA%3D%3D&ccb=9-4&oh=00_AYBLV2ezYmK2oQAnc5AUEBMtU4rbWLgqHlK9Ut9qXpBSKg&oe=66D39AE6&_nc_sid=721f0c'
    let video = __dirname + '/bg-video.mp4'

    let outputs = await generator.createBackgroundVideos(video, 1)
    console.log("🚀 ~ outputs:", outputs)

    // console.log("🚀 ~ constres:any=awaitgenerator.scrapeUsersPosts ~ res:", res)

})()