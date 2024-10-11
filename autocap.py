import argparse
import whisper
from moviepy.editor import VideoFileClip, CompositeVideoClip, TextClip
from moviepy.video.tools.subtitles import SubtitlesClip
import textwrap
import os
import cv2
import numpy as np
import os
import subprocess
from datetime import timedelta
import yt_dlp

YT_ATTACH = "youtube-a"
YT_GENERATE = "youtube-g"
VALID_MODES = ("attach", "generate", YT_ATTACH, YT_GENERATE)
YT_MODES = (YT_ATTACH, YT_GENERATE)
TEMP_FILE = "temp.mp3"
OUTPUT_SRT = "output.srt"
OUTPUT_VID = "output.mp4"
YT_VID = "/content/videoplayback.mp4"

try:
  os.remove("output.srt")
except:
  print("No output.srt")


class VideoManager:
    def __init__(self, path: str, youtube: bool, target_resolution=[1080, 1920]) -> None:
        self.path = path
        self.youtube = youtube
        self.video = VideoFileClip(path)

        # Resize the video
        self.video = self.resize_video(target_resolution)

        self.extract_audio()

    def resize_video(self, target_resolution):
        """Resize the video to the target resolution without losing quality."""
        original_resolution = self.video.size  # Get the original resolution (width, height)
        if original_resolution != target_resolution:
            print(f"Resizing video from {original_resolution} to {target_resolution}")
            resized_video = self.video.resize(newsize=target_resolution)
        else:
            resized_video = self.video
        return resized_video

    def extract_audio(self) -> None:
        if self.video.audio is not None:
            self.video.audio.write_audiofile("temp.mp3", codec="mp3")
        else:
            print("video has no audio, quitting")



class Utility:
    def __init__(self, path: str, youtube: bool) -> None:
        self.path = path
        self.youtube = youtube

    def file_exists(self) -> bool:
        if self.youtube:
            return True
        return len(self.path) > 0 and os.path.exists(path=self.path)


class SubtitleGenerator:
    def __init__(self, videomanager: VideoManager) -> None:
        self.videomanager = videomanager

    def generate(self) -> None:
            # Credit goes to
            # https://github.com/openai/whisper/discussions/98#discussioncomment-3725983
            # github.com/lectair

            model = whisper.load_model("medium.en")
            transcribe = model.transcribe(audio=TEMP_FILE, fp16=False)
            segments = transcribe["segments"]

            for seg in segments:
                start = str(0) + str(timedelta(seconds=int(seg["start"]))) + ",000"
                end = str(0) + str(timedelta(seconds=int(seg["end"]))) + ",000"
                text = seg["text"]
                segment_id = seg["id"] + 1
                segment = f"{segment_id}\n{start} --> {end}\n{text[1:] if text[0] == ' ' else text}\n\n"
                with open(OUTPUT_SRT, "a", encoding="utf-8") as f:
                    f.write(segment)

            print("subtitles generated")
            
    # def generate(self, max_words_per_segment=5) -> None:
    #     # Load Whisper model and transcribe
    #     model = whisper.load_model("medium.en")
    #     transcribe = model.transcribe(audio=TEMP_FILE, fp16=False)
    #     segments = transcribe["segments"]

    #     def format_time(seconds):
    #         return str(0) + str(timedelta(seconds=int(seconds))) + ",000"

    #     for seg in segments:
    #         start_time = seg["start"]
    #         end_time = seg["end"]
    #         text = seg["text"].strip()
    #         words = text.split()

    #         if len(words) > max_words_per_segment:
    #             # Split into multiple segments
    #             chunk_count = (len(words) + max_words_per_segment - 1) // max_words_per_segment
                
    #             chunk_duration = (end_time - start_time) / chunk_count
    #             for i in range(chunk_count):
    #                 chunk_start = start_time + i * chunk_duration
    #                 chunk_end = start_time + (i + 1) * chunk_duration
    #                 chunk_words = words[i * max_words_per_segment:(i + 1) * max_words_per_segment]
    #                 chunk_text = " ".join(chunk_words)
    #                 segment_id = seg["id"] + 1 + i
    #                 segment = f"{segment_id}\n{format_time(chunk_start)} --> {format_time(chunk_end)}\n{chunk_text}\n\n"
    #                 print(segment)
    #                 with open(OUTPUT_SRT, "a", encoding="utf-8") as f:
    #                     f.write(segment)
    #         else:
    #             # Single segment
    #             start = format_time(start_time)
    #             end = format_time(end_time)
    #             segment_id = seg["id"] + 1
    #             segment = f"{segment_id}\n{start} --> {end}\n{text}\n\n"

    #             with open(OUTPUT_SRT, "a", encoding="utf-8") as f:
    #                 f.write(segment)

    #     print("Subtitles generated")

    # def attach(self) -> None:
    #     self.generate()
    #     if os.path.exists(OUTPUT_SRT):
    #         subtitles = SubtitlesClip(
    #             OUTPUT_SRT,
    #             lambda txt: TextClip(
    #                 txt,
    #                 font="MontserratBlack-3zOvZ.ttf",
    #                 fontsize=35,
    #                 color="#FFEA30",
    #                 stroke_color = "black",
    #                 stroke_width = 2,

    #                 # bg_color="black",
    #             ),
    #         )

    #         video_with_subtitles = CompositeVideoClip(
    #             [
    #                 self.videomanager.video,
    #                 subtitles.set_position(("center", 0.80), relative=True),
    #             ]
    #         )

    #         video_with_subtitles.write_videofile(OUTPUT_VID, codec="libx264")
    #         print(f"saved to {OUTPUT_VID}")
    

    def attach(self) -> None:
        self.generate()  # Assuming this method generates the video

        if os.path.exists(OUTPUT_SRT):
            # Define a function to wrap the text if it exceeds a certain length
            def subtitle_text(txt):
                # Set a character limit per line
                max_chars_per_line = 40  # You can adjust this number based on font size and frame width

                # Wrap the text using textwrap
                wrapped_text = "\n".join(textwrap.wrap(txt, width=max_chars_per_line))

                # Create a TextClip with the wrapped text
                return TextClip(
                    wrapped_text,
                    font="MontserratBlack-3zOvZ.ttf",
                    fontsize=45,
                    color="#FFEA30",
                    stroke_color="black",
                    stroke_width=2
                )

            # Load the subtitles
            subtitles = SubtitlesClip(OUTPUT_SRT, subtitle_text)

            # Combine the video and subtitles
            video_with_subtitles = CompositeVideoClip(
                [
                    self.videomanager.video,
                    subtitles.set_position(("center", 0.80), relative=True),
                ]
            )

            # Write the final video with subtitles
            video_with_subtitles.write_videofile(OUTPUT_VID, codec="libx264")
            print(f"Saved to {OUTPUT_VID}")

def check_ffmpeg() -> bool:
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True)
        return result.returncode == 0 and 'ffmpeg' in result.stdout
    except FileNotFoundError:
        return False


def main() -> None:
    parser = argparse.ArgumentParser(description="auto caption generator v1.0")
    parser.add_argument("path", metavar="path", type=str, help="filepath of the video")
    args = parser.parse_args()
    mode = 'attach' #args.mode
    path = args.path #"short.mp4"


    if not check_ffmpeg():
        print("ffmpeg must be installed to run this script, quitting")
        exit()

    if len(mode) > 0 and len(path) > 0:
        yt_mode = True if mode in YT_MODES else False
        utility = Utility(path, yt_mode)

        if mode in VALID_MODES and utility.file_exists():
            videomanager = VideoManager(utility.path, yt_mode)
            subtitle_generator = SubtitleGenerator(videomanager)

            if mode == VALID_MODES[0] or mode == VALID_MODES[2]:
                subtitle_generator.attach()
            elif mode == VALID_MODES[1] or mode == VALID_MODES[3]:
                subtitle_generator.generate()
        else:
            print("invalid mode or file path, quitting")


if __name__ == "__main__":
    main()
