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
 * AMD code for the frequently used comments chooser for the marking guide grading form.
 *
 * @module     gradereport_grader/gradereporttable
 * @class      gradereporttable
 * @package    core
 * @copyright  2019 Jun Pataleta <jun@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery', 'core/table-sticky', 'core/pubsub'], function($, TableSticky, PubSub) {

    return /** @alias module:gradereport_grader/gradereporttable */ {
        initialise: function() {

            PubSub.subscribe('stk:responsive-susses', function(data) {
                var stickyTable = data.stickytable;
                stickyTable.wrapperSticky.css('width', $("#page-content").outerWidth() - 50);
            });

            var tableSticky = TableSticky.init({
                table: ".gradereport-grader-table",
                stickies: {
                    'top': "tbody tr.heading",
                    'bottom': "tbody tr.lastrow",
                    'left': "tbody tr th.header.c0, tbody tr td.userreport",
                }
            });

            $(document).on('cie:activate', function() {
                setTimeout(function() {
                    PubSub.publish(TableSticky.EVENTS.responsiveStart, {
                        stickytable: tableSticky
                    });
                }, 500);
            });
        }
    };
});
