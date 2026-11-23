# Images: photos, logos, headshots and icons

Read this when a slide needs a photo, logo, headshot or icon. (How editable template objects are stored and used is in `Objects/README.md`.)

## Folders

```
Objects/
├── Brand/logos/      ← official logo files you supply, named <company>.svg / .png
├── Visual/people/    ← headshots you supply (e.g. your team), named <first-last>.jpg
├── Visual/photos/    ← photos you own or that are free-licensed (with a credits line)
├── Visual/icons/     ← icon set (one consistent style)
├── store/            ← template object store (see Objects/README.md)
└── credits.md        ← source + licence for every image not made by you
```

## Where images come from (in this order)

1. **This folder.** Your own assets come first.
2. **Files you attach in the chat**: save them here so they can be reused next time.
3. **Free-licensed stock** (Unsplash, Pexels, or Wikimedia Commons with a licence that allows commercial use), only for **generic scenes**: a city skyline, a factory floor, a product category, a landscape. Log each one in `credits.md`. Network access is on (2026-11-22). First photo: `Visual/photos/pudong-skyline-bund.jpg` (CC0).
   - **How:** search with the Wikimedia Commons API from the Mac (`device_bash`; the cloud workspace gets rate-limited with error 429). Read the licence and author from `extmetadata`, then download the thumbnail (`iiurlwidth=2400`; Wikimedia may serve a larger size such as 3840 px) and resize it to 2400 px wide with PIL at JPEG quality 85 (~0.3 MB). Never keep the multi-MB original.
   - **Licence preference:** CC0 / public domain first (no credit needed), then CC BY (credit on the slide's source line), then CC BY-SA (credit, and note share-alike). Skip anything with no licence, "fair use" or NC (non-commercial).
   - **Approval:** list each proposed photo (title, source, licence, size) in the Stage 3 "assets needed" list. Approving the plan approves those downloads. Nothing else is downloaded without asking.
4. **A placeholder:** a grey box labelled `[Photo: description]`, listed in the "assets needed" list so you can drop the file in.

Claude's image search (the images it shows in chat) is only for finding ideas or showing you options. Those images are never placed in a deck.

## Hard rules

- **No photos of real people found online**, including public figures. Headshots come only from you (`Visual/people/`). Without one, use an initials circle or a neutral silhouette icon. *Why: people's likeness and image rights.*
- **Claude doesn't pull company logos from the web.** You add official logo files to `Brand/logos/`, from the company's press or brand page or your own files. Without one, write the company name as a text label in the logo's slot and list it under "assets needed". *Why: logos are trademarks, and a scraped or redrawn logo is often an outdated or wrong version.*
- **Never use watermarked, news-site or paid-stock images,** and never use images without a known licence.
- **Never redraw or imitate a logo or character** in code or shapes.

## How images are used

- **Assets needed list:** at Stage 3 (slide plan), list every photo, logo and headshot the deck needs and whether it's already in `Objects/`. That way missing files are requested before the build, not after.
- **Logos:** all the same height (or the same visual weight) in a row or grid, aligned to the grid, with equal gaps. On comparison or landscape slides, use grey (monochrome) versions so no company looks favoured, unless the slide is about brand.
- **Photos:** crop to the layout's frame, never stretch. Use at most one hero photo per slide. On full-bleed photos, put text on a dark overlay with at least 4.5:1 contrast.
- **Headshots:** the same crop (head and shoulders), the same size and the same shape (circle or square) across a slide.
- **Icons:** one style per deck (line or filled, never mixed), coloured with the active style's main colour or grey.
