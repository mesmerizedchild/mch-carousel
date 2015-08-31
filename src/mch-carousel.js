/**
 * MCh Carousel 1.0
 *
 * © 2015 Roberto Giuntoli [rg@mesmerizedchild.eu]
 * More information at https://github.com/mesmerizedchild/mch-carousel/blob/master/README.md
 *
 * Dependencies:
 *   - jQuery 2 [https://jquery.com/]
 *   - plugin jQuery-mousewheel [https://github.com/jquery/jquery-mousewheel]
 * Licence:
 *   MIT
 *
 * @preserve
 */
 // TODO: Internal events emitted on rootElement should be emitted and listened
 //   on to something else.... event manager, perhaps, or even better make 
 //   rootElement.trigger() a method of the event manager...
 // FIXME: at startup, no slide, then image-hover and the slide starts....
(function($) {
    "use strict";

    // I don't like messing around with prototypes, but this one *is* a nice polyfill :) ...
    if (typeof String.prototype.endsWith !== 'function') {
        String.prototype.endsWith = function(suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
    }

    // On the other hand, I'm ruthless about messing with jQuery's prototype ;) ...
    $.fn.mchCarousel = function(options) {
        var retValue = [];
        $(this).each(function() {
            var t = $(this),
                data,
                carousel;
            if (!t[0]) // Reference to non-existent element
                return;
            if (data = t.data(_st.f)) { // Element already associated to a carousel
                retValue.push(data);
                return;
            }
            carousel = new MChCarousel(t, options);
            t.data(_st.f, carousel);
            retValue.push(carousel);
        });
        switch (retValue.length) {
            case 0:
                return undefined;
            case 1:
                return retValue[0];
        }
        return retValue;
    };

    var _df = {
            // Default options
            automaticSlideOptions: {
                atStartup: true, // Evaluated only at startup
                direction: null,
                pauseMs: 3000,
                pauseOnHoverImage: true,
                pauseOnHoverButtons: false
            },
            slideOneImageAnimation: '2000px/s',
            slideAllImagesAnimation: '3236px/s',
            slideEasingFunction: 'swing',
            autoCenterOnHover: true,
            displayButtons: 'hover', // never, hover, always
            displayCaption: 'hover', // never, hover, always
            captureArrowKeys: true,
            captureArrowKeysOptions: {
                selector: 'body'
            },
            slideWithMouseWheel: true,
            advanced: {
                slideTolerance: 5,
                mousewheelAutocentreInactivityMs: 1000,
                mousewheelMultiplier: 40,
                divCleanup: true,
            },
        },
        _st = {
            // Various strings
            f: 'mch-carousel',
            p: 'px/s',
            x: 'px',
            a: 'mch-invisible',
            h: 'mch-no-hover',
            w: 'default',
            n: 'negative',
            r: 'reverse',

            // Selectors, class names and ID's
            s: '#mch-visible-carousel',
            S: 'mch-visible-carousel',
            c: '#mch-viewport',
            C: 'mch-viewport',
            b: '.mch-button',
            B: 'mch-button',
            t: '.mch-caption-cntnr',
            T: 'mch-caption-cntnr',
            k: '.mch-image-container',
            K: 'mch-image-container',
            m: '.mch-padding',
            M: 'mch-padding',
            l: '#mch-image-list',
            L: 'mch-image-list',
            Z: 'mch-buttons-pane',
            Z1: 'mch-slide-control-group',
            Z2: 'mch-left-right-group',
            Z3: 'mch-start-end-group',
            G: 'mch-button-background',
            J: 'mch-button-graphics',
            D: 'mch-hyperlink',
            E: 'mch-caption-lines',
            E0: 'mch-caption-background',
            E1: 'mch-caption-line1',
            E2: 'mch-caption-line2',
            E3: 'mch-caption-line3',
            F: 'mch-image',
            Q: 'mch-scrollable-viewport',
            R: 'mch-navigation',
            O: 'mch-slide-control',

            // Internal event names
            ia: '_mch-carousel:enter-image',
            ib: '_mch-carousel:auto-centre',
            ic: '_mch-carousel:leave-image',
            ie: '_mch-carousel:enter-carousel',
            ig: '_mch-carousel:leave-carousel',
            im: '_mch-carousel:options-changed',
            ix: '_mch-carousel:pause-auto-slide',
            iz: '_mch-carousel:restart-auto-slide',
            iy: '_mch-carousel:reschedule-auto-slide',
            it: '_mch-carousel:cancel-auto-slide',
            i5: '_mch-carousel:slide-prev',
            i6: '_mch-carousel:slide-next',
            i7: '_mch-carousel:slide-first',
            i8: '_mch-carousel:slide-last',
            i9: '_mch-carousel:auto-next',
        },
        _ev = {
            /* Public event names */

            /* The following events receive the DOM for carousel [.mch-carousel]: */
            p: 'mch-carousel:enter-carousel',
            r: 'mch-carousel:leave-carousel',

            /* The following events receive the DOM for viewport [#mch-scrollable-viewport]: */
            c: 'mch-carousel:before-slide-left',
            d: 'mch-carousel:slide-left',
            e: 'mch-carousel:before-slide-right',
            f: 'mch-carousel:slide-right',
            g: 'mch-carousel:before-slide-leftmost',
            h: 'mch-carousel:slide-leftmost',
            i: 'mch-carousel:before-slide-rightmost',
            j: 'mch-carousel:slide-rightmost',
            C: 'mch-carousel:before-slide-prev',
            D: 'mch-carousel:slide-prev',
            E: 'mch-carousel:before-slide-next',
            F: 'mch-carousel:slide-next',
            G: 'mch-carousel:before-slide-first',
            H: 'mch-carousel:slide-first',
            I: 'mch-carousel:before-slide-last',
            J: 'mch-carousel:slide-last',

            /* The following events receive the DOM for image container [.mch-image-container]: */
            a: 'mch-carousel:before-autocentre-image',
            b: 'mch-carousel:autocentre-image',
            l: 'mch-carousel:enter-image',
            n: 'mch-carousel:leave-image',

            /* The following events receive the DOM for button [.mch-button]: */
            s: 'mch-carousel:enter-button',
            t: 'mch-carousel:leave-button',
        };

    // Copy the content of _ev to eventNames, converting from object to plain array.
    var _en = $.fn.mchCarousel.eventNames = [];
    $.each(_ev, function(key, value) {
        _en.push(value);
    });
    $.fn.mchCarousel.defaultOptions = _df;

    /*
     * The object that generates the carousel from the images in the <div>,
     *   and handles incoming events.
     * @constructor
     */
    var MChCarousel = function(rootElement, options) {

        // Mix the input options [if any] with the default ones.
        options = $.extend(true, {}, _df, options);
        buildHiddenOptions();

        // From now on, it's all function and class declarations.
        // The main body of this function resumes where 
        //   the comment reads: Main body resumes.

        // To which element does this MchCarousel instance belong?
        // Result is a jQuery object wrapping the actual DOM element
        function getObject() {
            return rootElement;
        }

        // To which element does this MchCarousel instance belong?
        // Result is the actual DOM element
        function getDomObject() {
            return rootElement[0];
        }

        function buildImageList() {
            var retValue = $('<div id="' + _st.L + '"></div>');
            rootElement.find('img').each(function() {
                // Re-parent the image to retValue
                retValue.append(this);
            });

            /* Εnsure that we start with a clean slate [i.e. no elements
                 other than #mch-image-list in the carousel].
               This is needed mostly with WordPress, because it 'likes'
                 to throw stray <p>'s into the HTML even when we are editing
                 our page or post from the Text tab... go figure.
               Regardless of why that happens, those stray <p>'s do take up
                 space in the carousel, offsetting the viewport and all other
                 elements, thus making it appear as if the carousel itself
                 were defective. Thank you WP :) ... 
               I'm not sure I can see a scenario where this cleanup would hurt,
                 but anyway I've made it optional, with the default set to true. */
            if(options.advanced.divCleanup)
                rootElement.html('');
            rootElement.append(retValue);
            return retValue;
        }

        function windowResized() {
            domCarousel.carouselResized();
        }

        function changeOptions(optionValuePair) {
            options = $.extend(true, {}, options, optionValuePair);
            buildHiddenOptions();
            rootElement.trigger(_st.im); // _mch-carousel:options-changed
        }

        function buildHiddenOptions() {
            var hid = options._h || (options._h = {}),
                one = options.slideOneImageAnimation,
                all = options.slideAllImagesAnimation;
            // These options are hidden, so they don't need meaningful names, but here we go:
            //   oau = Speed unit for one-image sliding: px/s or ms
            //   oav = Value for one-image sliding
            //   aau = Unit for all-left or all-right sliding: px/s or ms
            //   aav = Value for all-left or all-right sliding
            hid.oau = one ? ((one.endsWith(_st.x) ||
                one.endsWith(_st.p)) ? _st.p : 'ms') : '1000px';
            hid.oav = one ? parseInt(one) : 500;
            hid.aau = all ? ((all.endsWith(_st.x) ||
                all.endsWith(_st.p)) ? _st.p : 'ms') : '1609px';
            hid.aav = all ? parseInt(all) : 1500;
        }

        function slidesLtr() {
            // Imposed by the options...
            switch (options.automaticSlideOptions.direction) {
                case 'ltr':
                    return true;
                case 'rtl':
                    return false;
            }
            // ...or taken from the page itself.
            return isLtr(rootElement);
        }

        // Utility methods to reduce the size of the code [especially when minified]
        function triggerRescheduleAutoSlide() {
            rootElement.trigger(_st.iy);
        }

        function makeInvisible(element) {
            element.addClass(_st.a);
        }

        function makeVisible(element) {
            element.removeClass(_st.a);
        }

        function isBeingHovered(element) {
            element.removeClass(_st.h);
        }

        function isNotBeingHovered(element) {
            element.addClass(_st.h);
        }

        /*
         * Very basic timer implementation.
         * @constructor
         * @param {string} funct The function to be invoked at every tick
         * @param {} time It may be an integer or a function returning an integer,
                            expressing how often the timer should tick. If it's a
                            function, it's evaluated at every tick to determine
                            when the next tick should occurr. */
        var Timer = function(funct, time) {
            var res = null,
                paused = false,
                _time = (typeof time === 'function' ? time : function() {
                    return time;
                });
            this.schedule = schedule;
            this.cancel = cancel;
            this.reschedule = reschedule;
            this.pause = pause;
            this.restart = restart;
            this.isPaused = isPaused;

            // If paused, don't do anything.
            // If a timeout is already scheduled, don't do anything.
            // Otherwise, do schedule the timeout.
            function schedule() {
                if (!paused && res==null) {
                    res = window.setTimeout(function() {
                        funct();
                        res = null; // Reset res after execution
                    }, _time());
                }
            }

            function cancel() {
                if (res)
                    window.clearTimeout(res);
                res = null;
            }

            function reschedule() {
                cancel();
                schedule();
            }

            function pause() {
                paused = true;
                cancel();
            }

            function restart() {
                paused = false;
                reschedule();
            }

            function isPaused() {
                return paused;
            }
        };

        /*
         * Handles events coming in via the API, as well as via the buttons
         *
         * @constructor
         */
        var EventManager = function() {
            this.pauseAutoslide = pauseAutoslide;
            this.restartAutoslide = restartAutoslide;
            this.slideLeft = slideLeft;
            this.slideRight = slideRight;
            this.slideLeftmost = slideLeftmost;
            this.slideRightmost = slideRightmost;
            this.slidePrev = slidePrev;
            this.slideNext = slideNext;
            this.slideFirst = slideFirst;
            this.slideLast = slideLast;

            function pauseAutoslide() {
                rootElement.trigger(_st.ix); // _mch-carousel:pause-auto-slide
            }

            function restartAutoslide() {
                rootElement.trigger(_st.iz); // _mch-carousel:restart-auto-slide
            }

            function slideLeft() {
                var ltr;
                triggerRescheduleAutoSlide();
                triggerBeforeSlideLeft();
                if (ltr = slidesLtr()) {
                    triggerBeforeSlidePrev();
                    triggerInternalSlidePrev();
                } else {
                    triggerBeforeSlideNext();
                    triggerInternalSlideNext();
                }
                triggerSlideLeft();
                if (ltr)
                    triggerSlidePrev();
                else
                    triggerSlideNext();
            }

            function slideRight() {
                var ltr;
                triggerRescheduleAutoSlide();
                triggerBeforeSlideRight();
                if (ltr = slidesLtr()) {
                    triggerBeforeSlideNext();
                    triggerInternalSlideNext();
                } else {
                    triggerBeforeSlidePrev();
                    triggerInternalSlidePrev();
                }
                triggerSlideRight();
                if (ltr)
                    triggerSlideNext();
                else
                    triggerSlidePrev();
            }

            function slideLeftmost() {
                var ltr;
                triggerRescheduleAutoSlide();
                triggerBeforeSlideLeftmost();
                if (ltr = slidesLtr()) {
                    triggerBeforeSlideFirst();
                    triggerInternalSlideFirst();
                } else {
                    triggerBeforeSlideLast();
                    triggerInternalSlideLast();
                }
                triggerSlideLeftmost();
                if (ltr)
                    triggerSlideFirst();
                else
                    triggerSlideLast();
            }

            function slideRightmost() {
                var ltr;
                triggerRescheduleAutoSlide();
                triggerBeforeSlideRightmost();
                if (ltr = slidesLtr()) {
                    triggerBeforeSlideLast();
                    triggerInternalSlideLast();
                } else {
                    triggerBeforeSlideFirst();
                    triggerInternalSlideFirst();
                }
                triggerSlideRightmost();
                if (ltr)
                    triggerSlideLast();
                else
                    triggerSlideFirst();
            }

            function slidePrev() {
                var ltr;
                triggerRescheduleAutoSlide();
                if (ltr = slidesLtr())
                    triggerBeforeSlideLeft();
                else
                    triggerBeforeSlideRight();
                triggerBeforeSlidePrev();
                triggerInternalSlidePrev();
                if (ltr = slidesLtr())
                    triggerSlideLeft();
                else
                    triggerSlideRight();
                triggerSlidePrev();
            }

            function slideNext() {
                var ltr;
                triggerRescheduleAutoSlide();
                if (ltr = slidesLtr())
                    triggerBeforeSlideRight();
                else
                    triggerBeforeSlideLeft();
                triggerBeforeSlideNext();
                triggerInternalSlideNext();
                if (ltr = slidesLtr())
                    triggerSlideRight();
                else
                    triggerSlideLeft();
                triggerSlideNext();
            }

            function slideFirst(e) {
                var ltr;
                triggerRescheduleAutoSlide();
                if (ltr = slidesLtr())
                    triggerBeforeSlideLeftmost();
                else
                    triggerBeforeSlideRightmost();
                triggerBeforeSlideFirst();
                triggerInternalSlideFirst();
                if (ltr = slidesLtr())
                    triggerSlideLeftmost();
                else
                    triggerSlideRightmost();
                triggerSlideFirst();
            }

            function slideLast() {
                var ltr;
                triggerRescheduleAutoSlide();
                if (ltr = slidesLtr())
                    triggerBeforeSlideRightmost();
                else
                    triggerBeforeSlideLeftmost();
                triggerBeforeSlideLast();
                triggerInternalSlideLast();
                if (ltr = slidesLtr())
                    triggerSlideRightmost();
                else
                    triggerSlideLeftmost();
                triggerSlideLast();
            }

            // These functions [with their self-descriptive names] help
            //   understand what is going on in the functions above, and
            //   also reduce the size of the code when minified.
            function triggerBeforeSlideLeft() {
                rootElement.trigger(_ev.c);
            }

            function triggerSlideLeft() {
                rootElement.trigger(_ev.d);
            }

            function triggerBeforeSlideRight() {
                rootElement.trigger(_ev.e);
            }

            function triggerSlideRight() {
                rootElement.trigger(_ev.f);
            }

            function triggerBeforeSlideLeftmost() {
                rootElement.trigger(_ev.g);
            }

            function triggerSlideLeftmost() {
                rootElement.trigger(_ev.h);
            }

            function triggerBeforeSlideRightmost() {
                rootElement.trigger(_ev.i);
            }

            function triggerSlideRightmost() {
                rootElement.trigger(_ev.j);
            }

            function triggerBeforeSlidePrev() {
                rootElement.trigger(_ev.C);
            }

            function triggerSlidePrev() {
                rootElement.trigger(_ev.D);
            }

            function triggerBeforeSlideNext() {
                rootElement.trigger(_ev.E);
            }

            function triggerSlideNext() {
                rootElement.trigger(_ev.F);
            }

            function triggerBeforeSlideFirst() {
                rootElement.trigger(_ev.G);
            }

            function triggerSlideFirst() {
                rootElement.trigger(_ev.H);
            }

            function triggerBeforeSlideLast() {
                rootElement.trigger(_ev.I);
            }

            function triggerSlideLast() {
                rootElement.trigger(_ev.J);
            }

            function triggerInternalSlideFirst() {
                rootElement.trigger(_st.i7);
            }

            function triggerInternalSlidePrev() {
                rootElement.trigger(_st.i5);
            }

            function triggerInternalSlideNext() {
                rootElement.trigger(_st.i6);
            }

            function triggerInternalSlideLast() {
                rootElement.trigger(_st.i8);
            }
        };

        /*
         * The class handling the automatic slide. 
         * @constructor
         */
        var AutoSlider = function(carousel) {
            var domCarousel = carousel[0],
                timedSlide = new Timer(timedSlideFunct, function() {
                    return options.automaticSlideOptions.pauseMs;
                }),
                hoveringButtons = false,
                hoveringCarousel = false;

            rootElement.on(_st.ix, function() {
                //console.log('timer pause');
                timedSlide.pause();
            });
            rootElement.on(_st.iz, function() {
                //console.log('timer restart');
                timedSlide.restart();
            });
            rootElement.on(_st.iy, function() {
                //console.log('timer reschedule');
                timedSlide.reschedule();
            });
            rootElement.on(_st.it, function() {
                //console.log('timer cancel');
                timedSlide.cancel();
            });

            rootElement.on(_st.ia, enteredImage);
            rootElement.on(_st.ic, leftImage);
            rootElement.on(_ev.s, enteredButton);
            rootElement.on(_ev.t, leftButton);
            rootElement.on(_st.im, optionsChanged);

            // Ready or not, here I come!
            if(options.automaticSlideOptions.atStartup)
                timedSlide.schedule();
            else
                timedSlide.pause();

            function timedSlideFunct() {
                // Slide only if visible...
                if (carousel.is(':visible'))
                    rootElement.trigger(_st.i9); // _mch-carousel:auto-next
                timedSlide.schedule(); // Schedule next tick, regardless...
            }

            function enteredImage(e) {
                if(options.automaticSlideOptions.pauseOnHoverImage)
                    timedSlide.cancel();
            }

            function leftImage(e) {
                if(options.automaticSlideOptions.pauseOnHoverImage)
                    timedSlide.schedule();
            }

            function enteredButton(e) {
                if(options.automaticSlideOptions.pauseOnHoverButtons)
                    timedSlide.cancel();
            }

            function leftButton(e) {
                if(options.automaticSlideOptions.pauseOnHoverButtons)
                    timedSlide.schedule();
            }

            function optionsChanged() {
                // Assume unhovered
            }
        };

        /*
         * The object that wraps the visible carousel.
         * @constructor
         */
        var Carousel = function() {
            var carousel = $('<div id="' + _st.S + '"></div>'),
                buttonsPane,
                viewport,
                justUsedWheel = false,
                noWheel = new Timer(noWheelFunct, function() {
                    return options.advanced.mousewheelAutocentreInactivityMs;
                }),
                hoveringButtons = false;
            carousel.on({
                mouseenter: enterCarousel,
                mouseleave: leaveCarousel
            });
            carousel.on(_st.ia, enteredImage);
            rootElement.on(_st.im, optionsChanged);
            optionsChanged();

            var dom = carousel[0];

            dom.carouselResized = carouselResized;
            dom.setViewport = setViewport;
            dom.getViewport = getViewport;
            dom.setButtonsPane = setButtonsPane;
            dom.getButtonsPane = getButtonsPane;

            return carousel;

            function setViewport(v) {
                if (viewport) {
                    viewport.off('mousewheel', mouseWheelScroll);
                    viewport.remove();
                }
                if (viewport = v) {
                    carousel.prepend(viewport);
                    viewport.on({
                        mousewheel: mouseWheelScroll
                    });
                }
            }

            function getViewport() {
                return viewport;
            }

            function setButtonsPane(p) {
                if (buttonsPane)
                    buttonsPane.remove();
                carousel.append(buttonsPane = p);
            }

            function getButtonsPane() {
                return buttonsPane;
            }

            function enteredImage(e) {
                if (canViewportAutoCentre())
                    $(e.target).trigger(_st.ib, e.target); // _mch-carousel:auto-centre
            }

            function attachArrowsHandling() {
                if (options.captureArrowKeys) {
                    var s = $(options.captureArrowKeysOptions.selector),
                        f = function(e) {
                            if (!viewport)
                                return;
                            if (e.keyCode === 37) { // left
                                eventManager.slideLeft();
                            } else if (e.keyCode === 39) { // right
                                eventManager.slideRight();
                            }
                        };

                    if (s[0]) { // Does the selector reference valid DOM?
                        s.on('keydown', f);
                        var hid;
                        // Store for detaching, if the options change
                        (hid = options._h).cD = s[0];
                        hid.cF = f;
                    }
                }
            }

            function detachArrowsHandling() {
                var hid;
                if ((hid = options._h).cD) {
                    // We need to be specific as to which handler we want to unlink
                    //   for the [unlikely] case that two or more carousels are
                    //   in the same page
                    $(hid.cD).off('keydown', hid.cF);
                    hid.cD = null;
                }
            }

            function optionsChanged() {
                detachArrowsHandling();
                carouselResized();
                attachArrowsHandling();
            }

            function carouselResized() {
                if (!buttonsPane)
                    return;
                // Show or hide the buttons, depending on the options and on the current width
                if (options.displayButtons !== 'never' && carousel.width() < viewport[0].totalWidth())
                    buttonsPane[0].showNavigationButtons();
                else
                    buttonsPane[0].hideNavigationButtons();
            }

            function enterCarousel(e) {
                rootElement.trigger(_st.ie); // _mch-carousel:enter-carousel
                carousel.trigger(_ev.p); // carousel-enter
            }

            function leaveCarousel(e) {
                rootElement.trigger(_st.ig); // _mch-carousel:leave-carousel
                carousel.trigger(_ev.r); // carousel-leave
            }

            function mouseWheelScroll() {
                justUsedWheel = true;
                // Start the no-wheel timer; during this time, carousel images will not auto-centre.
                noWheel.reschedule();
            }

            // After some time without using the mouse wheel,
            //   restart auto-slide and re-enable auto-centre
            function noWheelFunct() {
                justUsedWheel = false;
                triggerRescheduleAutoSlide();
            }

            function canViewportAutoCentre() {
                return options.autoCenterOnHover && !justUsedWheel;
            }
        };

        var SubPane = function(id) {
            var subPane = $('<div id="' + id + '"></div>');
            rootElement.on(_st.ie, hoveredButtons);
            rootElement.on(_st.ig, unhoveredButtons);
            rootElement.on(_st.im, optionsChanged);
            optionsChanged();

            var dom = subPane[0];

            dom.addButton = addButton;

            return subPane;

            function addButton(b) {
                subPane.append(b);
            }

            function optionsChanged() {
                switch(options.displayButtons) {
                    case 'hover':
                        // Assume unhovered
                        isNotBeingHovered(subPane);
                        makeVisible(subPane);
                        break;
                    case 'never':
                        makeInvisible(subPane);
                        break;
                    // case 'always':
                    default: // Show whether case is 'always', or some gibberish
                        isBeingHovered(subPane);
                        makeVisible(subPane);
                }
            }

            function hoveredButtons() {
                // Show the buttons if needed
                if (options.displayButtons === 'hover')
                    isBeingHovered(subPane);
            }

            function unhoveredButtons() {
                // Hide the button if needed
                if (options.displayButtons === 'hover')
                    isNotBeingHovered(subPane);
            }
        }

        /*
         * The button pane.<br/>
         * It creates and contains all buttons, then it's up to the CSS to decide
         *   which ones to show, and which ones to hide.
         * @constructor
         */
        var ButtonsPane = function() {
            var buttonsPane = $('<div id="' + _st.Z + '"></div>'),
                slideControlGroup = new SubPane(_st.Z1),
                leftRightGroup = new SubPane(_st.Z2),
                startEndGroup = new SubPane(_st.Z3),
                panes = [ slideControlGroup, leftRightGroup, startEndGroup ];

            addSCGButton(new CarouselButton('mch-pause', 'sc', eventManager.pauseAutoslide));
            addSCGButton(new CarouselButton('mch-restart', 'sc', eventManager.restartAutoslide));
            addLRGButton(new CarouselButton('mch-leftmost', 'nlr', eventManager.slideLeftmost));
            addLRGButton(new CarouselButton('mch-left', 'nlr', eventManager.slideLeft));
            addLRGButton(new CarouselButton('mch-right', 'nlr', eventManager.slideRight));
            addLRGButton(new CarouselButton('mch-rightmost', 'nlr', eventManager.slideRightmost));
            addSEGButton(new CarouselButton('mch-first', 'nse', eventManager.slideFirst));
            addSEGButton(new CarouselButton('mch-prev', 'nse', eventManager.slidePrev));
            addSEGButton(new CarouselButton('mch-next', 'nse', eventManager.slideNext));
            addSEGButton(new CarouselButton('mch-last', 'nse', eventManager.slideLast));

            buttonsPane.append(slideControlGroup).append(leftRightGroup).append(startEndGroup);

            //rootElement.on(_st.im, optionsChanged);

            var dom = buttonsPane[0];

            dom.showNavigationButtons = showNavigationButtons;
            dom.hideNavigationButtons = hideNavigationButtons;

            return buttonsPane;

            // TODO: this might compete with options.displayButtons
            function showNavigationButtons() {
                makeVisible(leftRightGroup);
                makeVisible(startEndGroup);
            }

            function hideNavigationButtons() {
                makeInvisible(leftRightGroup);
                makeInvisible(startEndGroup);
            }

            // Utility functions to reduce the code size a bit when minifying...
            function addSCGButton(b) {
                slideControlGroup[0].addButton(b);
            }

            function addLRGButton(b) {
                leftRightGroup[0].addButton(b);
            }

            function addSEGButton(b) {
                startEndGroup[0].addButton(b);
            }
        };

        /*
         * Any one of the carousel buttons.
         * @constructor
         */
        var CarouselButton = function(id, nav, onClick) {
            var btn = $('<div class="' + _st.B +
                // TODO add another class based on nav = nlr or nse
                ' ' + (nav === 'sc' ? _st.O : _st.R) +
                '" id="' + id + '"><div class="' + _st.G + '"></div><div class="' + _st.J + '"></div></div>');
            btn.on({
                click: onClick,
                dblclick: ignoreDoubleClick,
                mouseenter: enterButton,
                mouseleave: leaveButton
            });

            // As the buttons are actually empty HTML [styled via CSS, but still
            //   empty HTML], if you double click on one of them then the text
            //   around it will highlight, that is: double-click triggers text 
            //   selection. The following will stop that...
            // Curiously, jQuery does not provide support for onselectstart...
            btn[0].onselectstart = ignoreDoubleClick;

            // var dom = btn[0]; No methods to attach here.

            return btn;

            function enterButton(e) {
                btn.trigger(_ev.s); // enter-button
            }

            function leaveButton(e) {
                btn.trigger(_ev.t); // leave-button
            }

            function ignoreDoubleClick(e) {
                e.preventDefault();
            }
        };

        /*
         * The object that wraps an image and its caption [if present]
         * @constructor
         */
        var ImageContainer = function(t) {
            // Take the information from the image [in #mch-image-list]
            //   and build a DOM element ready for the viewport [in #mch-scrollable-viewport]
            var id = t.prop('id'),
                clazz = t.prop('class'),
                src = t.prop('src'),
                alt = t.prop('alt'),
                imgOver = t.data('img-over'),
                captionDisplay = t.data('caption-display'),
                data = t.data('data'),
                captionLang = t.data('caption-lang'),
                captionLine1 = t.data('caption-line1'),
                captionLine2 = t.data('caption-line2'),
                captionLine3 = t.data('caption-line3'),
                link = t.data('link'),
                newWin = t.data('open-in-new-window'),
                imgCntnr = $('<div class="' + _st.K +
                    (clazz ? ' ' + clazz : '') + '"' +
                    (id ? ' id="' + id + '"' : '') +
                    (data ? ' data-data="' + data + '"' : '') +
                    '></div>'),
                forAppend,
                captionCntnr;

            // Maybe add the link...
            if (link)
                imgCntnr.append(forAppend = $('<a class="' + _st.D + '" href="' + link + '"' +
                    (newWin ? ' target="_blank"' : '') +
                    '></a>'));
            else
                forAppend = imgCntnr;

            // Caption, anybody?
            if (captionLine1 || captionLine2 || captionLine3) {
                captionCntnr = $('<div class="' + _st.T +
                    '"><div class="' + _st.E0 + // mch-caption-background
                    '"></div><div class="' + _st.E + // mch-caption-lines
                    '"' + (captionLang ? ' lang="' + captionLang + '"' : '') +
                    '>' +
                    (captionLine1 ? '<div class="' + _st.E1 + '"><p>' + captionLine1 + '</p></div>' : '') +
                    (captionLine2 ? '<div class="' + _st.E2 + '"><p>' + captionLine2 + '</p></div>' : '') +
                    (captionLine3 ? '<div class="' + _st.E3 + '"><p>' + captionLine3 + '</p></div>' : '') +
                    '</div></div>');
                forAppend.append(captionCntnr);
            }

            // Add the image...
            forAppend.append('<img class="' + _st.F + '" src="' + src +
                '" data-src="' + src + '" ' +
                (alt ? ' alt="' + alt + '" ' : '') +
                (imgOver ? ' data-img-over="' + imgOver + '" ' : '') +
                (captionDisplay ? ' data-caption-display="' + captionDisplay + '" ' : '') +
                //'style="height: 100%;" ' +
                '></img>');

            // Attach the events to the image container
            imgCntnr.on({
                mouseenter: enterImage,
                mouseleave: leaveImage
            });
            rootElement.on(_st.im, optionsChanged);

            // Save some more data for the methods...
            var img = imgCntnr.find('img'),
                hasImgOver = !!(img.data('img-over'));
            optionsChanged(); // Get the caption visibility in sync with the options

            // var dom = imgCntnr[0]; No methods to attach here.

            return imgCntnr;

            function enterImage() {
                // If an overlay image is defined, change the image now
                if (hasImgOver)
                    img.prop('src', imgOver);

                // Display the caption
                captionsOn();

                imgCntnr.trigger(_st.ia); // _mch-carousel:enter-image

                imgCntnr.trigger(_ev.l); // enter-image
            }

            function leaveImage() {
                // If an overlay image is defined, restore the original image now
                if (hasImgOver)
                    img.prop('src', src);

                captionsOff();

                imgCntnr.trigger(_st.ic); // _mch-carousel:leave-image

                imgCntnr.trigger(_ev.n); // leave-image
            }

            function captionsOn() {
                // Show the caption if needed
                if (captionCntnr && captionsWhen() === 'hover')
                    isBeingHovered(captionCntnr);
            }

            function captionsOff() {
                // Hide the caption if needed
                if (captionCntnr && captionsWhen() === 'hover')
                    isNotBeingHovered(captionCntnr);
            }

            function captionsWhen() {
                var display;
                // caption-display on the image takes precedence over the options
                if (display = img.data('caption-display'))
                    return display;
                return options.displayCaption;
            }

            function optionsChanged() {
                if (captionCntnr)
                    switch(captionsWhen()) {
                        case 'hover':
                            // Assume unhovered
                            isNotBeingHovered(captionCntnr);
                            makeVisible(captionCntnr);
                            break;
                        case 'never':
                            makeInvisible(captionCntnr);
                            break;
                        // case 'always':
                        default: // Show whether case is 'always', or some gibberish
                            isBeingHovered(captionCntnr);
                            makeVisible(captionCntnr);
                    }
            }
        };

        /*
         * The in-between padding.
         * @constructor
         */
        var Padding = function() {
            var padding = $('<div class="' + _st.M + '"></div>');

            // var dom = padding[0]; No methods to attach here.

            return padding;
        }

        /*
         * The part of the carousel that contains the images. 
         * @constructor
         */
        var Viewport = function(imageList) {
            var viewport = $('<div id="' + _st.C + '"></div>'),
                scrollableViewport = $('<div id="' + _st.Q + '"></div>'),
                idx = 0,
                imgCntnrs = [],
                pads = [],
                totalSize = 0,
                prevPad = [],
                nextPad = [],
                startPx = [],
                endPx = [];
            viewport.append(scrollableViewport);

            // Scan the list of images and create new containers.
            imageList.find('img').each(function() {
                var imgCntnr = new ImageContainer($(this));
                // Can anybody explain why imgCntnr.attr('data-idx', idx++) works, 
                //   while imgCntnr.data('idx', idx++) just won't?
                imgCntnr.attr('data-idx', idx++);
                imgCntnrs.push(imgCntnr);
            });

            // Add the containers to the viewport, together with
            //   in-between padding
            for(var i=0; i<imgCntnrs.length; i++) {
                if(i!=0) {
                    var pad = new Padding();
                    pad.attr('data-img-before', i-1);
                    pad.attr('data-img-after', i);
                    scrollableViewport.append(pad);
                }
                scrollableViewport.append(imgCntnrs[i]);
            }

            // Attach events
            scrollableViewport.on({
                mousewheel: mousewheelScroll,
                scroll: triggerRescheduleAutoSlide
            });
            scrollableViewport.on(_st.ib, autoCentre);

            // Should be done better, by attaching the methods via
            //   the event manager
            rootElement.on(_st.i5, slidePrev);
            rootElement.on(_st.i6, slideNext);
            rootElement.on(_st.i7, slideFirst);
            rootElement.on(_st.i8, slideLast);
            rootElement.on(_st.i9, autoNext);
            // rootElement.on(_st.im, optionsChanged);

            // Fix scrollLeft(), which works inconsistently across browsers
            //   with RTL elements. Hopefully we can remove this hack in
            //   some future version of jQuery.
            addScrollStart(scrollableViewport, options);

            var dom = viewport[0];

            dom.totalWidth = totalWidth;

            return viewport;

            function calc(excludeArrays) {
                var currLeft = prevPad.length = nextPad.length = startPx.length = endPx.length = 0;
                // Relying on the fact that find() returns elements in document order
                scrollableViewport.find(_st.k).each(function() {
                    var w = parseInt($(this).css('width'));
                    if (!excludeArrays) {
                        // If we have padding, let's save it and take it into account
                        //   for currLeft.
                        var padElem = $(this).prev(_st.m),
                            padW = padElem[0] ? parseInt(padElem.css('width')) : 0;
                        prevPad.push(padW);
                        currLeft += padW;

                        // And now save the next padding.
                        padElem = $(this).next(_st.m);
                        nextPad.push(padElem[0] ? parseInt(padElem.css('width')) : 0);

                        startPx.push(currLeft);
                        endPx.push(currLeft + w);
                    }
                    currLeft += w;
                });
                totalSize = currLeft;
            }

            function totalWidth() {
                calc(true);
                return totalSize;
            }

            function autoCentre(e, ic) {
                calc();
                // Here, ic is the DOM element corresponding to the image container
                var t = $(ic),
                    i = t.data('idx'),
                    w = Math.round(containerWidth()),
                    sl = Math.round(scrollableViewport.scrollStart()),
                    sr = sl + w,
                    sp = startPx[i],
                    ep = endPx[i];

                // Don't auto-centre if the viewport is smaller than the image
                //   and the image is already filling it [i.e. there are no
                //   fragments of other images into view].
                if (w < ep - sp && sp <= sl && ep >= sr)
                    return;

                if (sp < sl) {
                    t.trigger(_ev.a); // before-autocentre-image
                    animatedScrollToOneImage(sp);
                    t.trigger(_ev.b); // autocentre-image
                } else if (ep > sr) {
                    t.trigger(_ev.a); // before-autocentre-image
                    animatedScrollToOneImage(ep - w);
                    t.trigger(_ev.b); // autocentre-image
                }
            }

            function slidePrev() {
                calc();
                var sl = Math.round(scrollableViewport.scrollStart()),
                    t = options.advanced.slideTolerance;
                if (sl > t) {
                    for (var i = 0; i < endPx.length; i++)
                        if (endPx[i] + nextPad[i] >= sl - t) {
                            animatedScrollToOneImage(startPx[i]);
                            return true;
                        }
                }
            }

            function slideNext() {
                calc();
                var w = Math.round(containerWidth()),
                    sr = Math.round(scrollableViewport.scrollStart() + w),
                    t = options.advanced.slideTolerance;
                if (sr < totalSize - t) {
                    for (var i = startPx.length - 1; i >= 0; i--)
                        if (startPx[i] - prevPad[i] <= sr + t) {
                            animatedScrollToOneImage(endPx[i] - w);
                            return true;
                        }
                }
            }

            function slideFirst() {
                // calc(); Not necessary
                animatedScrollToAllImages(0);
            }

            function slideLast() {
                calc();
                animatedScrollToAllImages(endPx[endPx.length - 1] - containerWidth());
            }

            function autoNext() {
                if (!slideNext())
                    slideFirst();
            }

            function containerWidth() {
                var c;
                return (c = viewport.closest(_st.s))[0] ? c.width() : undefined;
            }

            // Scrolling, for only one image
            function animatedScrollToOneImage(to) {
                var h;
                scrollableViewport.animatedScrollStart(to, (h = options._h).oau, h.oav);
            }

            // Scrolling, for the whole viewport
            function animatedScrollToAllImages(to) {
                var h;
                scrollableViewport.animatedScrollStart(to, (h = options._h).aau, h.aav);
            }

            // Handle mouse wheel
            // TODO: is this the right place, considering the EventManager?
            function mousewheelScroll(e) {
                if (!options.slideWithMouseWheel)
                    return;

                // Disable auto-slide while 'wheeling'
                rootElement.trigger(_st.it); // cancel-auto-slide

                // FIXME; this could be what breaks Safari 6!!!
                e = window.event || e;

                // In the following, delta is normalised based solely on
                //   the scrolling direction [up/down or left/right].
                // The actual amount by which the carousel scrolls is determined
                //   by options.advanced.mousewheelMultiplier

                // Events are reversed in Firefox, and this is a non-fool-proof way of
                //   determining whether we are in Firefox
                var mult = e.originalEvent && (typeof e.originalEvent.detail !== 'undefined') ? -1 : 1,
                    // This is a workaround for Safari 6, which for some reason does not
                    //   work find with jquery-mousewheel.
                    useWheelDelta = (typeof e.deltaX === 'undefined'),
                    dX = useWheelDelta ? e.wheelDeltaX : e.deltaX,
                    dY = useWheelDelta ? e.wheelDeltaY : e.deltaY,
                    delta;
                // For trackpads and Magic Mouse, which direction should I take into account?
                if (Math.abs(dY) > Math.abs(dX)) {
                    // Take into account vertical scrolling.
                    // This needs to be RTL-aware [scroll down advances to the "next" slide,
                    //   which is "slide right" for LRT, and "slide left" for RTL], so the value
                    //   is passed "as is" to scrollStart() [which is RTL-aware].
                    delta = Math.max(-1, Math.min(1, mult * dY));
                } else {
                    // Take into account horizontal scrolling.
                    // This needs to translate to physical scrolling [positive is right, 
                    //   negative is left], independently of the text layout direction.
                    // Because scrollStart() is RTL-aware, we need to de-RTL-aware-ise
                    //   the scrolling direction [test on slideLtr()].
                    delta = Math.max(-1, Math.min(1, mult * dX)) * (slidesLtr() ? -1 : 1);
                }

                // Now do the scrolling, and avoid the mousewheel default behaviour
                //   [i.e. scrolling the whole page where the carousel sits].
                scrollableViewport.scrollStart(scrollableViewport.scrollStart() + (delta * options.advanced.mousewheelMultiplier));
                e.preventDefault();
            }
        };

        // Main body resumes.
        var imgList = buildImageList(), // This is our 'data source'
            eventManager = new EventManager(),

            // The carousel hosts the viewport and the buttons
            carousel = new Carousel(),
            domCarousel = carousel[0],

            // Build the [visible] viewport from the [hidden] list of images...
            viewport = new Viewport(imgList),

            buttonsPane = new ButtonsPane();

        // TODO: this variable, used only to create the new AutoSlider, is
        //   a bit embarrassing...
        var autoSlider = new AutoSlider(carousel);

        // Assemble the carousel: first the viewport...
        domCarousel.setViewport(viewport);
        // ... then the buttons...
        domCarousel.setButtonsPane(buttonsPane);

        // ...then add the new carousel to the root element, and the DOM is done!
        rootElement.append(carousel);
        rootElement.addClass(_st.f);

        this.pauseAutoslide = eventManager.pauseAutoslide;
        this.restartAutoslide = eventManager.restartAutoslide;
        this.slideLeft = eventManager.slideLeft;
        this.slideRight = eventManager.slideRight;
        this.slideLeftmost = eventManager.slideLeftmost;
        this.slideRightmost = eventManager.slideRightmost;
        this.slideNext = eventManager.slideNext;
        this.slidePrev = eventManager.slidePrev;
        this.slideFirst = eventManager.slideFirst;
        this.slideLast = eventManager.slideLast;

        this.changeOptions = changeOptions;
        this.forceResize = windowResized; // TODO: check better responsiveness.
        this.getObject = getObject;
        this.getDomObject = getDomObject;

        $(window).on('resize', windowResized);

    }; /* MChCarousel */

    // Enhance a DOM object with a RTL-aware version of scrollLeft() and its corresponding animated version.
    function addScrollStart(client, options) {
        // Detect which type of browser this is
        var rtlScrollType = (function() {
            // Based on https://github.com/othree/jquery.rtl-scroll-type
            var definer = $('<div dir="rtl" style="position: absolute; top: -1000px; font-size: 14px; width: 1px; height: 1px; overflow: scroll">A</div>').appendTo('body')[0],
                retValue;

            if (definer.scrollLeft > 0) {
                retValue = _st.w; // default
            } else {
                definer.scrollLeft = 1;
                if (definer.scrollLeft === 0) {
                    retValue = _st.n; // negative
                } else
                    retValue = _st.r; // reverse
            }

            $(definer).remove();
            return retValue;
        })();

        // Attach RTL-aware functions to the client object
        client.scrollStart = scrollStart;
        client.animatedScrollStart = animatedScrollStart;

        function scrollStart(arg) {
            return typeof arg === 'undefined' ? adjustScrollLeft($.fn.scrollLeft.apply(client)) : $.fn.scrollLeft.apply(client, [adjustScrollLeft(arg)]);
        }

        // Change scrollLeft(), smoothly
        function animatedScrollStart(to, unit, value) {
            var time = (unit === _st.p) ? Math.abs(client.scrollStart() - to) * 1000 / value // time is in ms
                : value; // unit is time, so this is much simpler...
            client.stop(true, false).animate({
                scrollLeft: adjustScrollLeft(to)
            }, time, options.slideEasingFunction);
        }

        // Adjust the scroll amount in order to handle RTL inconsistencies
        // Based on http://jsfiddle.net/scA63/
        function adjustScrollLeft(arg) {
            if (isLtr(client))
                return arg;
            var c = client[0];
            switch (rtlScrollType) {
                case _st.n: // negative
                    return -arg;
                case _st.w: // default
                    return c.scrollWidth - arg - c.clientWidth;
            }
            return arg;
        }
    }

    function isLtr(client) {
        return (client.css('direction') === 'ltr');
    }
})(jQuery);
