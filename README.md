# Restaurant menu quiz

Small static web app for training on the restaurant menu from the supplied PDF manual.

## Use

Open `index.html` in a browser, choose the number of questions, theme, difficulty and pace, then start the session.

The end of each session shows:

- the score;
- missed questions;
- the answer you selected;
- the correct answer;
- the source in the manual when available.

## Sharing

The local `file:///C:/.../index.html` link only works on this computer. To share the app with friends, publish this folder as a static website with GitHub Pages, Netlify, Vercel, or any basic web host. The app has no backend, so it can be hosted as plain static files.

## Data

Quiz data is generated in `data/menu-data.js` from:

`Food and dessert Manual  edited 04 2024.pdf`

The extraction script is in `tools/extract_menu_data.py`.

Important note: allergens are not used in the quiz because they are not needed for this training setup.
