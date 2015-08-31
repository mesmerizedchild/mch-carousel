window.onload = function() {
    $(function() {
        // smoothState
        $('#page-content').smoothState();

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
};

function adjustIFrame(i) {
    $('#dom-tree').height(i);
}
