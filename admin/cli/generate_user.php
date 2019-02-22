<?php

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
 * This script generate test users, enroll to given course and assign to given group.
 *
 * @package    test
 * @subpackage cli
 * @copyright  2019 Huong Nguyen <huongnv13@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('CLI_SCRIPT', true);

require(__DIR__ . '/../../config.php');
require_once($CFG->libdir . '/clilib.php');
require_once(__DIR__ . '/../../lib/phpunit/classes/util.php');
require_once __DIR__ . '/../../vendor/autoload.php';

// Define the input options.
$longparams = [
        'help' => false,
        'total' => '',
        'course' => '',
        'group' => ''
];

$shortparams = array(
        'h' => 'help',
        't' => 'total',
        'c' => 'course',
        'g' => 'group'
);

list($options, $unrecognized) = cli_get_params($longparams, $shortparams);

if ($unrecognized) {
    $unrecognized = implode("\n  ", $unrecognized);
    cli_error(get_string('cliunknowoption', 'admin', $unrecognized), 2);
}

if ($options['help']) {
    $help =
            "Generate test user and enroll and assign to group

Options:
-h, --help            Print out this help
-t, --total           Total user to create
-c, --course          Assign to Course id
-g, --group           Assign to Group id

Example:
\$sudo /usr/bin/php admin/cli/generate_user.php -t=100
";

    echo $help;
    exit(0);
}

if ($options['total'] == '') {
    $prompt = "Enter total users: ";
    $total = cli_input($prompt);
} else {
    $total = $options['total'];
}

$total = (int) $total;
$generator = phpunit_util::get_data_generator();

for ($i = 1; $i <= $total; $i++) {
    $faker = Faker\Factory::create();
    $user = $generator->create_user([
                    'firstname' => $faker->firstName,
                    'lastname' => $faker->lastName,
                    'email' => $faker->email,
                    "username" => $faker->userName . rand(0, 100000)
            ]
    );
    if (!empty($options['course'])) {
        $studentrole = $DB->get_record('role', array('shortname' => 'student'));
        $generator->enrol_user($user->id, $options['course'], $studentrole->id, 'manual');

        if (!empty($options['group'])) {
            $generator->create_group_member(['groupid' => $options['group'], 'userid' => $user->id]);
        }
    }
    echo "Create user " . $faker->firstName . PHP_EOL;
}