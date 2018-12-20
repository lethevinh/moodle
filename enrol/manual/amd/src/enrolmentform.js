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

/*
 * JavaScript to support navigation of duplicate button.
 *
 * @module     enrol_manual/enrolmentform
 * @copyright  2019 The Open University
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Form enrolment AMD module.
 *
 * @module     enrol_manual/enrolmentform
 * @copyright  2019 The Open University
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery'], function($) {
    return {
        init: function(options) {
            var form = $("#" + options.formid);
            var duration = form.find('#id_duration, #menuextendperiod');
            var checkbox = form.find('#id_timeend_enabled');
            var timeEnd = form.find('select[name*="timeend"]');

            // Default time end disable.
            timeEnd.attr('disabled', "disabled");
            checkbox.prop('checked', false);

            duration.change(function() {
                timeEnd.attr('disabled', "disabled");
            });
            checkbox.click(function() {
                // The status checkbox.
                var isChecked = $(this).is(":checked");
                timeEnd.attr('disabled', !isChecked);
                duration.attr("disabled", isChecked);
            });
        }
    };
});
