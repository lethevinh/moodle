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
 * @copyright  2019 Vinh Le
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery', 'core/custom_interaction_events', 'core/log', 'core/pubsub'], function($, CustomEvents, Log, PubSub) {

    var CLASS = {
        "wrapper": "md-sticky-wrapper",
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
        this.isPositionStickySupport = this.positionStickySupport();

        if (!this.tableSticky.length) {
            Log.debug('Page is missing a sticky table region');
        }

        if (!this.tableSticky.parent().hasClass(CLASS.wrapper)) {
            this.tableSticky.wrap('<div class="' + CLASS.wrapper + ' "></div>');
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

        if (!this.isPositionStickySupport) {
            this.handelNotPositionStickySupport();
        }

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
            stickyTable.handleScrollSticky();
        });

        PubSub.subscribe(EVENTS.scrolling, function(data) {
            var stickyTable = data.stickytable;
            stickyTable.handleScrollSticky();
        });
    };

    StickyTable.prototype.handleScrollSticky = function() {
        // Suport sticky muilty colunms.
        var stickies = this.config.stickies;
        $.each(stickies, function(position, stickySelector) {
            var selectors = stickySelector.split(',');
            if (selectors.length <= 1) {
                return;
            }
            selectors.forEach(function(selector, index) {
                if (index < 1) {
                    return;
                }
                var element = $(selector);
                switch (position) {
                    case "right":
                    case "left":
                        element.css(position, element.prev().outerWidth());
                        break;
                    default:
                        break;
                }
            });
        });

        // Suport for browser not support position Sticky

        if (!this.isPositionStickySupport) {
            if (navigator.userAgent.match(/Trident\/7\./)) {
                $(CLASS.wrapper).on("mousewheel", function(event) {
                    event.preventDefault();
                    var wd = event.originalEvent.wheelDelta;
                    var csp = $(this).scrollTop();
                    $(this).scrollTop(csp - wd);
                });
            }
            this.handelNotPositionStickySupport();
        }
    };

    StickyTable.prototype.handelNotPositionStickySupport = function() {

        var scrollTop = this.wrapperSticky.scrollTop();
        var prevSticky = $('.md-sticky-top').prevAll(':not(.md-sticky-top)');
        var heightPrevSticky = 0;

        prevSticky.each(function(index, item) {
            heightPrevSticky += parseInt($(item).outerHeight());
        });

        if (prevSticky.length > 0 && scrollTop < heightPrevSticky) {
            prevSticky.show();
        } else {
            prevSticky.hide();
        }

        this.tableSticky.find("tr.md-sticky-top th").css('top', scrollTop);
        this.tableSticky.find("tr.md-sticky-top td").css('top', scrollTop);
        var maxScroll = this.tableSticky.prop("clientHeight") - this.wrapperSticky.prop("clientHeight");
        this.tableSticky.find("tr.md-sticky-bottom th").css('bottom', maxScroll - this.wrapperSticky.scrollTop());
        this.tableSticky.find("tr.md-sticky-bottom td").css('bottom', maxScroll - this.wrapperSticky.scrollTop());

        this.tableSticky.find("th.md-sticky-left").css('left', this.wrapperSticky.scrollLeft());
        this.tableSticky.find("td.md-sticky-left").css('left', this.wrapperSticky.scrollLeft());
        maxScroll = this.wrapperSticky.find("table").prop("clientWidth") - this.wrapperSticky.prop("clientWidth");
        this.tableSticky.find("th.md-sticky-right").css('right', maxScroll - this.wrapperSticky.scrollLeft());
        this.tableSticky.find("td.md-sticky-right").css('right', maxScroll - this.wrapperSticky.scrollLeft());
    };

    StickyTable.prototype.positionStickySupport = function() {
        var el = document.createElement('a'),
            mStyle = el.style;
        mStyle.cssText = "position:sticky;position:-webkit-sticky;position:-ms-sticky;";
        return mStyle.position.indexOf('sticky') !== -1;
    };

    return {
        init: function(config) {
            return new StickyTable(config);
        },
        EVENTS: EVENTS
    };
});
