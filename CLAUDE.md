# Motion studio rules

## Render contract
- Every frame is a pure function of time. Drive everything from useCurrentFrame() with interpolate() and spring().
- NEVER use CSS transitions, CSS animations, @keyframes, setTimeout/setInterval, Date.now() or unseeded Math.random().
- Images: <Img> + staticFile(). Video: <Video> from @remotion/media. Audio: <Audio>.
- Never use CSS background-image or mask-image with url() for assets.
- Fonts: load explicitly with @remotion/google-fonts. Measure text only after fonts load.
- Default canvas 1920x1080 @ 30fps. Vertical = 1080x1920. Square = 1440x1440.
- Vertical safe zone: 150px top, 170px bottom, 60px sides. Minimum text size 28px.

## Motion language (energy rules, non-negotiable)
- Something is always moving. A new visual event every 10-15 frames.
- No scene longer than 4s. A cut every 1-3s. Every cut is a match cut, a morph or a push-through. No plain fades or slide-ins.
- The camera is never static: slow push-in, parallax across 3 depth layers, subtle 3D tilt.
- Kinetic type: words land one by one with stagger, masked reveals, huge-to-small scale contrast.
- Animated background (deterministic): drifting gradient or grid, never a flat colour.
- Build real UI components so they can animate. No static screenshots unless told.
- Springs: Snappy (damping 20, stiffness 200) for hits, Default (damping 15, stiffness 120) for the rest.
- Everything lands on the beat when there is music.

## Sound (you source it, never ask me for files)
- Music: first try to download a free, commercially usable instrumental (Mixkit or Pixabay) into public/music/, around 100-125 BPM, with a clear build and drop. Log the source URL and licence in licenses.md.
- If you can't get one (blocked, no direct link, unclear licence), generate it: write a Python or FFmpeg script that synthesises a 120 BPM bed (kick, hat, bass, pad) into public/music/bed.wav. You chose the BPM, so you already know the exact beat grid.
- SFX: synthesise whoosh, click, hit and riser with a script into public/sfx/ (filtered noise sweeps, short sine thuds). No downloads needed.
- Beat grid: from the known BPM if generated, otherwise analyse with librosa.
- Mix: music at -18 to -20 dB under any voice, SFX placed by their measured peak (not file start), loudnorm -14 LUFS.
- Never use audio whose licence you could not confirm.

## Process
1. Storyboard first: scene list with frame ranges (and the beat grid if there's music). Wait for my OK.
2. Build. Render 4-8 stills (npx remotion still), including the frame at every cut, and review them.
3. List every overlap, cramped layout, slow moment or unreadable text as P0/P1/P2. Fix all P0s.
4. Only then render the full MP4 to out/. Preview renders at 720p.

## Lessons
- When a problem takes more than one try to fix, add a one-line rule to lessons.md and read lessons.md at the start of every session.
