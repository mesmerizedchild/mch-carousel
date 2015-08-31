$(function(){
	// Initialise Fancytree
	$("#dom-tree").fancytree({
		extensions: [],
		checkbox: false,
		selectMode: 2,
		source: {url: "json/mch-carousel-dom-tree.json"},
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
			if((d=data.node.data) && d.description) {
				var sideBySide = $('#dom-doc').css('float')=='right';
				$('#dom-doc .dom-description').html(d.description);
				if(d.styleable) {
					// Pick the icon and the default description for the style.
					switch(d.styleable) {
						case 'yes':
							ico = 'images/Light_green_check.svg';
							sd = '<p>You may style this element as you see fit.</p>';
							break;
						case 'no':
							ico = 'images/h0us3s-Signs-Hazard-Warning-21.svg';
						    sd = '<p>Usually there is no need to style this element.</p>';
						    break;
						case 'dont':
							ico = 'images/StopSign-nofont.svg';
							sd = '<p>Refrain from styling this element unless you really know what you are doing.</p>';
							break;
						case 'warning':
							ico = 'images/h0us3s-Signs-Hazard-Warning-17.svg';
							sd = '<p>There should be a manually-entered description for this element! You might want to report an issue in GitHub for this, I\'d be very grateful :-) ...</p>';
							break;
						default:
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

		iconClass: function(event, data){
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
		},
	});

	function notifyParentIFrame() {
		if(parent.adjustIFrame)
			parent.adjustIFrame($('body').height());
	}
});
