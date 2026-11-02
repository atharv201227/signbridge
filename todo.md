# Project TODO

## Rebuild: reliable core experience

- [x] Replace the fragile prototype screen with a single stable Translate flow
- [x] Make message assembly work without camera access: letter input, space, delete, clear
- [x] Keep native camera permission and preview isolated behind a safe fallback
- [x] Add a clear recognition-mode label so demo/manual input is never mistaken for live ASL recognition
- [x] Add local History for saved messages and replay with speech
- [x] Add Settings for speech rate and privacy preferences
- [x] Fix icon mappings and verify Android/web rendering paths
- [x] Add deterministic tests for message editing and spacing behavior
- [x] Run TypeScript, lint, tests, and preview screenshot checks
- [ ] Save a new checkpoint after the rebuilt app passes verification

## Production recognition follow-up

- [ ] Integrate a real on-device ASL handshape model through the recognition adapter
- [ ] Test hand orientation, lighting, distance, and multiple skin tones on physical devices
- [ ] Generate and validate an Android APK from the rebuilt checkpoint
