/*
Fathom.js v1.0
Copyright 2011, Mark Dalgleish

This content is released under the MIT License
github.com/markdalgleish/fathom/blob/master/MIT-LICENSE.txt
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
			displayMode: 'single',
			slideTagName: 'div',
			slideClass: 'slide',
			activeClass: 'activeslide',
			inactiveClass: 'inactiveslide',
			margin: 100,
			onScrollInterval: 300,
			scrollLength: 600,
			_autoStyles: true,
			
			onActivateSlide: undefined,
			onDeactivateSlide: undefined
		},
		
		init: function() {
			var self = this;
			
			this.config = $.extend({}, this.defaults, this.options);
			
			this.$container = $(this.container);
			this.$slides = this.$container.find(this.config.slideTagName + 
				(this.config.slideClass ? '.' + this.config.slideClass : ''));
			this.$firstSlide = this.$slides.filter(':first');
			this.$lastSlide = this.$slides.filter(':last');
			this.$activeSlide = this.activateSlide(this.$firstSlide);
			
			this._setStyles()
				._setClasses()
				._setMargins()
				._setupEvents()
				._setupScrollHandler();
			
			return this;
		},
		
		nextSlide: function() {
			var $next = this.$activeSlide.next();
			if ($next.length === 1 && $next.hasClass(this.config.slideClass)) {
				this.scrollToSlide($next);
			}
			
			return $next;
		},
		
		prevSlide: function() {
			var $prev = this.$activeSlide.prev();
			if ($prev.length === 1) {
				this.scrollToSlide($prev);
			}
			
			return $prev;
		},
		
		scrollToSlide: function($elem) {
			var self = this;
			
			this.isAutoScrolling = true;
			
			$('html,body').stop().animate({
				scrollLeft: ($elem.position().left - 
					(($window.width() - $elem.innerWidth()) / 2))
			}, self.config.scrollLength, function() {
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
			if (this.config._autoStyles) {
				$('body').width(99999);
				this.$clearFloats = this.$container.append('<div style="clear:left"></div>');
				this.$container.css('float','left');
				this.$slides.css('float','left');
			}
			
			return this;
		},
		
		_setClasses: function() {
			this.$slides.addClass(this.config.inactiveClass);
			
			this.$activeSlide
				.removeClass(this.config.inactiveClass)
				.addClass(this.config.inactiveClass);
			
			return this;
		},
		
		_setMargins: function() {
			var displayMode = this.config.displayMode,
				windowWidth = $window.width(),
				verticalSpacing = ($window.height() - this.$firstSlide.innerHeight()) / 2,
				firstSlideSpacing = (windowWidth - this.$firstSlide.innerWidth()) / 2,
				lastSlideSpacing = (windowWidth - this.$lastSlide.innerWidth()) / 2,
				peekabooWidth = windowWidth / 25;
			
			this.$container.css('margin-top', verticalSpacing);
			
			if (displayMode === 'single') {
				this.$slides.css('margin-right', firstSlideSpacing - peekabooWidth);
			} else if (displayMode === 'multi') {
				this.$slides.css('margin-right', this.config.margin);
			}
			
			this.$firstSlide.css('margin-left', firstSlideSpacing);
			this.$lastSlide.css('margin-right', lastSlideSpacing);
			
			$('html,body').width(this.$container.outerWidth());
			
			return this;
		},
		
		_setupScrollHandler: function() {
			var self = this,
				slideSelector = self.config.slideTagName + (self.config.slideClass ? '.' + self.config.slideClass : ''),
				$elem;
			
			self.scrolling = false;
			
			setMidPoints();				
			
			setInterval(function() {
				if (self.scrolling && (self.isAutoScrolling === false || self.isAutoScrolling === undefined)) {
					self.scrolling = false;
					
					if ($window.scrollLeft() === 0) {
						self.activateSlide(self.$firstSlide)
					} else {
						$elem = $(document.elementFromPoint(self.midpoint.x, self.midpoint.y));
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
			
			$window
				.scroll(function() {
					self.scrolling = true;
				})
				.resize(function() {
					setMidPoints();
				});
			
			function setMidPoints() {
				self.midpoint = {
					x: ($window.width() / 2),
					y: ($window.height() / 2)
				}
			}
			
			return this;
		}				
	};
	
	$.fn.Fathom = function(options){
		new Fathom(this, options);
		return this;
	};
	
	Fathom.defaults = Fathom.prototype.defaults;
	
	Fathom.setDefaults = function(options) {
		$.extend(Fathom.defaults, options);
	};
	
	window.Fathom = Fathom;
})(jQuery,window);