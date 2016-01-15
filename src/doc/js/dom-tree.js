$(function(){

    // I don't like messing around with prototypes, but this one *is* a nice polyfill :) ...
    if (typeof String.prototype.startsWith !== 'function') {
        String.prototype.startsWith = function(prefix) {
            return this.indexOf(prefix) === 0;
        };
    }

	// Initialise Fancytree
	$("#dom-tree").fancytree({
		extensions: [],
		checkbox: false,
		selectMode: 2,
		source: {
			url: "json/mch-carousel-dom-tree.json",
			complete: notifyParentIFrame
		},
		wide: {
			iconWidth: "26px",     // Adjust this if @fancy-icon-width != "16px"
			iconSpacing: "0px", // Adjust this if @fancy-icon-spacing != "3px"
			levelOfs: "16px"     // Adjust this if ul padding != "16px"
		},

		collapse: function() {
			notifyParentIFrame();
		},

		expand: function() {
			notifyParentIFrame();
		},
		
		activate: function(event, data){
			var d,
			    sd,
			    ico;
			// Blank out the icon first.
			// Problem: if the server is slow at providing the new icon image,
			//   the old icon will still appear with the new text for a consireable
			//   amount of time, and this is quite confusing.
			// Solution: clear the icon first thing, then, when the new icon arrives
			//   from the server, it will be displayed correctly. It's definitely
			//   preferrable to see an empty square for "a considerable amount of time",
			//   than something that has nothing to do with the new content.
			$('#dom-doc .dom-style-icon').prop('src', '');
			if((d=data.node.data) && d.description) {
				var sideBySide = $('#dom-doc').css('float')==='right';
				$('#dom-doc .dom-description').html(d.description);
				if(d.styleable) {
					// Pick the icon and the default description for the style.
					switch(d.styleable) {
						case 'yes':
							ico = 'images/Light_green_check.svg';
							sd = '<p>You may style this element as you see fit.</p>';
							break;
						case 'no':
							ico = 'images/Information-icon.svg';
						    sd = '<p>Usually there is no need to style this element.</p>';
						    break;
						case 'dont':
							ico = 'images/StopSign-nofont.svg';
							sd = '<p>Refrain from styling this element unless you really know what you are doing.</p>';
							break;
						case 'warning':
							ico = 'images/ryanlerch-Warning-Deer-Roadsign.svg';
							sd = '<p>There should be a manually-entered description for this element! You might want to report an issue in GitHub for this, I\'d be very grateful :-) ...</p>';
							break;
						default:
							ico = 'images/h0us3s-Signs-Hazard-Warning-17.svg';
							sd = '';
					}

					// But if styling details are present, override the default description
					if(d.styleDetails) {
						if(d.styleDetails.startsWith('+'))
							sd += d.styleDetails.substr(1);
						else
							sd = d.styleDetails;
					}
					$('#dom-doc .dom-style-details').html(sd);
					$('#dom-doc .dom-style-icon').prop('src', ico);
					$('#dom-doc .dom-style-info').css('display', 'block');
					$('#dom-doc').scrollTop(0); // Reset to top, for mobile devices
				}
				else 
					$('#dom-doc .dom-style-info').css('display', 'none');

				// Check where we are in the DOM tree and reposition #dom-doc if it's smaller
				//   than #dom-tree
				var hTree = parseInt($('#dom-tree').css('height')),
					hDoc = parseInt($('#dom-doc').css('height'));
				if(hTree <= hDoc) 
					$('#dom-doc').css('top', 0);
				else {
					var liTop = $(data.node.li).position().top;
					$('#dom-doc').css('top', Math.max(0, Math.min(hTree-hDoc, liTop-20)));
				}

				// Force to display #dom-doc
				$('#dom-doc').css('display', 'block');
			}
			else {
				// Hide all of #dom-doc and clean-up
				$('#dom-doc').css('display', 'none');
				$('#dom-doc .dom-description').html('');
				$('#dom-doc .dom-style-icon').prop('src', '');
				$('#dom-doc .dom-style-details').html('');
			}

			notifyParentIFrame();
		},

		icon: function(event, data){
			var t = data.node.data.tag;
			if(!t) 
				return def();
			switch(t) {
				case 'img':
					return data.node.folder ? 'image-highlight' : 'image';
				case 'a':
					return 'hyperlink';
				case 'p':
					return 'paragraph';
			}
			return def();

			function def() {
				return data.node.folder ? 'div-highlight' : 'div';
			}
		}
	});
	$('#expand-all').on({
		click: function() {
		$("#dom-tree").fancytree("getRootNode").visit(function(node){
        		node.setExpanded(true);
      		});
      	},
		dblckick: ignoreDoubleClick
	});
	$('#expand-all')[0].onselectstart = ignoreDoubleClick;

	function notifyParentIFrame() {
		var sideBySide = $('#dom-doc').css('float')==='right';
		console.log(sideBySide);

		// Not sure why getting the height is so complicated... maybe
		//   because #dom-tree has not collapsed/expanded yet?
		var treeHeight = $($('#dom-tree').children()[0]).height() + 10,
		    newBodyHeight;
		if(sideBySide) {
			newBodyHeight = Math.max(treeHeight, $('#dom-doc').height());
		}
		else {
		    var parentWindowHeight;
			if(parent.getWindowHeight)
				parentWindowHeight = parent.getWindowHeight();
			else
				parentWindowHeight = 99999;
			newBodyHeight = Math.min(parentWindowHeight, treeHeight*2.23);
		}
		newBodyHeight = Math.max(newBodyHeight, 100);

		$('body').height(newBodyHeight);
		if(parent.adjustIFrame)
			parent.adjustIFrame(newBodyHeight);
	}

	function ignoreDoubleClick(e) {
		e.preventDefault();
	}
});

function gotoNode(id) {
	var tree = $("#dom-tree").fancytree("getTree");
	var node = tree.getNodeByKey(id);
	node.setActive(true);
}
