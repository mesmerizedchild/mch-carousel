window.onload = function() {
    $(function() {
        $('#page-content').smoothState();
    });
    var nodeList = document.querySelectorAll('.copy-to-clipboard');
    for(var i=nodeList.length - 1; i>=0; i--) {
        var el = nodeList[i];
        el.onselectstart = function() { return false; };
        el.onclick = function(e) {
            // Bare-bone logic: it expects the <pre> to be the previous
            //   element, and that <pre> have a child <code> which in
            //   turn has the code to be copied.
            var el = e.target;
            if(el.style.zIndex==101) // We are already running the trigger
                return;
            var text = this.previousElementSibling.firstChild.textContent, //.replace(/\n/g, ' '),
                opaque = document.createElement('div'),
                dialog = document.createElement('div'),
                button = document.createElement('div'),
                ta = document.createElement('textarea');
            opaque.className = "dialog-opaque";
            dialog.className = "dialog-outer";
            button.className = "dialog-button";
            button.onclick = dismiss;
            // Set the text area up
            ta.wrap = 'off';
            ta.cols = 120;
            ta.rows = 30;
            ta.value = text;
            ta.autofocus = 'autofocus';
            ta.onkeydown = function(e) {
                if(e.keyCode==13)
                    dismiss(e);
            };
            // TODO: make the .bottom if the dialog box won't fit...
            // Build the dialog box
            dialog.appendChild(ta);
            dialog.appendChild(button);
            // Make the button stand out, even while the rest of the page is opaque
            el.style.zIndex = 101;
            document.body.appendChild(opaque);
            document.body.appendChild(dialog);
            // Highlight the text in the text area; all you have to do now is CTRL-C...
            ta.select();

            function dismiss(e) {
                document.body.removeChild(dialog);
                document.body.removeChild(opaque);
                el.style.zIndex = 0;
            }
        };
    };
};
