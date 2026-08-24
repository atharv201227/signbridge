# SignBridge Mobile Interface Design

## Product direction

SignBridge is a portrait-oriented communication aid for people who use hand alphabets and for listeners who may not understand them. The first prototype targets **ASL fingerspelling**, not full conversational sign-language translation. It should make the camera, current recognition, assembled message, and speech output understandable at a glance while remaining comfortable for one-handed use.

## Screen list

| Screen | Primary content and functionality |
|---|---|
| **Translate** | Main camera workspace with a large hand-position guide, camera permission state, recognition status, current detected letter, confidence indicator, and the assembled message. Includes controls for pause/resume, add space, delete last character, clear message, and speak message. |
| **Practice** | A lightweight practice mode showing a target letter, visual hand cue, progress through a small set of letters, and a reset/next action. This is useful while the recognition model is still limited. |
| **History** | Locally stored recent messages, each with timestamp and actions to replay speech, copy, or delete. The prototype may show an empty state until persistence is added. |
| **Settings** | Language/model selection placeholder for future ASL or other sign-language packs, speech rate, camera guidance, privacy note, and a link to help. No account or cloud storage is required for the first version. |
| **Camera permission sheet** | A friendly explanation of why camera access is needed, a retry action, and a path to device settings if permission was denied. |

## Main layout

The Translate screen uses a dark navy background so the camera preview and pale hand guide remain legible. The top bar contains the SignBridge mark, the title “Translate,” and a compact privacy status reading “Camera stays on this device” when local recognition is active. The camera preview occupies the visual center with rounded corners and a thin mint guide frame. A small status pill overlays the preview with states such as “Show one hand,” “Letter detected,” or “Hold steady.”

Below the preview, a high-contrast message card presents the assembled text in large type. The most recent character is emphasized briefly, while the full message remains readable. A horizontal control row provides delete and space actions, and the primary mint “Speak message” button is anchored near the bottom within thumb reach. A secondary “Clear” action is visible but less prominent to reduce accidental deletion.

The interface follows mainstream iOS conventions: large readable labels, generous touch targets, semantic button labels, subtle press feedback, system safe areas, and bottom-sheet presentation for permission or settings choices. The first version should avoid excessive animation and should always communicate whether recognition is active, paused, unavailable, or waiting for a hand.

## Key user flows

### First launch and translation

1. The user opens SignBridge and sees a short explanation of camera-based fingerspelling.
2. The user grants camera access through the system permission prompt.
3. The Translate screen opens with the camera preview and a hand-position guide.
4. The user holds one ASL alphabet handshape inside the guide.
5. The app displays the detected letter and adds it only after a stable recognition interval, preventing rapid duplicate letters.
6. The user repeats letters, taps **Space** between words, and uses **Delete** to correct the latest character.
7. The user taps **Speak message**; the assembled message is spoken using the device text-to-speech engine.
8. The user can tap **Clear** to begin a new message.

### Permission recovery

1. If camera permission is unavailable, the app replaces the preview with a clear explanation.
2. The user taps **Try again** to request permission again.
3. If the system has permanently denied access, the app offers **Open Settings** and explains that recognition cannot work without the camera.

### Practice mode

1. The user opens Practice from the tab bar.
2. The app presents one target letter and a simple instruction to position the hand.
3. The user holds the sign until it is recognized.
4. The app provides encouraging progress feedback and offers the next letter or a reset.

## Color choices

| Token | Color | Use |
|---|---|---|
| `background` | `#071A2B` | Deep navy app background and camera workspace chrome |
| `surface` | `#102B40` | Message cards, settings rows, and elevated panels |
| `primary` | `#8DE1C0` | Main action buttons, active controls, and recognition highlights |
| `foreground` | `#F4FAF8` | Primary text and high-contrast labels |
| `muted` | `#A9BEC8` | Supporting copy, helper text, and inactive states |
| `border` | `#2B4A5D` | Subtle separators and card outlines |
| `success` | `#8DE1C0` | Stable letter recognition and ready state |
| `warning` | `#F6C66E` | Hold-steady or low-confidence guidance |
| `error` | `#FF8D8D` | Camera errors and destructive actions |

The brand feeling is calm, supportive, and dependable rather than clinical. Mint communicates progress and voice, while navy keeps the camera view and message readable in varied lighting.

## Recognition scope and honest feedback

The prototype should clearly label its recognition state and avoid implying that it understands every sign-language sentence. Initial recognition can be represented by a model/service boundary that returns a letter, confidence, and stability state. Until a production hand-landmark or vision model is connected, the UI should use a clearly labeled demo recognition mode rather than silently presenting simulated results as real recognition.

## Accessibility and usability

All actionable controls should have comfortable touch targets, visible labels, and accessible hints. Text should remain readable with larger system font settings. The app should not depend on color alone to communicate confidence or errors. Speech output is the primary communication affordance, while the assembled text remains available for users who prefer reading or showing the screen.
