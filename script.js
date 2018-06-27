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

		var request = jQuery.ajax({url: "/search.php?q=" + query});
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
	oldMenu:  null,
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
			var page = window.location.href.split("#")[1];
			this.currentMenu = $("#"+page);
			this.load(page);
		} else {
			this.currentMenu = $("#main");
			this.load("main");
		}
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
	load: (function(page) {
		jQuery.ajax({url: "/content.php?page="+page}).done(content.update);
		//TODO do error handling
		this.nextMenu = $("#"+page);
	}),
	update: (function(data, textStatus, jqXHR) {
		var that = content;

		that.contents.innerHTML = data;
		that.oldMenu            = that.currentMenu;
		that.currentMenu        = that.nextMenu;

		if(that.oldMenu) {
			that.oldMenu.classList.remove("active");
		}
		that.currentMenu.classList.add("active");
		if(that.navMenu != null) {
			that.navMenu.parentNode.removeChild(that.navMenu);
			that.navMenu = null;
		}
		var lastElementChild = that.currentMenu.children[that.currentMenu.children.length-1];
		if(that.currentMenu.children[0] != lastElementChild) {
			that.navMenu = lastElementChild.cloneNode(true);
			that.navMenu.id = "sub-menus";
			that.nav.appendChild(that.navMenu);
			$("#nav_placeholder").style.height = that.nav.offsetHeight +"px";
		}
	})
}

jQuery(document).ready(function() {
	login.init();
	new Search();
	content.init();
});
