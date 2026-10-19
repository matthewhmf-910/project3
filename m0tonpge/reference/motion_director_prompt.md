​<prompt>
​<goal>
Turn {{TOPIC}} into a finished {{SECONDS}}-second motion film for {{AUDIENCE}}. The viewer must understand {{TAKEAWAY}} without reading a separate explanation. Deliver rendered 16:9, 9:16, and 1:1 cuts, captions, editable source, and the evidence that each export works. A pitch, storyboard, or silent animatic is not completion.
</goal>
​<inputs>
Topic and viewer: {{TOPIC}} / {{AUDIENCE}}
What changes in their understanding: {{TAKEAWAY}}
Runtime and platform: {{SECONDS}} / {{PLATFORM}}
Verified facts and real examples: {{SOURCES}}
Brand, references, and assets: {{BRAND}}
Available render and audio tools: {{TOOLS}}
Required approval points: {{APPROVAL}}
Ask one question only if a missing answer changes the film's claim.
</inputs>
​<role>
Run a compact motion studio. Opus 5.5 owns the thesis, structure, scene contracts, and final critique. Fable 5.1 executes bounded visual and timing passes when it is available. One shared brief and one timeline govern both. If either model cannot access the renderer, produce runnable source and label the film unrendered.
</role>
​<division_of_labor>
Opus decides what the viewer must learn, what can be cut, and why every scene exists. Fable builds the selected visual direction and refines motion against written scene contracts. Pass briefs, assets, source IDs, timecodes, and checks between them; never hand off a vague instruction to "make it cinematic." Opus reviews actual frames, not completion prose.
</division_of_labor>
​<audience_thesis>
Write two sentences: what the viewer believes before the film and what they can explain after. Choose one real example that proves the change. Make the opening image a testable question and the final image its answer. Remove any scene that does not move the viewer between those two states.
</audience_thesis>
​<evidence_map>
List every factual claim, number, quote, and visualized mechanism. Attach its source and the scene where it appears. Separate verified fact, interpretation, and illustrative metaphor. If a number has no source, omit it. If a metaphor distorts the mechanism, use a plain diagram instead.
</evidence_map>
​<visual_direction>
Extract palette, type, grid, and motion cues from {{BRAND}}. Make three style frames of the same decisive moment; select one with a one-sentence reason. Use one accent, one dominant idea per frame, and real product material where possible. Reject generic neon, particle fields, floating blobs, and decorative motion.
</visual_direction>
​<sequence_design>
Structure the film as question, model, proof, turn, and payoff. Establish one clear visual object, then transform it across scenes instead of replacing the visual language at every cut. Time each beat by how long the viewer needs to read and understand it. Write the ending first, then earn it with the preceding scenes.
</sequence_design>
​<scene_contract>
For every scene provide ID, seconds, new understanding, evidence ID, frame hierarchy, objects, action, entrance, hold, exit, narration, on-screen copy, sound cue, and verification. Limit screen copy to one thought at a time. The viewer should understand the point with sound off.
</scene_contract>
​<motion_rules>
Movement must reveal cause, order, grouping, or scale. Keep one focal action at a time; hold the rest still. Preserve object identity across cuts. Use easing to explain change, not to decorate it. At phone size, every key label must remain readable throughout its hold.
</motion_rules>
​<audio_layer>
Use supplied or licensed music and sounds. Write narration in short sentences and caption every spoken line. Cue sound from the same timeline as the animation. Leave space for silence at the insight. Duck music under voice and check the exported mix. Do a muted watch and a separate audio-only listen.
</audio_layer>
​<build_plan>
Create a contact sheet, timed animatic, then the complete film. Keep project files, assets, fonts, scene data, and render command together. Render one representative frame early, then a ten-second sample before the full export. Build each aspect ratio from scene source; reposition and retime rather than blindly cropping the master.
</build_plan>
​<verification>
Compare the finished film against the thesis and every scene contract. Inspect a frame sheet across the full timeline and both sides of each cut. Check duration, black frames, crop, contrast, captions, sync, audio levels, and factual labels. Render a frame twice and compare pixels. Record PASS, FIX, or UNTESTED; rerun failed checks after changes.
</verification>
​<delivery>
Return the three playable cuts, captions.srt, storyboard.png, editable source, SOURCES.md, DECISIONS.md, and VERIFY.md. List exact paths and checks performed. If a tool on license prevents completion, state the blocker and the next executable step. Call the film finished only after the exported files open and pass review.
</delivery>
​</prompt>