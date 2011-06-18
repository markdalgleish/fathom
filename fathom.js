/*
Fathom.js v1.1
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
			portable: undefined,
			portableContainerTag: 'div',
			portableContainerClass: 'fathom-container',
			displayMode: 'single',
			slideTagName: 'div',
			slideClass: 'slide',
			activeClass: 'activeslide',
			inactiveClass: 'inactiveslide',
			margin: 100,
			onScrollInterval: 300,
			scrollLength: 600,
			
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
			
			this._detectPortable()
				._setStyles()
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
			var self = this,
				$scrollingElement = this.config.portable ? this.$portableContainer : $('html,body'),
				$container = this.config.portable ? this.$portableContainer : $window,
				portableScrollLeft = this.config.portable ? this.$portableContainer.scrollLeft() : 0;
			
			this.isAutoScrolling = true;
			
			$scrollingElement.stop().animate({
				scrollLeft: ($elem.position().left + portableScrollLeft - 
					(($container.width() - $elem.innerWidth()) / 2))
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
			if (this.config.portable) {
				this.$portableContainer = $('<' + this.config.portableContainerTag + ' class="' + this.config.portableContainerClass + '" />');
				this.$container.before(this.$portableContainer).appendTo(this.$portableContainer);
			} else {
				$('body').width(99999);
			}
			
			this.$clearFloats = this.$container.append('<div style="clear:left"></div>');
			this.$container.css('float','left');
			this.$slides.css('float','left');
			
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
			
			if (!this.config.portable) {
				$('html,body').width(this.$container.outerWidth());
			} else {
				var slidesWidth = parseInt(this.$container.css('padding-left')) + parseInt(this.$container.css('padding-right'));
				this.$slides.each(function() {
					slidesWidth += $(this).outerWidth(true);
				});
				this.$container.width(slidesWidth);
			}
			
			return this;
		},
		
		_setupScrollHandler: function() {
			var self = this,
				slideSelector = self.config.slideTagName + (self.config.slideClass ? '.' + self.config.slideClass : ''),
				$scrollContainer = this.config.portable ? this.$portableContainer : $window,
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
								x: offsetX + ($scrollContainer.width() / 2),
								y: offsetY + ($scrollContainer.height() / 2)
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