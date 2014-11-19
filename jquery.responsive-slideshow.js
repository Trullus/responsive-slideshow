;(function ($, window, undefined) {

    var pluginName = 'responsiveSlideshow',
        document = window.document,
        defaults = {
            disableControlelements: false,
            autoscrollInterval: 0,
            startingPosition: 0,
            fadeOutHeadlineOnMouseOver: false,
            fadeOutHeadlineAfterTimespan: 0,
            direction: 'horizontal',
            type: 'slideshow',
            elements: 1,
            r320: {},
            r768: {},
            r1024: {},
            r1280: {}
        },
        functionscope = {
            position: 0
        };

    var currentWindowProperties = {
        width:  $(window).width(),
        height:  $(window).height()
    };

    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend( {}, defaults, options) ;
        this._defaults = defaults;
        this._name = pluginName;
        this.functionscope = $.extend( {}, functionscope);
        this.init();
    }

    Plugin.prototype.init = function () {
        var plugin = this;

        plugin.functionscope.position = plugin.options.startingPosition;
        if(Modernizr.prefixed('transform') == 'MozTransform') {
            plugin.functionscope.roundfactor = 10000;
        } else {
            plugin.functionscope.roundfactor = 1000;
        }

        plugin.functionscope.stopSlideshow = false;

        // Set the default size for elements
        initAllElements(plugin);
        if(plugin.options.autoscrollInterval > 0) {
            initSlideshow(plugin);
        }

        // Bind eventlisteners
        bindEventListeners(plugin);
    };

    function bindEventListeners(plugin) {
        $('button', $(plugin.element)).click(function(e) {
            e.preventDefault();
            if($(this).hasClass('controlelement') && $(this).hasClass('previous')) {
                plugin.functionscope.position = getNextAvailablePosition(plugin, 'previous');
                scroll(plugin, plugin.functionscope.position);
            } else if($(this).hasClass('controlelement') && $(this).hasClass('next')) {
                plugin.functionscope.position = getNextAvailablePosition(plugin, 'next');
                scroll(plugin, plugin.functionscope.position);
            }
            resetAndStartSlideshow(plugin);
        });

        $('li.controlelement.thumbnail', $(plugin.element)).bind('click.thumbnail', function(e) {
            bindThumbnail(plugin, this);
        });

        if(plugin.options.autoscrollInterval > 0) {
            $(plugin.element).mouseover(function(e) {
                clearInterval(plugin.functionscope.slideShowInterval);
            });
            $(plugin.element).mouseout(function(e) {
                resetAndStartSlideshow(plugin);
            });
        }

        if(plugin.options.fadeOutHeadlineOnMouseOver) {
            plugin.functionscope.headlineRemoved = false;
            $('div.viewpoint', plugin.element).bind('mouseover.fadeOutHeadlineOnMouseOver', function(e){
                removeHeadline(plugin);
            });
        }

        if(plugin.options.fadeOutHeadlineAfterTimespan > 0) {
            setTimeout(function(){
                removeHeadline(plugin);
            }, plugin.options.fadeOutHeadlineAfterTimespan);
        }

        $(window).resize(function(e) {
            // Has the window width or height really changed? There is a bug on iOS devices, that this event is triggerd when requesting or scrolling the page.
            if(currentWindowProperties.width != $(window).width() || currentWindowProperties.height != $(window).height()) {
                plugin.functionscope.position = plugin.options.startingPosition;
                currentWindowProperties = {
                    width: $(window).width(),
                    height: $(window).height()
                }
                initAllElements(plugin);
            }
        });
    }

    function bindThumbnail(plugin, tumbnail) {
        if(plugin.functionscope.position != -$(tumbnail).index()) {
            plugin.functionscope.position = -$(tumbnail).index();
            scroll(plugin, plugin.functionscope.position);
            setNeedle(plugin);
            resetAndStartSlideshow(plugin);
            if(plugin.options.fadeOutHeadlineOnMouseOver) {
                removeHeadline(plugin);
            }
        }
    }

    function removeHeadline(plugin) {
        if($('.overlaylabel', $(plugin.element)).length && !plugin.functionscope.headlineRemoved) {
            $('.overlaylabel', $(plugin.element)).animate({'opacity': 0}, 400, function(e) {
                $('.overlaylabel', $(plugin.element)).css({'display': 'none'});
                plugin.functionscope.headlineRemoved = true;
            });
        }
    }

    function initAllElements(plugin) {
        getElementSize(plugin);
        resetDisplayAndControlElements(plugin);
        setPageinationDisplay(plugin);
    }

    function getElementSize(plugin) {
        MQ.addQuery({
                context: '320',
                callback: function() {
                    if(plugin.functionscope.currentMedia == '' || plugin.functionscope.currentMedia != 320) {
                        resetStyles(plugin);
                        if(!jQuery.isEmptyObject(plugin.options.r320)) {
                            setElementSize(plugin, plugin.options.r320);
                        } else {
                            setElementSize(plugin, plugin.options);
                        }
                        plugin.functionscope.currentMedia = 320;
                    }
                }
            });
        MQ.addQuery({
                context: '768',
                callback: function() {
                    if(plugin.functionscope.currentMedia == '' || plugin.functionscope.currentMedia != 768) {
                        resetStyles(plugin);
                        if(!jQuery.isEmptyObject(plugin.options.r768)) {
                            setElementSize(plugin, plugin.options.r768);
                        } else {
                            setElementSize(plugin, plugin.options);
                        }
                        plugin.functionscope.currentMedia = 768;
                    }
                }
            });
        MQ.addQuery({
                context: '1024',
                callback: function() {
                    if(plugin.functionscope.currentMedia == '' || plugin.functionscope.currentMedia != 1024) {
                        resetStyles(plugin);
                        if(!jQuery.isEmptyObject(plugin.options.r1024)) {
                            setElementSize(plugin, plugin.options.r1024);
                        } else {
                            setElementSize(plugin, plugin.options);
                        }
                        plugin.functionscope.currentMedia = 1024;
                    }
                }
        });
        MQ.addQuery({
                context: '1280',
                callback: function() {
                    if(plugin.functionscope.currentMedia == '' || plugin.functionscope.currentMedia != 1280) {
                        resetStyles(plugin);
                        if(!jQuery.isEmptyObject(plugin.options.r1280)) {
                            setElementSize(plugin, plugin.options.r1280);
                        } else {
                            setElementSize(plugin, plugin.options);
                        }
                        plugin.functionscope.currentMedia = 1280;
                    }
                }
            });
    }

    function resetDisplayAndControlElements(plugin) {
        setPageinationDisplay(plugin);
        setNeedle(plugin);
        setControlelements(plugin);
    }

    function resetStyles(plugin) {
        clearTransitionStyles(plugin);
        $('div.viewpoint', $(plugin.element)).css({'height': ''});
        $('div.viewpoint ul', $(plugin.element)).css({'margin': 0});
        $('div.viewpoint ul', $(plugin.element)).width(100 + '%');
        $('div.viewpoint ul', $(plugin.element)).height(100 + '%');
        $('div.viewpoint ul li', $(plugin.element)).width(100 + '%');
        $('div.viewpoint ul li', $(plugin.element)).height(100 + '%');
        $('div.viewpoint ul li', $(plugin.element)).css({'position': 'relative', 'z-index': ''});
        if(plugin.options.fadeOutHeadlineOnMouseOver) {
            $('header h1', $(plugin.element)).css({'display': 'block', 'opacity': 1});
            plugin.functionscope.headlineRemoved = false;
        }
        $(plugin.element).find('.next').removeAttr('disabled');
        $(plugin.element).find('.next').removeClass('disabled');
        $(plugin.element).find('.previous').removeAttr('disabled');
        $(plugin.element).find('.previous').removeClass('disabled');
        $(plugin.element).find('.ondisplay').removeClass('ondisplay');
        setTimeout(function(){setTransitionStyles(plugin);}, 100);
    }

    function setTransitionStyles(plugin) {
        if(Modernizr.csstransitions) {
            $('div.viewpoint ul', $(plugin.element)).css({'-moz-transition': 'margin 0.5s ease 0s'});
            $('div.viewpoint ul', $(plugin.element)).css({'-webkit-transition': 'margin 0.5s ease 0s'});
            $('div.viewpoint ul', $(plugin.element)).css({'-o-transition': 'margin 0.5s ease 0s'});
            $('div.viewpoint ul', $(plugin.element)).css({'transition': 'margin 0.5s ease 0s'});
        }
    }

    function clearTransitionStyles(plugin) {
        if(Modernizr.csstransitions) {
            $('div.viewpoint ul', $(plugin.element)).css({'-moz-transition': ''});
            $('div.viewpoint ul', $(plugin.element)).css({'-webkit-transition': ''});
            $('div.viewpoint ul', $(plugin.element)).css({'-o-transition': ''});
            $('div.viewpoint ul', $(plugin.element)).css({'transition': ''});
        }
    }

    function setElementSize(plugin, options) {
        // Type - List
        if(options.type == 'list') {
            $('div.viewpoint ul', $(plugin.element)).width(100 + '%');
            $('div.viewpoint ul li', $(plugin.element)).width(100 + '%');
            disableDragAndDropSwipeEventListener(plugin);
        } else {
            // Type - Slideshow (Default)
            if(options.direction == 'vertical') {
                $('div.viewpoint ul', $(plugin.element)).height(($('div.viewpoint ul li', $(plugin.element)).size() * 100) / options.elements + '%');
                $('div.viewpoint ul li', $(plugin.element)).height(Math.round((100 / $('div.viewpoint ul li', $(plugin.element)).size() * plugin.functionscope.roundfactor)) / plugin.functionscope.roundfactor + '%');
                $('div.viewpoint', $(plugin.element)).height(parseInt($('div.viewpoint ul li', $(plugin.element)).outerHeight()) * options.elements);
                plugin.functionscope.currentdirection = 'vertical';
                disableDragAndDropSwipeEventListener(plugin);
            } else if (!Modernizr.touch && options.direction == 'fade') {
                $('div.viewpoint ul li', $(plugin.element)).css({'position': 'absolute'});
                $('div.viewpoint ul li', $(plugin.element)).first().css({'z-index': 3});
                $('div.viewpoint ul li', $(plugin.element)).first().addClass('ondisplay');
                $('.controlpanel', $(plugin.element)).css({'z-index': 98});
                $('.alwaysontop', $(plugin.element)).css({'z-index': 98});
                plugin.functionscope.currentdirection = 'fade';
                disableDragAndDropSwipeEventListener(plugin);
            } else {
                $('div.viewpoint ul', $(plugin.element)).width(($('div.viewpoint ul li', $(plugin.element)).size() * 100) / options.elements + '%');
                $('div.viewpoint ul li', $(plugin.element)).width(Math.round((100 / $('div.viewpoint ul li', $(plugin.element)).size() * plugin.functionscope.roundfactor)) / plugin.functionscope.roundfactor + '%');
                plugin.functionscope.currentdirection = 'horizontal';
                addDragAndDropSwipeEventListener(plugin, options);
            }
            plugin.functionscope.elementsinviewpoint = options.elements;
        }
    }

    function resetAndStartSlideshow(plugin) {
        if(plugin.options.autoscrollInterval > 0) {
            clearInterval(plugin.functionscope.slideShowInterval);
            initSlideshow(plugin);
        }
    }

    function initSlideshow(plugin) {
        if(!plugin.functionscope.stopSlideshow && plugin.options.autoscrollInterval > 0 && $('div.viewpoint ul li', $(plugin.element)).size() > 1) {
            plugin.functionscope.slideShowInterval = setInterval(function() {
                plugin.functionscope.position = getNextAvailablePosition(plugin, 'next');
                scroll(plugin, plugin.functionscope.position);
            }, plugin.options.autoscrollInterval);
        }
    }

    function getNextAvailablePosition(plugin, action){
        var childCount = $('div.viewpoint ul li', $(plugin.element)).size();
        var position = plugin.functionscope.position;
        switch(action) {
            case 'previous':
                position++;
                if(position > 0) {
                    position = -childCount + 1;
                }
                break;
            case 'next':
                position--;
                if(-position == childCount / plugin.functionscope.elementsinviewpoint) {
                    position = 0;
                }
                break;
        }
        return position;
    }

    function scroll(plugin, position){
        var newPositionPercent = position * 100 + '%';
        switch(plugin.functionscope.currentdirection) {
            case 'horizontal':
                if(Modernizr.csstransitions) {
                    $('div.viewpoint ul', $(plugin.element)).css({'margin-left': newPositionPercent});
                } else {
                    $('div.viewpoint ul', $(plugin.element)).animate({'margin-left': newPositionPercent});
                }
                break;
            case 'vertical':
                if(Modernizr.csstransitions) {
                    $('div.viewpoint ul', $(plugin.element)).css({'margin-top': position * $('div.viewpoint', $(plugin.element)).height() + 'px'});
                } else {
                    $('div.viewpoint ul', $(plugin.element)).animate({'margin-top': position * $('div.viewpoint', $(plugin.element)).height() + 'px'});
                }
                break;
            case 'fade':
                $('li.controlelement.thumbnail', $(plugin.element)).unbind('click.thumbnail');
                $('div.viewpoint ul li:eq(' + -position + ')', $(plugin.element)).css({'z-index': 2});
                $('div.viewpoint ul li.ondisplay', $(plugin.element)).animate({'opacity': 0}, 300, function() {
                    $('div.viewpoint ul li:eq(' + -position + ')', $(plugin.element)).css({'z-index': 3});
                    $('div.viewpoint ul li.ondisplay', $(plugin.element)).css({'z-index': '', 'opacity': ''});
                    $('div.viewpoint ul li.ondisplay', $(plugin.element)).removeClass('ondisplay');
                    $('div.viewpoint ul li:eq(' + -position + ')', $(plugin.element)).addClass('ondisplay');
                    $('li.controlelement.thumbnail', $(plugin.element)).bind('click.thumbnail', function(e) {
                        bindThumbnail(plugin, this);
                    });
                });
                break;
        }
        resetDisplayAndControlElements(plugin);
    }

    function setPageinationDisplay(plugin) {
        var cPageination = $(plugin.element).find('div.pageination');
        if(cPageination.length){
            if(plugin.functionscope.elementsinviewpoint && plugin.functionscope.elementsinviewpoint > 1) {
                var pageinationFromCount = -plugin.functionscope.position * plugin.functionscope.elementsinviewpoint + 1;
                var pageinationToCount = pageinationFromCount + plugin.functionscope.elementsinviewpoint - 1;
                if(pageinationToCount > $('div.viewpoint ul li', $(plugin.element)).size()) {
                    pageinationToCount = $('div.viewpoint ul li', $(plugin.element)).size();
                }
                var pageinationDisplay = pageinationFromCount + "-" + pageinationToCount + " von " + $('div.viewpoint ul li', $(plugin.element)).size();
            } else {
                var pageinationDisplay = -plugin.functionscope.position + 1 + '/' + $('div.viewpoint ul li', $(plugin.element)).size();
            }
            cPageination.html(pageinationDisplay);
        }
    }

    function setNeedle(plugin) {
        var currentTumbnail = $('ul.controlpanel li.controlelement.thumbnail', $(plugin.element)).get(-plugin.functionscope.position);
        if($(plugin.element).find('ul.controlpanel li.controlelement.thumbnail').length) {
            $('.needle', $(plugin.element)).remove();
            $(currentTumbnail).append('<div class="needle"></div>');
        }
    }

    function setControlelements(plugin) {
        if(plugin.options.disableControlelements) {
            var positionCount = $('div.viewpoint ul li', $(plugin.element)).size() / plugin.functionscope.elementsinviewpoint;
            if(-plugin.functionscope.position + 1 >= positionCount) {
                $(plugin.element).find('.next').attr('disabled', 'disabled');
                $(plugin.element).find('.next').addClass('disabled');
            } else if($(plugin.element).find('.next').hasClass('disabled')) {
                $(plugin.element).find('.next').removeAttr('disabled');
                $(plugin.element).find('.next').removeClass('disabled');
            }
            if(plugin.functionscope.position == 0) {
                $(plugin.element).find('.previous').attr('disabled', 'disabled');
                $(plugin.element).find('.previous').addClass('disabled');
            }
            if(-plugin.functionscope.position == 1) {
                $(plugin.element).find('.previous').removeAttr('disabled');
                $(plugin.element).find('.previous').removeClass('disabled');
            }
        }
    }

    function responsiveSlideshowRefresh(plugin) {
        plugin.functionscope.position = plugin.options.startingPosition;
        resetStyles(plugin);
        switch(plugin.functionscope.currentMedia) {
            case 320:
                if(!jQuery.isEmptyObject(plugin.options.r320)) {
                    setElementSize(plugin, plugin.options.r320);
                } else {
                    setElementSize(plugin, plugin.options);
                }
            break;
            case 768:
                if(!jQuery.isEmptyObject(plugin.options.r768)) {
                    setElementSize(plugin, plugin.options.r768);
                } else {
                    setElementSize(plugin, plugin.options);
                }
            break;
            case 1024:
                if(!jQuery.isEmptyObject(plugin.options.r1024)) {
                    setElementSize(plugin, plugin.options.r1024);
                } else {
                    setElementSize(plugin, plugin.options);
                }
            break;
            case 1280:
                if(!jQuery.isEmptyObject(plugin.options.r1280)) {
                    setElementSize(plugin, plugin.options.r1280);
                } else {
                    setElementSize(plugin, plugin.options);
                }
            break;
        }
        resetDisplayAndControlElements(plugin);
    }

    function addDragAndDropSwipeEventListener(plugin, options) {

        if(Modernizr.touch) {

            $('div.viewpoint, .overlaylabel', plugin.element).swipe({swipeStatus: function(event, phase, direction, distance, status) {

                // Stop slideshow while swiping
                clearInterval(plugin.functionscope.slideShowInterval);

                // Clear all transitionstyles while swiping
                clearTransitionStyles(plugin);

                // Remove the headline while swiping
                if(plugin.options.fadeOutHeadlineOnMouseOver) {
                    removeHeadline(plugin);
                }

                // Set desired directions (right now only horizontal swiping is supported)
                directionnext = "left";
                directionprevious = "right";

                // Set boundaries
                boundarynext = 0;
                boundaryprevious = -$('div.viewpoint ul li', $(plugin.element)).size() + 1;

                // Functions to handle the swipes in the desired directions
                if(phase == "move" && (direction == directionnext || direction == directionprevious)) {

                    nextpossibleposition = getNextAvailablePosition(plugin, 'next');
                    previouspossibleposition = getNextAvailablePosition(plugin, 'previous');

                    // Calculate the swipeposition and set the new position
                    swipeposition = ((100 * distance) / $('div.viewpoint ul li', $(plugin.element)).outerWidth()) / options.elements;

                    // If no more elements are available slow the swipe down to simulate the native ios feeling
                    if((direction == directionprevious && previouspossibleposition == boundaryprevious) || (direction == directionnext && nextpossibleposition == boundarynext)) {
                        swipeposition /= 4;
                    }

                    if(direction == directionnext) {
                        newposition = -swipeposition;
                    } else {
                        newposition = swipeposition;
                    }

                    // Add the current position
                    newposition += (plugin.functionscope.position * 100);

                    // Set the new position
                    $('div.viewpoint ul', $(plugin.element)).css({'margin-left': newposition + "%"});

                }

                // Functions to handle the scroll to the next position
                if((phase == "end" && swipeposition >= 30) || phase == "cancel") {

                    setTransitionStyles(plugin);

                    if(direction == directionnext && nextpossibleposition != boundarynext) {
                        plugin.functionscope.position = nextpossibleposition;
                    } else if(direction == directionprevious && previouspossibleposition != boundaryprevious) {
                        plugin.functionscope.position = previouspossibleposition;
                    }

                    scroll(plugin, plugin.functionscope.position);

                    // Restart slideshow
                    resetAndStartSlideshow(plugin);

                }

                // Functions to handle the scroll back to the current position
                if(phase == "end" && swipeposition < 30) {

                    setTransitionStyles(plugin);
                    scroll(plugin, plugin.functionscope.position);

                    // Restart slideshow
                    resetAndStartSlideshow(plugin);

                }

            }, allowPageScroll: "vertical" })

        }

    }

    function disableDragAndDropSwipeEventListener(plugin) {
        $('div.viewpoint, .overlaylabel', plugin.element).swipe('destroy');
    }

    function startSlideshow(plugin) {
        plugin.functionscope.stopSlideshow = false;
    }

    function stopSlideshow(plugin) {
        plugin.functionscope.stopSlideshow = true;
    }

    $.fn.startSlideshow = function () {
        return this.each(function () {
            startSlideshow($.data(this, 'plugin_' + pluginName));
        });
    }

    $.fn.stopSlideshow = function () {
        return this.each(function () {
            stopSlideshow($.data(this, 'plugin_' + pluginName));
        });
    }

    $.fn.responsiveSlideshowRefresh = function () {
        return this.each(function () {
            responsiveSlideshowRefresh($.data(this, 'plugin_' + pluginName));
        });
    }

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    }

}(jQuery, window));