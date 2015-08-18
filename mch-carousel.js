/**
 * MCh Carousel
 * 
 * © 2015 by Roberto Giuntoli [rg@mesmerizedchild.eu] 
 * Dependencies:
 *   - jQuery 2 [https://jquery.com/]
 *   - plugin jQuery-mousewheel [https://github.com/jquery/jquery-mousewheel] 
 * Licence:
 *   MIT
 *
 * More information at https://github.com/mesmerizedchild/mch-carousel
 *
 * @preserve 
 */
(function($) {

    // I don't like messing around with JS prototypes, but this one *is* a nice polyfill :) ...
    if (typeof String.prototype.endsWith !== 'function') {
        String.prototype.endsWith = function(suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
    }

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
        switch(retValue.length) {
            case 0:
                return undefined;
            case 1:
                return retValue[0];
        }
        return retValue;
    }

    var _df = {
            slideAutomatically: true,
            slideAutomaticallyOptions: {
                direction: null,
                pauseMs: 3000,
                pauseOnHoverImage: true,
                pauseOnHoverButtons: false
            },
            slideOneImageAnimation: '2000px/s',
            slideAllImagesAnimation: '3236px/s',
            slideEasingFunction: 'swing',
            autoCenterOnHover: true,
            displayButtons: true,
            displayButtonsOptions: {
                when: 'hover' // hover, always
            },
            displayImageCaption: true,
            displayImageCaptionOptions: {
                when: 'hover'
            },
            captureArrowKeys: true,
            captureArrowKeysOptions: {
                selector: 'body'
            },
            slideWithMouseWheel: true,
            advanced: {
                slideTolerance: 5,
                mousewheelAutocentreInactivity: 1000,
                mousewheelMultiplier: 40,
                divCleanup: true,
            },
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
            l: '#mch-image-list',
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
            ix: '_mch-carousel:pause-auto-slide',
            iz: '_mch-carousel:restart-auto-slide',
            iy: '_mch-carousel:reschedule-auto-slide',
            it: '_mch-carousel:cancel-auto-slide',
            i5: '_mch-carousel:slide-prev',
            i6: '_mch-carousel:slide-next',
            i7: '_mch-carousel:slide-first',
            i8: '_mch-carousel:slide-last',
            i9: '_mch-carousel:auto-next',
        };
    var _en = $.fn.mchCarousel.eventNames = [];
    $.each(_ev, function(key, value) {
        _en.push(value);
    });
    $.fn.mchCarousel.defaultOptions = _df;

    // TODO: add @constructor and other JS Doc.
    function MChCarousel(rootElement, options) {
        // Mix the input options [if any] with the default ones.
        options = $.extend(true, {}, _df, options);
        buildHiddenOptions();

        var // This is our 'data source'
            imgList = rootElement.find(_st.l);

        /* Εnsure that we start with a clean slate [i.e. no elements
             other than #mch-image-list in the carousel].
           This is needed mostly with WordPress, because it 'likes'
             to throw stray <p>'s into the HTML even when we are editing
             our page from the Text tab... go figure.
           Anyway, those stray <p>'s do take space in the carousel,
             offsetting the viewport and all other elements, thus making it
             appear as if the carousel itself were defective.
           Thank you WP :) ... */
        if (options.advanced.divCleanup) {
            var el;
            while ((el = imgList.next())[0])
                el.remove();
            while ((el = imgList.prev())[0])
                el.remove();
        }

        var evntMngr = new EventManager(),

            // The carousel hosts the viewport and the buttons
            carousel = new Carousel(),
            domCarousel = carousel[0],

            // Build the [visible] viewport from the [hidden] list of images...
            viewport = new Viewport(imgList),

            buttonsPane = new ButtonsPane();

        var autoSlider = new AutoSlider(carousel);

        // Assemble the carousel: first the viewport...
        domCarousel.setViewport(viewport);
        // ... then the buttons...
        domCarousel.setButtonsPane(buttonsPane);

        // ...then add the new carousel to the root element, and the DOM is done!
        rootElement.append(carousel);
        rootElement.addClass(_st.f);

        this.pauseAutoslide = evntMngr.pauseAutoslide;
        this.restartAutoslide = evntMngr.restartAutoslide;
        this.slideLeft = evntMngr.slideLeft;
        this.slideRight = evntMngr.slideRight;
        this.slideLeftmost = evntMngr.slideLeftmost;
        this.slideRightmost = evntMngr.slideRightmost;
        this.slideNext = evntMngr.slideNext;
        this.slidePrev = evntMngr.slidePrev;
        this.slideFirst = evntMngr.slideFirst;
        this.slideLast = evntMngr.slideLast;

        this.changeOptions = changeOptions;
        this.forceResize = windowResized; // TODO: check better responsiveness.
        this.getObject = getObject;
        this.getDomObject = getDomObject;

        $(window).on('resize', windowResized);

        // That's it, from now on are only function declarations...

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

        function windowResized() {
            domCarousel.carouselResized();
        }

        function changeOptions(optionValuePair) {
            options = $.extend(true, {}, options, optionValuePair);
            buildHiddenOptions();
            domCarousel.optionsChanged();
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

        function isPageLtr() {
            return (rootElement.css('direction') === 'ltr');
        }

        function slidesLtr() {
            // Imposed by the options...
            switch (options.slideAutomaticallyOptions.direction) {
                case 'ltr':
                    return true;
                case 'rtl':
                    return false;
            }
            // ...or taken from the page itself.
            return isPageLtr();
        }

        // Utility methods to reduce the size of the code [especially when minified]
        function rescheduleAutoSlide() {
            rootElement.trigger(_st.iy);
        }

        // Handles events coming in via the API, as well as via the buttons
        function EventManager() {
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
                rootElement.trigger(_st.ix);
            }

            function restartAutoslide() {
                rootElement.trigger(_st.iz);
            }

            function slideLeft() {
                var ltr;
                rescheduleAutoSlide();
                triggerBeforeSlideLeft();
                if (ltr = slidesLtr()) {
                    triggerBeforeSlidePrev();
                    rootElement.trigger(_st.i5);
                } else {
                    triggerBeforeSlideNext();
                    rootElement.trigger(_st.i6);
                }
                triggerSlideLeft();
                if (ltr)
                    triggerSlidePrev();
                else
                    triggerSlideNext();
            }

            function slideRight() {
                var ltr;
                rescheduleAutoSlide();
                triggerBeforeSlideRight();
                if (ltr = slidesLtr()) {
                    triggerBeforeSlideNext();
                    rootElement.trigger(_st.i6);
                } else {
                    triggerBeforeSlidePrev();
                    rootElement.trigger(_st.i5);
                }
                triggerSlideRight();
                if (ltr)
                    triggerSlideNext();
                else
                    triggerSlidePrev();
            }

            function slideLeftmost() {
                var ltr;
                rescheduleAutoSlide();
                triggerBeforeSlideLeftmost();
                if (ltr = slidesLtr()) {
                    triggerBeforeSlideFirst();
                    rootElement.trigger(_st.i7);
                } else {
                    triggerBeforeSlideLast();
                    rootElement.trigger(_st.i8);
                }
                triggerSlideLeftmost();
                if (ltr)
                    triggerSlideFirst();
                else
                    triggerSlideLast();
            }

            function slideRightmost() {
                var ltr;
                rescheduleAutoSlide();
                triggerBeforeSlideRightmost();
                if (ltr = slidesLtr()) {
                    triggerBeforeSlideLast();
                    rootElement.trigger(_st.i8);
                } else {
                    triggerBeforeSlideFirst();
                    rootElement.trigger(_st.i7);
                }
                triggerSlideRightmost();
                if (ltr)
                    triggerSlideLast();
                else
                    triggerSlideFirst();
            }

            function slidePrev() {
                var ltr;
                rescheduleAutoSlide();
                if (ltr = slidesLtr())
                    triggerBeforeSlideLeft();
                else
                    triggerBeforeSlideRight();
                triggerBeforeSlidePrev();
                rootElement.trigger(_st.i5);
                if (ltr = slidesLtr())
                    triggerSlideLeft();
                else
                    triggerSlideRight();
                triggerSlidePrev();
            }

            function slideNext() {
                var ltr;
                rescheduleAutoSlide();
                if (ltr = slidesLtr())
                    triggerBeforeSlideRight();
                else
                    triggerBeforeSlideLeft();
                triggerBeforeSlideNext();
                rootElement.trigger(_st.i6);
                if (ltr = slidesLtr())
                    triggerSlideRight();
                else
                    triggerSlideLeft();
                triggerSlideNext();
            }

            function slideFirst(e) {
                var ltr;
                rescheduleAutoSlide();
                if (ltr = slidesLtr())
                    triggerBeforeSlideLeftmost();
                else
                    triggerBeforeSlideRightmost();
                triggerBeforeSlideFirst();
                rootElement.trigger(_st.i7);
                if (ltr = slidesLtr())
                    triggerSlideLeftmost();
                else
                    triggerSlideRightmost();
                triggerSlideFirst();
            }

            function slideLast() {
                var ltr;
                rescheduleAutoSlide();
                if (ltr = slidesLtr())
                    triggerBeforeSlideRightmost();
                else
                    triggerBeforeSlideLeftmost();
                triggerBeforeSlideLast();
                rootElement.trigger(_st.i8);
                if (ltr = slidesLtr())
                    triggerSlideRightmost();
                else
                    triggerSlideLeftmost();
                triggerSlideLast();
            }

            function slideOneImage() {
                
            }

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
        }

        // Carousel auto-sliding class
        function AutoSlider(carousel) {
            var domCarousel = carousel[0],
                timedSlide = new Timer(timedSlideFunct, function() {
                    return options.slideAutomaticallyOptions.pauseMs;
                });

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

            // Ready or not, here I come!
            timedSlide.schedule();

            function timedSlideFunct() {
                if (options.slideAutomatically && domCarousel.canAutoSlide())
                    rootElement.trigger(_st.i9);
                timedSlide.schedule(); // Schedule next tick, regardless...
            }
        }

        // Very basic timer implementation
        //   time may be an integer or a function returning an integer
        function Timer(funct, time) {
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

            function schedule() {
                if (!paused)
                    res = window.setTimeout(funct, _time());
            };

            function cancel() {
                if (res)
                    window.clearTimeout(res);
                res = null;
            };

            function reschedule() {
                cancel();
                schedule();
            };

            function pause() {
                paused = true;
                cancel();
            };

            function restart() {
                paused = false;
                reschedule();
            };

            function isPaused() {
                return paused;
            };
        }

        // The carousel, with its viewport and buttons
        function Carousel() {
            var carousel = $('<div id="' + _st.S + '"></div>'),
                buttonsPane,
                viewport,
                justUsedWheel = false,
                noWheel = new Timer(noWheelFunct,
                                    options.advanced.mousewheelAutocentreInactivity);
            carousel.on({
                mouseenter: enterCarousel,
                mouseleave: leaveCarousel
            });
            carousel.on(_st.ia, enteredImage);
            attachArrowsHandling();

            var dom = carousel[0];

            dom.carouselResized = carouselResized;
            dom.optionsChanged = optionsChanged;
            dom.setViewport = setViewport;
            dom.getViewport = getViewport;
            dom.setButtonsPane = setButtonsPane;
            dom.getButtonsPane = getButtonsPane;
            dom.canAutoSlide = canAutoSlide;

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
                            if (e.keyCode == 37) { // left
                                evntMngr.slideLeft();
                            } else if (e.keyCode == 39) { // right
                                evntMngr.slideRight();
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
                if (viewport)
                    viewport[0].optionsChanged();
                if (buttonsPane)
                    buttonsPane[0].optionsChanged();
            }

            function carouselResized() {
                if (!buttonsPane)
                    return;
                // Show or hide the buttons, depending on the options and on the current dimensions
                if (options.displayButtons && carousel.width() < viewport[0].totalWidth())
                    buttonsPane[0].showNavigationButtons();
                else
                    buttonsPane[0].hideNavigationButtons();
            }

            function enterCarousel(e) {
                if (buttonsPane)
                    buttonsPane[0].hoverButtons();
                carousel.trigger(_ev.p); // carousel-enter
            }

            function leaveCarousel(e) {
                if (buttonsPane)
                    buttonsPane[0].unhoverButtons();
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
                rescheduleAutoSlide();
            }

            function canViewportAutoCentre() {
                return options.autoCenterOnHover && !justUsedWheel;
            }

            function canAutoSlide() {
                return carousel.is(':visible') &&
                    !(buttonsPane && buttonsPane[0].isMouseHoveringButtons() && options.slideAutomaticallyOptions.pauseOnHoverButtons) &&
                    !(viewport && viewport[0].isMouseHoveringImages() && options.slideAutomaticallyOptions.pauseOnHoverImage);
            }
        }

        function ButtonsPane() {
            var buttonsPane = $('<div id="' + _st.Z + '"></div>'),
                slideControlGroup = $('<div id="' + _st.Z1 + '"></div>'),
                leftRightGroup = $('<div id="' + _st.Z2 + '"></div>'),
                startEndGroup = $('<div id="' + _st.Z3 + '"></div>'),
                buttons = [],
                hoveringButtons = false;

            addSCGButton(new CarouselButton('mch-pause', 'sc', evntMngr.pauseAutoslide));
            addSCGButton(new CarouselButton('mch-restart', 'sc', evntMngr.restartAutoslide));
            addLRGButton(new CarouselButton('mch-leftmost', 'nlr', evntMngr.slideLeftmost));
            addLRGButton(new CarouselButton('mch-left', 'nlr', evntMngr.slideLeft));
            addLRGButton(new CarouselButton('mch-right', 'nlr', evntMngr.slideRight));
            addLRGButton(new CarouselButton('mch-rightmost', 'nlr', evntMngr.slideRightmost));
            addSTGButton(new CarouselButton('mch-first', 'nse', evntMngr.slideFirst));
            addSTGButton(new CarouselButton('mch-prev', 'nse', evntMngr.slidePrev));
            addSTGButton(new CarouselButton('mch-next', 'nse', evntMngr.slideNext));
            addSTGButton(new CarouselButton('mch-last', 'nse', evntMngr.slideLast));

            buttonsPane.append(slideControlGroup).append(leftRightGroup).append(startEndGroup);

            var dom = buttonsPane[0];

            dom.optionsChanged = optionsChanged;
            dom.showNavigationButtons = showNavigationButtons;
            dom.hideNavigationButtons = hideNavigationButtons;
            dom.showSlideControlButtons = showSlideControlButtons;
            dom.hideSlideControlButtons = hideSlideControlButtons;
            dom.hoverButtons = hoverButtons;
            dom.unhoverButtons = unhoverButtons;
            dom.isMouseHoveringButtons = isMouseHoveringButtons;

            return buttonsPane;

            function addSCGButton(b) {
                slideControlGroup.append(b);
                automaticChanged();
                finaliseButton(b);
            }

            function addLRGButton(b) {
                leftRightGroup.append(b);
                finaliseButton(b);
            }

            function addSTGButton(b) {
                startEndGroup.append(b);
                finaliseButton(b);
            }

            function finaliseButton(b) {
                buttons.push(b);
                b.on({
                    mouseenter: enterButton,
                    mouseleave: leaveButton
                });
            }

            function optionsChanged() {
                $.each(buttons, function() {
                    $(this)[0].optionsChanged();
                });
                automaticChanged();
            }

            function automaticChanged() {
                if (options.slideAutomatically)
                    showSlideControlButtons();
                else
                    hideSlideControlButtons();
            }

            function showNavigationButtons() {
                leftRightGroup.removeClass(_st.a);
                startEndGroup.removeClass(_st.a);
            }

            function hideNavigationButtons() {
                leftRightGroup.addClass(_st.a);
                startEndGroup.addClass(_st.a);
            }

            function showSlideControlButtons() {
                slideControlGroup.removeClass(_st.a);
            }

            function hideSlideControlButtons() {
                slideControlGroup.addClass(_st.a);
            }

            function hoverButtons() {
                $.each(buttons, function() {
                    $(this)[0].buttonHover();
                });
            }

            function unhoverButtons() {
                $.each(buttons, function() {
                    $(this)[0].buttonUnhover();
                });
            }

            function enterButton(e) {
                hoveringButtons = true;
            }

            function leaveButton(e) {
                hoveringButtons = false;
            }

            function isMouseHoveringButtons() {
                return hoveringButtons;
            }
        }

        // Each of the buttons for the carousel
        function CarouselButton(id, nav, onClick) {
            var btn = $('<div class="' + _st.B +
                    ' ' + (nav == 'sc' ? _st.O : _st.R) +
                    (buttonsOnlyWhenHovering() ? ' ' + _st.h : '') +
                    '" id="' + id + '"><div class="' + _st.G + '"></div><div class="' + _st.J + '"></div></div>');
            btn.on({
                click: onClick,
                dblclick: ignoreDoubleClick,
                mouseenter: enterButton,
                mouseleave: leaveButton
            });
            // Curiously, jQuery does not provide support for onselectstart...
            btn[0].onselectstart = ignoreDoubleClick;

            var dom = btn[0];
            dom.buttonHover = buttonHover;
            dom.buttonUnhover = buttonUnhover;
            dom.showButton = showButton;
            dom.hideButton = hideButton;
            dom.optionsChanged = optionsChanged;
            dom.isNavigation = isNavigation;

            return btn;

            function isNavigation() {
                return nav == 'nlr' || nav == 'nse';
            }

            function enterButton(e) {
                btn.trigger(_ev.s);
            }

            function leaveButton(e) {
                btn.trigger(_ev.t);
            }

            function buttonHover() {
                if (buttonsOnlyWhenHovering())
                    btn.removeClass(_st.h);
            }

            function buttonUnhover() {
                if (buttonsOnlyWhenHovering())
                    btn.addClass(_st.h);
            }

            // TODO: this function depends at start-time on an option
            //   and then the option may not be changed...
            // There is another such example in the code, but right now I'm
            //   too sleepy to look for it.
            function buttonsOnlyWhenHovering() {
                return options.displayButtons && options.displayButtonsOptions.when == 'hover';
            }

            function showButton() {
                btn.removeClass(_st.a);
            }

            function hideButton() {
                btn.addClass(_st.a);
            }

            function optionsChanged() {
                // Do nothing... for the time being?
            }

            function ignoreDoubleClick(e) {
                e.preventDefault();
            }
        }

        // Build the images in the viewport from the image list
        function Viewport(imageList) {
            var viewport = $('<div id="' + _st.C + '"></div>'),
                scrollableViewport = $('<div id="' + _st.Q + '"></div>'),
                idx = 0,
                imgCntnrs = [],
                hoveringImages = false,
                totalSize = 0,
                startPx = [],
                endPx = [];
            viewport.append(scrollableViewport);

            imageList.find('img').each(function() {
                var imgCntnr = new ImageContainer($(this), idx++);
                // See constructor of ImageContainer() for notes:
                // imgCntnr.data('idx', idx++);
                scrollableViewport.append(imgCntnr);
                imgCntnr.on({
                    mouseenter: enterImage,
                    mouseleave: leaveImage
                });
                imgCntnrs.push(imgCntnr);
            });

            // Attach events
            scrollableViewport.on({
                mousewheel: mousewheelScroll,
                scroll: rescheduleAutoSlide
            });
            scrollableViewport.on(_st.ib, autoCentre);
            rootElement.on(_st.i5, slidePrev);
            rootElement.on(_st.i6, slideNext);
            rootElement.on(_st.i7, slideFirst);
            rootElement.on(_st.i8, slideLast);
            rootElement.on(_st.i9, autoNext);

            // Fix scrollLeft(), which works inconsistently across browsers
            //   with RTL elements. Hopefully we can remove this hack in
            //   some future version of jQuery.
            addScrollStart(scrollableViewport);

            var dom = viewport[0];

            dom.totalWidth = totalWidth;
            dom.optionsChanged = optionsChanged;
            dom.isMouseHoveringImages = isMouseHoveringImages;

            return viewport;

            function optionsChanged() {
                $.each(imgCntnrs, function(index, value) {
                    value.optionsChanged();
                });
            }

            function calc(onlyTotalSize) {
                totalSize = startPx.length = endPx.length = 0;
                // Relying on the fact that find() returns elements in document order
                scrollableViewport.find(_st.k).each(function() {
                    var w = parseInt($(this).css('width'));
                    if (!onlyTotalSize) {
                        startPx.push(totalSize);
                        endPx.push(totalSize + w);
                    }
                    totalSize += w;
                });
            }

            function totalWidth() {
                calc(true);
                return totalSize;
            }

            function enterImage() {
                hoveringImages = true;
            }

            function leaveImage() {
                hoveringImages = false;
                rescheduleAutoSlide();
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
                if (w < endPx[i] - startPx[i] && sp <= sl && ep >= sr)
                    return;

                if (sp < sl) {
                    t.trigger(_ev.a);
                    animatedScrollToOneImage(sp);
                    t.trigger(_ev.b);
                } else if (ep > sr) {
                    t.trigger(_ev.a);
                    animatedScrollToOneImage(ep - w);
                    t.trigger(_ev.b);
                }
            }

            function isMouseHoveringImages() {
                return hoveringImages;
            }

            function slidePrev() {
                calc();
                var sl = Math.round(scrollableViewport.scrollStart()),
                    t = options.advanced.slideTolerance;
                if (sl > t) {
                    for (var i = 0; i < endPx.length; i++)
                        if (endPx[i] >= sl - t) {
                            animatedScrollToOneImage(startPx[i]);
                            return true;
                        }
                }
                return false;
            }

            function slideNext() {
                calc();
                var w = Math.round(containerWidth()),
                    sr = Math.round(scrollableViewport.scrollStart() + w),
                    t = options.advanced.slideTolerance;
                if (sr < totalSize - t) {
                    for (var i = startPx.length - 1; i >= 0; i--)
                        if (startPx[i] <= sr + t) {
                            animatedScrollToOneImage(endPx[i] - w);
                            return true;
                        }
                }
                return false;
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
                e = window.event || e;

                // Events are reversed in Firefox, and this is a non-fool-proof way of
                //   determining whether we are in Firefox
                var mult = e.originalEvent && (typeof e.originalEvent.detail !== 'undefined') ? -1 : 1
                    // Should I look at wheelDelta, or delta?
                    useWheelDelta = (typeof e.deltaX === 'undefined');

                // In the following, delta is normalised based solely on
                //   the scrolling direction [up/down or left/right].
                // The actual amount by which the carousel scrolls is determined
                //   by options.advanced.mousewheelMultiplier
                var dX = useWheelDelta ? e.wheelDeltaX : e.deltaX ,
                    dY = useWheelDelta ? e.wheelDeltaY : e.deltaY;
                //var dX = e.deltaY,
                //    dY = 0;
                if(Math.abs(dY)>Math.abs(dX)) {
                    // Take into account vertical scrolling.
                    // This needs to be RTL-aware [scroll down advances to the next slide,
                    //   which is "slide right" for LRT, and "slide left" for RTL].
                    delta = Math.max(-1, Math.min(1, mult * dY));
                }
                else {
                    // Take into account horizontal scrolling.
                    // This needs to translate to physical scrolling [positive is right, 
                    //   negative is left], independently of the layout direction.
                    // Because scrollStart() is RTL-aware, we need to de-RTL-aware-ise
                    //   the scrolling direction [test on slideLtr()].
                    delta = Math.max(-1, Math.min(1, mult * dX)) * (slidesLtr() ? -1 : 1);
                }

                // Now do the scrolling, and avoid the mousewheel default behaviour [ie scrolling the whole page]
                scrollableViewport.scrollStart(scrollableViewport.scrollStart() + (delta * options.advanced.mousewheelMultiplier));
                e.preventDefault();
            }
        }

        function ImageContainer(t, idx) {
            // Take the information from the image [in #mch-image-list]
            //   and build a DOM element ready for the viewport [in #mch-scrollable-viewport]
            var id = t.prop('id'),
                src = t.prop('src'),
                alt = t.prop('alt'),
                imgOver = t.data('img-over'),
                display = t.data('display'),
                data = t.data('data'),
                captionLang = t.data('caption-lang'),
                captionLine1 = t.data('caption-line1'),
                captionLine2 = t.data('caption-line2'),
                captionLine3 = t.data('caption-line3'),
                link = t.data('link'),
                sameWin = t.data('link-in-same-window'),
                //
                // HELP!!!
                //
                // data-idx actually belongs to the viewport bit, not here...
                // but if, in the Viewport constructor, I do:
                //
                //   var imgCntnr = new ImageContainer($(this));
                //   imgCntnr.data('idx', idx++);
                // 
                // then data-idx does not stick around and make it to the HTML.
                // Anybody knows why?!?
                //
                imgCntnr = $('<div class="' + _st.K + '" data-idx="' + idx + '"' +
                    (id ? ' id="' + id + '"' : '') +
                    (data ? ' data-data="' + data + '"' : '') +
                    '></div>'),
                forAppend,
                captionCntnr;

            // Maybe the link...
            if (link)
                imgCntnr.append(forAppend = $('<a class="' + _st.D + '" href="' + link + '"' +
                    (sameWin ? '' : ' target="_blank"') +
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
                (display ? ' data-display="' + display + '" ' : '') +
                //'style="height: 100%;" ' +
                '></img>');

            // Attach the events to the image container
            imgCntnr.on({
                mouseenter: enterImage,
                mouseleave: leaveImage
            });

            // Save some more data for the methods...
            var img = imgCntnr.find('img'),
                caption = imgCntnr.find(_st.t),
                hasImgOver = !!(img.data('img-over'));
            captionsOff(); // Switch captions off if needed

            var dom = imgCntnr[0];

            dom.optionsChanged = optionsChanged;

            return imgCntnr;

            function enterImage() {
                // If an overlay image is defined, change the image now
                if (hasImgOver)
                    img.prop('src', imgOver);

                // Display the caption
                if (caption && captionOnlyWhenHovering())
                    caption.removeClass(_st.h);

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

            function captionsOff() {
                // Hide the caption
                if (caption && captionOnlyWhenHovering())
                    caption.addClass(_st.h);
            }

            function captionOnlyWhenHovering() {
                var display;
                if (img && (display = img.data('display')))
                    return display == 'hover';
                return options.displayImageCaption && options.displayImageCaptionOptions.when == 'hover';
            }

            function optionsChanged() {
                if (captionCntnr)
                    if (options.displayImageCaption)
                        captionCntnr.removeClass(_st.a);
                    else
                        captionCntnr.addClass(_st.a);
            }
        }

        // Enhance a DOM object with a RTL-aware version of scrollLeft() and its corresponding animated version.
        function addScrollStart(client) {
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
                return arg ? $.fn.scrollLeft.apply(client, [adjustScrollLeft(arg)]) : adjustScrollLeft($.fn.scrollLeft.apply(client));
            }

            // Change scrollLeft(), smoothly
            function animatedScrollStart(to, unit, value) {
                var time = (unit == _st.p) ? Math.abs(client.scrollStart() - to) * 1000 / value // time is in ms
                    : value; // unit is time, so this is much simpler...
                client.stop(true, false).animate({
                    scrollLeft: adjustScrollLeft(to)
                }, time, options.slideEasingFunction);
            }

            // Adjust the scroll amount in order to handle RTL inconsistencies
            // Based on http://jsfiddle.net/scA63/
            function adjustScrollLeft(arg) {
                if (isPageLtr())
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
    }
})(jQuery);
