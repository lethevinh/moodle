// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * A module to help with toggle select/deselect all.
 *
 * @module     core/table-sticky
 * @copyright  2019 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery', 'core/custom_interaction_events'], function($, CustomEvents) {

    var stickies = {
        'top': "",
        'right': "",
        'bottom': "",
        'left': ""
    };

    var events = {
        sticky: 'stk:sticky',
        responsive: 'stk:responsive',
        init: 'stk:init',
    };

    var tableSticky;

    var CLASS = {
        "wrapper": "md-sticky-wrapper",
        "wrapperLTR": "sticky-ltr-cells",
        "wrapperRTL": "sticky-rtl-cells"
    };

    var handleNotPositionSticky = function() {

        // Suport sticky muilty colunms.
        for (var sticky in stickies) {
            var classLeft = stickies[sticky].split(',');
            if (classLeft.length <= 1) {
                continue;
            }
            for (var i = 0; i < classLeft.length; i++) {
                if (i < 1) {
                    continue;
                }

                var item = classLeft[i];
                if (sticky === "left") {
                    $(item).css(sticky, $(item).prev().outerWidth());
                }
            }
        }

        var positionStickySupport = function() {
            var el = document.createElement('a'),
                mStyle = el.style;
            mStyle.cssText = "position:sticky;position:-webkit-sticky;position:-ms-sticky;";
            return mStyle.position.indexOf('sticky') !== -1;
        };
        positionStickySupport();

        var scrollTypeRTL = function() {
            var style = 'font-size: 14px; width: 4px; height: 1px; position: absolute; top: -1000px; overflow: scroll';
            var definer = $('<div dir="rtl" style="' + style + '">ABCD</div>')
                    .appendTo('body')[0],
                scrollTypeRTL = 'reverse';

            if (definer.scrollLeft > 0) {
                scrollTypeRTL = 'default';
            } else {
                definer.scrollLeft = 1;
                if (definer.scrollLeft === 0) {
                    scrollTypeRTL = 'negative';
                }
            }
            $(definer).remove();
            return scrollTypeRTL;
        };
        scrollTypeRTL();
        if (!positionStickySupport) {
            if (navigator.userAgent.match(/Trident\/7\./)) {
                $('.' + CLASS.wrapper).on("mousewheel", function(event) {
                    event.preventDefault();
                    var wd = event.originalEvent.wheelDelta;
                    var csp = $(this).scrollTop();
                    $(this).scrollTop(csp - wd);
                });
            }

            $('.' + CLASS.wrapper).scroll(function() {
                $(this).find("table tr.sticky-header th").css('top', $(this).scrollTop());
                $(this).find("table tr.sticky-header td").css('top', $(this).scrollTop());
                var maxScroll = $(this).find("table").prop("clientHeight") - $(this).prop("clientHeight");
                $(this).find("table tr.sticky-footer th").css('bottom', maxScroll - $(this).scrollTop());
                $(this).find("table tr.sticky-footer td").css('bottom', maxScroll - $(this).scrollTop());
            }).scroll();

            $(".sticky-ltr-cells").scroll(function() {
                $(this).find("table th.sticky-cell").css('left', $(this).scrollLeft());
                $(this).find("table td.sticky-cell").css('left', $(this).scrollLeft());
                var maxScroll = $(this).find("table").prop("clientWidth") - $(this).prop("clientWidth");
                $(this).find("table th.sticky-cell-opposite").css('right', maxScroll - $(this).scrollLeft());
                $(this).find("table td.sticky-cell-opposite").css('right', maxScroll - $(this).scrollLeft());
            }).scroll();
        }
        if ($(".sticky-rtl-cells").length && !(positionStickySupport && scrollTypeRTL == 'negative')) {
            if (positionStickySupport) {
                $(".sticky-rtl-cells table th.sticky-cell").css('position', "relative");
                $(".sticky-rtl-cells table td.sticky-cell").css('position', "relative");
                $(".sticky-rtl-cells table th.sticky-cell-opposite").css('position', "relative");
                $(".sticky-rtl-cells table td.sticky-cell-opposite").css('position', "relative");

                $('.' + CLASS.wrapper).scroll(function() {
                    $(this).find("table tr.sticky-header .sticky-cell").css('top', $(this).scrollTop());
                    $(this).find("table tr.sticky-header .sticky-cell-opposite").css('top', $(this).scrollTop());
                    var maxScroll = $(this).find("table").prop("clientHeight") - $(this).prop("clientHeight");
                    $(this).find("table tr.sticky-footer .sticky-cell").css('bottom', maxScroll - $(this).scrollTop());
                    $(this).find("table tr.sticky-footer .sticky-cell-opposite").css('bottom', maxScroll - $(this).scrollTop());
                }).scroll();
            }
            $(".sticky-rtl-cells").scroll(function() {
                var maxScroll = $(this).find("table").prop("clientWidth") - $(this).prop("clientWidth");
                switch (scrollTypeRTL) {
                    case "default": // webKit Browsers
                        $(this).find("table th.sticky-cell").css('right', maxScroll - $(this).scrollLeft());
                        $(this).find("table td.sticky-cell").css('right', maxScroll - $(this).scrollLeft());
                        $(this).find("table th.sticky-cell-opposite").css('left', $(this).scrollLeft());
                        $(this).find("table td.sticky-cell-opposite").css('left', $(this).scrollLeft());
                        break;
                    case "negative": // Firefox, Opera
                        $(this).find("table th.sticky-cell").css('right', $(this).scrollLeft() * -1);
                        $(this).find("table td.sticky-cell").css('right', $(this).scrollLeft() * -1);
                        $(this).find("table th.sticky-cell-opposite").css('left', maxScroll + $(this).scrollLeft());
                        $(this).find("table td.sticky-cell-opposite").css('left', maxScroll + $(this).scrollLeft());
                        break;
                    case "reverse": // IE, Edge
                        $(this).find("table th.sticky-cell").css('right', $(this).scrollLeft());
                        $(this).find("table td.sticky-cell").css('right', $(this).scrollLeft());
                        $(this).find("table th.sticky-cell-opposite").css('left', maxScroll - $(this).scrollLeft());
                        $(this).find("table td.sticky-cell-opposite").css('left', maxScroll - $(this).scrollLeft());
                }
            }).scroll();
        }
    };

    var addStructuringSticky = function() {

        if (tableSticky.parent().hasClass(CLASS.wrapper) || tableSticky.length === 0) {
            return false;
        }

        tableSticky.wrap('<div class="' + CLASS.wrapper + ' sticky-ltr-cells"></div>');

        for (var position in stickies) {
            $(stickies[position]).addClass('md-sticky-' + position);
        }

        return true;
    };

    var responsiveSticky = function() {
        tableSticky.parent().css('width', $("#page-content").outerWidth() - 50);
    };

    var initStickyTable = function() {
        if (addStructuringSticky()) {
            responsiveSticky();
            handleNotPositionSticky();
        }
    };

    return {
        initialise: function(options) {

            tableSticky = $(options.table);
            if (tableSticky.length === 0) {
                return;
            }

            stickies = options.stickies;

            $(document).on(events.sticky, handleNotPositionSticky);
            $(document).on(events.init, initStickyTable);
            $(document).on(events.responsive, responsiveSticky);

            $(document).trigger(events.init);

            $(document).on(CustomEvents.events.activate, function() {
                setTimeout(function() {
                    $(document).trigger(events.responsive);
                }, 500);
            });

            tableSticky.parent('.' + CLASS.wrapper).scroll(function() {
                $(document).trigger(events.sticky);
            });

            var timeoutId;
            $(window).resize(function() {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(function() {
                    $(document).trigger(events.sticky);
                    responsiveSticky();
                }, 500);
            });
        },
        stickies: stickies
    };
});