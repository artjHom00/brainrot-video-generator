# # import zipfile
# # with zipfile.ZipFile("ffmpeg.7z", 'r') as zip_ref:
# #     zip_ref.extractall('C:/Users/David/Desktop/projects')
    
# from pyunpack import Archive
# Archive('chrusty-rock-font.zip').extractall("C:/Users/David/Desktop/projects")
# from moviepy.editor import VideoFileClip, CompositeVideoClip, TextClip

# TextClip.list("font")

import yt_dlp
from moviepy.editor import VideoFileClip

def download():
    ydl_opts = {
        "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "outtmpl": "yt",
    }
    with yt_dlp.YoutubeDL(ydl_opts) as dl:
        dl.download(["https://www.youtube.com/shorts/91MhNtDNAbg"])

    video = VideoFileClip("yt.mp4")
    
download()