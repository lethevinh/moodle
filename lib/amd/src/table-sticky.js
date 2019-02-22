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
define(['jquery'], function($) {

    var stickies = {
        'top': "",
        'right': "",
        'bottom': "",
        'left': ""
    };
    var tableSticky;

    var stickyTable = function() {

        var positionStickySupport = function() {
            var el = document.createElement('a'),
                mStyle = el.style;
            mStyle.cssText = "position:sticky;position:-webkit-sticky;position:-ms-sticky;";
            return mStyle.position.indexOf('sticky') !== -1;
        }();

        var scrollTypeRTL = function() {
            var definer = $('<div dir="rtl" style="font-size: 14px; width: 4px; height: 1px; position: absolute; top: -1000px; overflow: scroll">ABCD</div>')
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
        }();

        if (!positionStickySupport) {
            if (navigator.userAgent.match(/Trident\/7\./)) {
                $('.sticky-table').on("mousewheel", function(event) {
                    event.preventDefault();
                    var wd = event.originalEvent.wheelDelta;
                    var csp = $(this).scrollTop();
                    $(this).scrollTop(csp - wd);
                });
            }

            $(".sticky-table").scroll(function() {
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

                $(".sticky-table").scroll(function() {
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

    var createStructureTable = function() {

        if (tableSticky.parent().hasClass('sticky-table') || tableSticky.length == 0) {
            return false;
        }

        tableSticky.wrap('<div class="sticky-table sticky-ltr-cells"></div>');

        $(stickies.top).addClass('sticky-header');
        $(stickies.bottom).addClass('sticky-footer');
        $(stickies.left).addClass('sticky-cell');
        $(stickies.right).addClass('sticky-cell-opposite');

        return true;
    };

    var responsiveSticky = function() {
        var widthframe = document.documentElement.clientWidth;
        tableSticky.parent().css('max-width', widthframe - 100);
    };

    var initStickyTable = function() {
        if (createStructureTable()) {
            responsiveSticky();
            stickyTable();
        }
    };

    return {
        init: function(options) {
            stickies = options.stickies;

            $(document).on('sticky-table', stickyTable);
            $(document).on('init-sticky-table', initStickyTable);

            tableSticky = $('.gradereport-grader-table');
            $(document).trigger("init-sticky-table");

            tableSticky.parent().scroll(function() {
                $(document).trigger("sticky-table");
            });

            var timeoutId;
            $(window).resize(function() {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(function() {
                    $('.wrapper').trigger("sticky-table");
                    responsiveSticky();
                }, 500);
            });
        },
        stickies: stickies
    };
});