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
		this.contents  = $("#content");
		this.header    = $("#header");
		this.links     = $("#headerright");
		this.nav       = $("nav");
		this.navPrev   = $("h1", this.header);
		this.navOffset = this.nav.offsetTop;

		this.links.innerHTML          = "<button>Aa</button> | " + this.links.innerHTML;
		this.links.firstChild.onclick = this.sizeFontClick;
		document.onclick              = this.sizeFontReset;
		document.onmousemove          = this.sizeFontChange;

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

	orgFontPos:    0,
	sizeChangeing: false,
	sizeFont:      100,
	sizeFontReset: (function(e){
		if(content.sizeChangeing) {
			e.stopPropagation();
			e.preventDefault();
			content.sizeChangeing = false;
		}
	}),
	sizeFontClick: (function(e){
		if(!content.sizeChangeing) {
			content.orgFontPos = content.links.offsetLeft;
			content.sizeChangeing = true;
		}
		e.stopPropagation();
	}),
	sizeFontChange: (function(e){
		if(!content.sizeChangeing) return;

		content.sizeFont = Math.floor(Math.pow(1.01, e.clientX - content.orgFontPos) * 100);
		document.body.style.fontSize = content.sizeFont +"%";
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
