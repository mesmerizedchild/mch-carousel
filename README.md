# MCh Carousel -- Work in Progress, still not production-ready

## What is MCh Carousel?

Yet another carousel, this time by some [obscure developer](https://www.linkedin.com/in/robertogiuntoli) in Barcelona, Spain...

It displays any number of pictures in a horizontal strip, with the ability of scrolling left or right.  
It is appropriate for when multiple pictures must be displayed side by side, but not all of them might fit into the visible navigator viewport.

## Features
* Unlimited number of images [bandwidth and memory permitting...]
* Touch-screen, keyboard, trackpad and mousewheel support for scrolling
* [Optional] navigation and slide-control buttons
* Styled entirely via CSS, including the buttons
* Each image may be wrapped in a hyperlink
* On-mouse-hover image
* Up to 3 lines of caption for each image, that may be styled independently
* Auto-slide [enabled by default]
* 3 themes included, useful as starting point for your customisations
* Custom jQuery events are emitted for significant visual events
* Support for both left-to-right and right-to-left page flows
* Most options may be changed dynamically, after the carousel has loaded
* [Simple] API for programmatic control of the carousel

## Sample usage
The following [pseudo] HTML code shows quickly the steps involved in creating an MCh Carousel:
```html
  <!-- first define a container for your images -->
  <div id="whateverIdYouLike">
    <div id="mch-image-list"><!-- this div must have its ID set to mch-image-list -->
      <!-- list the images of your carousel; they will be displayed
             in the same order as they appear here -->
      <img src=... [more properties...]>
      <img src=... [more properties...]>
      [more images...]
    </div>
  </div>
  <!-- the Javascript code to create the carousel is pretty simple -->
  <script type="text/javascript">
    // Turn the above list of images into an MCh Carousel
    var theCarousel = $('#whateverIdYouLike').mchCarousel( 
        // Optionally list here the options that you want to change
        //   [with respect to the default ones], for example:
        {
            slideEasingFunction: 'linear',
            displayImageCaptionOptions: {
                when: 'always'
            }
        });
    ...
    // Now the carousel is up [and running, if you left the auto-slide option on].
    // You may also slide programmatically using the object above:
    theCarousel.slideNext();
    theCarousel.slideLeftmost();
    // See the API file [*****] for a complete reference.
  </script>
  </pre>
```
... and here is a fully-fledged [**demo page**](http://www.mesmerizedchild.eu/mch-carousel/mch-carousel-demo/).

## Dependencies
* The following JavaScript library must be included for MCh Carousel to work properly:  
  * [**jQuery 2.1.4**](https://jquery.com/)  
    You may add:  
    ```html
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>  
    ```  
    to your HTML in order to include jQuery from a well-known CDN.
  
* The following JavaScript library should be included if you need cross-browser support for mousewheel and trackpad in MCh Carousel:  
  * [**jQuery Mouse Wheel Plugin 3.1.13**](https://github.com/jquery/jquery-mousewheel)  
    You may add:  
    ```html
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery-mousewheel/3.1.13/jquery.mousewheel.min.js"></script>  
    ```  
    to your HTML in order to include jquery-mousewheel from a well-known CDN.
  
If you need support for earlier versions of jQuery and/or the jQuery Mouse Wheel Plugin, let me know [although support for jQuery 1.x is out of the question...]  
If you have successfully tested [or not!] the carousel with another version of jQuery and/or the mousewheel plugin, also let me know.  
Support for later version of jQuery should be available shortly after they are released, and will be documented here.  

## Browser support  
As a rule of thumb, MCh Carousel will work on any browser supported by jQuery 2.1.4 [see [https://jquery.com/browser-support/](https://jquery.com/browser-support/) for more information].  
It has been tested successfully on the latest versions [as of August 2015] of:
* Google Chrome [Windows 7, Windows 10, Mac OS X Yosemite, Ubuntu 14.02 and Android]
* Mozilla Firefox [Windows 7, Windows 10, Mac OS X Yosemite, Ubuntu 14.02 and Android]
* Internet Explorer [Windows 7 and Windows 10]
* Microsoft Edge [Windows 10]
* Opera [Windows 7, Windows 10, Ubuntu 14.02 and Android]
* Safari [Mac OS X Yosemite]
* UC Browser [Windows 7, Windows 10 and Android]
If your experience is [quite] different, then let me know.  

## FAQ, Good-To-Know and Trivia
* **Under which licence is MCh Carousel released?**  
This software is released under the MIT licence; see LICENCE.txt.

* **Is MCh Carousel responsive?**  
    Mostly.  
    MCh Carousel is fully responsive to changes of height, when triggered via CSS media queries [see ***** for an example]. It's also fully responsive to changes of width triggered by CSS media queries, or by resizing the window.
    At the moment MCh Carousel is not responsive to events triggered by Javascript, such as changing the width and/or height of the DOM elements that contain the carousel.

* **I'm having problems with Google Chrome and other Chromium-based browsers [Opera and UC Browser]; do you know anything about it?**  
    There are two known problems with Chromium that may affect an MCh Carousel:  
  * [scrollLeft() may return incorrect values](https://code.google.com/p/chromium/issues/detail?id=351692); due to this bug, when the zoom level is other than 100%, the autoslide feature will correctly slide all images from the first one to the last one once, but then it might just halt, instead of automatically sliding back to the first one. The JS code within MCh Carousel copes with this bug, and works around it in all tested scenarios, but your experience might be different... Let me know in case you hit this bug real hard, and we can try to figure out a solution.
  * [Lagging scroll](https://code.google.com/p/chromium/issues/detail?id=92812); due to this bug, you may experience lags when sliding; this is particularly visible when the carousel is loaded with large images [scaled down by CSS] and then autoslide slides from the last image back to the first image: the sliding may be choppy, because Chromium is spending too much time resizing images on the fly and this briefly but perceptibly pauses the animation. Contrary to the previous Chromium bug, this one cannot be worked around in code and, to my knowledge, the only workaround is to use images that match more closely the actual image height of the carousel.  
    Neither Firefox nor Internet explorer exhibit the problematic behaviour described above, suggesting that it is indeed rooted in Chromium rather than in MCh Carousel.

* **Who is the author?**  
    The author is an Italian guy enjoying life in Barcelona, and who recently embarked on the adventure of web development. This is his first publicly-available web project.  
    His mission is to deliver quality products, and thus tends to test thoroughly his software before releasing it.  
    He also believes that cooperation is key in any endavour, so please do send suggestions, ideas, [constructive] criticism, kudos and anything else, to his email address: [rg@mesmerizedchild.eu](mailto:rg@mesmerizedchild.eu), or give him a tweet at [@mesmerizedChild](https://twitter.com/mesmerizedChild). Also, do fork this project, log issues and feel free to create a pull request if you have an interesting addition [or bug fix!]  

## Credits
Contains [adapted] code from the following sources:  
* [jquery.rtl-scroll-type](https://github.com/othree/jquery.rtl-scroll-type)  
* [http://jsfiddle.net/scA63/](http://jsfiddle.net/scA63/), posted as a part of the [accepted] reply to [a question in Stack Overflow](http://stackoverflow.com/questions/24276619/better-way-to-get-the-viewport-of-a-scrollable-div-in-rtl-mode)  

## Th-Th-Th-Th-That's All Folks!
...and **Thank You** for your interest!
