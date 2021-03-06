# MCh Carousel

## What is MCh Carousel?

A flexible, CSS styled, programmable, right-to-left aware carousel [a.k.a. slideshow], this time by some [obscure developer](https://www.linkedin.com/in/robertogiuntoli) in Barcelona, Spain...

It displays any number of pictures in a horizontal strip, with the ability of sliding left or right, plus a number of features [listed below].
It is appropriate for when multiple pictures must be displayed side by side, but not all of them might fit into the navigator viewport.

## Features
* Unlimited number of images [bandwidth and memory permitting...]
* Auto-slide [enabled by default]
* Touch-screen, keyboard, trackpad and mousewheel support for manual scrolling
* [Optional] navigation and slide-control buttons
* Styled entirely via CSS, including the buttons
* Each image may be wrapped in a hyperlink, which may open in a new window
* On-mouse-hover image [obviously, only for devices with a mouse]
* For each image, up to 3 lines of caption that may be styled independently
* Themes and styles included, useful as a starting point for your customisations
* Custom jQuery events are emitted for significant visual events and user interaction
* Support for both left-to-right and right-to-left carousel flows
* Most options may be changed dynamically, after the carousel has loaded
* [Simple] API for programmatic control of the carousel

See the demo pages in the demo subdirectory and also the documentation in the doc subdirectory.

## Sample usage
The following [pseudo] HTML code gives an idea of the steps involved in creating an MCh Carousel:
```html
  <!-- Set the carousel height. -->
  <style type="text/css">
    #mch-viewport, .mch-image-container {
      height: 320px;
    }
    /* Works with media queries. */
    @media (min-width: 600px) {
      #mch-viewport, .mch-image-container {
        height: 580px;
      }
    }
  </style>
  <!-- Define a container for your images -->
  <div id="whateverIdYouLike">
    <!-- List the images of your carousel; they will be displayed in the carousel
           in the same order as they appear here -->
    <img src=... [more properties...]>
    <img src=... [more properties...]>
    [more images...]
  </div>
  <!-- The Javascript code to create the carousel is pretty simple: -->
  <script type="text/javascript">
    $(function() {
      // This one line starts the carousel up
      $('#whateverIdYouLike').mchCarousel({
        // Optionally, list here the options that you want to change
        //   [with respect to the default ones], for example:
        slideEasingFunction: 'linear',
        displayImageCaptionOptions: {
          when: 'hover'
        }
      });
      ...
      // Now the carousel is up [and running, if you left the auto-slide option on].
      // You may also slide programmatically using:
      $('#whateverIdYouLike').data('mch-carousel').slideNext();
      $('#whateverIdYouLike').data('mch-carousel').slideLeftmost();
    });
  </script>
  </pre>
```

Of course, some CSS and JavaScript also needs to be linked...

Complete information in the documentation [at docs/index.html].
  
## Dependencies
* The following JavaScript library must be included for MCh Carousel to work properly:  
  * [**jQuery 2.1.4**](https://jquery.com/)  
* The following JavaScript library should be included if you need cross-browser support for mousewheel and trackpad in MCh Carousel:  
  * [**jQuery Mouse Wheel Plugin 3.1.13**](https://github.com/jquery/jquery-mousewheel)  
  
If you need support for earlier versions of jQuery and/or the jQuery Mouse Wheel Plugin, let me know [although explicit/official support of jQuery 1.x is out of the question...]  
If you have successfully tested [or not!] the carousel with another version of jQuery and/or the mousewheel plugin, also let me know.  
Support for later version of jQuery should be available shortly after they are released, and will be documented here.  
  
## Browser support  
As a rule of thumb, MCh Carousel will work on any browser supported by jQuery 2.1.4 [see [https://jquery.com/browser-support/](https://jquery.com/browser-support/) for more information]. See the [list of supported browsers](docs/supported-browsers.html) for more information.  
It has been tested successfully on the latest versions [as of September 2015] of:
* Google Chrome [Windows 7, Windows 10, Mac OS X Yosemite, Ubuntu 14.02 and Android]
* Mozilla Firefox [Windows 7, Windows 10, Mac OS X Yosemite, Ubuntu 14.02 and Android]
* Internet Explorer [Windows 7 and Windows 10]
* Microsoft Edge [Windows 10]
* Opera [Windows 7, Windows 10, Mac OS X Yosemite, Ubuntu 14.02 and Android]
* Safari [Mac OS X Yosemite]
* UC Browser [Windows 7, Windows 10 and Android]  
If your experience is [quite] different, then let me know.  
  
## FAQ, Good-To-Know and Trivia
* **Under which licence is MCh Carousel released?**  
This software is released under the MIT licence; see LICENCE.txt.
  
* **Is there a CDN for MCh Carousel?**  
Consider using [RawGit](https://rawgit.com/), who "serves raw files directly from GitHub with proper Content-Type headers". You may choose between pointing to files that sit in the master branch [which are always up-to-date to the latest version of MCh Carousel], or to files  in the release branches [which are stable and never change].
  
* **Is MCh Carousel responsive?**  
Mostly.  
It's fully responsive to changes of width triggered by CSS media queries, or by resizing the window.  
MCh Carousel is responsive to changes of height, when triggered via CSS media queries. See 'The Techie[r] Bits' in the documentation for more details.  
At the moment MCh Carousel is not responsive to changes of height triggered via Javascript. I'm working on fixing these quirks.  
  
* **I'm having problems with Google Chrome and other Chromium-based browsers [Opera and UC Browser]; do you know anything about it?**  
    There are two known problems with Chromium that may affect an MCh Carousel:  
  * [scrollLeft() may return incorrect values](https://code.google.com/p/chromium/issues/detail?id=351692); due to this bug, when the zoom level is other than 100%, the autoslide feature will correctly slide all images from the first one to the last one once, but then it might just halt, instead of automatically sliding back to the first one. The JS code within MCh Carousel copes with this bug, and works around it in all tested scenarios, but your experience might be different... Let me know in case you hit this bug real hard, and we can try to figure out a solution.
  * [Lagging scroll](https://code.google.com/p/chromium/issues/detail?id=92812); due to this bug, you may experience lags when sliding; this is particularly visible when the carousel is loaded with large images [scaled down by CSS] and then autoslide slides from the last image back to the first image: the sliding may be choppy, because Chromium is spending too much time resizing images on the fly and this briefly but perceptibly pauses the animation. Contrary to the previous Chromium bug, this one cannot be worked around in code and, to my knowledge, the only workaround is to use images that match more closely the actual image height of the carousel.  
  
    Neither Firefox nor Internet explorer exhibit the problematic behaviour described above, suggesting that it is indeed rooted in Chromium rather than in MCh Carousel.
  
* **Who is the author?**  
The author is an Italian guy enjoying life in Barcelona, and who recently embarked on the adventure of web development. This is his first publicly-available web project.  
His mission is to deliver quality products, matching customers' needs as much as humanly possible.  
He also believes that cooperation is key in any endavour, so please do send suggestions, ideas, questions, doubts, [constructive] criticism, kudos and anything else, to his email address: [rg@mesmerizedchild.eu](mailto:rg@mesmerizedchild.eu), or give him a tweet at [@mesmerizedChild](https://twitter.com/mesmerizedChild).
Finally, do fork this project, log issues and feel free to create a pull request if you have an interesting addition [or bug fix!]  
  
## Credits
Contains [adapted] code from the following sources:  
* [jQuery RTL Scroll Type Detector](https://github.com/othree/jquery.rtl-scroll-type)  
* [http://jsfiddle.net/scA63/](http://jsfiddle.net/scA63/), posted as a part of the [accepted] reply to [a question in Stack Overflow](http://stackoverflow.com/questions/24276619/better-way-to-get-the-viewport-of-a-scrollable-div-in-rtl-mode)  
  
The documentation pages use:
* [smoothState.js](https://github.com/miguel-perez/smoothState.js/) for page transitions;
* [fancytree](https://github.com/mar10/fancytree/) for the visualisation of the DOM tree.
* Images [sometimes modified] by [h0us3s](https://openclipart.org/user-detail/h0us3s), [dominiquechappard](https://openclipart.org/user-detail/dominiquechappard), [ryanlerch](https://openclipart.org/user-detail/ryanlerch), [libberry](https://openclipart.org/user-detail/libberry) and [davidblyons](https://openclipart.org/user-detail/davidblyons) at openclipart.org.
  
Many thanks to [David Ferrando](mailto:ferr@weareanimals.eu) at [We Are Animals](http://www.weareanimals.eu/) for his input, ideas, creativity and constant support.

If you think I have forgotten someone or something, let me know.
  
## External tools
All LESS and Javascript files compiled and minified with [Koala](http://koala-app.com/) for Windows.
  
## Donations
This is free, open-source software, so donations are completely voluntary, but of course they *are* more than welcome :-) ! If you like this project and would like to support it, you may [donate via Paypal](https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&item_name=Donation%20for%20mch-carousel&item_number=mch-carousel&business=rg@mesmerizedchild.eu&button_subtype=services&currency_code=EUR).  
  
## Th-Th-Th-Th-That's All Folks!
...and **Thank You** for your interest!  
  
Yours Sincerely,
  Roberto Giuntoli [a [mesmerizedChild](https://twitter.com/mesmerizedChild)].
