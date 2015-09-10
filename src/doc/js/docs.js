$(function() {

    // Warnings if page is not loaded via http[s]
    if(!(location.origin.substr(0, 5)==='http:' || location.origin.substr(0, 6)==='https:')) {
    console.log('starting');
        $('.mustBeWeb').prev().append('<div class="warning"><p>WARNING: This page must be served via a web server for the following section to function correctly.<p></div>');
    }

    // smoothState. Disabled for the time being, as it
    //   causes some navigation problems [i.e. at times the 
    //   back button does not work properly]. Maybe it's just
    //   me and not the plug-in; regardless, I must fix it
    //   before I can integrate it back.
    // $('#page-content').smoothState();

    // Copy-to-clipboard buttons.
    $('.copy-to-clipboard').each(function() {
        this.onselectstart = function() { return false; };
        var el = $(this);
        el.on('click', function(e) {
            var el = $(e.target);
            // Bare-bone logic: it expects the <pre> to be the previous
            //   element, and that <pre> have a child <code> which in
            //   turn has the code to be copied.
            var text = el.prev().children('code').text(),
                opaque = $('<div class="dialog-opaque"></div>'),
                dialog = $('<div class="dialog-outer"></div>'),
                button = $('<div class="dialog-button"></div>'),
                ta = $('<textarea></textarea>');
            button.on('click', dismiss);

            ta.val(text);
            ta.on('keydown', function(e) {
                // Enter or ESC
                if(e.keyCode==13 || e.keyCode==27)
                    dismiss(e);
            });

            // TODO: make the .bottom if the dialog box won't fit...

            // Build the dialog box
            dialog.append(ta);
            dialog.append(button);

            // Add the new elements to the page
            $('body').append(opaque);
            $('body').append(dialog);

            // Highlight the text in the text area; all you have to do now is CTRL-C...
            ta.select();

            function dismiss(e) {
                dialog.remove();
                opaque.remove();
            }
        });
    });
});

function adjustIFrame(i) {
    console.log('set height to ' + i);
    $('#dom-tree').height(i);
}

function iFrameGoto(sublocation) {
    location.href = location.href.split('#')[0] + sublocation;
}

function getWindowHeight() {
    return $(window).height();
}