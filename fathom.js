/*
 * Fathom.js v1.2.4
 * Copyright 2012, Mark Dalgleish
 *
 * This content is released under the MIT License
 * markdalgleish.mit-license.org
 */

(function($, window, undefined){
	var Fathom = function(container, options){
			this.container = container;
			this.options = options;
			
			return this.init();
		},
		$window = $(window),
		$document = $(document);
	
	Fathom.prototype = {
		defaults: {
			portable: undefined,
			portableTagName: 'div',
			portableClass: 'fathom-container',
			displayMode: 'single',
			slideTagName: 'div',
			slideClass: 'slide',
			activeClass: 'activeslide',
			inactiveClass: 'inactiveslide',
			margin: 100,
			onScrollInterval: 300,
			scrollLength: 600,
			easing: 'swing',
			
			timeline: undefined,
			video: undefined,
			
			onActivateSlide: undefined,
			onDeactivateSlide: undefined
		},
		
		init: function() {
			this.config = $.extend({}, this.defaults, this.options);
			
			this.$container = $(this.container);
			this.$slides = this.$container.find(this.config.slideTagName + 
				(this.config.slideClass ? '.' + this.config.slideClass : ''));
			this.$firstSlide = this.$slides.filter(':first');
			this.$lastSlide = this.$slides.filter(':last');
			this.$activeSlide = this.activateSlide(this.$firstSlide);
			
			return this
				._detectPortable()
				._setStyles()
				._setClasses()
				._setMargins()
				._setupEvents()
				._setupTimeline()
				._setupVideo()
				._setupScrollHandler();
		},
		
		nextSlide: function() {
			return this.scrollToSlide(this.$activeSlide.next());
		},
		
		prevSlide: function() {
			return this.scrollToSlide(this.$activeSlide.prev());
		},
		
		scrollToSlide: function($elem) {
			var self = this,
				$scrollingElement = this.config.portable ? this.$portableContainer : $('html,body'),
				$container = this.config.portable ? this.$portableContainer : $window,
				portableScrollLeft = this.config.portable ? this.$portableContainer.scrollLeft() : 0;
			
			if ($elem.length !== 1) {
				return $elem;
			}
			
			this.isAutoScrolling = true;
			
			$scrollingElement.stop().animate({
				scrollLeft: ($elem.position().left + portableScrollLeft - 
					(($container.width() - $elem.innerWidth()) / 2))
			}, self.config.scrollLength, self.config.easing, function() {
				self.isAutoScrolling = false;
			});
			
			return this.activateSlide($elem);
		},
		
		activateSlide: function($elem) {
			var elem = $elem.get(0),
				activeSlide;
		
			if (this.$activeSlide !== undefined) {
				activeSlide = this.$activeSlide.get(0)
				
				if (activeSlide === elem) {
					return $elem;
				}
			
				this.$activeSlide.removeClass(this.config.activeClass)
					.addClass(this.config.inactiveClass)
					.trigger('deactivateslide.fathom');
				
				if (typeof this.config.onDeactivateSlide === 'function') {
					this.config.onDeactivateSlide.call(activeSlide);
				}
			}
			
			$elem.removeClass(this.config.inactiveClass).addClass(this.config.activeClass);
			
			this.$activeSlide = $elem;
			
			$elem.trigger('activateslide.fathom');
			
			if (typeof this.config.onActivateSlide === 'function') {
				this.config.onActivateSlide.call(elem);
			}
			
			return $elem;
		},
		
		setTime: function( t ) {
			var times = this._timeline || [];
			for(var i = 0; i < times.length; i++) {
				if(times[i].time <= t && times[i+1].time > t) {
					if(this.$activeSlide[0] !== times[i].slide[0]) {
						this.scrollToSlide( times[i].slide );
					}
					break;
				}
			}
		},
		
		_detectPortable: function() {
			if (this.config.portable === undefined) {
				if (this.$container.parent().is('body')) {
					this.config.portable = false;
				} else {
					this.config.portable = true;
				}
			}
			
			return this;
		},
		
		_setupEvents: function() {
			var self = this;
			
			this.$container.delegate(this.config.slideTagName + '.' + this.config.inactiveClass, 'click', function(event) {
				event.preventDefault();
				self.scrollToSlide($(this));
			});
			
			$document.keydown(function(event) {
				var key = event.which;
				
				if (key === 39 || key === 32) {
					event.preventDefault();
					self.nextSlide();
				} else if ( key === 37) {
					event.preventDefault();
					self.prevSlide();
				}
			});
			
			$window.resize(function(){
				self._setMargins();
			});
			
			return this;
		},
		
		_setStyles: function() {
			this.$container.css('white-space', 'nowrap');
			
			this.$slides.css({
				'white-space': 'normal',
				'display': 'inline-block',
				'vertical-align': 'top'
			});
			
			if (this.config.portable) {
				this.$portableContainer = $('<' + this.config.portableTagName + ' class="' + this.config.portableClass + '" />');
				this.$container.before(this.$portableContainer).appendTo(this.$portableContainer);
			}
			
			return this;
		},
		
		_setClasses: function() {
			this.$slides.addClass(this.config.inactiveClass);
			
			this.$activeSlide
				.removeClass(this.config.inactiveClass)
				.addClass(this.config.activeClass);
			
			return this;
		},
		
		_setMargins: function() {
			var displayMode = this.config.displayMode,
				$container = this.config.portable ? this.$portableContainer : $window,
				containerWidth = $container.width(),
				verticalSpacing = Math.ceil(($container.height() - this.$firstSlide.innerHeight()) / 2),
				firstSlideSpacing = Math.ceil((containerWidth - this.$firstSlide.innerWidth()) / 2),
				lastSlideSpacing = Math.ceil((containerWidth - this.$lastSlide.innerWidth()) / 2),
				peekabooWidth = Math.ceil(containerWidth / 25);
			
			this.$container.css('margin-top', verticalSpacing);
			
			if (displayMode === 'single') {
				this.$slides.css('margin-right', firstSlideSpacing - peekabooWidth);
			} else if (displayMode === 'multi') {
				this.$slides.css('margin-right', this.config.margin);
			}
			
			this.$firstSlide.css('margin-left', firstSlideSpacing);
			this.$lastSlide.css('margin-right', lastSlideSpacing);
			
			if (this.config.portable) {
				var slidesWidth = parseInt(this.$container.css('padding-left')) + parseInt(this.$container.css('padding-right'));
				this.$slides.each(function() {
					slidesWidth += $(this).outerWidth(true);
				});
				this.$container.width(slidesWidth);
			}
			
			return this;
		},
		
		_setupTimeline: function() {
			var slides = this.$slides;
					
			function parseTime(point) {
				for(var m = (point.time || point).toString().match(/(((\d+):)?(\d+):)?(\d+)/), a = 0, i = 3; i <= 5; i++) {
					a = (a * 60) + parseInt(m[i] || 0);
				}
				return a;
			}
			
			var currentSlide = -1;
			function parseSlide(point) {
				if( point.slide == null ) {
					currentSlide++;
				} else if($.type(point.slide) === 'number') {
					currentSlide = point.slide;
				} else{
					for(var match = slides.filter( point.slide )[0], i = 0; i < slides.length; i++ ) {
						if( slides[i] === match ) {
							currentSlide = i;
							break;
						}
					}
				}
				return slides.eq( currentSlide );
			}
			
			if(! this.config.timeline)
				return this;

			this._timeline = [];
			for(var t = this.config.timeline, i = 0; i < t.length; i++) {
				this._timeline.push({ time: parseTime( t[i] ), slide: parseSlide( t[i] ) });
			}
			this._timeline.push( { time: 99999, slide: t[0].slide } );
			return this;
		},
		
		_setupVideo: function() {
			if( !this.config.video ) {
				this._setupDefaultTimeSource();
			} else if( this.config.video.source === "vimeo" ) {
				this._setupVimeoVideo( this.config.video );
			} else {
				throw "unknown video source, not supported";
			}
			return this;
		},
		
		_setupDefaultTimeSource: function() {
			var self = this, t0 = (new Date()).getTime();
			setInterval(function() {
				var t1 = (new Date()).getTime();
				self.setTime( (t1 - t0)/1000 );
			}, 250 );
		},
		
		_setupVimeoVideo: function(vid) {
			var self = this, vid = this.config.video, downgrade = false;
			
			if(window.location.protocol === "file:") {
				( "console" in window ) && console.log("vimeo video player api does not work with local files. Downgrading video support\nsee http://vimeo.com/api/docs/player-js");
				downgrade = true;
			}

			function loadFrame() {
				var id = "p" + vid.id;
				var frameSrc = "<iframe id=\"" + id + "\"	width=\""+ ( vid.width || 360 ) + "\" height=\"" + (vid.height || 203 ) + "\" frameborder=\"0\" src=\"http://player.vimeo.com/video/" + vid.id + "?api=1&player_id=" + id + "\">";
				return $( frameSrc ).appendTo( vid.parent || "body" )[0];
			}

			if( downgrade ) {
				$( loadFrame() ).bind("load", function() {
					self._setupDefaultTimeSource();
				});
			} else {
				$.getScript("http://a.vimeocdn.com/js/froogaloop2.min.js?", function() {
					$f( loadFrame() ).addEvent( 'ready', function (player_id) {
						var vimeo = $f( player_id ), timer = false;
						vimeo.addEvent('play', function(data) {
							if(timer === false) {	
								timer = setInterval( function() {
									vimeo.api('getCurrentTime', function ( value, player_id ) {
										self.setTime( value );
									});
								}, 250 );
							}
						});
						vimeo.addEvent('pause', function(data) {
							clearInterval(timer);
							timer = false;
						});
						vid.autoplay && vimeo.api( "play" );
					} );
				} );
			}
		},
		
		_setupScrollHandler: function() {
			var self = this,
				slideSelector = self.config.slideTagName + (self.config.slideClass ? '.' + self.config.slideClass : ''),
				$scrollContainer = this.config.portable ? this.$portableContainer : $window,
				isIOS = navigator.userAgent.match(/like Mac OS X/i) === null ? false : true,
				$elem;
			
			self.scrolling = false;			
			
			setInterval(function() {
				if (self.scrolling && (self.isAutoScrolling === false || self.isAutoScrolling === undefined)) {
					self.scrolling = false;
					
					if ($scrollContainer.scrollLeft() === 0) {
						self.activateSlide(self.$firstSlide)
					} else {
						var offsetX = self.config.portable ? $scrollContainer.position().left : 0,
							offsetY = self.config.portable ? $scrollContainer.position().top : 0,
							midpoint = {
								x: offsetX + ($scrollContainer.width() / 2) + (isIOS ? $window.scrollLeft() : 0),
								y: offsetY + ($scrollContainer.height() / 2) + (isIOS ? $window.scrollTop() : 0)
							};
						
						$elem = $(document.elementFromPoint(midpoint.x, midpoint.y));
						
						if ($elem.is(slideSelector)) {
							self.activateSlide($elem);
						} else {
							$elem = $elem.parents(slideSelector + ':first').each(function(){
								self.activateSlide($(this));
							});
						}
					}
				}
			}, self.config.onScrollInterval);
			
			$scrollContainer.scroll(function() {
				self.scrolling = true;
			});
			
			return this;
		}				
	};
	
	$.fn.fathom = function(options){
		new Fathom(this, options);
		return this;
	};
	
	Fathom.defaults = Fathom.prototype.defaults;
	
	Fathom.setDefaults = function(options) {
		$.extend(Fathom.defaults, options);
	};
	
	window.Fathom = Fathom;
})(jQuery,window);