# Board Runner

Phone-first pre-op dictation → short plain-text card for the group text.

- Tap the mic, dictate in bursts, tap **Done** (or say "pepper").
- Parsing runs entirely on the phone (`parser.js`, rules only — no AI, no server).
- Cards live in this phone's local storage and are wiped when the date changes.
- **Room # only — no names, MRN, or DOB.** The parser strips obvious identifiers and turns ages over 89 into "90+".

Speech-to-text uses the phone's built-in engine (Apple on iPhone, Google on Android), which may process audio on their servers. For fully on-device dictation, use the keyboard 🎤 in the type box instead.
