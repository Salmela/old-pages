function $(str, root) {
	if(!root) root = document;
	if(root.querySelector) {
		return document.querySelector(str);
	}
	if(str[0] == '#') {
		return document.getElementById(str.substring(1, str.length));
	}
}

var login = {
	wrap: null,
	dialog: null,
	pageWrap: null,
	
	init: (function() {
		this.wrap = document.getElementById("loginWrap");
		this.dialog = document.getElementById("loginDialog");
		this.pageWrap = document.getElementById("wrap");
	}),
	show: (function() {
		this.wrap.style.display = "block";
		this.dialog.style.display = "block";
		this.pageWrap.style.filter = "url(\"filters.svg#login\")";
	}),
	unshow: (function() {
		this.wrap.style.display = "none";
		this.dialog.style.display = "none";
		this.pageWrap.style.filter = "";
	}),
};

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
	var showSearchResults = (function(data, textStatus, jqXHR) {
		jQuery("#content").html(data);
	});
	var onChange = (function(event) {
		var query = $queryInput.val();

		var request = jQuery.ajax({url: "/search.php?q=" + query, cache:true});
		request.done(showSearchResults);
		request.fail(function() {
			//TODO improve this
			alert("Jokin meni pieleen");
		});
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

		if(window.location.href.split("#")[1] != undefined) {
			var page = window.location.pathname.substring(1);
			this.currentMenu = $("#"+page);
		} else {
			this.currentMenu = $("#main");
		}

		jQuery("a", this.nav).on("click", function(e) {
			var newUrl = jQuery(e.target).attr("href");
			if (newUrl[0] != "/") return;
			var page = newUrl.substring(1);
			//TODO do error handling
			content.load(page, e.target);
			e.preventDefault();
		});

		jQuery(window).on('popstate', function(event){
			var state = event.state;
			content.setContent(jQuery("[href=" + state[0] + "]"), state[1]);
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
		jQuery.ajax({url: "/content.php?page="+page, cache:true}).done(content.update);
		this.nextMenu = link;
	}),
	update: (function(data, textStatus, jqXHR) {
		var that = content;

		var url = jQuery(that.nextMenu).attr("href");
		history.pushState([url, data], "Otsikko", url);
		that.setContent(data, that.nextMenu);
	}),
	setContent: (function(data, newActiveItem) {
		this.contents.innerHTML = data;

		var oldMenu = this.currentMenu;
		this.currentMenu = newActiveItem.parentNode;

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
	login.init();
	new Search();
	content.init();
});
