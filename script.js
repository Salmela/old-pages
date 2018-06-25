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
		var newValue = $queryInput.val();
		if(oldValue == newValue) return;
		oldValue = newValue;

		var request = jQuery.ajax({url: "/content.php?search=" + newValue});
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

		new FontResizeButton(jQuery("#font-resize-button"));

		window.onresize = this.resize;
		/*document.onmousemove = (function(e) {
			content.sizeFontChange(e.clientX / 400);
		});*/
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

		if(document.documentElement.clientHeight < 480) {
			that.header.className = "";
			window.onscroll = null;
		} else {
			window.onscroll = that.scroll;
			that.scroll();
		}
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
