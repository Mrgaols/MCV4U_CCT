"""Mux prepared genuine narration into a review video and measure the result."""
from pathlib import Path
import argparse
import json
import subprocess

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('lesson',choices=['alan','jeff'])
p.add_argument('--visuals',type=Path,required=True)
args=p.parse_args()
root=Path(__file__).resolve().parents[2]
audio=root/'videos/exports'/f'{args.lesson}-narration-review.m4a'
out=root/'videos/exports'/f'{args.lesson}-narrated-review.mp4'
cues=json.loads((root/'videos/verification'/f'{args.lesson}-narration-cues.json').read_text())
def probe(path):
    return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,duration','-of','json',str(path)],text=True))
visual=probe(args.visuals)
sound=probe(audio)
if abs(float(visual['format']['duration'])-cues['duration'])>.05 or abs(float(sound['format']['duration'])-cues['duration'])>.08:
    raise ValueError('Media durations must match the measured cue sheet; no automatic padding or shortening is allowed')
if cues['duration']<480:raise ValueError('Lesson must last at least eight minutes')
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-n','-i',str(args.visuals),'-i',str(audio),'-map','0:v:0','-map','1:a:0','-c','copy','-movflags','+faststart',str(out)],check=True)
result=probe(out)
if {s['codec_type'] for s in result['streams']}!={'video','audio'}:raise ValueError('Missing media stream')
subprocess.run(['ffmpeg','-v','error','-i',str(out),'-f','null','-'],check=True)
result['missing_recordings']=cues['missing']
result['full_decode']='passed'
result['classification']='narrated review copy; final content and delivery acceptance pending'
(root/'videos/verification'/f'{args.lesson}-narrated-media.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result),flush=True)
