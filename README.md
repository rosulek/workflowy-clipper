# WorkFlowy clipper

By Mike Rosulek (rosulekm@eecs.oregonstate.edu)

Made available under the MIT license.

## What is it?

[WorkFlowy](https://workflowy.com) is a minimalist outlining & note-taking application. This Chrome extension allows you to designate a WorkFlowy sublist as your "inbox" and quickly save notes to it.

## How to use it

Install the Chrome extension:

* Get it from the [Chrome store](https://chrome.google.com/webstore/detail/workflowy-clipper/pmolhkonbppmihdpjmgclnclfppjndom?hl=en-US&gl=US)

Setup the extension:

* Browse to [WorkFlowy](https://workflowy.com) in a browser tab and ensure you are logged in.

* Click the new toolbar icon.

* In the popup, click "Resynchronize with WorkFlowy".

* Zoom into the list that you want to designate as your inbox. Then in the popup, press "Make current list your inbox".

Clip something:

* When visiting a page that you want to save, or whenever you have an idea that you'd like to jot down, just press the WorkFlowy toolbar icon.

* You can also set a keyboard shortcut, by using the "Keyboard shortcuts" link at the bottom of chrome://extensions.

## Isn't there already an extension for this?

There is "[Clip to WorkFlowy](https://chrome.google.com/webstore/detail/clip-to-workflowy/cfifjihfoegnccifkcdomdookdckhaah)", but what it does is just copy the current window title + location to the clipboard. Then you go to WorkFlowy yourself and paste it. In contrast, this extension actually adds it an item WorkFlowy for you.

## To-do:

* Actively 'push_and_poll' WorkFlowy to detect online/logged-in status.

* Show "busy working" status indicator when clip button is pressed

* Reasonable error handling in the case that inbox destination got deleted
