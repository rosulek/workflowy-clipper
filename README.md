# WorkFlowy clipper

By Mike Rosulek (rosulekm@eecs.oregonstate.edu)

Made available under the MIT license.

## What is it?

[WorkFlowy](https://workflowy.com) is a minimalist outlining & note-taking application. This Chrome extension allows you to designate a WorkFlowy sublist as your "inbox" and quickly save notes to it.

![screenshot](https://raw.githubusercontent.com/rosulek/workflowy-clipper/master/screens/screen1.png)

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

## To-do:

* Actively 'push_and_poll' WorkFlowy to detect online/logged-in status.

* Show "busy working" status indicator when clip button is pressed

* Reasonable error handling in the case that inbox destination got deleted

* Option to append/prepend to inbox list.

* Separate configuration screen so that internal workflowy sublists can be clipped as well
