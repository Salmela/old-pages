function $(str, root) {
	if(!root) root = document;
	if(root.querySelector) {
		return document.querySelector(str);
	}
	if(str[0] == '#') {
		return document.getElementById(str.substring(1, str.length));
	}
}

var ajax = (function(url, data, func) {
	var request;

	if(window.ActiveXObject) {
		request = new ActiveXObject("Microsoft.XMLHTTP");
	} else if(window.XMLHttpRequest) {
		request = new XMLHttpRequest();
	}
	request.onreadystatechange = function() {func(request)};
	request.open("GET", url, true);
	request.send(data);
});

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

var search = {
	box: null,
	submit: null,
	oldValue: "",

	init: (function() {
		this.box = $("#searchBox");
		this.submit = $("#searchSubmit");
		this.hideText();

		this.submit.onclick = this.change;
		this.box.onchange = this.change;
	}),
	hideText: (function() {
		if(this.submit.style.border != undefined) {
			this.submit.innerHTML = "<img src=\"icons/search.png\">";
		}
	}),
	change: (function(event) {
		var that = search;

		if(oldValue != that.box.value) {
			oldValue = that.box.value;

			ajax("./content.php?search="+page, oldValue, search.getSearchResults);
		}
	})
};

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
		ajax("./content.php?page="+page, null, content.update);
		this.nextMenu = $("#"+page);
	}),
	update: (function(request) {
		var that = content;
		if(request.readyState != 4) return;
		if(request.status != 200 || request.responseText == "") return;

		that.contents.innerHTML = request.responseText;
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
	search.init();
	content.init();
});
