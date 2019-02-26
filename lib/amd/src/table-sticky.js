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
define(['jquery', 'core/custom_interaction_events', 'core/log', 'core/pubsub'], function($, CustomEvents, Log, PubSub) {

    var CLASS = {
        "wrapper": "md-sticky-wrapper",
        "wrapperLTR": "sticky-ltr-cells",
        "wrapperRTL": "sticky-rtl-cells"
    };

    var EVENTS = {
        responsiveSusses: 'stk:responsive-susses',
        responsiveStart: 'stk:responsive-start',
        scrolling: 'stk:scrolling',
        initSusses: 'stk:init-susses',
        initStart: 'stk:init-start',
    };

    var StickyTable = function(config) {
        this.config = config;
        this.tableSticky = $(config.table);
        if (!this.tableSticky.length) {
            Log.debug('Page is missing a sticky table region');
        }

        if (!this.tableSticky.parent().hasClass(CLASS.wrapper)) {
            this.tableSticky.wrap('<div class="' + CLASS.wrapper + ' sticky-ltr-cells"></div>');
        }

        this.wrapperSticky = this.tableSticky.parent('.' + CLASS.wrapper);

        this.registerEventListeners();

        PubSub.publish(EVENTS.initStart, {
            stickytable: this,
        });

        var $this = this;

        this.wrapperSticky.scroll(function() {
            PubSub.publish(EVENTS.scrolling, {
                stickytable: $this,
            });
        });

        var timeoutId;
        $(window).resize(function() {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(function() {
                PubSub.publish(EVENTS.responsiveStart, {
                    stickytable: $this,
                });
            }, 500);
        });

        PubSub.publish(EVENTS.initSusses, {
            stickytable: this
        });
    };

    StickyTable.prototype.initStickyTable = function() {

        var stickies = this.config.stickies;
        $.each(stickies, function(position, stickySelector) {
            $(stickySelector).addClass('md-sticky-' + position);
        });
    };

    StickyTable.prototype.handleResponsiveSticky = function() {
        PubSub.publish(EVENTS.responsiveSusses, {
            stickytable: this
        });
    };

    /**
     * Set up all of the event handling for the modal.
     *
     * @method registerEventListeners
     */
    StickyTable.prototype.registerEventListeners = function() {

        // Public Event
        PubSub.subscribe(EVENTS.responsiveStart, function(data) {
            var stickyTable = data.stickytable;
            stickyTable.handleResponsiveSticky();
        });

        PubSub.subscribe(EVENTS.initStart, function(data) {
            var stickyTable = data.stickytable;
            stickyTable.initStickyTable();
            stickyTable.handleResponsiveSticky();
        });

        PubSub.subscribe(EVENTS.scrolling, function(data) {
            var stickyTable = data.stickytable;
            stickyTable.handleSupportPositionSticky();
        });
    };

    StickyTable.prototype.isBrowserPositionStickySupport = function() {
        var el = document.createElement('a'),
            mStyle = el.style;
        mStyle.cssText = "position:sticky;position:-webkit-sticky;position:-ms-sticky;";
        return mStyle.position.indexOf('sticky') !== -1;
    };

    StickyTable.prototype.handleSupportPositionSticky = function() {

        // Suport sticky muilty colunms.
        var stickies = this.config.stickies;
        $.each(stickies, function(position, stickySelector) {
            var selectors = stickySelector.split(',');
            if (selectors.length <= 1) {
                return;
            }
            for (var i = 0; i < selectors.length; i++) {
                if (i < 1) {
                    continue;
                }

                var item = selectors[i];
                if (position === "left") {
                    $(item).css(position, $(item).prev().outerWidth());
                }
            }
        });

        // Suport for browser not support position Sticky
        var $this = this;
        var positionStickySupport = this.isBrowserPositionStickySupport();

        if (!positionStickySupport) {
            if (navigator.userAgent.match(/Trident\/7\./)) {
                this.wrapperSticky.on("mousewheel", function(event) {
                    event.preventDefault();
                    var wd = event.originalEvent.wheelDelta;
                    var csp = $(this).scrollTop();
                    $(this).scrollTop(csp - wd);
                });
            }

            this.wrapperSticky.scroll(function() {
                $this.tableSticky.find(" tr.sticky-header th").css('top', $(this).scrollTop());
                $this.tableSticky.find(" tr.sticky-header td").css('top', $(this).scrollTop());
                var maxScroll = $this.tableSticky.prop("clientHeight") - $(this).prop("clientHeight");
                $this.tableSticky.find(" tr.sticky-footer th").css('bottom', maxScroll - $(this).scrollTop());
                $this.tableSticky.find(" tr.sticky-footer td").css('bottom', maxScroll - $(this).scrollTop());
            }).scroll();

            $(".sticky-ltr-cells").scroll(function() {
                $this.tableSticky.find(" th.sticky-cell").css('left', $(this).scrollLeft());
                $this.tableSticky.find(" td.sticky-cell").css('left', $(this).scrollLeft());
                var maxScroll = $this.tableSticky.prop("clientWidth") - $(this).prop("clientWidth");
                $this.tableSticky.find(" th.sticky-cell-opposite").css('right', maxScroll - $(this).scrollLeft());
                $this.tableSticky.find(" td.sticky-cell-opposite").css('right', maxScroll - $(this).scrollLeft());
            }).scroll();
        }
    };

    return {
        init: function(config) {
            return new StickyTable(config);
        },
        EVENTS: EVENTS
    };
});