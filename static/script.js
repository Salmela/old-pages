function $(str, root) {
	if(!root) root = document;
	if(root.querySelector) {
		return document.querySelector(str);
	}
	if(str[0] == '#') {
		return document.getElementById(str.substring(1, str.length));
	}
}

var Login = (function() {
	var $wrap = jQuery("#login-wrap");
	var $dialog = jQuery("#login-dialog");
	var $pageWrap = jQuery("#wrap");

	var show = (function() {
		$wrap.css("display", "block");
		$dialog.css("display", "block");
		$pageWrap.addClass("login-show");
	});
	var unshow = (function() {
		$wrap.css("display", "none");
		$dialog.css("display", "none");
		$pageWrap.removeClass("login-show");
	});

	jQuery("#login-link").on("click", function() {
		show();
	});
	jQuery("#login-close, #login-wrap").on("click", function() {
		unshow();
	});
});

var Search = (function() {
	var oldValue = "";
	var $queryInput = jQuery("#searchBox");
	var $submit = jQuery("#searchSubmit");

	var hideText = (function() {
		//why?
		if($submit.css("border") != undefined) {
			$submit.html("<img src=\"icons/search.png\">");
		}
	});
	var onChange = (function(event) {
		var query = $queryInput.val();

		var url = "/search?q=" + query;
		var request = jQuery.ajax({url: url + "&format=body", cache:true});

		request.done((function(data, textStatus, jqXHR) {
			jQuery("#content").html(data);
			content.updateBrowserUrl(url, data);
		}));
		request.fail(function() {
			//TODO improve this
			alert("Jokin meni pieleen");
		});
		event.preventDefault();
	});
	hideText();
	$submit.on("click", onChange);
	$queryInput.on("change", onChange);
});

var FontResizeButton = (function($button) {
	"use strict";
	var $document = jQuery(document);
	var $body = jQuery(document.body);
	var startMousePosition = 0;
	var sizeFont = 100;
	var sizeChangeing = false;

	var sizeFontChange = (function(e){
		var deltaMovement = e.clientX - startMousePosition;
		sizeFont = Math.floor(Math.pow(1.01, deltaMovement) * 100);
		$body.css("fontSize", sizeFont + "%");
	});
	var sizeFontReset = (function(e){
		e.stopPropagation();
		e.preventDefault();
		sizeChangeing = false;
		$document.off("click", sizeFontReset);
		$document.off("mousemove", sizeFontChange);
	});
	var sizeFontClick = (function(e){
		if(sizeChangeing) {
			$body.css("fontSize", "100%");
			sizeChangeing = false;
			return;
		}
		$document.on("click", sizeFontReset);
		$document.on("mousemove", sizeFontChange);
		sizeChangeing = true;
		startMousePosition = e.clientX;
		e.stopPropagation();
	});

	$button.on("click", sizeFontClick);
});

var content = {
	currentMenu: null,
	nextMenu: null,
	navMenu:  null,

	contents: null,
	header:   null,
	nav:      null,
	navPrev:  null,
	request:  null,
	links:    null,

	init: (function() {
		jQuery(document.body).addClass("js-enabled");
		this.contents  = $("#content");
		this.header    = $("#header");
		this.links     = $("#headerright");
		this.nav       = $("nav");
		this.navPrev   = $("h1", this.header);
		this.navOffset = this.nav.offsetTop;
		// required for fixing zoom on retina displays
		this.initialZoom = window.devicePixelRatio;

		new FontResizeButton(jQuery("#font-resize-button"));

		window.onresize = this.resize;
		if(document.documentElement.clientHeight > 480) {
			window.onscroll = this.scroll;
		}

		$("#nav_placeholder").style.height = this.nav.offsetHeight +"px";

		this.currentMenu = $(".active");
		this.navMenu = jQuery("#sub-menus")[0];

		jQuery("a", this.nav).on("click", function(e) {
			var newUrl = jQuery(e.target).attr("href");
			if (newUrl[0] != "/") return;
			var page = newUrl.substring(1);
			//TODO do error handling
			content.load(page, e.target);
			e.preventDefault();
		});

		jQuery(window).on('popstate', function(event){
			var state = event.originalEvent.state;
			content.setContent(state[1], jQuery(".menu > [href=\"" + state[0] + "\"]")[0]);
		});
	}),

	scroll: (function(page) {
		var that = content;

		if(document.documentElement.scrollTop < that.navOffset) {
			that.header.className = "";
		} else {
			that.header.className = "scroll";
		}
	}),
	resize: (function(page) {
		var that = content;

		that.navOffset = that.navPrev.offsetTop + that.navPrev.offsetHeight;
		$("#nav_placeholder").style.height = that.nav.offsetHeight +"px";

		// hide the menu if it would take too much screen real estate
		if(document.documentElement.clientHeight < 480) {
			that.header.className = "";
			window.onscroll = null;
		} else {
			if (that._zoomedIn()) {
				jQuery("nav", that.header).stop().animate({top: -that.header.clientHeight}, {duration:500});
			} else {
				jQuery("nav", that.header).stop().animate({top: 0}, {duration:500});
			}
			window.onscroll = that.scroll;
			that.scroll();
		}
	}),
	_zoomedIn: (function() {
		var browserZoomLevel = window.devicePixelRatio;
		return (browserZoomLevel > this.initialZoom + 0.01);
	}),
	load: (function(page, link) {
		jQuery.ajax({url: "/" + page + "?format=body", cache:true}).done(content.update);
		this.nextMenu = link;
	}),
	update: (function(data, textStatus, jqXHR) {
		var that = content;

		var url = jQuery(that.nextMenu).attr("href");
		that.updateBrowserUrl(url, data);
		that.setContent(data, that.nextMenu);
	}),
	_parseGetParams: (function(urlGetPart) {
		var result = {};
		var items = urlGetPart.substr(1).split("&");
		for (var index = 0; index < items.length; index++) {
			var parts = items[index].split("=");
			result[parts[0]] = decodeURIComponent(parts[1]);
		}
		return result;
	}),
	_findPageTitle: (function(content) {
		matches = /<h[1-9]>(.*)<\/h[1-9]>/.exec(content);
		return matches[1];
	}),
	updateBrowserUrl: (function(url, content) {
		var params = this._parseGetParams(location.search);
		var title = this._findPageTitle(content);
		document.title = title + " - Salmela";
		history.pushState([url, content], document.title, url);
		jQuery("[data-url-param]").each(function() {
			var $this = jQuery(this);
			var linkParams = jQuery.extend({}, params);
			var param = $this.attr("data-url-param");
			var paramParts = param.split("=");
			linkParams[paramParts[0]] = paramParts[1];
			$this.attr("href", window.location.pathname + "?" + jQuery.param(linkParams));
		});
	}),
	setContent: (function(data, newActiveItem) {
		this.contents.innerHTML = data;

		var oldMenu = this.currentMenu;
		this.currentMenu = newActiveItem.parentNode;
		var that = this;
		// fix weird issue were focus() is not working when devtools are open
		window.setTimeout(function () {
			that.currentMenu.children[0].focus();
		}, 0);

		if(oldMenu) {
			oldMenu.classList.remove("active");
		}
		this.currentMenu.classList.add("active");
		if(this.navMenu != null) {
			this.navMenu.parentNode.removeChild(this.navMenu);
			this.navMenu = null;
		}
		var lastElementChild = this.currentMenu.children[this.currentMenu.children.length-1];
		if(this.currentMenu.children[0] != lastElementChild) {
			this.navMenu = lastElementChild.cloneNode(true);
			this.navMenu.id = "sub-menus";
			this.nav.appendChild(this.navMenu);
			$("#nav_placeholder").style.height = this.nav.offsetHeight +"px";
		}
	})
}

jQuery(document).ready(function() {
	new Login();
	new Search();
	content.init();
});
