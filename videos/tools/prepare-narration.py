"""Measure supplied clips and prepare a 30 fps timeline without changing speech speed.

Usage: python videos/tools/prepare-narration.py --recordings "C:/path/to/mcv radio" --allow-missing
The input folder contains Alan/ and Jeff/. Existing source recordings are never changed.
"""
from pathlib import Path
import argparse
import hashlib
import json
import math
import re
import shutil
import subprocess

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--recordings',type=Path)
parser.add_argument('--lesson',choices=['alan','jeff'],help='Prepare only this lesson; preserve the other lesson')
parser.add_argument('--allow-missing',action='store_true',help='Prepare an explicitly incomplete review copy; never a final submission.')
args=parser.parse_args()
root=Path(__file__).resolve().parents[2]
verification=root/'videos/verification'
verification.mkdir(parents=True,exist_ok=True)
inventory={}
duplicates=[]
def pcm_hash(path):
    return subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-map','0:a:0','-ac','1','-ar','48000','-f','hash','-hash','sha256','-'],text=True).strip()


for who in ([args.lesson] if args.lesson else ['alan','jeff']):
    folder=args.recordings/who.capitalize() if args.recordings else root/'videos/audio'/who
    timing_path=root/'videos'/who/'timing.js'
    timing=json.loads(subprocess.check_output(['node','-e',f'require({json.dumps(str(timing_path))});console.log(JSON.stringify(globalThis.{who.capitalize()}Timing))'],text=True))
    expected=[(f'{i+1}.{j+1}',scene['scene'],beat) for i,scene in enumerate(timing) for j,beat in enumerate(scene['beats'])]
    files=[];seen=set()
    for p in folder.iterdir():
        if not p.is_file() or p.suffix.lower() not in ['.m4a','.wav','.mp3','.flac','.aac']:continue
        match=re.search(r'(\d+)\.(\d+)',p.stem)
        if not match:raise ValueError('Recording needs scene.beat numbering: '+str(p))
        key=f'{int(match[1])}.{int(match[2])}'
        if key in seen:
            existing=next(x for x in files if x['key']==key)
            same_bytes=hashlib.sha256(p.read_bytes()).hexdigest()==existing['sha256']
            if same_bytes or pcm_hash(p)==pcm_hash(existing['source']):
                duplicates.append({'lesson':who,'key':key,'selected':existing['source'],'duplicate':str(p),'byte_identical':same_bytes,'decoded_audio_identical':True})
                continue
            raise ValueError('Multiple different takes need an explicit selection for '+who+' '+key)
        if key not in {x[0] for x in expected}:raise ValueError('Unexpected recording '+key)
        seen.add(key)
        info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(p)],text=True))
        files.append({'key':key,'source':str(p.resolve()),'duration':float(info['format']['duration']),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
    missing=[x for x in expected if x[0] not in seen]
    inventory[who]={'files':files,'expected':expected,'missing':missing,'total_audio_duration':sum(x['duration'] for x in files),'timing':timing}
    if missing and not args.allow_missing:raise ValueError(f'{who}: missing {missing}; use --allow-missing only for review copies')

for who,data in inventory.items():
    signature=hashlib.sha256(json.dumps(data,sort_keys=True).encode()).hexdigest()[:12]
    cache=root/'videos/.cache'/f'{who}-{signature}'
    cache.mkdir(parents=True,exist_ok=True)
    bykey={x['key']:x for x in data['files']}
    cues=[];cursor=0;wav_files=[]
    timing=data.pop('timing')
    for i,scene in enumerate(timing):
        for j,(beat,baseline) in enumerate(scene['beats'].items()):
            key=f'{i+1}.{j+1}';record=bykey.get(key)
            duration=math.ceil(((record['duration']+.35) if record else baseline)*30)/30
            wav=cache/f'{key}.wav'
            cmd=['ffmpeg','-hide_banner','-loglevel','error','-n']
            if record:
                dest=root/'videos/audio'/who/(key+Path(record['source']).suffix.lower())
                dest.parent.mkdir(parents=True,exist_ok=True)
                if not dest.exists():shutil.copy2(record['source'],dest)
                elif hashlib.sha256(dest.read_bytes()).hexdigest()!=record['sha256']:
                    raise ValueError('Preserved take differs; select a new production directory: '+str(dest))
                cmd+=['-i',str(dest),'-af',f'loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad,atrim=end_sample={round(duration*48000)}']
            else:cmd+=['-f','lavfi','-i','anullsrc=r=48000:cl=mono','-t',str(duration)]
            cmd+=['-ac','1','-ar','48000','-c:a','pcm_s16le',str(wav)]
            if not wav.exists():subprocess.run(cmd,check=True)
            wav_files.append(wav)
            cues.append({'key':key,'scene':scene['scene'],'beat':beat,'start':cursor,'end':cursor+duration,'duration':duration,'missing':record is None,'source_sha256':record['sha256'] if record else None})
            scene['beats'][beat]=duration;cursor+=duration
    listing=cache/'concat.txt'
    listing.write_text('\n'.join("file '"+p.as_posix().replace("'","'\\''")+"'" for p in wav_files),encoding='utf-8')
    combined=cache/'combined.wav'
    if not combined.exists():subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-n','-f','concat','-safe','0','-i',str(listing),'-c','copy',str(combined)],check=True)
    audio=root/'videos/exports'/f'{who}-narration-review.m4a'
    audio.parent.mkdir(parents=True,exist_ok=True)
    if audio.exists():raise ValueError('Existing export preserved. Move it aside before regenerating: '+str(audio))
    measured=subprocess.run(['ffmpeg','-hide_banner','-i',str(combined),'-af','loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
    levels=json.loads(re.findall(r'\{\s*"input_i".*?\}',measured.stderr,re.S)[-1])
    master=(f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={levels['input_i']}:measured_TP={levels['input_tp']}:"
            f"measured_LRA={levels['input_lra']}:measured_thresh={levels['input_thresh']}:offset={levels['target_offset']}:linear=true,"
            f"aresample=48000,apad,atrim=end_sample={round(cursor*48000)}")
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-n','-i',str(combined),'-af',master,'-c:a','aac','-b:a','160k',str(audio)],check=True)
    (verification/f'{who}-audio-mastering.json').write_text(json.dumps({'first_pass':levels,'target_lufs':-16,'target_true_peak_db':-1.5,'sample_rate':48000,'expected_samples':round(cursor*48000),'speech_rate_changed':False},indent=2),encoding='utf-8')
    lesson=root/'videos'/who
    (lesson/'narration-timing.js').write_text(f'window.{who.capitalize()}NarrationTiming = '+json.dumps(timing,indent=2)+';\nwindow.CCTNarrationCues = '+json.dumps(cues,indent=2)+';\n',encoding='utf-8')
    (verification/f'{who}-narration-cues.json').write_text(json.dumps({'duration':cursor,'cues':cues,'missing':[x['key'] for x in cues if x['missing']]},indent=2),encoding='utf-8')
    print(who,round(cursor,3),'seconds; missing',len(data['missing']),flush=True)
previous=json.loads((verification/'audio-inventory.json').read_text(encoding='utf-8')) if (verification/'audio-inventory.json').exists() else {}
previous.update(inventory)
(verification/'duplicate-audio-checks.json').write_text(json.dumps(duplicates,indent=2),encoding='utf-8')
(verification/'audio-inventory.json').write_text(json.dumps(previous,ensure_ascii=False,indent=2),encoding='utf-8')
