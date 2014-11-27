'use strict';

$(function () { //DOM Ready
    $('.gridster ul').gridster({
        widget_margins: [5, 5],
        widget_base_dimensions: [20, 20],
        autogrow_cols: true
    });
});